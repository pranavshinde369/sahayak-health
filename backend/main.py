from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import uvicorn
import os
import requests

from gemma_client import (
    run_voice_triage,
    run_pratibimb_scan,
    extract_wellness_signals,
    generate_referral_letter,
    process_nadi_transcript,
)
from jeevan_score import calculate_jeevan_score
from database import init_db, save_patient, get_all_patients, get_patient, save_session, get_patient_sessions, save_nadi_call, get_nadi_calls
from pdf_gen import generate_referral_pdf

app = FastAPI(title="Sahayak API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with your Lovable URL in production
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Startup ──────────────────────────────────────────────────────────────────

@app.on_event("startup")
def startup():
    init_db()

# ─── Health check ─────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "Sahayak backend running", "version": "1.0.0"}

# ─── Triage ───────────────────────────────────────────────────────────────────

class TriageRequest(BaseModel):
    text: str
    language: str = "mr"            # mr = Marathi, hi = Hindi, en = English
    patient_id: Optional[str] = None

@app.post("/api/triage")
async def triage(req: TriageRequest):
    if not req.text.strip():
        raise HTTPException(400, "No symptom text provided")
    result = await run_voice_triage(req.text, req.language)
    if req.patient_id:
        save_session(req.patient_id, "triage", result)
    return result

# ─── Pratibimb ────────────────────────────────────────────────────────────────

class PratibimbRequest(BaseModel):
    image: str                       # base64 encoded image
    patient_id: Optional[str] = None

@app.post("/api/pratibimb")
async def pratibimb(req: PratibimbRequest):
    if not req.image:
        raise HTTPException(400, "No image provided")
    result = await run_pratibimb_scan(req.image)
    if req.patient_id:
        save_session(req.patient_id, "pratibimb", result)
    return result

# ─── Early Intervention / Wellness signals ────────────────────────────────────

class WellnessRequest(BaseModel):
    session_text: str

@app.post("/api/wellness/extract")
async def extract_wellness(req: WellnessRequest):
    signals = await extract_wellness_signals(req.session_text)
    return signals

# ─── Referral Letter ──────────────────────────────────────────────────────────

class ReferralRequest(BaseModel):
    patient_name: str
    patient_age: int
    patient_village: str
    asha_name: str
    findings: str
    recommendation: str
    language: str = "mr"

@app.post("/api/referral/generate")
async def referral(req: ReferralRequest):
    letter = await generate_referral_letter(req.dict())
    pdf_path = generate_referral_pdf(letter, req.dict())
    return {
        "letter_text": letter,
        "pdf_url": f"/api/referral/download/{pdf_path}"
    }

@app.get("/api/referral/download/{filename}")
def download_referral(filename: str):
    from fastapi.responses import FileResponse
    import os
    path = f"generated/{filename}"
    if not os.path.exists(path):
        raise HTTPException(404, "PDF not found")
    return FileResponse(path, media_type="application/pdf", filename=filename)

# ─── Jeevan Score ─────────────────────────────────────────────────────────────

class JeevanRequest(BaseModel):
    patient_id: str

@app.get("/api/jeevan/{patient_id}")
def jeevan(patient_id: str):
    sessions = get_patient_sessions(patient_id)
    score, breakdown = calculate_jeevan_score(sessions)
    return {"score": score, "breakdown": breakdown, "patient_id": patient_id}

# ─── Patients ─────────────────────────────────────────────────────────────────

class PatientCreate(BaseModel):
    name: str
    age: int
    village: str
    phone: Optional[str] = None
    conditions: Optional[List[str]] = []

@app.post("/api/patients")
def create_patient(p: PatientCreate):
    patient = save_patient(p.dict())
    return patient

@app.get("/api/patients")
def list_patients():
    return get_all_patients()

@app.get("/api/patients/{patient_id}")
def get_one_patient(patient_id: str):
    p = get_patient(patient_id)
    if not p:
        raise HTTPException(404, "Patient not found")
    sessions = get_patient_sessions(patient_id)
    score, breakdown = calculate_jeevan_score(sessions)
    return {**p, "jeevan_score": score, "sessions": sessions}

# ─── Nadi IVR ─────────────────────────────────────────────────────────────────

class NadiWebhook(BaseModel):
    CallSid: str
    From: str
    SpeechResult: Optional[str] = None
    Digits: Optional[str] = None
    question_index: Optional[int] = 0

NADI_QUESTIONS = [
    "Tumchi umer kiti aahe? Teen pasun less sathi 1 daba, aathara te saath sathi 2, saath var sathi 3.",
    "Tumhala kon ta tras hoto ahe? Bolun sanga.",
    "He tras kiti divansapasun ahe?",
    "Taap ahe ka? Ho sathi 1, Nahi sathi 2.",
    "Shvaas ghenyala tras hoto ka? Ho sathi 1, Nahi sathi 2.",
    "Garbavastha ahe ka? Ho sathi 1, Nahi sathi 2, Laagu nahi sathi 3.",
    "Madhumeha kinwa raktadaab saarkhya vyaadhi aaheta ka? Ho sathi 1, Nahi sathi 2.",
]

@app.post("/api/nadi/webhook")
async def nadi_webhook(req: NadiWebhook):
    from twilio.twiml.voice_response import VoiceResponse, Gather
    response = VoiceResponse()
    idx = req.question_index or 0

    if idx < len(NADI_QUESTIONS):
        gather = Gather(
            input="speech dtmf",
            timeout=5,
            action=f"/api/nadi/webhook?question_index={idx+1}&CallSid={req.CallSid}",
            method="POST"
        )
        gather.say(NADI_QUESTIONS[idx], language="mr-IN", voice="Google.mr-IN-Standard-A")
        response.append(gather)
    else:
        # All questions answered — process and save
        response.say(
            "Dhanyavaad. Tumchi mahiti nondavali geli aahe. ASHA karyakarta lavkar samparka saadhel.",
            language="mr-IN"
        )
        response.hangup()

    return str(response)

@app.post("/api/nadi/process")
async def nadi_process(data: dict):
    result = await process_nadi_transcript(data)
    call = save_nadi_call(result)
    return call

@app.get("/api/nadi/calls")
def list_nadi_calls():
    return get_nadi_calls()

@app.post("/api/nadi/start-call")
async def start_nadi_call(request: Request):
    """Returns signed URL from ElevenLabs to start voice agent."""
    try:
        try:
            body = await request.json()
        except Exception as e:
            print("Failed to parse JSON body:", e)
            body = {}
            
        agent_id = os.getenv("ELEVENLABS_AGENT_ID")
        response = requests.get(
            f"https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id={agent_id}",
            headers={"xi-api-key": os.getenv("ELEVENLABS_API_KEY")}
        )
        
        if response.status_code != 200:
            print(f"ElevenLabs API Error: {response.status_code} - {response.text}")
            raise HTTPException(status_code=500,
                detail=f"ElevenLabs connection failed: {response.text}")
        
        return {
            "signed_url": response.json().get("signed_url"),
            "village": body.get("village", ""),
            "symptoms": body.get("symptoms", [])
        }
    except Exception as e:
        print(f"General Error in start_nadi_call: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ─── District Dashboard ───────────────────────────────────────────────────────

@app.get("/api/dashboard")
def dashboard():
    patients = get_all_patients()
    scores = []
    village_risk = {}
    critical = at_risk = stable = 0

    for p in patients:
        sessions = get_patient_sessions(p["id"])
        score, _ = calculate_jeevan_score(sessions)
        scores.append(score)
        v = p.get("village", "Unknown")
        if v not in village_risk:
            village_risk[v] = {"high": 0, "medium": 0, "low": 0}
        if score < 60:
            critical += 1
            village_risk[v]["high"] += 1
        elif score < 75:
            at_risk += 1
            village_risk[v]["medium"] += 1
        else:
            stable += 1
            village_risk[v]["low"] += 1

    avg_score = round(sum(scores) / len(scores), 1) if scores else 0

    return {
        "avg_jeevan_score": avg_score,
        "total_patients": len(patients),
        "critical": critical,
        "at_risk": at_risk,
        "stable": stable,
        "village_risk": village_risk,
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
