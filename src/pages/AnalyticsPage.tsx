import { useState, useEffect } from "react";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  TrendingUp, TrendingDown, Users, Clock, AlertTriangle,
  BarChart2, Zap, RefreshCw, ArrowUpRight,
} from "lucide-react";
import { Sidebar, BottomNav } from "../components/AppNav";

// ── Types ──────────────────────────────────────────────────────────────────────
type Period = "7d" | "30d" | "12w" | "12m";

// ── Palette (mirrors JUNO green + accent colours) ──────────────────────────────
const JUNO_GREEN  = "#10b981";
const COLORS = {
  green:  JUNO_GREEN,
  blue:   "#3b82f6",
  purple: "#8b5cf6",
  orange: "#f97316",
  red:    "#ef4444",
  teal:   "#14b8a6",
  yellow: "#f59e0b",
};

// ── Mock-data generators ───────────────────────────────────────────────────────
function range(n: number) { return Array.from({ length: n }, (_, i) => i); }

const dailyVolume = range(30).map((_, i) => ({
  date: `Jan ${i + 1}`,
  patients: Math.round(80 + Math.random() * 60),
  target: 110,
}));

const weeklyDepts = range(12).map((_, i) => ({
  week: `W${i + 1}`,
  Emergency: Math.round(40 + Math.random() * 30),
  General:   Math.round(60 + Math.random() * 40),
  Cardiology:Math.round(20 + Math.random() * 20),
  Pediatrics:Math.round(25 + Math.random() * 25),
}));

const hourlyWait = range(24).map((_, h) => ({
  hour: `${h}:00`,
  avgWait: Math.round(5 + Math.abs(Math.sin(h / 4)) * 30 + Math.random() * 10),
}));

const symptomEvolution = range(12).map((_, i) => {
  const m = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i];
  return { month: m, Respiratory: Math.round(30+Math.random()*20), Cardiac: Math.round(15+Math.random()*10), Trauma: Math.round(20+Math.random()*15), Neurological: Math.round(10+Math.random()*8) };
});

const priorityDist = [
  { name: "Critical",  value: 12, color: COLORS.red    },
  { name: "High",      value: 28, color: COLORS.orange  },
  { name: "Medium",    value: 38, color: COLORS.yellow  },
  { name: "Low",       value: 22, color: COLORS.green   },
];

const staffPerf = [
  { name: "Dr. Williams",  seen: 24, target: 20, wait: 8  },
  { name: "Dr. Thompson",  seen: 19, target: 20, wait: 14 },
  { name: "Nurse Clarke",  seen: 31, target: 28, wait: 6  },
  { name: "Dr. Patel",     seen: 22, target: 20, wait: 10 },
  { name: "Nurse Davis",   seen: 27, target: 28, wait: 9  },
];

const deptLoad = [
  { dept: "Emergency",  load: 92, capacity: 50, current: 46 },
  { dept: "General",    load: 67, capacity: 80, current: 54 },
  { dept: "Cardiology", load: 54, capacity: 30, current: 16 },
  { dept: "Pediatrics", load: 78, capacity: 40, current: 31 },
  { dept: "Orthopedics",load: 43, capacity: 25, current: 11 },
];

const realtimeMetrics = {
  activeQueue: 47,
  avgWait: 23,
  throughput: 12,
  alerts: 3,
  queueTrend: +8,
  waitTrend: -4,
  throughputTrend: +15,
};

const queueDepth = range(24).map((_, h) => ({
  hour: `${h}:00`,
  depth: Math.round(20 + Math.abs(Math.sin((h - 8) / 4)) * 35 + Math.random() * 8),
}));

// ── Sub-components ─────────────────────────────────────────────────────────────
function StatCard({
  label, value, sub, icon: Icon, color, trend,
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; color: string; trend?: number;
}) {
  const positive = trend != null && trend >= 0;
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-shadow"
         style={{ boxShadow: "0 2px 8px rgba(0,0,0,.05)" }}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
             style={{ background: `${color}18` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        {trend != null && (
          <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full
            ${positive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
            {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-3xl font-black text-gray-900 mb-0.5">{value}</p>
      <p className="text-sm font-semibold text-gray-700">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function ChartCard({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5"
         style={{ boxShadow: "0 2px 8px rgba(0,0,0,.05)" }}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-gray-900 text-base">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function PeriodSelect({ value, onChange }: { value: Period; onChange: (p: Period) => void }) {
  const opts: { label: string; v: Period }[] = [
    { label: "7 Days", v: "7d" }, { label: "30 Days", v: "30d" },
    { label: "12 Weeks", v: "12w" }, { label: "12 Months", v: "12m" },
  ];
  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
      {opts.map(o => (
        <button key={o.v} onClick={() => onChange(o.v)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
            ${value === o.v ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

function LoadBar({ dept, load, capacity, current }: typeof deptLoad[0]) {
  const color = load > 85 ? COLORS.red : load > 65 ? COLORS.orange : COLORS.green;
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm font-semibold text-gray-800">{dept}</span>
        <span className="text-xs text-gray-500">{current}/{capacity} patients</span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700"
             style={{ width: `${load}%`, background: color }} />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs text-gray-400">Utilization</span>
        <span className="text-xs font-bold" style={{ color }}>{load}%</span>
      </div>
    </div>
  );
}

function AlertBadge({ count }: { count: number }) {
  if (!count) return null;
  return (
    <span className="ml-2 inline-flex items-center gap-1 bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
      <AlertTriangle className="w-3 h-3" />
      {count} alert{count > 1 ? "s" : ""}
    </span>
  );
}

// ── Custom tooltip ─────────────────────────────────────────────────────────────
function JunoTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 text-white text-xs rounded-xl px-3 py-2 shadow-xl">
      <p className="font-semibold mb-1 text-gray-300">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <span className="font-bold text-white">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>("30d");
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  function refresh() {
    setLoading(true);
    setTimeout(() => { setLoading(false); setLastRefresh(new Date()); }, 900);
  }

  // Simulate live pulse on realtime card
  const [pulse, setPulse] = useState(realtimeMetrics.activeQueue);
  useEffect(() => {
    const t = setInterval(() => {
      setPulse(v => v + (Math.random() > 0.5 ? 1 : -1));
    }, 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ── Header ── */}
        <header className="bg-white border-b border-gray-100 px-5 py-4 lg:px-8 flex items-center justify-between flex-shrink-0"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,.04)" }}>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart2 className="w-6 h-6" style={{ color: JUNO_GREEN }} />
              Queue Analytics
              <AlertBadge count={realtimeMetrics.alerts} />
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">
              Last updated {lastRefresh.toLocaleTimeString()}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <PeriodSelect value={period} onChange={setPeriod} />
            <button onClick={refresh}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
              style={{ background: `linear-gradient(135deg, ${JUNO_GREEN} 0%, #059669 100%)` }}>
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </header>

        {/* ── Scrollable body ── */}
        <main className="flex-1 overflow-y-auto juno-bg px-4 py-6 lg:px-8 pb-52 lg:pb-32 space-y-6">

          {/* ── Row 1: KPI stat cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Active Queue" value={pulse} sub="Patients waiting now"
              icon={Users} color={COLORS.blue} trend={realtimeMetrics.queueTrend} />
            <StatCard label="Avg Wait Time" value={`${realtimeMetrics.avgWait}m`} sub="Across all departments"
              icon={Clock} color={COLORS.orange} trend={realtimeMetrics.waitTrend} />
            <StatCard label="Throughput" value={`${realtimeMetrics.throughput}/hr`} sub="Patients seen per hour"
              icon={Zap} color={COLORS.green} trend={realtimeMetrics.throughputTrend} />
            <StatCard label="Active Alerts" value={realtimeMetrics.alerts} sub="Require attention"
              icon={AlertTriangle} color={COLORS.red} />
          </div>

          {/* ── Row 2: Symptom Trend Alerts ── */}
          <div>
            <ChartCard title={<>Symptom Trend Alerts <AlertBadge count={3} /></> as any}>
              <div className="space-y-3">
                {[
                  { symptom: "Fever / Flu-like",       change: "+1000%", dept: "General",    severity: "high",   color: COLORS.red    },
                  { symptom: "Respiratory complaints", change: "+34%",  dept: "Emergency",  severity: "high",   color: COLORS.red    },
                  { symptom: "Chest pain reports",     change: "+18%",  dept: "Cardiology", severity: "medium", color: COLORS.orange },
                ].map((a, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl border"
                       style={{ borderColor: `${a.color}30`, background: `${a.color}08` }}>
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: a.color }} />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{a.symptom}</p>
                        <p className="text-xs text-gray-400">{a.dept}</p>
                      </div>
                    </div>
                    <span className="flex items-center gap-1 text-sm font-bold" style={{ color: a.color }}>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      {a.change}
                    </span>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>

          {/* ── Row 3: Daily volume + Queue depth ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            <ChartCard title="Daily Patient Volume"
              action={
                <span className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ background: JUNO_GREEN }} />
                  vs target
                </span>
              }>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={dailyVolume.slice(-20)} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gPatients" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={JUNO_GREEN} stopOpacity={0.18} />
                      <stop offset="95%" stopColor={JUNO_GREEN} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                  <Tooltip content={<JunoTooltip />} />
                  <Area type="monotone" dataKey="patients" stroke={JUNO_GREEN} strokeWidth={2.5}
                        fill="url(#gPatients)" name="Patients" />
                  <Line type="monotone" dataKey="target" stroke={COLORS.red} strokeWidth={1.5}
                        strokeDasharray="5 3" dot={false} name="Target" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Queue Depth (24h)">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={queueDepth} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gQueue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.purple} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={COLORS.purple} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false}
                         interval={3} />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                  <Tooltip content={<JunoTooltip />} />
                  <Area type="monotone" dataKey="depth" stroke={COLORS.purple} strokeWidth={2.5}
                        fill="url(#gQueue)" name="Queue Depth" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

          </div>

          {/* ── Row 3: Weekly dept + Priority pie ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <div className="lg:col-span-2">
              <ChartCard title="Weekly Department Volume">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={weeklyDepts.slice(-8)} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="week" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                    <Tooltip content={<JunoTooltip />} />
                    <Legend iconSize={8} iconType="circle"
                      wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                    <Bar dataKey="Emergency"  fill={COLORS.red}    radius={[3,3,0,0]} />
                    <Bar dataKey="General"    fill={COLORS.blue}   radius={[3,3,0,0]} />
                    <Bar dataKey="Cardiology" fill={COLORS.purple} radius={[3,3,0,0]} />
                    <Bar dataKey="Pediatrics" fill={COLORS.teal}   radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            <ChartCard title="Priority Distribution">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={priorityDist} cx="50%" cy="50%" innerRadius={52} outerRadius={78}
                       paddingAngle={3} dataKey="value">
                    {priorityDist.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<JunoTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {priorityDist.map(p => (
                  <div key={p.name} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: p.color }} />
                    <span className="text-xs text-gray-600">{p.name}</span>
                    <span className="text-xs font-bold text-gray-900 ml-auto">{p.value}%</span>
                  </div>
                ))}
              </div>
            </ChartCard>

          </div>

          {/* ── Row 4: Hourly wait + Symptom evolution ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            <ChartCard title="Hourly Wait Times (avg min)">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={hourlyWait} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false}
                         interval={3} />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                  <Tooltip content={<JunoTooltip />} />
                  <Line type="monotone" dataKey="avgWait" stroke={COLORS.orange} strokeWidth={2.5}
                        dot={false} name="Avg Wait (min)" />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Monthly Symptom Category Trends">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={symptomEvolution} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                  <Tooltip content={<JunoTooltip />} />
                  <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                  <Line type="monotone" dataKey="Respiratory"  stroke={COLORS.blue}   strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Cardiac"      stroke={COLORS.red}    strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Trauma"       stroke={COLORS.orange} strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Neurological" stroke={COLORS.purple} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

          </div>

          {/* ── Row 5: Department Load + Staff Performance ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            <ChartCard title="Department Load Analysis">
              <div className="mt-1">
                {deptLoad.map(d => <LoadBar key={d.dept} {...d} />)}
              </div>
            </ChartCard>

            <ChartCard title="Staff Performance — Patients Seen Today">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={staffPerf} layout="vertical"
                          margin={{ top: 4, right: 12, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" width={95}
                         tick={{ fontSize: 11, fill: "#374151", fontWeight: 600 }}
                         tickLine={false} axisLine={false} />
                  <Tooltip content={<JunoTooltip />} />
                  <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                  <Bar dataKey="seen"   fill={JUNO_GREEN}    radius={[0,4,4,0]} name="Seen" />
                  <Bar dataKey="target" fill="#e2e8f0"       radius={[0,4,4,0]} name="Target" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

          </div>


        </main>
      </div>

      <BottomNav />
    </div>
  );
}