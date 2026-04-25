import { AppShell, Card, StatusBadge } from "@/components/AppShell";
import {
  Search,
  SlidersHorizontal,
  TrendingDown,
  TrendingUp,
  Minus,
  ChevronRight,
  Plus,
  PhoneCall,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { type Trend, type Risk } from "@/data/patients";
import { getAllPatients, createPatient } from "@/lib/api";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

const filters = ["All", "High Risk", "Medium Risk", "Pending Visit", "Nadi Calls"];

interface ApiPatient {
  id: string;
  name: string;
  age?: number;
  village: string;
  score?: number;
  trend?: Trend;
  risk?: Risk;
  lastVisit?: string;
  last_visit?: string;
  tag?: { label: string; tone: "pink" | "blue" };
  nadi?: boolean;
  nadiNote?: string;
}

const scoreTone = (score: number) => {
  if (score < 60) return "text-destructive";
  if (score < 80) return "text-warning";
  return "text-success";
};

const TrendIcon = ({ trend }: { trend: Trend }) => {
  if (trend === "up") return <TrendingUp size={14} className="text-success" />;
  if (trend === "down") return <TrendingDown size={14} className="text-destructive" />;
  return <Minus size={14} className="text-muted-foreground" />;
};

const riskVariant: Record<Risk, "red" | "amber" | "green"> = {
  HIGH: "red",
  MEDIUM: "amber",
  LOW: "green",
};

const tagStyles = {
  pink: "bg-pink-500/15 text-pink-400 border-pink-500/30",
  blue: "bg-blue-500/15 text-blue-400 border-blue-500/30",
};

const Patients = () => {
  const [activeFilter, setActiveFilter] = useState("All");
  const [patients, setPatients] = useState<ApiPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [village, setVillage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const loadPatients = async () => {
    setLoading(true);
    try {
      const data = await getAllPatients();
      const list: ApiPatient[] = Array.isArray(data) ? data : data?.patients ?? [];
      setPatients(list);
    } catch {
      toast.error("Could not reach backend");
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !village.trim() || !age) return;
    setSubmitting(true);
    try {
      await createPatient(name.trim(), Number(age), village.trim());
      toast.success("Patient added");
      setOpen(false);
      setName("");
      setAge("");
      setVillage("");
      await loadPatients();
    } catch {
      toast.error("Could not reach backend");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      {/* Header */}
      <header className="flex items-center justify-between pt-6 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">My Patients</h1>
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center">
            <Search size={18} className="text-foreground" />
          </button>
          <button className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center">
            <SlidersHorizontal size={18} className="text-foreground" />
          </button>
        </div>
      </header>

      {/* Search bar */}
      <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2.5 mb-4">
        <Search size={16} className="text-muted-foreground" />
        <input
          placeholder="Search by name or village..."
          className="bg-transparent text-sm flex-1 outline-none placeholder:text-muted-foreground"
        />
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 -mx-5 px-5 scrollbar-none">
        {filters.map((f) => {
          const active = f === activeFilter;
          return (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors ${
                active
                  ? "bg-primary/15 text-primary border-primary/40"
                  : "bg-card text-muted-foreground border-border"
              }`}
            >
              {f}
            </button>
          );
        })}
      </div>

      {/* Patient list */}
      <div className="space-y-3 pb-4">
        {loading ? (
          <>
            {[0, 1, 2].map((i) => (
              <Card key={i}>
                <div className="flex items-center gap-3">
                  <Skeleton className="w-11 h-11 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-8 w-10" />
                </div>
              </Card>
            ))}
          </>
        ) : patients.length === 0 ? (
          <Card className="text-center py-10">
            <p className="text-sm text-muted-foreground">
              No patients yet. Add your first patient.
            </p>
          </Card>
        ) : (
          patients.map((p) =>
            p.nadi ? (
              <Card key={p.id ?? p.name}>
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-full bg-blue-500/15 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                    <PhoneCall size={18} className="text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm">{p.name}</p>
                      {p.tag && (
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${tagStyles[p.tag.tone]}`}
                        >
                          {p.tag.label}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">Village: {p.village}</p>
                    {p.nadiNote && (
                      <p className="text-xs text-foreground/80 mt-1.5">{p.nadiNote}</p>
                    )}
                    <button className="mt-3 px-3 py-1.5 rounded-lg bg-gradient-primary text-primary-foreground text-xs font-semibold shadow-glow">
                      Review Profile
                    </button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card key={p.id ?? p.name} onClick={() => navigate(`/patients/${p.id}`)}>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-accent flex items-center justify-center flex-shrink-0 text-accent-foreground font-bold text-sm">
                    {p.name.split(" ").map((n) => n[0]).join("")}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm truncate">{p.name}</p>
                      {p.risk && (
                        <StatusBadge variant={riskVariant[p.risk]}>{p.risk}</StatusBadge>
                      )}
                      {p.tag && (
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${tagStyles[p.tag.tone]}`}
                        >
                          {p.tag.label}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {p.age ? `${p.age} yrs · ` : ""}{p.village}
                    </p>
                    {(p.lastVisit || p.last_visit) && (
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Last visit:{" "}
                        <span className="text-foreground/80">{p.lastVisit ?? p.last_visit}</span>
                      </p>
                    )}
                  </div>

                  {typeof p.score === "number" && (
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <div className="flex items-center gap-1">
                        <span className={`text-2xl font-bold leading-none ${scoreTone(p.score)}`}>
                          {p.score}
                        </span>
                        {p.trend && <TrendIcon trend={p.trend} />}
                      </div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                        Jeevan
                      </p>
                      <ChevronRight size={16} className="text-muted-foreground mt-1" />
                    </div>
                  )}
                </div>
              </Card>
            )
          )
        )}
      </div>

      {/* Floating action button */}
      <button
        aria-label="Add new patient"
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-[max(1.25rem,calc(50%-195px+1.25rem))] w-14 h-14 rounded-full bg-gradient-primary shadow-glow flex items-center justify-center active:scale-95 transition-transform z-10"
      >
        <Plus size={24} className="text-primary-foreground" strokeWidth={2.5} />
      </button>

      {/* Add patient dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Patient</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                min={0}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="village">Village</Label>
              <Input
                id="village"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                required
              />
            </div>
            <DialogFooter>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-primary text-primary-foreground font-semibold py-2.5 rounded-xl shadow-glow active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
                {submitting ? "Saving..." : "Save Patient"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
};

export default Patients;
