# Sahayak Backend

FastAPI backend for the Sahayak AI Health Co-Pilot.

## Setup (5 minutes)

### 1. Clone and install
```bash
cd sahayak-backend
pip install -r requirements.txt
```

### 2. Set environment variables
```bash
cp .env.example .env
# Open .env and paste your keys
```

**Get your keys:**
- Gemini API key → https://aistudio.google.com/app/apikey
- Twilio keys → https://console.twilio.com (only needed for Nadi IVR)

### 3. Run locally
```bash
python main.py
```
Backend runs at: http://localhost:8000
API docs at: http://localhost:8000/docs

---

## Connecting to Lovable

1. Copy `sahayak-api.js` into your Lovable project at `src/lib/api.js`
2. Change `BASE_URL` at the top to your backend URL
3. Import functions where needed:

```javascript
import { runTriage, runPratibimb, getAllPatients } from "@/lib/api";

// In your Triage component:
const handleAnalyse = async () => {
  setLoading(true);
  try {
    const result = await runTriage(transcript, "mr", selectedPatientId);
    setAssessment(result);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};
```

---

## Deploying (free options)

### Option 1 — Railway (recommended, easiest)
1. Go to https://railway.app
2. New Project → Deploy from GitHub repo
3. Add environment variables in Railway dashboard
4. Get your public URL (e.g. https://sahayak-backend.up.railway.app)
5. Update BASE_URL in sahayak-api.js

### Option 2 — Render
1. Go to https://render.com
2. New Web Service → connect GitHub
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn main:app --host 0.0.0.0 --port 8000`

### Option 3 — Run locally + ngrok (for demo day)
```bash
# Terminal 1
python main.py

# Terminal 2
ngrok http 8000
# Copy the https URL → paste into sahayak-api.js BASE_URL
```
ngrok gives you a public URL that tunnels to your laptop.
**This is the easiest option for the hackathon demo.**

---

## API Reference

| Method | Endpoint | What it does |
|--------|----------|-------------|
| POST | /api/triage | Analyse symptoms with Gemini |
| POST | /api/pratibimb | Face scan with Gemini Vision |
| POST | /api/wellness/extract | Extract wellness signals |
| POST | /api/referral/generate | Generate referral letter + PDF |
| GET | /api/referral/download/{file} | Download PDF |
| GET | /api/jeevan/{patient_id} | Get Jeevan Score |
| POST | /api/patients | Create patient |
| GET | /api/patients | List all patients |
| GET | /api/patients/{id} | Get patient + sessions |
| POST | /api/nadi/webhook | Twilio IVR webhook |
| GET | /api/nadi/calls | List Nadi call profiles |
| GET | /api/dashboard | District dashboard data |

Full interactive docs: http://localhost:8000/docs

---

## For Nadi IVR (Twilio setup)

1. Buy an Indian number on Twilio (~$1)
2. Set webhook URL to: `https://your-backend-url/api/nadi/webhook`
3. Select "HTTP POST"
4. When someone calls the number, Sahayak answers in Marathi automatically

---

## File Structure

```
sahayak-backend/
├── main.py          # All API routes
├── gemini.py        # Gemini API calls (triage, face scan, referral, wellness)
├── database.py      # SQLite — patients, sessions, nadi calls
├── jeevan_score.py  # Score calculation from session history
├── pdf_gen.py       # Referral PDF generation
├── sahayak-api.js   # Frontend integration code (copy to Lovable)
├── requirements.txt
├── .env.example
└── generated/       # PDF files saved here
```
