import { AppShell, Card } from "@/components/AppShell";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Download, MessageCircle, Stethoscope, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { patients } from "@/data/patients";
import { generateReferral, BASE_URL } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const today = new Date().toLocaleDateString("en-IN", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

interface ReferralResponse {
  letter_text?: string;
  pdf_url?: string;
}

const ASHA_NAME = "Sunita Pawar";

const LetterShell = ({ children }: { children: React.ReactNode }) => (
  <div
    className="bg-[hsl(40_30%_96%)] text-[hsl(220_30%_15%)] rounded-xl p-5 shadow-card relative overflow-hidden"
    style={{ fontFamily: "'Noto Sans Devanagari', 'Georgia', serif" }}
  >
    <div className="border-b-2 border-[hsl(162_60%_30%)] pb-3 mb-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-[hsl(162_60%_30%)] flex items-center justify-center">
          <Stethoscope size={16} className="text-white" />
        </div>
        <div>
          <h2 className="text-sm font-bold leading-tight">ASHA Health Referral</h2>
          <p className="text-[10px] opacity-70 leading-tight">Solapur District Health Network</p>
        </div>
      </div>
    </div>
    <div className="text-[11px] text-right mb-3 opacity-80">Date: {today}</div>
    {children}
  </div>
);

const Referral = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [params] = useSearchParams();

  const patient =
    patients.find((p) => p.id === id) ?? {
      name: params.get("name") ?? "Rambai Kale",
      age: Number(params.get("age")) || 58,
      village: params.get("village") ?? "Mohol",
    };

  const findings =
    params.get("findings") ??
    "Patient presents with persistent fever for 4 days accompanied by breathlessness on mild exertion.";
  const recommendation =
    params.get("recommendation") ??
    "Refer to PHC immediately for clinical evaluation. Do not delay.";

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ReferralResponse | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await generateReferral({
          patient_name: patient.name,
          patient_age: patient.age ?? 0,
          patient_village: patient.village,
          asha_name: ASHA_NAME,
          findings,
          recommendation,
        });
        setData(res);
      } catch {
        toast.error("Could not reach backend");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patient.name, patient.village]);

  const handleDownload = () => {
    if (data?.pdf_url) {
      const url = data.pdf_url.startsWith("http") ? data.pdf_url : `${BASE_URL}${data.pdf_url}`;
      window.open(url, "_blank");
    } else {
      toast.error("PDF not available yet");
    }
  };

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
          <h1 className="text-xl font-bold tracking-tight">Referral Letter</h1>
          <p className="text-xs text-muted-foreground">
            {loading ? "Generating letter..." : `For ${patient.name} · ${patient.village}`}
          </p>
        </div>
      </header>

      {/* Letter preview */}
      <LetterShell>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <Loader2 className="animate-spin text-[hsl(162_60%_30%)]" size={28} />
            <p className="text-xs opacity-70">Generating letter...</p>
            <div className="w-full space-y-2 mt-2">
              <Skeleton className="h-3 w-full bg-black/10" />
              <Skeleton className="h-3 w-5/6 bg-black/10" />
              <Skeleton className="h-3 w-4/6 bg-black/10" />
              <Skeleton className="h-3 w-full bg-black/10" />
              <Skeleton className="h-3 w-3/5 bg-black/10" />
            </div>
          </div>
        ) : data?.letter_text ? (
          <pre className="text-[12px] leading-relaxed whitespace-pre-wrap font-[inherit]">
            {data.letter_text}
          </pre>
        ) : (
          <p className="text-[12px] opacity-70 text-center py-6">
            Could not load referral letter.
          </p>
        )}
      </LetterShell>

      {/* Meta */}
      <Card className="mt-4 mb-4">
        <p className="text-[11px] text-muted-foreground">
          This referral will be sent to the assigned PHC and a copy saved to the patient's record.
        </p>
      </Card>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3 pb-4">
        <button
          onClick={handleDownload}
          disabled={loading || !data?.pdf_url}
          className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-primary text-primary-foreground text-sm font-semibold shadow-glow active:scale-[0.98] transition-transform disabled:opacity-60"
        >
          <Download size={16} />
          Download PDF
        </button>
        <button
          disabled={loading}
          className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[hsl(142_70%_45%)] text-white text-sm font-semibold active:scale-[0.98] transition-transform disabled:opacity-60"
        >
          <MessageCircle size={16} />
          WhatsApp
        </button>
      </div>
    </AppShell>
  );
};

export default Referral;
