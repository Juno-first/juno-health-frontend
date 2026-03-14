import { useState } from "react";
import {
  Activity, Bell, FolderOpen, Bot, Phone, UserRound, FlaskConical,
  TestTube2, Video, MapPin,
  Menu, CheckCircle2, Search,
} from "lucide-react";
import { Sidebar, BottomNav } from "../components/AppNav";
import QuickActionCard from "../components/QuickActionCard";
import SectionHeader from "../components/SectionHeader";
import AppointmentCard from "../components/AppointmentCard";
import LabCard from "../components/LabCard";
import HealthScoreCard from "../components/HealthScoreCard";
import DoctorSummaryCard from "../components/DoctorSummaryCard";
import MedicationCard from "../components/MedicationCard";

// ── Mock data ──────────────────────────────────────────────────────────────────
const MEDICATIONS = [
  { id: 1, name: "Metformin",    dose: "500mg - Twice daily",  time: "9:00 AM",  timeColor: "bg-green-100 text-green-700",  iconBg: "bg-purple-100", iconColor: "text-purple-600", done: false },
  { id: 2, name: "Lisinopril",   dose: "10mg - Once daily",    time: "2:00 PM",  timeColor: "bg-yellow-100 text-yellow-700", iconBg: "bg-blue-100",  iconColor: "text-blue-600",   done: false },
  { id: 3, name: "Atorvastatin", dose: "20mg - Once daily",    time: "9:00 PM",  timeColor: "bg-gray-100 text-gray-500",     iconBg: "bg-green-100", iconColor: "text-green-600",  done: true  },
];

const APPOINTMENTS = [
  {
    id: 1, name: "Dr. Sarah Williams", sub: "General Checkup", badge: "In 2 days",
    badgeColor: "bg-blue-100 text-blue-700", borderColor: "border-blue-500",
    iconBg: "bg-blue-100", iconColor: "text-blue-600", Icon: UserRound,
    date: "Friday, Jan 19", time: "10:30 AM",
    action: { label: "Join Virtual Visit", Icon: Video, color: "bg-blue-600 hover:bg-blue-700" },
    secondary: "Reschedule",
  },
  {
    id: 2, name: "Lab Work - Blood Test", sub: "Kingston Public Hospital", badge: "Next week",
    badgeColor: "bg-purple-100 text-purple-700", borderColor: "border-purple-500",
    iconBg: "bg-purple-100", iconColor: "text-purple-600", Icon: FlaskConical,
    date: "Monday, Jan 22", time: "8:00 AM",
    action: { label: "Get Directions", Icon: MapPin, color: "bg-purple-600 hover:bg-purple-700" },
    secondary: "Cancel",
  },
];

const LAB_RESULTS = [
  {
    id: 1, name: "Complete Blood Count (CBC)", lab: "Kingston Medical Lab",
    status: "Processing", statusColor: "bg-yellow-100 text-yellow-700",
    iconBg: "bg-orange-100", iconColor: "text-orange-600", Icon: TestTube2,
    date: "Collected on Jan 15, 2024", note: "Results expected in 1-2 business days",
    ready: false,
  },
  {
    id: 2, name: "Lipid Panel", lab: "Kingston Medical Lab",
    status: "Ready", statusColor: "bg-green-100 text-green-700",
    iconBg: "bg-green-100", iconColor: "text-green-600", Icon: CheckCircle2,
    date: "Completed on Jan 14, 2024", note: null,
    ready: true,
  },
];

const DOCTOR_SUMMARIES = [
  {
    id: 1, name: "Dr. Sarah Williams", role: "General Practitioner",
    initials: "SW", avatarBg: "bg-blue-200 text-blue-800",
    when: "2 days ago",
    note: "Patient presents with well-controlled blood pressure. Continue current medication regimen. Recommend increasing physical activity to 30 minutes daily. Follow-up in 3 months.",
    tags: [{ label: "Blood Pressure", color: "bg-blue-100 text-blue-700" }, { label: "Medication", color: "bg-green-100 text-green-700" }, { label: "Lifestyle", color: "bg-purple-100 text-purple-700" }],
  },
  {
    id: 2, name: "Dr. Marcus Thompson", role: "Cardiologist",
    initials: "MT", avatarBg: "bg-emerald-200 text-emerald-800",
    when: "1 week ago",
    note: "Echocardiogram shows normal cardiac function. Cholesterol levels have improved since last visit. Continue statin therapy and maintain current exercise routine.",
    tags: [{ label: "Cardiology", color: "bg-red-100 text-red-700" }, { label: "Cholesterol", color: "bg-orange-100 text-orange-700" }],
  },
];


// ── Main Page ──────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [meds, setMeds] = useState(MEDICATIONS);

   function markTaken(id: number) {
    setMeds((m) => m.map((x) => (x.id === id ? { ...x, done: true } : x)));
   }

  function markSkip(id: number) {
    setMeds((m) => m.map((x) => (x.id === id ? { ...x, done: true } : x)));
  }


  const QUICK_ACTIONS = [
    { gradient: "linear-gradient(135deg, var(--color-juno-green) 0%, #059669 100%)", Icon: FolderOpen, title: "View Records",  sub: "Access your medical history" },
    { gradient: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",                Icon: Bot,        title: "Ask MedBot",   sub: "Get health answers instantly" },
    { gradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",                Icon: Phone,      title: "Emergency SOS", sub: "Quick access to help", pulse: true },
  ];

  return (
    <div className="flex h-screen overflow-hidden">

      {/* ══ SIDEBAR — lg+ ═════════════════════════════════════════════════ */}
      <Sidebar />

      {/* ══ MAIN WRAPPER ══════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ── TOP HEADER ── */}
        <header className="bg-white border-b border-gray-100 px-5 py-4 lg:px-8 flex items-center justify-between flex-shrink-0"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,.04)" }}>
          <div className="flex items-center gap-4">
            {/* Mobile hamburger + logo */}
            <button className="lg:hidden w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
              <Menu className="w-5 h-5 text-gray-700" />
            </button>
            <div className="lg:hidden flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                   style={{ background: "linear-gradient(135deg, var(--color-juno-green) 0%, #059669 100%)" }}>
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black text-gray-900" style={{ fontFamily: "'Syne', sans-serif" }}>JUNO</span>
            </div>
            {/* Desktop greeting */}
            <div className="hidden lg:block">
              <h2 className="text-2xl font-bold text-gray-900">Good morning, Michael</h2>
              <p className="text-sm text-gray-500">Here's your health summary for today</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors hidden lg:flex items-center justify-center">
              <Search className="w-4.5 h-4.5 text-gray-700" />
            </button>
            <button className="relative w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center">
              <Bell className="w-4.5 h-4.5 text-gray-700" />
              <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">3</span>
            </button>
            <div className="hidden lg:flex w-10 h-10 rounded-xl bg-blue-200 items-center justify-center font-bold text-blue-800 text-sm">
              MJ
            </div>
          </div>
        </header>

        {/* ── SCROLLABLE MAIN ── */}
        <main className="flex-1 overflow-y-auto juno-bg px-4 py-6 lg:px-8 pb-24 lg:pb-8">

          {/* Mobile greeting */}
          <div className="lg:hidden mb-6 fade-up">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">Good morning, Michael</h2>
            <p className="text-gray-500">Here's your health summary for today</p>
          </div>

          {/* ── TOP ROW: health score (2/3) + quick actions (1/3) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

            {/* Health score - spans 2 cols on desktop, full on mobile */}
            <div className="lg:col-span-2">
              <HealthScoreCard size="lg" />
            </div>

            {/* Quick actions - stacked on desktop, 3-col grid on mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
              {QUICK_ACTIONS.map((a, i) => (
                <QuickActionCard key={i} {...a} />
              ))}
            </div>
          </div>

          {/* ── MIDDLE ROW: Medications | Appointments ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Medications */}
            <div>
              <SectionHeader title="Medication Reminders" />
              <div className="space-y-3">
                {meds.map(m => (
                  <MedicationCard key={m.id} med={m} onTaken={markTaken} onSkip={markSkip} />
                ))}
              </div>
            </div>

            {/* Appointments */}
            <div>
              <SectionHeader title="Upcoming Appointments" />
              <div className="space-y-3">
                {APPOINTMENTS.map(a => <AppointmentCard key={a.id} apt={a} />)}
              </div>
            </div>
          </div>

          {/* ── BOTTOM ROW: Lab Results | Doctor Summaries ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lab Results */}
            <div>
              <SectionHeader title="Pending Lab Results" />
              <div className="space-y-3">
                {LAB_RESULTS.map(l => <LabCard key={l.id} lab={l} />)}
              </div>
            </div>

            {/* Doctor Summaries */}
            <div>
              <SectionHeader title="Recent Doctor Summaries" />
              <div className="space-y-3">
                {DOCTOR_SUMMARIES.map(d => <DoctorSummaryCard key={d.id} doc={d} />)}
              </div>
            </div>
          </div>

        </main>
      </div>

      {/* ══ BOTTOM NAV — mobile only ═══════════════════════════════════════ */}
      <BottomNav />

    </div>
  );
}