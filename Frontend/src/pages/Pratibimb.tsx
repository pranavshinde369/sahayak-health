import { AppShell, Card, StatusBadge } from "@/components/AppShell";
import { Camera, Upload, Eye, Droplet, FileText, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { runPratibimb } from "@/lib/api";
import { toast } from "sonner";

type Severity = "refer" | "watch" | "clear" | string;
type OverallRisk = "high" | "medium" | "low" | string;

interface PratibimbFlag {
  condition: string;
  indicator: string;
  confidence: number;
  region: string;
  severity: Severity;
}

interface PratibimbResponse {
  flags?: PratibimbFlag[];
  overall_risk?: OverallRisk;
  disclaimer?: string;
}

const severityToVariant = (s: Severity): "red" | "amber" | "green" => {
  if (s === "refer") return "red";
  if (s === "watch") return "amber";
  return "green";
};

const severityLabel = (s: Severity) => {
  if (s === "refer") return "REFER";
  if (s === "watch") return "WATCH";
  return "CLEAR";
};

const severityBorder = (s: Severity) => {
  const v = severityToVariant(s);
  return v === "red" ? "border-destructive/30" : v === "amber" ? "border-warning/30" : "border-success/30";
};

const severityBar = (s: Severity) => {
  const v = severityToVariant(s);
  return v === "red" ? "bg-destructive" : v === "amber" ? "bg-warning" : "bg-success";
};

const regionIcon = (region: string) => {
  const r = region.toLowerCase();
  if (r.includes("mouth") || r.includes("lip")) return Droplet;
  return Eye;
};

const disclaimerStyles = (risk?: OverallRisk) => {
  const r = (risk || "").toString().toLowerCase();
  if (r === "high") return "bg-destructive/10 border-destructive/30 text-destructive";
  if (r === "low") return "bg-success/10 border-success/30 text-success";
  return "bg-warning/10 border-warning/30 text-warning";
};

const Pratibimb = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PratibimbResponse | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFile = async (file?: File | null) => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    try {
      const base64 = await fileToBase64(file);
      setPreviewUrl(base64);
      const data = await runPratibimb(base64);
      setResult(data);
    } catch {
      toast.error("Could not reach backend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell title="Pratibimb" subtitle="Clinical Face Scan">
      {/* Hidden inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

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
        {previewUrl ? (
          <img src={previewUrl} alt="Captured" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-dashed border-primary/60 flex items-center justify-center"
            style={{ width: "60%", height: "75%", borderRadius: "50% / 50%" }}
          >
            <span className="text-xs font-medium text-foreground/70 tracking-wide">
              Align face here
            </span>
          </div>
        )}
        <span className="absolute top-3 left-3 w-6 h-6 border-t-[3px] border-l-[3px] border-primary rounded-tl-md" />
        <span className="absolute top-3 right-3 w-6 h-6 border-t-[3px] border-r-[3px] border-primary rounded-tr-md" />
        <span className="absolute bottom-3 left-3 w-6 h-6 border-b-[3px] border-l-[3px] border-primary rounded-bl-md" />
        <span className="absolute bottom-3 right-3 w-6 h-6 border-b-[3px] border-r-[3px] border-primary rounded-br-md" />
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={() => cameraInputRef.current?.click()}
          disabled={loading}
          className="flex-1 bg-gradient-primary text-primary-foreground font-semibold py-3 rounded-xl shadow-glow active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <Camera size={16} /> Open Camera
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="flex-1 border border-border text-foreground font-semibold py-3 rounded-xl active:scale-[0.98] transition flex items-center justify-center gap-2 hover:bg-card disabled:opacity-60"
        >
          <Upload size={16} /> Upload Photo
        </button>
      </div>

      {/* Results */}
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mt-7 mb-3">
        Scan Results
      </h2>

      {loading ? (
        <Card className="flex items-center justify-center py-10">
          <Loader2 className="animate-spin text-primary" size={24} />
          <span className="ml-3 text-sm text-muted-foreground">Analysing image...</span>
        </Card>
      ) : result ? (
        <>
          {/* Disclaimer */}
          {result.disclaimer && (
            <Card className={`${disclaimerStyles(result.overall_risk)} mb-3`}>
              <p className="text-xs leading-relaxed">{result.disclaimer}</p>
            </Card>
          )}

          <div className="space-y-3">
            {(result.flags || []).map((f, idx) => {
              const Icon = regionIcon(f.region);
              const variant = severityToVariant(f.severity);
              const confidencePct = Math.round((f.confidence ?? 0) * (f.confidence > 1 ? 1 : 100));
              return (
                <Card key={`${f.condition}-${idx}`} className={severityBorder(f.severity)}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                        <Icon className="text-foreground/80" size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{f.condition}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{f.indicator}</p>
                      </div>
                    </div>
                    <StatusBadge variant={variant}>{severityLabel(f.severity)}</StatusBadge>
                  </div>

                  {/* Confidence bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                        Confidence
                      </span>
                      <span className="text-xs font-bold text-foreground">{confidencePct}%</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full ${severityBar(f.severity)} rounded-full transition-all`}
                        style={{ width: `${Math.min(100, Math.max(0, confidencePct))}%` }}
                      />
                    </div>
                  </div>

                  {/* Region badge */}
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-secondary border border-border text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      {f.region}
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
        </>
      ) : (
        <Card className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            Capture or upload a photo to begin analysis.
          </p>
        </Card>
      )}
    </AppShell>
  );
};

export default Pratibimb;
