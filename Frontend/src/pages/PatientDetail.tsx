import { AppShell, Card, StatusBadge } from "@/components/AppShell";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Mic, FileText, AlertTriangle, CheckCircle2, Activity } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { patients, visitHistory, triageResults } from "@/data/patients";

const scoreColor = (score: number) => {
  if (score < 60) return { stroke: "hsl(var(--destructive))", text: "text-destructive" };
  if (score < 80) return { stroke: "hsl(var(--warning))", text: "text-warning" };
  return { stroke: "hsl(var(--success))", text: "text-success" };
};

const ScoreGauge = ({ score }: { score: number }) => {
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const { stroke, text } = scoreColor(score);

  return (
    <div className="relative w-36 h-36">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
        <circle cx="64" cy="64" r={radius} stroke="hsl(var(--border))" strokeWidth="10" fill="none" />
        <circle
          cx="64"
          cy="64"
          r={radius}
          stroke={stroke}
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-4xl font-bold ${text}`}>{score}</span>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">Jeevan</span>
      </div>
    </div>
  );
};

const toneDot = {
  red: "bg-destructive",
  amber: "bg-warning",
  green: "bg-success",
};

const riskVariant = { HIGH: "red", MEDIUM: "amber", LOW: "green" } as const;

const PatientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const patient = patients.find((p) => p.id === id);

  if (!patient) {
    return (
      <AppShell>
        <div className="pt-10 text-center">
          <p className="text-muted-foreground">Patient not found.</p>
          <Link to="/patients" className="text-primary text-sm mt-3 inline-block">Back to Patients</Link>
        </div>
      </AppShell>
    );
  }

  const visits = visitHistory.default;
  const triages = triageResults.default;
  const score = patient.score ?? 70;
  const initials = patient.name.split(" ").map((n) => n[0]).join("");

  return (
    <AppShell>
      {/* Header */}
      <header className="flex items-center gap-3 pt-6 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold tracking-tight truncate">{patient.name}</h1>
          <p className="text-xs text-muted-foreground">
            {patient.age ? `${patient.age} yrs · ` : ""}{patient.village}
          </p>
        </div>
        {patient.risk && <StatusBadge variant={riskVariant[patient.risk]}>{patient.risk}</StatusBadge>}
      </header>

      {/* Score gauge */}
      <Card className="flex items-center gap-4 mb-4">
        <ScoreGauge score={score} />
        <div className="flex-1">
          <div className="w-12 h-12 rounded-full bg-gradient-accent flex items-center justify-center text-accent-foreground font-bold mb-2">
            {initials}
          </div>
          <p className="text-sm font-semibold">Health Index</p>
          <p className="text-xs text-muted-foreground mt-1">
            {score < 60 ? "Needs urgent attention" : score < 80 ? "Monitor closely" : "Doing well"}
          </p>
        </div>
      </Card>

      {/* Visit history timeline */}
      <h2 className="text-sm font-semibold text-foreground/90 mt-2 mb-3 px-1">Visit History</h2>
      <Card className="mb-4">
        <ol className="relative">
          {visits.map((v, idx) => (
            <li key={idx} className="flex gap-3 pb-4 last:pb-0">
              <div className="flex flex-col items-center">
                <span className={`w-3 h-3 rounded-full ${toneDot[v.tone]} ring-4 ring-card`} />
                {idx < visits.length - 1 && (
                  <span className="w-px flex-1 bg-border mt-1" />
                )}
              </div>
              <div className="flex-1 -mt-0.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{v.title}</p>
                  <span className="text-[11px] text-muted-foreground">{v.date}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{v.note}</p>
              </div>
            </li>
          ))}
        </ol>
      </Card>

      {/* Triage results accordion */}
      <h2 className="text-sm font-semibold text-foreground/90 mt-2 mb-3 px-1">Triage Results</h2>
      <Card className="mb-5 py-1">
        <Accordion type="single" collapsible className="w-full">
          {triages.map((t, idx) => (
            <AccordionItem key={idx} value={`item-${idx}`} className="border-border last:border-0">
              <AccordionTrigger className="hover:no-underline py-3">
                <div className="flex items-center gap-3 flex-1 text-left">
                  {t.risk === "HIGH" ? (
                    <AlertTriangle size={16} className="text-destructive flex-shrink-0" />
                  ) : t.risk === "MEDIUM" ? (
                    <Activity size={16} className="text-warning flex-shrink-0" />
                  ) : (
                    <CheckCircle2 size={16} className="text-success flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{t.summary}</p>
                    <p className="text-[11px] text-muted-foreground font-normal">{t.date}</p>
                  </div>
                  <StatusBadge variant={riskVariant[t.risk]}>{t.risk}</StatusBadge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed pl-7">
                {t.details}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Card>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3 pb-4">
        <button
          onClick={() => navigate("/triage")}
          className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-primary text-primary-foreground text-sm font-semibold shadow-glow active:scale-[0.98] transition-transform"
        >
          <Mic size={16} />
          Start Triage
        </button>
        <button
          onClick={() => navigate(`/patients/${patient.id}/referral`)}
          className="flex items-center justify-center gap-2 py-3 rounded-xl border border-border bg-card text-foreground text-sm font-semibold active:scale-[0.98] transition-transform"
        >
          <FileText size={16} />
          Generate Referral
        </button>
      </div>
    </AppShell>
  );
};

export default PatientDetail;
