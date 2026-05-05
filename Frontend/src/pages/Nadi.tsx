import { AppShell, Card, StatusBadge } from "@/components/AppShell";
import { Phone, PhoneIncoming, UserPlus, UserCheck } from "lucide-react";
import { useState } from 'react';
import { useNadiCall } from '../hooks/useNadiCall';
import NadiCallOverlay from '../components/NadiCallOverlay';

type Risk = "HIGH" | "MEDIUM" | "LOW";

const calls: {
  id: string;
  village: string;
  time: string;
  symptoms: string[];
  risk: Risk;
}[] = [
  {
    id: "c1",
    village: "Mohol",
    time: "12 min ago",
    symptoms: ["Fever", "Cough", "Body ache"],
    risk: "HIGH",
  },
  {
    id: "c2",
    village: "Barshi",
    time: "1 hour ago",
    symptoms: ["Headache", "Fatigue"],
    risk: "MEDIUM",
  },
  {
    id: "c3",
    village: "Akkalkot",
    time: "3 hours ago",
    symptoms: ["Mild cold", "Runny nose"],
    risk: "LOW",
  },
];

const riskVariant: Record<Risk, "red" | "amber" | "green"> = {
  HIGH: "red",
  MEDIUM: "amber",
  LOW: "green",
};

const Nadi = () => {
  const {
    callStatus, agentMessage, isSpeaking,
    callDuration, formatDuration, startCall, endCall
  } = useNadiCall();
  const [activeCallData, setActiveCallData] = useState(null);

  return (
    <AppShell>
      {/* Header */}
      <header className="flex items-center gap-3 pt-6 pb-5">
        <div className="w-11 h-11 rounded-2xl bg-[hsl(217_91%_60%/0.2)] border border-[hsl(217_91%_60%/0.4)] flex items-center justify-center">
          <Phone size={20} className="text-[hsl(217_91%_70%)]" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Nadi IVR Calls
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {calls.length} incoming calls today
          </p>
        </div>
      </header>

      {/* Call list */}
      <div className="space-y-3 pb-4">
        {calls.map((c) => (
          <Card key={c.id} className="border-l-4 border-l-[hsl(217_91%_60%)]">
            {/* Top row */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[hsl(217_91%_60%/0.15)] flex items-center justify-center flex-shrink-0">
                <PhoneIncoming size={18} className="text-[hsl(217_91%_70%)]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-foreground text-sm">
                    {c.village}
                  </p>
                  <StatusBadge variant={riskVariant[c.risk]}>
                    {c.risk}
                  </StatusBadge>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Received {c.time}
                </p>
              </div>
            </div>

            {/* Symptoms */}
            <div className="mt-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">
                Symptoms reported
              </p>
              <div className="flex flex-wrap gap-1.5">
                {c.symptoms.map((s) => (
                  <span
                    key={s}
                    className="px-2.5 py-1 rounded-full bg-secondary text-foreground text-[11px] font-medium border border-border"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              <button 
                onClick={() => {
                  setActiveCallData(c);
                  startCall(c);
                }}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-border bg-card text-foreground text-xs font-semibold active:scale-[0.98] transition-transform"
              >
                <UserCheck size={14} />
                Assign to Patient
              </button>
              <button className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-primary text-primary-foreground text-xs font-semibold shadow-glow active:scale-[0.98] transition-transform">
                <UserPlus size={14} />
                Create New Patient
              </button>
            </div>
          </Card>
        ))}
      </div>
      
      <NadiCallOverlay
        callData={activeCallData}
        callStatus={callStatus}
        agentMessage={agentMessage}
        callDuration={callDuration}
        isSpeaking={isSpeaking}
        formatDuration={formatDuration}
        onEndCall={endCall}
      />
    </AppShell>
  );
};

export default Nadi;
