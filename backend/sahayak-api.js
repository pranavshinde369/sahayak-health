// ─────────────────────────────────────────────────────────────────────────────
// sahayak-api.js
// Paste this file into your Lovable project as src/lib/api.js
// Replace BASE_URL with your deployed backend URL
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL = "http://localhost:8000"; // Change to your deployed URL

// ─── Helper ───────────────────────────────────────────────────────────────────

async function post(endpoint, body) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Request failed: ${res.status}`);
  }
  return res.json();
}

async function get(endpoint) {
  const res = await fetch(`${BASE_URL}${endpoint}`);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

// ─── Triage ───────────────────────────────────────────────────────────────────

// Call this when ASHA taps "Analyse Symptoms"
// text: transcript from mic or typed input
// language: "mr" | "hi" | "en"
// patientId: optional — saves session to patient record
export async function runTriage(text, language = "mr", patientId = null) {
  return post("/api/triage", { text, language, patient_id: patientId });
}

// Response shape:
// {
//   assessment: "Persistent fever with breathlessness...",
//   assessment_mr: "सतत ताप आणि श्वास घेण्यास त्रास...",
//   risk_level: "high",
//   red_flags: ["Fever > 3 days", "Breathing difficulty"],
//   recommendation: "Refer to PHC immediately.",
//   recommendation_mr: "तात्काळ PHC कडे पाठवा.",
//   referral_needed: true,
//   refer_urgency: "immediate"
// }

// ─── Pratibimb ────────────────────────────────────────────────────────────────

// Call this when ASHA captures a photo
// imageBase64: base64 string from camera capture
// patientId: optional
export async function runPratibimb(imageBase64, patientId = null) {
  // Strip data URL prefix if present
  const clean = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");
  return post("/api/pratibimb", { image: clean, patient_id: patientId });
}

// Response shape:
// {
//   flags: [
//     { condition: "Anemia Risk", indicator: "Pale conjunctiva", confidence: 74,
//       region: "eyes", severity: "watch" }
//   ],
//   overall_risk: "medium",
//   refer: false,
//   summary: "Possible anemia indicators detected",
//   disclaimer: "Risk indicators only..."
// }

// ─── Wellness Signals ─────────────────────────────────────────────────────────

// Call this silently at the end of every triage session
// Store result in localStorage with timestamp for rolling window
export async function extractWellnessSignals(sessionText) {
  return post("/api/wellness/extract", { session_text: sessionText });
}

// Store in localStorage:
export function saveWellnessSignal(signals) {
  const key = "sahayak_wellness";
  const existing = JSON.parse(localStorage.getItem(key) || "[]");
  existing.push({ ...signals, date: new Date().toISOString() });
  // Keep only last 7 days
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const filtered = existing.filter((e) => e.date > cutoff);
  localStorage.setItem(key, JSON.stringify(filtered));
}

// Check rolling window for alerts:
export function checkWellnessAlerts() {
  const key = "sahayak_wellness";
  const data = JSON.parse(localStorage.getItem(key) || "[]");
  if (data.length < 4) return null;

  const last6 = data.slice(-6);
  const alerts = [];

  const count = (field, badValue) =>
    last6.filter((d) => d[field] === badValue).length;

  if (count("sleep", "poor") >= 4)
    alerts.push("Poor sleep detected for 4+ days in a row");
  if (count("fatigue", "high") >= 3)
    alerts.push("High fatigue reported for 3+ consecutive days");
  if (count("mood", "anxious") >= 4)
    alerts.push("Anxiety signals detected across multiple sessions");
  if (count("stress", "high") >= 3)
    alerts.push("Elevated stress levels detected this week");

  return alerts.length > 0 ? alerts : null;
}

// ─── Referral Letter ──────────────────────────────────────────────────────────

export async function generateReferral(patientName, patientAge, patientVillage, ashaName, findings, recommendation) {
  return post("/api/referral/generate", {
    patient_name: patientName,
    patient_age: patientAge,
    patient_village: patientVillage,
    asha_name: ashaName,
    findings,
    recommendation,
    language: "mr",
  });
}

// To download PDF:
export function downloadReferralPDF(pdfUrl) {
  window.open(`${BASE_URL}${pdfUrl}`, "_blank");
}

// ─── Patients ─────────────────────────────────────────────────────────────────

export async function createPatient(name, age, village, phone = null, conditions = []) {
  return post("/api/patients", { name, age, village, phone, conditions });
}

export async function getAllPatients() {
  return get("/api/patients");
}

export async function getPatient(patientId) {
  return get(`/api/patients/${patientId}`);
}

// ─── Jeevan Score ─────────────────────────────────────────────────────────────

export async function getJeevanScore(patientId) {
  return get(`/api/jeevan/${patientId}`);
}

// Response: { score: 54, breakdown: {...}, patient_id: "abc123" }

// ─── Nadi Calls ───────────────────────────────────────────────────────────────

export async function getNadiCalls() {
  return get("/api/nadi/calls");
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export async function getDashboard() {
  return get("/api/dashboard");
}

// Response:
// {
//   avg_jeevan_score: 68,
//   total_patients: 47,
//   critical: 3,
//   at_risk: 8,
//   stable: 36,
//   village_risk: { Mohol: { high: 4, medium: 1, low: 0 }, ... }
// }
