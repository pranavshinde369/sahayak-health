export const BASE_URL = "http://localhost:8000";

export async function runTriage(text: string, language = "mr", patientId?: string) {
  const res = await fetch(`${BASE_URL}/api/triage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, language, patient_id: patientId }),
  });
  return res.json();
}

export async function runPratibimb(imageBase64: string, patientId?: string) {
  const clean = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");
  const res = await fetch(`${BASE_URL}/api/pratibimb`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: clean, patient_id: patientId }),
  });
  return res.json();
}

export async function getAllPatients() {
  const res = await fetch(`${BASE_URL}/api/patients`);
  return res.json();
}

export async function createPatient(name: string, age: number, village: string) {
  const res = await fetch(`${BASE_URL}/api/patients`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, age, village }),
  });
  return res.json();
}

export async function getPatient(id: string) {
  const res = await fetch(`${BASE_URL}/api/patients/${id}`);
  return res.json();
}

export async function getJeevanScore(patientId: string) {
  const res = await fetch(`${BASE_URL}/api/jeevan/${patientId}`);
  return res.json();
}

export async function generateReferral(data: {
  patient_name: string;
  patient_age: number;
  patient_village: string;
  asha_name: string;
  findings: string;
  recommendation: string;
}) {
  const res = await fetch(`${BASE_URL}/api/referral/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, language: "mr" }),
  });
  return res.json();
}

export async function getDashboard() {
  const res = await fetch(`${BASE_URL}/api/dashboard`);
  return res.json();
}

export async function getNadiCalls() {
  const res = await fetch(`${BASE_URL}/api/nadi/calls`);
  return res.json();
}

export async function extractWellnessSignals(sessionText: string) {
  const res = await fetch(`${BASE_URL}/api/wellness/extract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_text: sessionText }),
  });
  return res.json();
}
