import { AppShell, Card, StatusBadge } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingDown,
  AlertTriangle,
  Activity,
  Moon,
  Battery,
  Brain,
  Bell,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { useEffect, useState } from "react";
import { getDashboard } from "@/lib/api";
import { toast } from "sonner";

interface DashboardData {
  avg_jeevan_score?: number;
  total_patients?: number;
  critical?: number;
  at_risk?: number;
  stable?: number;
  village_risk?: Record<string, "high" | "medium" | "low" | string | number>;
}

const toneForLevel = (level: string) => {
  const l = level.toLowerCase();
  if (l === "high") return "hsl(var(--destructive))";
  if (l === "medium") return "hsl(var(--warning))";
  return "hsl(var(--success))";
};

const wellness = [
  { icon: Moon, label: "Sleep", value: "Poor — 4 days", tone: "bg-warning" },
  { icon: Battery, label: "Fatigue", value: "Normal", tone: "bg-success" },
  { icon: Brain, label: "Stress", value: "Elevated", tone: "bg-warning" },
];

const Dashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await getDashboard();
        setData(res);
      } catch {
        toast.error("Could not reach backend");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Build village chart data from village_risk object.
  // Supports: { village: "high"|"medium"|"low" } or { village: count }
  const villageData = data?.village_risk
    ? Object.entries(data.village_risk).map(([village, value]) => {
        if (typeof value === "number") {
          const level = value >= 4 ? "High" : value >= 2 ? "Medium" : "Low";
          return { village, count: value, tone: toneForLevel(level), level };
        }
        const level = String(value);
        const display = level.charAt(0).toUpperCase() + level.slice(1).toLowerCase();
        const count =
          level.toLowerCase() === "high" ? 5 : level.toLowerCase() === "medium" ? 3 : 1;
        return { village, count, tone: toneForLevel(level), level: display };
      })
    : [];

  const maxCount = Math.max(5, ...villageData.map((v) => v.count));

  return (
    <AppShell title="District Overview" subtitle="Solapur District · Live">
      {/* Jeevan Score Summary */}
      <Card className="bg-gradient-hero border-primary/20">
        <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          Village Health Index
        </p>
        {loading ? (
          <Skeleton className="h-12 w-24 mt-2" />
        ) : (
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-5xl font-bold text-foreground">
              {data?.avg_jeevan_score ?? "—"}
            </span>
            <span className="text-lg text-muted-foreground font-medium">/100</span>
          </div>
        )}
        <p className="text-sm text-muted-foreground mt-1">
          Avg Jeevan Score across {data?.total_patients ?? "—"} patients
        </p>
        <div className="flex items-center gap-1.5 mt-3 text-warning text-xs font-semibold">
          <TrendingDown size={14} />
          <span>3 points from last week</span>
        </div>
      </Card>

      {/* Stat row */}
      <div className="grid grid-cols-3 gap-2 mt-4">
        <Card className="border-destructive/30 border-l-4 border-l-destructive p-3">
          {loading ? (
            <Skeleton className="h-7 w-8" />
          ) : (
            <p className="text-2xl font-bold text-destructive">{data?.critical ?? 0}</p>
          )}
          <p className="text-sm text-muted-foreground font-medium">Critical</p>
        </Card>
        <Card className="border-warning/30 border-l-4 border-l-warning p-3">
          {loading ? (
            <Skeleton className="h-7 w-8" />
          ) : (
            <p className="text-2xl font-bold text-warning">{data?.at_risk ?? 0}</p>
          )}
          <p className="text-sm text-muted-foreground font-medium">At Risk</p>
        </Card>
        <Card className="border-success/30 border-l-4 border-l-success p-3">
          {loading ? (
            <Skeleton className="h-7 w-8" />
          ) : (
            <p className="text-2xl font-bold text-success">{data?.stable ?? 0}</p>
          )}
          <p className="text-sm text-muted-foreground font-medium">Stable</p>
        </Card>
      </div>

      {/* Risk Distribution */}
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mt-6 mb-3">
        Risk Distribution by Village
      </h2>
      <Card>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="h-5 w-3/5" />
            <Skeleton className="h-5 w-2/5" />
          </div>
        ) : villageData.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No village risk data available.
          </p>
        ) : (
          <div className="-ml-2" style={{ height: Math.max(120, villageData.length * 36) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={villageData}
                layout="vertical"
                margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
              >
                <XAxis type="number" hide domain={[0, maxCount]} />
                <YAxis
                  type="category"
                  dataKey="village"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  width={80}
                />
                <Bar dataKey="count" radius={[6, 6, 6, 6]} barSize={18}>
                  {villageData.map((d, i) => (
                    <Cell key={i} fill={d.tone} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        <div className="flex flex-wrap gap-3 mt-2 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-destructive" /> High
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-warning" /> Medium
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-success" /> Low
          </span>
        </div>
      </Card>

      {/* Outbreak Alert */}
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mt-6 mb-3">
        Outbreak Alert
      </h2>
      <Card className="border-l-4 border-l-destructive bg-destructive/5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-destructive/15 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={18} className="text-destructive" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-foreground">Cluster Alert</p>
              <StatusBadge variant="red">URGENT</StatusBadge>
            </div>
            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
              3 patients in Mohol village reported fever + cough in last 48 hours
            </p>
            <Button
              size="sm"
              className="mt-3 bg-destructive hover:bg-destructive/90 text-destructive-foreground h-8 text-xs"
            >
              <Bell size={14} />
              Notify District Officer
            </Button>
          </div>
        </div>
      </Card>

      {/* ASHA Wellness Monitor */}
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mt-6 mb-3">
        ASHA Wellness Monitor
      </h2>
      <Card className="border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">
              Your Jeevan Score
            </p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-4xl font-bold text-primary">72</span>
              <span className="text-sm text-muted-foreground">/100</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center">
            <Activity size={22} className="text-primary" />
          </div>
        </div>

        <div className="mt-4 space-y-3 border-t border-border pt-4">
          {wellness.map((w) => (
            <div key={w.label} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                <w.icon size={15} className="text-muted-foreground" />
              </div>
              <div className="flex-1 flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">{w.label}</p>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${w.tone}`} />
                  <p className="text-sm text-muted-foreground">{w.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-muted-foreground italic text-center mt-4 pt-3 border-t border-border">
          These are your personal wellness signals
        </p>
      </Card>
    </AppShell>
  );
};

export default Dashboard;
