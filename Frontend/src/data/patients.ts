export type Trend = "up" | "down" | "stable";
export type Risk = "HIGH" | "MEDIUM" | "LOW";

export interface Patient {
  id: string;
  name: string;
  age?: number;
  village: string;
  score?: number;
  trend?: Trend;
  risk?: Risk;
  lastVisit?: string;
  tag?: { label: string; tone: "pink" | "blue" };
  nadi?: boolean;
  nadiNote?: string;
}

export const patients: Patient[] = [
  { id: "rambai-kale", name: "Rambai Kale", age: 58, village: "Mohol", score: 54, trend: "down", risk: "HIGH", lastVisit: "2 days ago" },
  { id: "lata-bhosale", name: "Lata Bhosale", age: 34, village: "Akkalkot", score: 71, trend: "stable", risk: "MEDIUM", lastVisit: "Today" },
  { id: "manjula-yadav", name: "Manjula Yadav", age: 45, village: "Pandharpur", score: 88, trend: "up", risk: "LOW", lastVisit: "3 days ago" },
  { id: "savita-kamble", name: "Savita Kamble", age: 29, village: "Mohol", score: 62, trend: "up", risk: "MEDIUM", lastVisit: "1 week ago", tag: { label: "Pregnant", tone: "pink" } },
  { id: "unknown-caller", name: "Unknown Caller", village: "Barshi", nadi: true, nadiNote: "Received 3 hours ago · Fever + cough reported", tag: { label: "Nadi IVR Call", tone: "blue" } },
];

export interface VisitEntry {
  date: string;
  title: string;
  note: string;
  tone: "red" | "amber" | "green";
}

export interface TriageResult {
  date: string;
  risk: "HIGH" | "MEDIUM" | "LOW";
  summary: string;
  details: string;
}

export const visitHistory: Record<string, VisitEntry[]> = {
  default: [
    { date: "2 days ago", title: "Home Visit", note: "Fever 102°F, breathlessness on exertion. BP 140/90.", tone: "red" },
    { date: "2 weeks ago", title: "Routine Check", note: "Mild cough reported. Hydration advised.", tone: "amber" },
    { date: "1 month ago", title: "Initial Assessment", note: "Baseline Jeevan Score 71. No acute concerns.", tone: "green" },
  ],
};

export const triageResults: Record<string, TriageResult[]> = {
  default: [
    { date: "2 days ago", risk: "HIGH", summary: "Possible respiratory infection", details: "Persistent fever > 3 days with breathlessness. Refer to PHC immediately." },
    { date: "2 weeks ago", risk: "LOW", summary: "Mild upper respiratory symptoms", details: "Symptomatic care advised. Monitor for 48 hours." },
  ],
};
