import { AppShell, Card, StatusBadge } from "@/components/AppShell";
import {
  ArrowLeft,
  Mic,
  ChevronDown,
  AlertTriangle,
  FileText,
  Save,
  Sparkles,
  Loader2,
} from "lucide-react";
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { runTriage } from "@/lib/api";
import { toast } from "sonner";
import { useSpeechInput } from '../hooks/useSpeechInput';
import MicButton from '../components/MicButton';

type RiskLevel = "HIGH" | "MEDIUM" | "LOW";

interface TriageResponse {
  assessment?: string;
  risk_level?: RiskLevel | string;
  red_flags?: string[];
  recommendation?: string;
  referral_needed?: boolean;
}

const Triage = () => {
  const navigate = useNavigate();
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [analysing, setAnalysing] = useState(false);
  const [result, setResult] = useState<TriageResponse | null>(null);

  const handleVoiceResult = useCallback((text: string) => {
    setTranscript(text);
  }, []);

  const { isListening, error, toggleListening } = useSpeechInput(
    handleVoiceResult
  );

  const hasText = transcript.trim().length > 0;

  const handleAnalyse = async () => {
    if (!hasText || analysing) return;
    setAnalysing(true);
    setResult(null);
    try {
      const data = await runTriage(transcript, "mr");
      setResult(data);
    } catch (e) {
      toast.error("Could not reach backend");
    } finally {
      setAnalysing(false);
    }
  };

  return (
    <AppShell>
      {/* Header */}
      <header className="flex items-center justify-between pt-6 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center active:scale-95 transition"
          aria-label="Back"
        >
          <ArrowLeft size={18} className="text-foreground" />
        </button>
        <h1 className="text-lg font-bold tracking-tight">Voice Triage</h1>
        <button className="px-3 h-9 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-bold tracking-wide active:scale-95 transition">
          MR
        </button>
      </header>

      {/* Patient selector */}
      <button className="w-full flex items-center justify-between bg-card border border-border rounded-2xl px-4 py-3 mb-6 active:scale-[0.99] transition">
        <div className="text-left">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
            Patient
          </p>
          <p className="text-sm font-semibold text-foreground mt-0.5">
            Rambai Kale
            <span className="text-muted-foreground font-normal">
              {" "}
              — Village: Mohol
            </span>
          </p>
        </div>
        <ChevronDown size={18} className="text-muted-foreground" />
      </button>

      {/* Mic button */}
      <div className="flex flex-col items-center py-4">
        <button
          onClick={() => setRecording(!recording)}
          className="relative w-20 h-20 rounded-full flex items-center justify-center bg-gradient-primary shadow-glow active:scale-95 transition"
          aria-label={recording ? "Stop recording" : "Start recording"}
        >
          {recording && (
            <>
              <span className="absolute inset-0 rounded-full bg-primary/40 animate-ping" />
              <span className="absolute -inset-2 rounded-full border-2 border-primary/50 animate-pulse" />
            </>
          )}
          <Mic className="text-primary-foreground relative z-10" size={32} />
        </button>
        <p className="mt-4 text-sm font-semibold text-foreground">
          {recording ? "Listening..." : "Tap to speak"}
        </p>
      </div>

      {/* Transcript */}
      <Card className="mt-2 mb-3 min-h-[110px] flex flex-col">
        <div style={{
          display: 'flex',
          gap: 10,
          alignItems: 'center'
        }}>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value.slice(0, 500))}
            placeholder="Type or speak symptoms in Marathi..."
            className="bg-transparent resize-none outline-none text-sm leading-relaxed flex-1 min-h-[80px] placeholder:text-muted-foreground placeholder:italic text-foreground"
            style={{ flex: 1 }}
          />
          <MicButton
            isListening={isListening}
            onClick={toggleListening}
            disabled={false}
          />
        </div>

        {isListening && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginTop: 8,
            color: '#4ade80',
            fontSize: 13
          }}>
            <div style={{
              width: 8, height: 8,
              borderRadius: '50%',
              backgroundColor: '#ef4444',
              animation: 'micPulse 1s infinite'
            }}/>
            Listening... speak in Marathi or Hindi
          </div>
        )}

        {error && (
          <div style={{
            marginTop: 8,
            color: '#f87171',
            fontSize: 13
          }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{
          fontSize: 11,
          color: '#6b7280',
          marginTop: 6
        }}>
          🎤 मराठी, हिंदी किंवा English मध्ये बोला
        </div>
        <p className="text-[10px] text-muted-foreground text-right mt-2 font-mono">
          {transcript.length} / 500
        </p>
      </Card>

      {/* Analyse Symptoms */}
      <button
        onClick={handleAnalyse}
        disabled={!hasText || analysing}
        className={`w-full font-semibold py-3 rounded-xl mb-6 flex items-center justify-center gap-2 transition-all ${
          hasText && !analysing
            ? "bg-gradient-primary text-primary-foreground shadow-glow active:scale-[0.98]"
            : "bg-secondary text-muted-foreground cursor-not-allowed"
        }`}
      >
        {analysing ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Analysing...
          </>
        ) : (
          <>
            <Sparkles size={16} /> Analyse Symptoms
          </>
        )}
      </button>

      {result && (() => {
        const risk = (result.risk_level || "").toString().toUpperCase() as RiskLevel;
        const variant = risk === "HIGH" ? "red" : risk === "MEDIUM" ? "amber" : "green";
        const borderClass =
          risk === "HIGH"
            ? "border-destructive/30"
            : risk === "MEDIUM"
            ? "border-warning/30"
            : "border-success/30";
        return (
          <>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Assessment Result
            </h2>
            <Card className={borderClass}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Assessment
                </span>
                {risk && <StatusBadge variant={variant}>{risk}</StatusBadge>}
              </div>

              {result.assessment && (
                <p className="text-sm text-foreground leading-relaxed mb-4">
                  {result.assessment}
                </p>
              )}

              {result.red_flags && result.red_flags.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                    Red Flags
                  </p>
                  <ul className="space-y-1.5">
                    {result.red_flags.map((flag) => (
                      <li
                        key={flag}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <AlertTriangle
                          size={14}
                          className="text-destructive mt-0.5 shrink-0"
                        />
                        <span>{flag}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.recommendation && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                    Recommendation
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {result.recommendation}
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-2 pt-2">
                {result.referral_needed && (
                  <button
                    onClick={() => {
                      const qs = new URLSearchParams({
                        name: "Rambai Kale",
                        age: "58",
                        village: "Mohol",
                        findings: result.assessment ?? "",
                        recommendation: result.recommendation ?? "",
                      }).toString();
                      navigate(`/referral?${qs}`);
                    }}
                    className="w-full bg-gradient-primary text-primary-foreground font-semibold py-3 rounded-xl shadow-glow active:scale-[0.98] transition flex items-center justify-center gap-2"
                  >
                    <FileText size={16} /> Generate Referral Letter
                  </button>
                )}
                <button className="w-full border border-border text-foreground font-semibold py-3 rounded-xl active:scale-[0.98] transition flex items-center justify-center gap-2 hover:bg-card">
                  <Save size={16} /> Save to Patient
                </button>
              </div>
            </Card>
          </>
        );
      })()}
    </AppShell>
  );
};

export default Triage;
