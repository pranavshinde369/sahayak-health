import { AppShell, Card } from "@/components/AppShell";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Download, MessageCircle, Stethoscope } from "lucide-react";
import { useState } from "react";
import { patients } from "@/data/patients";

type Lang = "en" | "mr";

const today = new Date().toLocaleDateString("en-IN", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const content = {
  en: {
    letterhead: "ASHA Health Referral",
    sub: "Solapur District Health Network",
    to: "To: Medical Officer, Primary Health Centre",
    re: "Re: Patient Referral",
    dateLabel: "Date",
    patientLabel: "Patient",
    villageLabel: "Village",
    ageLabel: "Age",
    findingsTitle: "Clinical Findings",
    findings:
      "Patient presents with persistent fever for 4 days accompanied by breathlessness on mild exertion. Voice triage flagged HIGH risk. Pratibimb scan indicated possible anemia (74%) and dehydration (58%).",
    recTitle: "Recommendation",
    recommendation:
      "Refer to PHC immediately for clinical evaluation, blood work, and chest examination. Do not delay.",
    signOff: "Respectfully submitted,",
    asha: "Sunita Pawar",
    ashaRole: "ASHA Worker · Mohol",
  },
  mr: {
    letterhead: "आशा आरोग्य संदर्भ पत्र",
    sub: "सोलापूर जिल्हा आरोग्य नेटवर्क",
    to: "प्रति: वैद्यकीय अधिकारी, प्राथमिक आरोग्य केंद्र",
    re: "विषय: रुग्ण संदर्भ",
    dateLabel: "दिनांक",
    patientLabel: "रुग्ण",
    villageLabel: "गाव",
    ageLabel: "वय",
    findingsTitle: "वैद्यकीय निरीक्षणे",
    findings:
      "रुग्णाला ४ दिवसांपासून सतत ताप असून थोड्या श्रमाने श्वासोच्छ्वासाचा त्रास होत आहे. व्हॉइस ट्रायएज मध्ये HIGH जोखीम आढळली. प्रतिबिंब स्कॅनमध्ये पंडुरोग (७४%) व निर्जलीकरण (५८%) चे संकेत आहेत.",
    recTitle: "शिफारस",
    recommendation:
      "तातडीने PHC येथे संदर्भित करा. रक्त तपासणी व छातीची तपासणी आवश्यक. विलंब करू नये.",
    signOff: "आदरपूर्वक,",
    asha: "सुनीता पवार",
    ashaRole: "आशा कार्यकर्ती · मोहोळ",
  },
};

const Letter = ({ lang, patient }: { lang: Lang; patient: { name: string; age?: number; village: string } }) => {
  const t = content[lang];
  return (
    <div
      className="bg-[hsl(40_30%_96%)] text-[hsl(220_30%_15%)] rounded-xl p-5 shadow-card relative overflow-hidden"
      style={{ fontFamily: lang === "mr" ? "'Noto Sans Devanagari', serif" : "'Georgia', serif" }}
    >
      {/* Letterhead */}
      <div className="border-b-2 border-[hsl(162_60%_30%)] pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[hsl(162_60%_30%)] flex items-center justify-center">
            <Stethoscope size={16} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold leading-tight">{t.letterhead}</h2>
            <p className="text-[10px] opacity-70 leading-tight">{t.sub}</p>
          </div>
        </div>
      </div>

      {/* Date + To */}
      <div className="flex justify-between text-[11px] mb-3">
        <span>{t.to}</span>
        <span>
          {t.dateLabel}: {today}
        </span>
      </div>

      <p className="text-[11px] font-semibold mb-3 underline">{t.re}</p>

      {/* Patient block */}
      <div className="bg-white/60 border border-[hsl(220_15%_80%)] rounded-md p-2.5 mb-3 text-[11px] space-y-0.5">
        <p>
          <span className="font-semibold">{t.patientLabel}:</span> {patient.name}
        </p>
        {patient.age && (
          <p>
            <span className="font-semibold">{t.ageLabel}:</span> {patient.age}
          </p>
        )}
        <p>
          <span className="font-semibold">{t.villageLabel}:</span> {patient.village}
        </p>
      </div>

      {/* Findings */}
      <div className="mb-3">
        <p className="text-[11px] font-bold mb-1">{t.findingsTitle}</p>
        <p className="text-[11px] leading-relaxed">{t.findings}</p>
      </div>

      {/* Recommendation */}
      <div className="mb-4 border-l-2 border-[hsl(0_70%_45%)] pl-2">
        <p className="text-[11px] font-bold mb-1">{t.recTitle}</p>
        <p className="text-[11px] leading-relaxed">{t.recommendation}</p>
      </div>

      {/* Signature */}
      <div className="text-[11px] mt-4">
        <p>{t.signOff}</p>
        <p className="font-semibold mt-3 italic">{t.asha}</p>
        <p className="text-[10px] opacity-70">{t.ashaRole}</p>
      </div>
    </div>
  );
};

const Referral = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [params] = useSearchParams();
  const [view, setView] = useState<"side" | "en" | "mr">("side");

  const patient =
    patients.find((p) => p.id === id) ?? {
      name: params.get("name") ?? "Rambai Kale",
      age: 58,
      village: params.get("village") ?? "Mohol",
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
          <p className="text-xs text-muted-foreground">Bilingual · EN / मराठी</p>
        </div>
      </header>

      {/* View toggle */}
      <div className="flex gap-1 p-1 bg-card border border-border rounded-xl mb-4">
        {([
          { key: "side", label: "Side by Side" },
          { key: "en", label: "English" },
          { key: "mr", label: "मराठी" },
        ] as const).map((o) => (
          <button
            key={o.key}
            onClick={() => setView(o.key)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
              view === o.key
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {/* Letters */}
      {view === "side" ? (
        <div className="flex gap-2 overflow-x-auto -mx-5 px-5 pb-2 snap-x snap-mandatory">
          <div className="min-w-[78%] snap-start">
            <Letter lang="en" patient={patient} />
            <p className="text-[10px] text-center text-muted-foreground mt-2">English</p>
          </div>
          <div className="min-w-[78%] snap-start">
            <Letter lang="mr" patient={patient} />
            <p className="text-[10px] text-center text-muted-foreground mt-2">मराठी</p>
          </div>
        </div>
      ) : (
        <div>
          <Letter lang={view} patient={patient} />
        </div>
      )}

      {/* Meta */}
      <Card className="mt-4 mb-4">
        <p className="text-[11px] text-muted-foreground">
          This referral will be sent to the assigned PHC and a copy saved to the patient's record.
        </p>
      </Card>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3 pb-4">
        <button className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-primary text-primary-foreground text-sm font-semibold shadow-glow active:scale-[0.98] transition-transform">
          <Download size={16} />
          Download PDF
        </button>
        <button className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[hsl(142_70%_45%)] text-white text-sm font-semibold active:scale-[0.98] transition-transform">
          <MessageCircle size={16} />
          WhatsApp
        </button>
      </div>
    </AppShell>
  );
};

export default Referral;
