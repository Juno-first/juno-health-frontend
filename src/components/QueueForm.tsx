import {
  HeartPulse, Wind, Scan, Droplets, Hand, Thermometer, Bone,
  AlertCircle, TrendingUp,Activity,Brain,Eye,Zap,Gauge,Baby,Siren,FlaskConical
} from "lucide-react";
import PainSlider from "./PainSlider";

const SYMPTOM_CATEGORIES = [
  // ── Cardiovascular & Respiratory ─────────────────────────────────────────
  { id: "chest",        Icon: HeartPulse,   label: "Chest Pain",              color: "text-red-500"    },
  { id: "breathing",    Icon: Wind,         label: "Difficulty Breathing",    color: "text-blue-500"   },
  { id: "highbp",       Icon: TrendingUp,   label: "High BP + Symptoms",      color: "text-red-600"    },
  { id: "heartrate",    Icon: Activity,     label: "Abnormal Heart Rate",     color: "text-orange-500" },

  // ── Neurological ──────────────────────────────────────────────────────────
  { id: "stroke",       Icon: Brain,        label: "Stroke (FAST Symptoms)",  color: "text-purple-500" },
  { id: "confusion",    Icon: Eye,          label: "Confusion / Unresponsive",color: "text-purple-600" },
  { id: "headache",     Icon: Zap,          label: "Sudden Severe Headache",  color: "text-yellow-500" },
  { id: "seizure",      Icon: Activity,     label: "Seizure",                 color: "text-purple-400" },

  // ── Vital Sign Red Zones ──────────────────────────────────────────────────
  { id: "oxygen",       Icon: Gauge,        label: "Low Oxygen (SpO₂ <94%)", color: "text-blue-600"   },
  { id: "highfever",    Icon: Thermometer,  label: "High Fever (>104°F)",     color: "text-orange-500" },
  { id: "infantfever",  Icon: Baby,         label: "Infant Fever",            color: "text-pink-500"   },

  // ── Trauma & Pain ─────────────────────────────────────────────────────────
  { id: "bleeding",     Icon: Hand,         label: "Bleeding",                color: "text-red-500"    },
  { id: "uncontrolled", Icon: Droplets,     label: "Uncontrolled Bleeding",   color: "text-red-600"    },
  { id: "extremepain",  Icon: Siren,        label: "Extreme Pain (10/10)",    color: "text-red-600"    },
  { id: "poisoning",    Icon: FlaskConical, label: "Poisoning / Overdose",    color: "text-green-600"  },
  { id: "injury",       Icon: Bone,         label: "Injury",                  color: "text-gray-600"   },

  // ── General ───────────────────────────────────────────────────────────────
  { id: "fever",        Icon: Thermometer,  label: "Fever",                   color: "text-orange-400" },
  { id: "vomiting",     Icon: Droplets,     label: "Vomiting / Nausea",       color: "text-green-500"  },
  { id: "dizziness",    Icon: Scan,         label: "Dizziness",               color: "text-purple-500" },
  { id: "allergy",      Icon: AlertCircle,  label: "Allergic Reaction",       color: "text-yellow-500" },
];

type Severity = "mild" | "moderate" | "severe" | "emergency" | null;

const SEVERITY_OPTIONS = [
  {
    id: "mild" as Severity,
    label: "Mild Discomfort",
    sub: "Minor symptoms",
    bg: "bg-green-100",
    icon: <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />,
    hoverBorder: "hover:border-green-400 hover:bg-green-50",
    activeBorder: "border-green-400 bg-green-50",
  },
  {
    id: "moderate" as Severity,
    label: "Moderate Symptoms",
    sub: "Noticeable discomfort",
    bg: "bg-yellow-100",
    icon: <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" />,
    hoverBorder: "hover:border-yellow-400 hover:bg-yellow-50",
    activeBorder: "border-yellow-400 bg-yellow-50",
  },
  {
    id: "severe" as Severity,
    label: "Severe Pain",
    sub: "Significant distress",
    bg: "bg-orange-100",
    icon: <span className="w-3 h-3 rounded-full bg-orange-500 inline-block" />,
    hoverBorder: "hover:border-orange-400 hover:bg-orange-50",
    activeBorder: "border-orange-400 bg-orange-50",
  },
  {
    id: "emergency" as Severity,
    label: "Emergency",
    sub: "Life-threatening",
    bg: "bg-red-500",
    icon: <AlertCircle size={14} className="text-white" />,
    hoverBorder: "hover:bg-red-100",
    activeBorder: "border-red-500 bg-red-50",
    defaultBorder: "border-red-500 bg-red-50",
    labelColor: "text-red-700",
    subColor: "text-red-600",
  },
];

export interface FormState {
  symptoms: string;
  severity: Severity;
  painLevel: number;
  checkedCategories: string[];
  duration: string;
  notes: string;
  queueCode: string;
}

export default function QueueForm({
  form,
  setForm,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
}) {
  function toggleCategory(id: string) {
    setForm((f) => {
      const has = f.checkedCategories.includes(id);
      return {
        ...f,
        checkedCategories: has
          ? f.checkedCategories.filter((c) => c !== id)
          : [...f.checkedCategories, id],
      };
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          What symptoms are you experiencing? <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={4}
          placeholder="Describe your symptoms in detail..."
          value={form.symptoms}
          onChange={(e) => setForm((f) => ({ ...f, symptoms: e.target.value }))}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none transition-all resize-none"
          onFocus={(e) => (e.target.style.borderColor = "#00703C")}
          onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Symptom Severity <span className="text-red-500">*</span>
        </label>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {SEVERITY_OPTIONS.map((opt) => {
            const isActive = form.severity === opt.id;

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setForm((f) => ({ ...f, severity: opt.id }))}
                className={`p-4 border-2 rounded-xl transition-all text-left
                  ${opt.defaultBorder ?? "border-gray-200"}
                  ${isActive ? opt.activeBorder : ""}
                  ${!isActive ? opt.hoverBorder : ""}`}
              >
                <div className="flex flex-col items-center text-center gap-2">
                  <div className={`w-11 h-11 ${opt.bg} rounded-lg flex items-center justify-center`}>
                    {opt.icon}
                  </div>
                  <div>
                    <div className={`font-semibold text-sm ${opt.labelColor ?? "text-gray-800"}`}>
                      {opt.label}
                    </div>
                    <div className={`text-xs ${opt.subColor ?? "text-gray-500"}`}>{opt.sub}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Pain Level (0–10) <span className="text-red-500">*</span>
        </label>
        <PainSlider value={form.painLevel} onChange={(v) => setForm((f) => ({ ...f, painLevel: v }))} />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Symptom Categories <span className="text-red-500">*</span>
        </label>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {SYMPTOM_CATEGORIES.map((cat) => {
            const checked = form.checkedCategories.includes(cat.id);

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className={`flex items-center gap-3 p-3 border-2 rounded-xl transition-all text-left touch-manipulation
                  ${checked ? "border-[#00703C] bg-green-50" : "border-gray-200 hover:border-[#00703C] hover:bg-green-50"}`}
                aria-pressed={checked}
              >
                <span
                  className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all
                  ${checked ? "border-[#00703C] bg-[#00703C]" : "border-gray-300"}`}
                >
                  {checked && (
                    <svg viewBox="0 0 12 10" fill="none" className="w-3 h-3">
                      <path
                        d="M1 5l3.5 3.5L11 1"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>

                <div className="flex items-center gap-2 min-w-0">
                  <cat.Icon size={15} className={`${cat.color} flex-shrink-0`} />
                  <span className="font-medium text-gray-800 text-sm leading-tight">{cat.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Duration of Symptoms <span className="text-red-500">*</span>
          </label>

          <select
            value={form.duration}
            onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
            className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none transition-all text-base font-medium bg-white"
            onFocus={(e) => (e.target.style.borderColor = "#00703C")}
            onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
          >
            <option value="">Select duration...</option>
            <option value="less-1h">Less than 1 hour</option>
            <option value="1-6h">1–6 hours</option>
            <option value="6-24h">6–24 hours</option>
            <option value="more-1d">More than 1 day</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Notes</label>
          <textarea
            rows={3}
            placeholder="Medications, allergies, previous conditions..."
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none transition-all resize-none"
            onFocus={(e) => (e.target.style.borderColor = "#00703C")}
            onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
          />
        </div>
      </div>
    </div>
  );
}