import { AppShell, Card, StatusBadge } from "@/components/AppShell";
import { Camera, Upload, Eye, Droplet, FileText, CheckCircle2 } from "lucide-react";

type ResultLevel = "amber" | "green" | "red";

interface ScanResult {
  condition: string;
  indicator: string;
  confidence: number;
  region: string;
  level: ResultLevel;
  cleared?: boolean;
  icon: typeof Eye;
}

const results: ScanResult[] = [
  {
    condition: "Anemia Risk",
    indicator: "Pale conjunctiva detected",
    confidence: 74,
    region: "Eyes",
    level: "amber",
    icon: Eye,
  },
  {
    condition: "Jaundice",
    indicator: "No yellow sclera detected",
    confidence: 12,
    region: "Eyes",
    level: "green",
    cleared: true,
    icon: Eye,
  },
  {
    condition: "Dehydration",
    indicator: "Dry lips observed",
    confidence: 58,
    region: "Mouth",
    level: "amber",
    icon: Droplet,
  },
];

const levelBarClass: Record<ResultLevel, string> = {
  amber: "bg-warning",
  green: "bg-success",
  red: "bg-destructive",
};

const levelBorderClass: Record<ResultLevel, string> = {
  amber: "border-warning/30",
  green: "border-success/30",
  red: "border-destructive/30",
};

const Pratibimb = () => {
  return (
    <AppShell title="Pratibimb" subtitle="Clinical Face Scan">
      {/* Instruction card */}
      <Card className="flex items-start gap-3 bg-gradient-hero border-accent/20">
        <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center shrink-0">
          <Camera className="text-accent" size={20} />
        </div>
        <p className="text-sm text-foreground/90 leading-relaxed">
          Position patient's face within the frame. Ensure good lighting.
        </p>
      </Card>

      {/* Viewfinder */}
      <div
        className="relative w-full mt-5 rounded-2xl overflow-hidden bg-card border border-border"
        style={{ aspectRatio: "3 / 4" }}
      >
        {/* Portrait oval face guide (60% w x 75% h) */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-dashed border-primary/60 flex items-center justify-center"
          style={{ width: "60%", height: "75%", borderRadius: "50% / 50%" }}
        >
          <span className="text-xs font-medium text-foreground/70 tracking-wide">
            Align face here
          </span>
        </div>
        {/* Teal corner brackets */}
        <span className="absolute top-3 left-3 w-6 h-6 border-t-[3px] border-l-[3px] border-primary rounded-tl-md" />
        <span className="absolute top-3 right-3 w-6 h-6 border-t-[3px] border-r-[3px] border-primary rounded-tr-md" />
        <span className="absolute bottom-3 left-3 w-6 h-6 border-b-[3px] border-l-[3px] border-primary rounded-bl-md" />
        <span className="absolute bottom-3 right-3 w-6 h-6 border-b-[3px] border-r-[3px] border-primary rounded-br-md" />
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mt-4">
        <button className="flex-1 bg-gradient-primary text-primary-foreground font-semibold py-3 rounded-xl shadow-glow active:scale-[0.98] transition flex items-center justify-center gap-2">
          <Camera size={16} /> Open Camera
        </button>
        <button className="flex-1 border border-border text-foreground font-semibold py-3 rounded-xl active:scale-[0.98] transition flex items-center justify-center gap-2 hover:bg-card">
          <Upload size={16} /> Upload Photo
        </button>
      </div>

      {/* Results */}
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mt-7 mb-3">
        Scan Results
      </h2>

      {/* Disclaimer */}
      <Card className="bg-warning/10 border-warning/30 mb-3">
        <p className="text-xs text-warning leading-relaxed">
          <span className="font-bold">Risk indicators only</span> — not a clinical diagnosis. Always refer for confirmation.
        </p>
      </Card>

      <div className="space-y-3">
        {results.map((r) => {
          const Icon = r.icon;
          return (
            <Card key={r.condition} className={levelBorderClass[r.level]}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                    <Icon className="text-foreground/80" size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{r.condition}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{r.indicator}</p>
                  </div>
                </div>
                {r.cleared ? (
                  <StatusBadge variant="green">
                    <CheckCircle2 size={11} /> CLEAR
                  </StatusBadge>
                ) : (
                  <StatusBadge variant={r.level}>
                    {r.level === "red" ? "HIGH" : "WATCH"}
                  </StatusBadge>
                )}
              </div>

              {/* Confidence bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    Confidence
                  </span>
                  <span className="text-xs font-bold text-foreground">{r.confidence}%</span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full ${levelBarClass[r.level]} rounded-full transition-all`}
                    style={{ width: `${r.confidence}%` }}
                  />
                </div>
              </div>

              {/* Region badge */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-secondary border border-border text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {r.region}
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Generate Report */}
      <button className="w-full mt-5 bg-gradient-primary text-primary-foreground font-semibold py-3.5 rounded-xl shadow-glow active:scale-[0.98] transition flex items-center justify-center gap-2">
        <FileText size={16} /> Generate Report
      </button>
    </AppShell>
  );
};

export default Pratibimb;
