import os
import json
import base64
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-2.5-flash")
vision_model = genai.GenerativeModel("gemini-2.5-flash")
# ─── Helper ───────────────────────────────────────────────────────────────────

def parse_json(text: str) -> dict:
    """Strip markdown fences and parse JSON safely."""
    clean = text.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
    return json.loads(clean)

# ─── Voice Triage ─────────────────────────────────────────────────────────────

async def run_voice_triage(text: str, language: str = "mr") -> dict:
    lang_map = {"mr": "Marathi", "hi": "Hindi", "en": "English"}
    lang_name = lang_map.get(language, "English")

    prompt = f"""
You are a clinical assistant helping ASHA workers in rural India.
The following symptom description was given in {lang_name}: "{text}"

Respond ONLY with valid JSON. No explanation. No markdown.

{{
  "assessment": "brief clinical assessment in English",
  "assessment_mr": "same assessment in Marathi (Devanagari script)",
  "risk_level": "low | medium | high | emergency",
  "red_flags": ["flag1", "flag2"],
  "recommendation": "what the ASHA worker should do next, in English",
  "recommendation_mr": "same recommendation in Marathi",
  "referral_needed": true or false,
  "refer_urgency": "immediate | within_24h | within_week | none"
}}

Rules:
- Never say "diagnosed with". Frame everything as risk indicators.
- If any symptoms suggest emergency (breathlessness + fever, chest pain, unconsciousness, convulsions, heavy bleeding), set risk_level = emergency and referral_needed = true.
- If unsure, always set referral_needed = true.
- red_flags should be a list of short specific warning signs observed.
"""
    response = model.generate_content(prompt)
    result = parse_json(response.text)
    return result


# ─── Pratibimb Face Scan ──────────────────────────────────────────────────────

async def run_pratibimb_scan(image_b64: str) -> dict:
    image_data = base64.b64decode(image_b64)

    prompt = """
You are a clinical screening assistant for ASHA workers in rural India.
Analyze this face image for visible clinical signs only.

Check for:
1. Jaundice — yellow discoloration of sclera (whites of eyes) or skin
2. Anemia — pale conjunctiva (inner eyelids), pale lips, pale skin
3. Dehydration — dry/cracked lips, sunken eyes, dull skin
4. Respiratory distress — nostril flaring, labored breathing visible

Respond ONLY with valid JSON. No explanation. No markdown.

{
  "flags": [
    {
      "condition": "condition name",
      "indicator": "specific visual sign observed",
      "confidence": 0-100,
      "region": "eyes | lips | skin | nose",
      "severity": "watch | refer | clear"
    }
  ],
  "overall_risk": "low | medium | high",
  "refer": true or false,
  "summary": "one sentence summary in English",
  "disclaimer": "Risk indicators only — not a clinical diagnosis. Always refer for confirmation."
}

Rules:
- Only report conditions with confidence >= 40
- confidence < 50 = "watch", 50-74 = "watch", >= 75 = "refer"
- If image is unclear, blurry, or face not visible, return overall_risk = "unknown" and a clear message in summary
- Never say "patient has X disease"
"""
    image_part = {"mime_type": "image/jpeg", "data": image_data}
    response = vision_model.generate_content([prompt, image_part])
    result = parse_json(response.text)
    return result


# ─── Wellness Signal Extraction ───────────────────────────────────────────────

async def extract_wellness_signals(session_text: str) -> dict:
    prompt = f"""
Extract personal wellness signals from this ASHA worker's session notes or voice input.
Text: "{session_text}"

Respond ONLY with valid JSON. No explanation. No markdown.

{{
  "sleep": "poor | normal | good | unknown",
  "fatigue": "high | normal | low | unknown",
  "mood": "anxious | neutral | positive | stressed | unknown",
  "appetite": "skipped | reduced | normal | unknown",
  "pain": "present | absent | unknown",
  "stress": "high | normal | low | unknown"
}}

Only extract signals explicitly mentioned or strongly implied. Use "unknown" if not mentioned.
"""
    response = model.generate_content(prompt)
    return parse_json(response.text)


# ─── Referral Letter ──────────────────────────────────────────────────────────

async def generate_referral_letter(data: dict) -> dict:
    prompt = f"""
Generate a formal health referral letter for a rural patient in India.

Patient: {data['patient_name']}, Age {data['patient_age']}, Village: {data['patient_village']}
ASHA Worker: {data['asha_name']}
Clinical Findings: {data['findings']}
Recommendation: {data['recommendation']}

Respond ONLY with valid JSON. No explanation. No markdown.

{{
  "english": {{
    "salutation": "To the Medical Officer,",
    "body": "full letter body in formal English (3-4 sentences)",
    "closing": "closing line",
    "signature": "ASHA Worker: [name]"
  }},
  "marathi": {{
    "salutation": "वैद्यकीय अधिकारी यांना,",
    "body": "full letter body in formal Marathi Devanagari (3-4 sentences)",
    "closing": "closing line in Marathi",
    "signature": "आशा कार्यकर्ता: [name]"
  }}
}}
"""
    response = model.generate_content(prompt)
    return parse_json(response.text)


# ─── Nadi IVR Transcript Processing ──────────────────────────────────────────

async def process_nadi_transcript(answers: dict) -> dict:
    prompt = f"""
An IVR call collected these health answers from a rural patient with no smartphone.
Answers: {json.dumps(answers)}

Questions were about: age group, main symptoms, duration, fever, breathing difficulty, pregnancy, chronic conditions.

Respond ONLY with valid JSON. No explanation. No markdown.

{{
  "summary": "brief summary of patient condition",
  "symptoms": ["symptom1", "symptom2"],
  "risk_level": "low | medium | high | emergency",
  "red_flags": ["flag1"],
  "referral_needed": true or false,
  "recommended_action": "what ASHA should do",
  "estimated_age_group": "child | adult | elderly",
  "has_fever": true or false,
  "breathing_difficulty": true or false,
  "is_pregnant": true or false,
  "has_chronic_condition": true or false
}}
"""
    response = model.generate_content(prompt)
    return parse_json(response.text)
