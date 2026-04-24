import { AppShell, Card } from "@/components/AppShell";
import {
  Mic,
  Camera,
  Phone,
  FileText,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <AppShell>
      {/* Greeting */}
      <header className="pt-6 pb-5">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Namaskar, Sunita 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          ASHA Worker · Solapur District
        </p>
        <div className="flex items-center gap-2 mt-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          <span className="text-xs font-medium text-primary">Online</span>
        </div>
      </header>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2.5 mb-6">
        <Card className="p-3">
          <p className="text-2xl font-bold text-foreground">12</p>
          <p className="text-[10px] text-muted-foreground mt-1 leading-tight">
            Patients Today
          </p>
        </Card>
        <Card className="p-3">
          <p className="text-2xl font-bold text-warning">3</p>
          <p className="text-[10px] text-muted-foreground mt-1 leading-tight">
            Pending Alerts
          </p>
        </Card>
        <Card className="p-3">
          <p className="text-2xl font-bold text-success">94%</p>
          <p className="text-[10px] text-muted-foreground mt-1 leading-tight">
            Adherence
          </p>
        </Card>
      </div>

      {/* Quick Actions */}
      <h2 className="text-base font-semibold text-foreground mb-3">
        Quick Actions
      </h2>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <ActionCard
          icon={<Mic size={22} />}
          label="Voice Triage"
          tone="teal"
          onClick={() => navigate("/triage")}
        />
        <ActionCard
          icon={<Camera size={22} />}
          label="Face Scan"
          tone="purple"
          onClick={() => navigate("/pratibimb")}
        />
        <ActionCard
          icon={<Phone size={22} />}
          label="Nadi Calls"
          tone="blue"
          onClick={() => navigate("/nadi")}
        />
        <ActionCard
          icon={<FileText size={22} />}
          label="Referral Letter"
          tone="orange"
        />
      </div>

      {/* Recent Alerts */}
      <h2 className="text-base font-semibold text-foreground mb-3">
        Recent Alerts
      </h2>
      <div className="space-y-3 mb-6">
        <AlertCard
          level="red"
          name="Rambai Kale"
          risk="High Risk"
          note="Fever 4 days + breathlessness"
          time="2 hours ago"
        />
        <AlertCard
          level="amber"
          name="Sunita Pawar"
          risk="Medium Risk"
          note="Poor sleep reported 5 days"
          time="Yesterday"
        />
      </div>

      {/* Early Intervention banner */}
      <div className="bg-warning/15 border border-warning/40 rounded-2xl p-4 flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center flex-shrink-0">
          <AlertCircle className="text-warning" size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold text-warning uppercase tracking-wide">
            Your wellness check
          </p>
          <p className="text-xs text-foreground/90 mt-0.5 leading-snug">
            Poor sleep detected 4 days in a row
          </p>
        </div>
        <button className="px-3.5 py-1.5 rounded-lg bg-warning text-warning-foreground text-xs font-semibold active:scale-95 transition">
          View
        </button>
      </div>
    </AppShell>
  );
};

type Tone = "teal" | "purple" | "blue" | "orange";

const toneStyles: Record<Tone, { bg: string; iconBg: string; text: string }> = {
  teal: {
    bg: "bg-primary/15 border-primary/30",
    iconBg: "bg-primary/25 text-primary",
    text: "text-primary",
  },
  purple: {
    bg: "bg-accent/15 border-accent/30",
    iconBg: "bg-accent/25 text-accent",
    text: "text-accent",
  },
  blue: {
    bg: "bg-[#1e3a5f] border-[hsl(217_91%_60%/0.4)]",
    iconBg: "bg-[hsl(217_91%_60%/0.3)] text-[hsl(217_91%_75%)]",
    text: "text-[hsl(217_91%_75%)]",
  },
  orange: {
    bg: "bg-[#3d1f0a] border-[hsl(25_95%_55%/0.4)]",
    iconBg: "bg-[hsl(25_95%_55%/0.3)] text-[hsl(25_95%_70%)]",
    text: "text-[hsl(25_95%_70%)]",
  },
};

const ActionCard = ({
  icon,
  label,
  tone,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  tone: Tone;
  onClick?: () => void;
}) => {
  const s = toneStyles[tone];
  return (
    <button
      onClick={onClick}
      className={`relative ${s.bg} border rounded-2xl p-4 h-28 flex flex-col justify-between text-left active:scale-[0.97] transition-transform`}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.iconBg}`}
      >
        {icon}
      </div>
      <div className="flex items-end justify-between">
        <span className="text-base font-bold text-foreground">{label}</span>
        <ChevronRight size={16} className={s.text} />
      </div>
    </button>
  );
};

const AlertCard = ({
  level,
  name,
  risk,
  note,
  time,
}: {
  level: "red" | "amber";
  name: string;
  risk: string;
  note: string;
  time: string;
}) => {
  const accentClass =
    level === "red"
      ? "before:bg-destructive"
      : "before:bg-warning";
  const riskColor = level === "red" ? "text-destructive" : "text-warning";
  return (
    <div
      className={`relative bg-card border border-border rounded-2xl p-4 pl-5 shadow-card overflow-hidden before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1.5 ${accentClass}`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="font-semibold text-sm text-foreground">
          {name} · <span className={riskColor}>{risk}</span>
        </p>
        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
          {time}
        </span>
      </div>
      <p className="text-xs text-muted-foreground mt-1">{note}</p>
    </div>
  );
};

export default Index;
