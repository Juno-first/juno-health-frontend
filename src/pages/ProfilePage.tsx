import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar, BottomNav } from "../components/AppNav";
import {
  ArrowLeft, Settings, Camera, QrCode, Pencil, Droplets, Ruler,
  Scale, MapPin, HeartPulse, TriangleAlert, Pill, TrendingUp,
  FileText, TestTube2, Users, User, Share2, Download, RefreshCw,
  Lightbulb, ShieldCheck, History, Phone, Info, ChevronRight,
  Calendar, Clock, Hourglass,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type SessionDuration = "15min" | "30min" | "1hr" | "2hr";

// ─── Gradient-border style (reused on the flip card) ─────────────────────────
const GRADIENT_BORDER: React.CSSProperties = {
  border: "2px solid transparent",
  background:
    "linear-gradient(white,white) padding-box, linear-gradient(135deg,#00703C,#059669) border-box",
};

// ─── Static data ──────────────────────────────────────────────────────────────
const VITAL_STATS = [
  { Icon: Droplets, color: "text-red-500",    label: "Blood Type", value: "O+"        },
  { Icon: Ruler,    color: "text-blue-500",   label: "Height",     value: `5'10"`      },
  { Icon: Scale,    color: "text-purple-500", label: "Weight",     value: "185 lbs"   },
  { Icon: MapPin,   color: "text-green-600",  label: "Parish",     value: "Kingston"  },
];

const CONDITIONS = [
  { dot: "bg-red-500",    name: "Type 2 Diabetes",  diagnosed: "Jan 2018", badge: "Active",     bCls: "bg-yellow-100 text-yellow-700" },
  { dot: "bg-orange-500", name: "Hypertension",     diagnosed: "Mar 2019", badge: "Controlled", bCls: "bg-green-100 text-green-700"  },
  { dot: "bg-blue-500",   name: "High Cholesterol", diagnosed: "Jun 2020", badge: "Improving",  bCls: "bg-green-100 text-green-700"  },
];

const ALLERGIES = [
  {
    name: "Penicillin", severity: "SEVERE",
    reaction: "Severe rash, difficulty breathing",
    card: "bg-red-50 border-red-500",
    nameCls: "text-red-900", reactionCls: "text-red-700",
    badge: "bg-red-200 text-red-900",
  },
  {
    name: "Shellfish", severity: "MODERATE",
    reaction: "Hives, stomach upset",
    card: "bg-yellow-50 border-yellow-500",
    nameCls: "text-yellow-900", reactionCls: "text-yellow-700",
    badge: "bg-yellow-200 text-yellow-900",
  },
];

const MEDICATIONS = [
  { name: "Metformin",    dose: "500mg – Twice daily with meals",  dr: "Dr. Sarah Williams"  },
  { name: "Lisinopril",   dose: "10mg – Once daily in morning",    dr: "Dr. Marcus Thompson" },
  { name: "Atorvastatin", dose: "20mg – Once daily at bedtime",    dr: "Dr. Marcus Thompson" },
];

const HISTORY = [
  {
    name: "Type 2 Diabetes Mellitus",
    date: "January 12, 2018", dr: "Dr. Sarah Williams",
    note: "Managed with oral medication and lifestyle modifications. Regular monitoring of blood glucose levels.",
  },
  {
    name: "Essential Hypertension",
    date: "March 8, 2019", dr: "Dr. Marcus Thompson",
    note: "Well-controlled with ACE inhibitor. Blood pressure readings consistently within target range.",
  },
];

const LABS = [
  { name: "HbA1c (Glycated Hemoglobin)", result: "Result: 6.8%  (Target: <7.0%)",     date: "Jan 10, 2024" },
  { name: "Lipid Panel",                  result: "Total Cholesterol: 195 mg/dL",       date: "Jan 14, 2024" },
  { name: "Complete Blood Count",         result: "All values within normal range",      date: "Dec 20, 2023" },
];

const FAMILY = [
  { iconCls: "text-pink-500",   relation: "Mother",  conditions: "Type 2 Diabetes, Hypertension" },
  { iconCls: "text-blue-500",   relation: "Father",  conditions: "Heart Disease, Stroke"          },
  { iconCls: "text-purple-500", relation: "Sibling", conditions: "High Cholesterol"               },
];

const CONTACTS = [
  { name: "Sarah Thompson",     relation: "Wife",                   avatar: "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg", tel: "8765551234" },
  { name: "Marcus Thompson",    relation: "Brother",                avatar: "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg", tel: "8765555678" },
  { name: "Dr. Sarah Williams", relation: "Primary Care Physician", avatar: "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg", tel: "8765559999" },
];

const PRIVACY_TOGGLES = [
  { label: "QR Code Access Only",             desc: "Medical data can only be accessed by scanning your QR code"   },
  { label: "Require Provider Authentication", desc: "Only verified healthcare professionals can access your data"   },
  { label: "Time-Limited Access Sessions",    desc: "Access automatically expires after a set duration"             },
];

const ACCESS_LOG = [
  {
    name: "Dr. Sarah Williams", org: "Kingston Medical Center",    status: "ACTIVE",
    sCls: "bg-green-200 text-green-800", card: "bg-green-50 border-l-4 border-green-500",
    meta: [
      { Icon: Calendar, cls: "text-green-600", text: "Jan 17, 2024"     },
      { Icon: Clock,    cls: "text-green-600", text: "10:45 AM"          },
      { Icon: Hourglass,cls: "text-green-600", text: "Expires in 18 min" },
    ],
  },
  {
    name: "Dr. Marcus Thompson", org: "Cardiology Clinic",        status: "EXPIRED",
    sCls: "bg-gray-300 text-gray-700", card: "bg-gray-50",
    meta: [
      { Icon: Calendar, cls: "text-gray-400", text: "Jan 15, 2024"       },
      { Icon: Clock,    cls: "text-gray-400", text: "2:30 PM – 3:00 PM"  },
    ],
  },
  {
    name: "Emergency Response Team", org: "Kingston Public Hospital ER", status: "EXPIRED",
    sCls: "bg-gray-300 text-gray-700", card: "bg-gray-50",
    meta: [
      { Icon: Calendar, cls: "text-gray-400", text: "Jan 10, 2024"       },
      { Icon: Clock,    cls: "text-gray-400", text: "8:15 AM – 8:45 AM"  },
    ],
  },
];

// ─── Small reusable pieces ────────────────────────────────────────────────────

function Toggle({ defaultOn = true }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      onClick={() => setOn(!on)}
      className="relative w-11 h-6 rounded-full flex-shrink-0 transition-colors"
      style={{ background: on ? "var(--color-juno-green)" : "#D1D5DB" }}
    >
      <span
        className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
        style={{ transform: on ? "translateX(20px)" : "translateX(0)" }}
      />
    </button>
  );
}

// ─── Flip Card ────────────────────────────────────────────────────────────────
function ProfileFlipCard({ desktop = false }: { desktop?: boolean }) {
  const [flipped, setFlipped] = useState(false);
  const radius = desktop ? 36 : 36;
  const roundedCls = desktop ? "rounded-2xl" : "rounded-3xl";

  return (
    <div style={{ perspective: 1000 }}>
      <div
        style={{
          position: "relative",
          transformStyle: "preserve-3d",
          transition: "transform 0.6s",
          transform: flipped ? "rotateY(180deg)" : "none",
          /* ensure back card height matches front */
        }}
      >
        {/* FRONT */}
        <div
          className={`bg-white ${roundedCls} p-6 shadow-[0_10px_30px_-5px_rgba(0,112,60,0.15)]`}
          style={{ ...GRADIENT_BORDER, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" as React.CSSProperties["WebkitBackfaceVisibility"] }}
        >
          {/* Avatar */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative mb-4">
              <div
                className="w-32 h-32 rounded-full overflow-hidden border-4 shadow-lg"
                style={{ borderColor: "var(--color-juno-green)" }}
              >
                <img
                  src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-8.jpg"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                className="absolute bottom-0 right-0 w-10 h-10 rounded-full text-white flex items-center justify-center shadow-lg hover:brightness-90 transition-all"
                style={{ background: "var(--color-juno-green)" }}
              >
                <Camera size={15} />
              </button>
            </div>
            <h2 className={`font-bold text-gray-800 mb-1 ${desktop ? "text-xl" : "text-2xl"}`}>
              Michael Thompson
            </h2>
            <p className="text-sm text-gray-500 mb-0.5">Patient ID: JN-2024-08457</p>
            <p className="text-sm text-gray-500">DOB: March 15, 1985 (38 years old)</p>
          </div>

          {/* Vital stats */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {VITAL_STATS.map((s) => (
              <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center">
                <s.Icon size={20} className={`${s.color} mx-auto mb-1.5`} />
                <p className="text-xs text-gray-500 mb-0.5">{s.label}</p>
                <p className="text-sm font-bold text-gray-800">{s.value}</p>
              </div>
            ))}
          </div>

          {/* CTA buttons — desktop: QR only; mobile: QR + Edit */}
          {desktop ? (
            <button
              onClick={() => setFlipped(true)}
              className="w-full text-white text-sm font-semibold py-3 rounded-xl hover:brightness-90 transition-all shadow-md flex items-center justify-center gap-2"
              style={{ background: "var(--color-juno-green)" }}
            >
              <QrCode size={16} /> Show QR Code
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => setFlipped(true)}
                className="flex-1 text-white text-sm font-semibold py-3 rounded-xl hover:brightness-90 transition-all shadow-md flex items-center justify-center gap-2"
                style={{ background: "var(--color-juno-green)" }}
              >
                <QrCode size={16} /> Show QR Code
              </button>
              <button
                className="flex-1 bg-white text-sm font-semibold py-3 rounded-xl hover:bg-green-50 transition-all flex items-center justify-center gap-2 border-2"
                style={{ borderColor: "var(--color-juno-green)", color: "var(--color-juno-green)" }}
              >
                <Pencil size={14} /> Edit Profile
              </button>
            </div>
          )}
        </div>

        {/* BACK */}
        <div
          className={`absolute inset-0 bg-white ${roundedCls} p-6 shadow-[0_10px_30px_-5px_rgba(0,112,60,0.15)]`}
          style={{
            ...GRADIENT_BORDER,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden" as React.CSSProperties["WebkitBackfaceVisibility"],
            transform: "rotateY(180deg)",
          }}
        >
          <div className="flex flex-col items-center justify-center h-full py-4">
            <div className="bg-white p-4 rounded-2xl shadow-inner mb-4">
              <div className="w-48 h-48 bg-gray-900 rounded-xl flex items-center justify-center">
                <QrCode size={88} className="text-white" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">
              Emergency Medical Snapshot
            </h3>
            <p className="text-sm text-center text-gray-500 mb-5 max-w-xs px-2">
              Healthcare providers can scan this QR code to access your essential medical information in emergencies
            </p>
            <div className="flex gap-3 w-full">
              <button className="flex-1 bg-blue-600 text-white text-sm font-semibold py-3 rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                <Download size={15} /> Download
              </button>
              <button
                onClick={() => setFlipped(false)}
                className="flex-1 bg-gray-200 text-gray-700 text-sm font-semibold py-3 rounded-xl hover:bg-gray-300 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Health Risk Donut ────────────────────────────────────────────────────────
function HealthRiskCard({ compact = false }: { compact?: boolean }) {
  const r = 36, circ = 2 * Math.PI * r; // ≈ 226
  const offset = circ * (1 - 0.75);     // 75% filled

  return (
    <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
          <TrendingUp size={18} className="text-green-600" />
        </div>
        <h4 className="font-bold text-gray-800 text-sm">
          {compact ? "Health Risk Score" : "Health Risk Indicator"}
        </h4>
      </div>

      {compact ? (
        <div className="flex flex-col items-center mb-4">
          <div className="relative mb-3">
            <svg width={96} height={96} style={{ transform: "rotate(-90deg)" }}>
              <circle cx={48} cy={48} r={r} stroke="#E2E8F0" strokeWidth={8} fill="none" />
              <circle cx={48} cy={48} r={r} stroke="#10B981" strokeWidth={8} fill="none"
                strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-green-600">75</span>
            </div>
          </div>
          <p className="text-xs text-center text-gray-600">
            Score is <span className="font-bold text-green-600">Good</span>
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-5 mb-4">
          <div className="relative flex-shrink-0">
            <svg width={96} height={96} style={{ transform: "rotate(-90deg)" }}>
              <circle cx={48} cy={48} r={r} stroke="#E2E8F0" strokeWidth={8} fill="none" />
              <circle cx={48} cy={48} r={r} stroke="#10B981" strokeWidth={8} fill="none"
                strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-green-600">75</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            Your health risk score is <span className="font-bold text-green-600">Good</span>. Based on your
            current conditions, medications, and lifestyle factors, you're managing your health well with room
            for improvement.
          </p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        <div className="text-center p-2 bg-green-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-0.5">Diabetes</p>
          <p className="text-xs font-bold text-green-700">Managed</p>
        </div>
        <div className="text-center p-2 bg-green-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-0.5">BP</p>
          <p className="text-xs font-bold text-green-700">Good</p>
        </div>
        <div className="text-center p-2 bg-yellow-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-0.5">Chol.</p>
          <p className="text-xs font-bold text-yellow-700">Monitor</p>
        </div>
      </div>
    </div>
  );
}

// ─── Privacy Controls ─────────────────────────────────────────────────────────
function PrivacyCard() {
  const [dur, setDur] = useState<SessionDuration>("30min");
  const durations: { key: SessionDuration; label: string }[] = [
    { key: "15min", label: "15 min" },
    { key: "30min", label: "30 min" },
    { key: "1hr",   label: "1 hour" },
    { key: "2hr",   label: "2 hours" },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
          <ShieldCheck size={18} className="text-purple-600" />
        </div>
        <h4 className="font-bold text-gray-800">Privacy &amp; Access Controls</h4>
      </div>

      <div className="space-y-3">
        {PRIVACY_TOGGLES.map((t) => (
          <div key={t.label} className="flex items-start justify-between gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="flex-1">
              <p className="font-semibold text-gray-800 text-sm mb-0.5">{t.label}</p>
              <p className="text-xs text-gray-500">{t.desc}</p>
            </div>
            <Toggle />
          </div>
        ))}

        <div className="p-3 bg-gray-50 rounded-xl">
          <p className="font-semibold text-gray-800 text-sm mb-3">Session Duration</p>
          <div className="flex gap-2">
            {durations.map((d) => (
              <button
                key={d.key}
                onClick={() => setDur(d.key)}
                className="flex-1 py-2 text-xs font-semibold rounded-lg border-2 transition-all"
                style={
                  dur === d.key
                    ? { background: "var(--color-juno-green)", borderColor: "var(--color-juno-green)", color: "#fff" }
                    : { background: "#fff", borderColor: "#D1D5DB", color: "#374151" }
                }
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Access Log ───────────────────────────────────────────────────────────────
function AccessLogCard() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
            <History size={18} className="text-gray-600" />
          </div>
          <h4 className="font-bold text-gray-800">Access Log</h4>
        </div>
        <button className="text-sm font-semibold hover:underline" style={{ color: "var(--color-juno-green)" }}>
          View All
        </button>
      </div>

      <div className="space-y-3">
        {ACCESS_LOG.map((e) => (
          <div key={e.name} className={`p-3 rounded-xl ${e.card}`}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold text-gray-800 text-sm">{e.name}</p>
                <p className="text-xs text-gray-500">{e.org}</p>
              </div>
              <span className={`px-2 py-0.5 text-xs font-bold rounded flex-shrink-0 ml-2 ${e.sCls}`}>
                {e.status}
              </span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {e.meta.map((m, i) => (
                <div key={i} className="flex items-center gap-1 text-xs text-gray-600">
                  <m.Icon size={11} className={m.cls} />
                  <span>{m.text}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Emergency Contacts ───────────────────────────────────────────────────────
function EmergencyContactsCard({ small = false }: { small?: boolean }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={18} className="text-red-600" />
          </div>
          <h4 className="font-bold text-gray-800">Emergency Contacts</h4>
        </div>
        <button className="text-sm font-semibold hover:underline" style={{ color: "var(--color-juno-green)" }}>
          {small ? "Add" : "Add Contact"}
        </button>
      </div>
      <div className="space-y-3">
        {CONTACTS.map((c) => (
          <div key={c.name} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className={`${small ? "w-10 h-10" : "w-12 h-12"} rounded-full overflow-hidden flex-shrink-0`}>
              <img src={c.avatar} alt={c.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 text-sm truncate">{c.name}</p>
              <p className="text-xs text-gray-500">{c.relation}</p>
            </div>
            <a
              href={`tel:${c.tel}`}
              className={`${small ? "w-8 h-8" : "w-10 h-10"} rounded-lg text-white flex items-center justify-center hover:brightness-90 transition-all flex-shrink-0`}
              style={{ background: "var(--color-juno-green)" }}
            >
              <Phone size={small ? 13 : 16} />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Family History ───────────────────────────────────────────────────────────
function FamilyHistoryCard() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center flex-shrink-0">
          <Users size={18} className="text-pink-600" />
        </div>
        <h4 className="font-bold text-gray-800">Family Health History</h4>
      </div>
      <div className="space-y-2">
        {FAMILY.map((f) => (
          <div key={f.relation} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <User size={16} className={f.iconCls} />
              <span className="text-sm font-semibold text-gray-700">{f.relation}</span>
            </div>
            <span className="text-xs text-gray-500 text-right">{f.conditions}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Share Medical Info ───────────────────────────────────────────────────────
function ShareCard({ desktop = false }: { desktop?: boolean }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
          <Share2 size={18} className="text-blue-600" />
        </div>
        <h4 className="font-bold text-gray-800">Share Medical Information</h4>
      </div>

      {desktop ? (
        <div className="grid grid-cols-3 gap-6">
          {/* QR code block */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 flex flex-col items-center">
            <div className="bg-white p-3 rounded-xl shadow-md mb-4">
              <div className="w-32 h-32 bg-gray-900 rounded-lg flex items-center justify-center">
                <QrCode size={60} className="text-white" />
              </div>
            </div>
            <h5 className="font-bold text-gray-800 mb-3 text-center text-sm">Emergency QR Code</h5>
            <div className="flex gap-2 w-full">
              <button className="flex-1 bg-blue-600 text-white text-xs font-semibold py-2 rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-1">
                <Download size={12} /> Download
              </button>
              <button className="flex-1 bg-white text-blue-600 border-2 border-blue-600 text-xs font-semibold py-2 rounded-lg hover:bg-blue-50 transition-all flex items-center justify-center gap-1">
                <RefreshCw size={12} /> Regenerate
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="col-span-2 bg-yellow-50 border-l-4 border-yellow-500 rounded-xl p-5">
            <div className="flex gap-3">
              <Lightbulb size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-yellow-900 mb-2">How to use your Emergency QR Code:</p>
                <ol className="text-sm text-yellow-800 space-y-2 list-decimal list-inside">
                  <li>Show or share your QR code with authorized healthcare providers</li>
                  <li>They scan the code using the JUNO provider app</li>
                  <li>Access is granted based on your privacy settings</li>
                  <li>You receive a notification of who accessed your data</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Mobile QR block */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 mb-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="bg-white p-3 rounded-xl shadow-md flex-shrink-0">
                <div className="w-32 h-32 bg-gray-900 rounded-lg flex items-center justify-center">
                  <QrCode size={60} className="text-white" />
                </div>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h5 className="font-bold text-gray-800 mb-2">Emergency Access QR Code</h5>
                <p className="text-sm text-gray-500 mb-3">
                  Healthcare providers can scan this code to access your essential medical information during emergencies
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button className="bg-blue-600 text-white text-sm font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                    <Download size={14} /> Download QR
                  </button>
                  <button className="bg-white text-blue-600 border-2 border-blue-600 text-sm font-semibold py-2 px-4 rounded-lg hover:bg-blue-50 transition-all flex items-center justify-center gap-2">
                    <RefreshCw size={14} /> Regenerate
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-xl p-4">
            <div className="flex gap-3">
              <Lightbulb size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-yellow-900 mb-1">How to use:</p>
                <ol className="text-xs text-yellow-800 space-y-1 list-decimal list-inside">
                  <li>Show or share your QR code with authorized healthcare providers</li>
                  <li>They scan the code using the JUNO provider app</li>
                  <li>Access is granted based on your privacy settings</li>
                  <li>You receive a notification of who accessed your data</li>
                </ol>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Section header shorthand ─────────────────────────────────────────────────
function SectionHeading({ title, action }: { title: string; action?: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-xl font-bold text-gray-800">{title}</h3>
      {action && (
        <button className="text-sm font-semibold hover:underline" style={{ color: "var(--color-juno-green)" }}>
          {action}
        </button>
      )}
    </div>
  );
}

// ─── Chronic Conditions (desktop variant – 3-col grid) ───────────────────────
function ConditionsDesktop() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
            <HeartPulse size={18} className="text-red-600" />
          </div>
          <h4 className="text-lg font-bold text-gray-800">Chronic Conditions</h4>
        </div>
        <button className="text-sm font-semibold hover:underline" style={{ color: "var(--color-juno-green)" }}>
          Update
        </button>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {CONDITIONS.map((c) => (
          <div key={c.name} className="p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
              <p className="font-semibold text-gray-800 text-sm">{c.name}</p>
            </div>
            <p className="text-xs text-gray-500 mb-2">Diagnosed: {c.diagnosed}</p>
            <span className={`px-2 py-0.5 text-xs font-semibold rounded ${c.bCls}`}>{c.badge}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const navigate = useNavigate();

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "linear-gradient(135deg,#F7F9FC 0%,#E8F5E9 100%)" }}
    >
      {/* Desktop sidebar */}
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ── Mobile header ── */}
        <header className="lg:hidden flex items-center justify-between px-4 pt-6 pb-3 flex-shrink-0 fade-in">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex items-center justify-center hover:shadow-md transition-all"
          >
            <ArrowLeft size={18} className="text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">My Health Profile</h1>
          <button className="w-10 h-10 rounded-xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex items-center justify-center hover:shadow-md transition-all">
            <Settings size={18} className="text-gray-700" />
          </button>
        </header>

        {/* ── Desktop header ── */}
        <header className="hidden lg:flex items-center justify-between bg-white border-b border-gray-200 px-8 py-4 flex-shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Health Profile</h1>
            <p className="text-sm text-gray-500 mt-0.5">View and manage your complete health information</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="px-4 py-2 bg-white border-2 rounded-xl hover:bg-green-50 transition-all font-semibold text-sm flex items-center gap-2"
              style={{ borderColor: "var(--color-juno-green)", color: "var(--color-juno-green)" }}
            >
              <Download size={15} /> Export Profile
            </button>
            <button
              className="px-4 py-2 text-white rounded-xl hover:brightness-90 transition-all font-semibold text-sm flex items-center gap-2"
              style={{ background: "var(--color-juno-green)" }}
            >
              <Pencil size={15} /> Edit Profile
            </button>
          </div>
        </header>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto">

          {/* ══════════ MOBILE LAYOUT ══════════ */}
          <div className="lg:hidden px-4 py-4 pb-28 space-y-5 max-w-2xl mx-auto w-full">

            {/* Flip card */}
            <ProfileFlipCard />

            {/* Update notice */}
            <div className="bg-blue-50 border-l-4 border-blue-500 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Info size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-900 font-semibold mb-0.5">Health profile last updated 3 days ago</p>
                  <p className="text-xs text-blue-700">Keep your information current for accurate emergency response</p>
                </div>
              </div>
            </div>

            <SectionHeading title="Health Summary" action="Update" />

            {/* Chronic Conditions */}
            <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                  <HeartPulse size={22} className="text-red-600" />
                </div>
                <h4 className="text-lg font-bold text-gray-800">Chronic Conditions</h4>
              </div>
              <div className="space-y-3">
                {CONDITIONS.map((c) => (
                  <div key={c.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className={`w-2.5 h-2.5 rounded-full ${c.dot} flex-shrink-0`} />
                      <div>
                        <p className="font-semibold text-gray-800">{c.name}</p>
                        <p className="text-xs text-gray-500">Diagnosed: {c.diagnosed}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-lg flex-shrink-0 ${c.bCls}`}>
                      {c.badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Allergies */}
            <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <TriangleAlert size={22} className="text-orange-600" />
                </div>
                <h4 className="text-lg font-bold text-gray-800">Allergies</h4>
              </div>
              <div className="space-y-3">
                {ALLERGIES.map((a) => (
                  <div key={a.name} className={`p-3 border-l-4 rounded-xl ${a.card}`}>
                    <div className="flex items-start justify-between mb-1">
                      <p className={`font-bold ${a.nameCls}`}>{a.name}</p>
                      <span className={`px-2 py-0.5 text-xs font-bold rounded ml-2 flex-shrink-0 ${a.badge}`}>
                        {a.severity}
                      </span>
                    </div>
                    <p className={`text-xs ${a.reactionCls}`}>Reaction: {a.reaction}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Medications */}
            <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Pill size={22} className="text-purple-600" />
                </div>
                <h4 className="text-lg font-bold text-gray-800">Current Medications</h4>
              </div>
              <div className="space-y-3">
                {MEDICATIONS.map((m) => (
                  <div key={m.name} className="p-3 bg-gray-50 rounded-xl">
                    <p className="font-semibold text-gray-800">{m.name}</p>
                    <p className="text-sm text-gray-600">{m.dose}</p>
                    <p className="text-xs text-gray-400 mt-1">Prescribed by: {m.dr}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Health Risk */}
            <HealthRiskCard />

            <SectionHeading title="Detailed Medical Information" />

            {/* Medical History */}
            <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <FileText size={18} className="text-indigo-600" />
                  </div>
                  <h4 className="font-bold text-gray-800">Medical History</h4>
                </div>
                <button className="text-sm font-semibold hover:underline" style={{ color: "var(--color-juno-green)" }}>View All</button>
              </div>
              <div className="space-y-3">
                {HISTORY.map((h) => (
                  <div key={h.name} className="p-3 bg-gray-50 rounded-xl">
                    <p className="font-semibold text-gray-800 mb-1">{h.name}</p>
                    <p className="text-xs text-gray-500">Date Diagnosed: {h.date}</p>
                    <p className="text-xs text-gray-500 mb-2">Treating Physician: {h.dr}</p>
                    <p className="text-sm text-gray-700">{h.note}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Lab Results */}
            <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
                    <TestTube2 size={18} className="text-teal-600" />
                  </div>
                  <h4 className="font-bold text-gray-800">Lab Results</h4>
                </div>
                <button className="text-sm font-semibold hover:underline" style={{ color: "var(--color-juno-green)" }}>View All</button>
              </div>
              <div className="space-y-3">
                {LABS.map((l) => (
                  <div key={l.name} className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-800">{l.name}</p>
                      <p className="text-sm text-gray-600 mt-0.5">{l.result}</p>
                      <p className="text-xs text-gray-400">Date: {l.date}</p>
                    </div>
                    <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>

            <FamilyHistoryCard />
            <EmergencyContactsCard />
            <ShareCard />
            <PrivacyCard />
            <AccessLogCard />
          </div>

          {/* ══════════ DESKTOP LAYOUT ══════════ */}
          <div className="hidden lg:block p-8">

            {/* Row 1: left col (flip card + notice + risk) | right col-span-2 (conditions + allergies/meds) */}
            <div className="grid grid-cols-3 gap-6 mb-6">

              {/* Left */}
              <div className="col-span-1 space-y-4">
                <ProfileFlipCard desktop />

                <div className="bg-blue-50 border-l-4 border-blue-500 rounded-xl p-4">
                  <div className="flex items-start gap-2">
                    <Info size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-blue-900 font-semibold mb-0.5">Profile last updated 3 days ago</p>
                      <p className="text-xs text-blue-700">Keep information current</p>
                    </div>
                  </div>
                </div>

                <HealthRiskCard compact />
              </div>

              {/* Right col-span-2 */}
              <div className="col-span-2 space-y-6">
                <ConditionsDesktop />

                <div className="grid grid-cols-2 gap-6">
                  {/* Allergies */}
                  <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                        <TriangleAlert size={18} className="text-orange-600" />
                      </div>
                      <h4 className="text-lg font-bold text-gray-800">Allergies</h4>
                    </div>
                    <div className="space-y-3">
                      {ALLERGIES.map((a) => (
                        <div key={a.name} className={`p-3 border-l-4 rounded-xl ${a.card}`}>
                          <div className="flex items-start justify-between mb-1">
                            <p className={`font-bold text-sm ${a.nameCls}`}>{a.name}</p>
                            <span className={`px-2 py-0.5 text-xs font-bold rounded ml-2 flex-shrink-0 ${a.badge}`}>
                              {a.severity}
                            </span>
                          </div>
                          <p className={`text-xs ${a.reactionCls}`}>{a.reaction}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Medications */}
                  <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <Pill size={18} className="text-purple-600" />
                      </div>
                      <h4 className="text-lg font-bold text-gray-800">Current Medications</h4>
                    </div>
                    <div className="space-y-2">
                      {MEDICATIONS.map((m) => (
                        <div key={m.name} className="p-3 bg-gray-50 rounded-lg">
                          <p className="font-semibold text-gray-800 text-sm">{m.name}</p>
                          <p className="text-xs text-gray-500">{m.dose}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Medical History | Lab Results */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <FileText size={18} className="text-indigo-600" />
                    </div>
                    <h4 className="font-bold text-gray-800">Medical History</h4>
                  </div>
                  <button className="text-sm font-semibold hover:underline" style={{ color: "var(--color-juno-green)" }}>View All</button>
                </div>
                <div className="space-y-3">
                  {HISTORY.map((h) => (
                    <div key={h.name} className="p-3 bg-gray-50 rounded-xl">
                      <p className="font-semibold text-gray-800 text-sm mb-1">{h.name}</p>
                      <p className="text-xs text-gray-500">Diagnosed: {h.date}</p>
                      <p className="text-xs text-gray-500 mb-2">{h.dr}</p>
                      <p className="text-xs text-gray-600">{h.note}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
                      <TestTube2 size={18} className="text-teal-600" />
                    </div>
                    <h4 className="font-bold text-gray-800">Recent Lab Results</h4>
                  </div>
                  <button className="text-sm font-semibold hover:underline" style={{ color: "var(--color-juno-green)" }}>View All</button>
                </div>
                <div className="space-y-2">
                  {LABS.map((l) => (
                    <div key={l.name} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{l.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{l.result}</p>
                        <p className="text-xs text-gray-400">{l.date}</p>
                      </div>
                      <ChevronRight size={15} className="text-gray-400 flex-shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 3: Emergency Contacts | Family History */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <EmergencyContactsCard small />
              <FamilyHistoryCard />
            </div>

            {/* Row 4: Share info (full width) */}
            <div className="mb-6">
              <ShareCard desktop />
            </div>

            {/* Row 5: Privacy | Access Log */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <PrivacyCard />
              <AccessLogCard />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  );
}