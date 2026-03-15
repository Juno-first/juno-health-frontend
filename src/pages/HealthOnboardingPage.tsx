import { useState } from "react";
import { useOnboarding } from "../store/hooks/useOnboarding";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, Check, Plus, Trash2,
  Activity, UserCircle2, Stethoscope, Pill, TriangleAlert,
  Users, Dumbbell, Phone, Ruler, Weight, Droplets,
  Baby, Languages, PlusCircle, Cigarette, Wine,
  Utensils, BedDouble, MessageSquare, ShieldCheck,
  User, UserCheck,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Demographics {
  heightFt:  string;
  heightIn:  string;
  weight:    string;
  bloodType: string;
  pregnancy: string;
  language:  string;
}

interface Conditions {
  diabetes?:      boolean;
  hypertension?:  boolean;
  asthma?:        boolean;
  heartDisease?:  boolean;
  kidneyDisease?: boolean;
  stroke?:        boolean;
  cancer?:        boolean;
  mentalHealth?:  boolean;
  other:          string;
  [key: string]:  boolean | string | undefined;
}

interface Medication {
  name:      string;
  dosage:    string;
  frequency: string;
  doctor:    string;
  pharmacy:  string;
}

interface Allergy {
  name:     string;
  severity: string;
  reaction: string;
}

interface Lifestyle {
  smoking:  string;
  alcohol:  string;
  activity: string;
  diet:     string;
  sleep:    string;
  notes:    string;
}

interface Contact {
  name:         string;
  relationship: string;
  phone:        string;
}

interface FormData {
  demographics:  Demographics;
  conditions:    Conditions;
  medications:   Medication[];
  allergies:     Allergy[];
  familyHistory: Record<string, string[]>;
  lifestyle:     Lifestyle;
  contacts:      Contact[];
}

// ─── Step metadata ────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: "Demographics",       sub: "Basic measurements",   Icon: UserCircle2,   iconBg: "bg-blue-100",   iconColor: "text-blue-600"   },
  { id: 2, label: "Chronic Conditions", sub: "Medical history",       Icon: Stethoscope,   iconBg: "bg-red-100",    iconColor: "text-red-600"    },
  { id: 3, label: "Medications",        sub: "Current prescriptions", Icon: Pill,          iconBg: "bg-purple-100", iconColor: "text-purple-600" },
  { id: 4, label: "Allergies",          sub: "Known allergies",       Icon: TriangleAlert, iconBg: "bg-orange-100", iconColor: "text-orange-600" },
  { id: 5, label: "Family History",     sub: "Genetic conditions",    Icon: Users,         iconBg: "bg-indigo-100", iconColor: "text-indigo-600" },
  { id: 6, label: "Lifestyle",          sub: "Daily habits",          Icon: Dumbbell,      iconBg: "bg-teal-100",   iconColor: "text-teal-600"   },
  { id: 7, label: "Emergency Contacts", sub: "Notify in emergencies", Icon: Phone,         iconBg: "bg-red-100",    iconColor: "text-red-600"    },
];

// ─── Shared primitives ────────────────────────────────────────────────────────

interface FieldLabelProps {
  Icon?:     React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  children:  React.ReactNode;
}
function FieldLabel({ Icon, children }: FieldLabelProps) {
  return (
    <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
      {Icon && <Icon className="w-3.5 h-3.5" style={{ color: "var(--color-juno-green)" } as React.CSSProperties} />}
      {children}
    </label>
  );
}

interface SectionHeaderProps {
  iconBg:    string;
  iconColor: string;
  Icon:      React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  title:     string;
  sub:       string;
}
function SectionHeader({ iconBg, iconColor, Icon: IconComp, title, sub }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-6 lg:mb-8">
      <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
        <IconComp className={`w-6 h-6 lg:w-7 lg:h-7 ${iconColor}`} />
      </div>
      <div>
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900">{title}</h2>
        <p className="text-xs text-gray-500">{sub}</p>
      </div>
    </div>
  );
}

interface CheckRowProps {
  label:    string;
  sub?:     string;
  checked:  boolean;
  onChange: () => void;
}
function CheckRow({ label, sub, checked, onChange }: CheckRowProps) {
  return (
    <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
      <input type="checkbox" className="check-custom mt-0.5" checked={checked} onChange={onChange} />
      <div>
        <div className="font-semibold text-gray-800 text-sm">{label}</div>
        {sub && <div className="text-xs text-gray-500">{sub}</div>}
      </div>
    </label>
  );
}

// ─── Step props type ──────────────────────────────────────────────────────────

interface StepProps {
  data:    FormData;
  setData: React.Dispatch<React.SetStateAction<FormData>>;
}

// ─── Step 1 ───────────────────────────────────────────────────────────────────

function StepDemographics({ data, setData }: StepProps) {
  const set = (k: keyof Demographics) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setData(d => ({ ...d, demographics: { ...d.demographics, [k]: e.target.value } }));
  const f = data.demographics;

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 lg:p-8 mb-6" style={{ boxShadow: "0 4px 20px -2px rgba(0,0,0,.05)" }}>
      <SectionHeader iconBg="bg-blue-100" iconColor="text-blue-600" Icon={UserCircle2} title="Demographics" sub="Basic health measurements" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
        <div>
          <FieldLabel Icon={Ruler}>Height</FieldLabel>
          <div className="flex gap-2">
            <input type="number" placeholder="Feet"   min="3" max="8"  value={f.heightFt} onChange={set("heightFt")} className="input-field" />
            <input type="number" placeholder="Inches" min="0" max="11" value={f.heightIn} onChange={set("heightIn")} className="input-field" />
          </div>
        </div>
        <div>
          <FieldLabel Icon={Weight}>Weight (lbs)</FieldLabel>
          <input type="number" placeholder="Enter weight" value={f.weight} onChange={set("weight")} className="input-field" />
        </div>
        <div>
          <FieldLabel Icon={Droplets}>Blood Type (if known)</FieldLabel>
          <select value={f.bloodType} onChange={set("bloodType")} className="input-field">
            <option value="">Select blood type</option>
            {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(t => <option key={t}>{t}</option>)}
            <option value="unknown">Don't know</option>
          </select>
        </div>
        <div>
          <FieldLabel Icon={Baby}>Pregnancy Status</FieldLabel>
          <select value={f.pregnancy} onChange={set("pregnancy")} className="input-field">
            <option value="">Select status</option>
            <option value="not-pregnant">Not pregnant</option>
            <option value="pregnant">Pregnant</option>
            <option value="trying">Trying to conceive</option>
            <option value="postpartum">Postpartum</option>
            <option value="not-applicable">Not applicable</option>
          </select>
        </div>
        <div className="lg:col-span-2">
          <FieldLabel Icon={Languages}>Preferred Language</FieldLabel>
          <select value={f.language} onChange={set("language")} className="input-field">
            <option value="english">English</option>
            <option value="patois">Jamaican Patois</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// ─── Step 2 ───────────────────────────────────────────────────────────────────

const CONDITIONS: { key: string; label: string; sub: string }[] = [
  { key: "diabetes",      label: "Diabetes",                 sub: "Type 1 or Type 2"         },
  { key: "hypertension",  label: "Hypertension",             sub: "High blood pressure"       },
  { key: "asthma",        label: "Asthma",                   sub: "Respiratory condition"     },
  { key: "heartDisease",  label: "Heart Disease",            sub: "Cardiovascular conditions" },
  { key: "kidneyDisease", label: "Kidney Disease",           sub: "Renal conditions"          },
  { key: "stroke",        label: "Stroke History",           sub: "Previous stroke or TIA"    },
  { key: "cancer",        label: "Cancer",                   sub: "Any type of cancer"        },
  { key: "mentalHealth",  label: "Mental Health Conditions", sub: "Depression, anxiety, etc." },
];

function StepConditions({ data, setData }: StepProps) {
  const f = data.conditions;
  const toggle = (k: string) =>
    setData(d => ({ ...d, conditions: { ...d.conditions, [k]: !d.conditions[k] } }));

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 lg:p-8 mb-6" style={{ boxShadow: "0 4px 20px -2px rgba(0,0,0,.05)" }}>
      <SectionHeader iconBg="bg-red-100" iconColor="text-red-600" Icon={Stethoscope} title="Chronic Conditions" sub="Select all that apply" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-6">
        {CONDITIONS.map(({ key, label, sub }) => (
          <CheckRow key={key} label={label} sub={sub} checked={!!f[key]} onChange={() => toggle(key)} />
        ))}
      </div>
      <div>
        <FieldLabel Icon={PlusCircle}>Other Conditions</FieldLabel>
        <textarea
          rows={3}
          placeholder="Enter any other chronic conditions not listed above"
          value={f.other}
          onChange={e => setData(d => ({ ...d, conditions: { ...d.conditions, other: e.target.value } }))}
          className="input-field resize-none"
        />
      </div>
    </div>
  );
}

// ─── Step 3 ───────────────────────────────────────────────────────────────────

const EMPTY_MED: Medication = { name: "", dosage: "", frequency: "", doctor: "", pharmacy: "" };

function StepMedications({ data, setData }: StepProps) {
  const [form, setForm] = useState<Medication>(EMPTY_MED);
  const [open, setOpen] = useState(false);
  const meds = data.medications;

  function save() {
    if (!form.name || !form.dosage || !form.frequency) return;
    setData(d => ({ ...d, medications: [...d.medications, form] }));
    setForm(EMPTY_MED);
    setOpen(false);
  }
  function remove(i: number) {
    setData(d => ({ ...d, medications: d.medications.filter((_, idx) => idx !== i) }));
  }

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 lg:p-8 mb-6" style={{ boxShadow: "0 4px 20px -2px rgba(0,0,0,.05)" }}>
      <SectionHeader iconBg="bg-purple-100" iconColor="text-purple-600" Icon={Pill} title="Current Medications" sub="Add all medications you're taking" />
      {meds.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {meds.map((m, i) => (
            <div key={i} className="slide-in bg-purple-50 border-2 border-purple-200 rounded-xl p-4 flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Pill className="w-4 h-4 text-purple-600" />
                  <span className="font-bold text-gray-800 text-sm">{m.name}</span>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div><span className="font-semibold">Dosage:</span> {m.dosage}</div>
                  <div><span className="font-semibold">Frequency:</span> {m.frequency}</div>
                  {m.doctor   && <div><span className="font-semibold">Doctor:</span> {m.doctor}</div>}
                  {m.pharmacy && <div><span className="font-semibold">Pharmacy:</span> {m.pharmacy}</div>}
                </div>
              </div>
              <button onClick={() => remove(i)} className="text-red-500 hover:text-red-700 p-2 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      {!open && (
        <button className="btn-dashed" onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4" /> Add Medication
        </button>
      )}
      {open && (
        <div className="mt-4 lg:mt-6 p-4 lg:p-6 bg-gray-50 rounded-xl border-2 border-gray-200 slide-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <div className="lg:col-span-2">
              <FieldLabel>Medication Name</FieldLabel>
              <input type="text" placeholder="e.g., Metformin" className="input-field" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <FieldLabel>Dosage</FieldLabel>
              <input type="text" placeholder="e.g., 500mg" className="input-field" value={form.dosage}
                onChange={e => setForm(f => ({ ...f, dosage: e.target.value }))} />
            </div>
            <div>
              <FieldLabel>Frequency</FieldLabel>
              <select className="input-field" value={form.frequency}
                onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}>
                <option value="">Select frequency</option>
                <option value="once-daily">Once daily</option>
                <option value="twice-daily">Twice daily</option>
                <option value="three-times-daily">Three times daily</option>
                <option value="as-needed">As needed</option>
                <option value="weekly">Weekly</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <FieldLabel>Prescribing Doctor</FieldLabel>
              <input type="text" placeholder="Dr. Smith" className="input-field" value={form.doctor}
                onChange={e => setForm(f => ({ ...f, doctor: e.target.value }))} />
            </div>
            <div>
              <FieldLabel>Pharmacy</FieldLabel>
              <input type="text" placeholder="Pharmacy name" className="input-field" value={form.pharmacy}
                onChange={e => setForm(f => ({ ...f, pharmacy: e.target.value }))} />
            </div>
            <div className="lg:col-span-2 flex gap-3">
              <button onClick={save} className="btn-primary flex-1 text-white font-semibold py-3 rounded-xl text-sm">
                Save Medication
              </button>
              <button onClick={() => { setForm(EMPTY_MED); setOpen(false); }}
                className="px-6 lg:px-8 bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl text-sm hover:bg-gray-300 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Step 4 ───────────────────────────────────────────────────────────────────

const EMPTY_ALLERGY: Allergy = { name: "", severity: "", reaction: "" };

const SEV: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  mild:               { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700", icon: "text-yellow-600" },
  moderate:           { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", icon: "text-orange-600" },
  severe:             { bg: "bg-red-50",    border: "border-red-200",    text: "text-red-700",    icon: "text-red-600"    },
  "life-threatening": { bg: "bg-red-50",    border: "border-red-300",    text: "text-red-800",    icon: "text-red-700"    },
};

function StepAllergies({ data, setData }: StepProps) {
  const [form, setForm] = useState<Allergy>(EMPTY_ALLERGY);
  const [open, setOpen] = useState(false);
  const allergies = data.allergies;

  function save() {
    if (!form.name || !form.severity || !form.reaction) return;
    setData(d => ({ ...d, allergies: [...d.allergies, form] }));
    setForm(EMPTY_ALLERGY);
    setOpen(false);
  }
  function remove(i: number) {
    setData(d => ({ ...d, allergies: d.allergies.filter((_, idx) => idx !== i) }));
  }

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 lg:p-8 mb-6" style={{ boxShadow: "0 4px 20px -2px rgba(0,0,0,.05)" }}>
      <SectionHeader iconBg="bg-orange-100" iconColor="text-orange-600" Icon={TriangleAlert} title="Allergies" sub="Record all known allergies" />
      {allergies.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {allergies.map((a, i) => {
            const s = SEV[a.severity] ?? { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-700", icon: "text-gray-600" };
            return (
              <div key={i} className={`slide-in ${s.bg} border-2 ${s.border} rounded-xl p-4 flex items-start justify-between`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <TriangleAlert className={`w-4 h-4 ${s.icon}`} />
                    <span className="font-bold text-gray-800 text-sm">{a.name}</span>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div><span className="font-semibold">Severity:</span> <span className={`font-semibold capitalize ${s.text}`}>{a.severity}</span></div>
                    <div><span className="font-semibold">Reaction:</span> {a.reaction}</div>
                  </div>
                </div>
                <button onClick={() => remove(i)} className="text-red-500 hover:text-red-700 p-2 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
      {!open && (
        <button className="btn-dashed" onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4" /> Add Allergy
        </button>
      )}
      {open && (
        <div className="mt-4 lg:mt-6 p-4 lg:p-6 bg-gray-50 rounded-xl border-2 border-gray-200 slide-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <div className="lg:col-span-2">
              <FieldLabel>Allergen</FieldLabel>
              <input type="text" placeholder="e.g., Penicillin, Peanuts" className="input-field" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <FieldLabel>Severity</FieldLabel>
              <select className="input-field" value={form.severity}
                onChange={e => setForm(f => ({ ...f, severity: e.target.value }))}>
                <option value="">Select severity</option>
                <option value="mild">Mild</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe</option>
                <option value="life-threatening">Life-threatening</option>
              </select>
            </div>
            <div>
              <FieldLabel>Reaction Type</FieldLabel>
              <textarea rows={3} placeholder="Describe the reaction" className="input-field resize-none" value={form.reaction}
                onChange={e => setForm(f => ({ ...f, reaction: e.target.value }))} />
            </div>
            <div className="lg:col-span-2 flex gap-3">
              <button onClick={save} className="btn-primary flex-1 text-white font-semibold py-3 rounded-xl text-sm">
                Save Allergy
              </button>
              <button onClick={() => { setForm(EMPTY_ALLERGY); setOpen(false); }}
                className="px-6 lg:px-8 bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl text-sm hover:bg-gray-300 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Step 5 ───────────────────────────────────────────────────────────────────

const FAM_CONDITIONS = ["Diabetes","Hypertension","Heart Disease","Stroke","Cancer","Kidney Disease"];
const FAM_MEMBERS: { key: string; label: string; Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; color: string }[] = [
  { key: "mother",   label: "Mother",   Icon: User,      color: "text-pink-500"   },
  { key: "father",   label: "Father",   Icon: User,      color: "text-blue-500"   },
  { key: "siblings", label: "Siblings", Icon: Users,     color: "text-purple-500" },
  { key: "children", label: "Children", Icon: UserCheck, color: "text-green-500"  },
];

function StepFamilyHistory({ data, setData }: StepProps) {
  function toggle(member: string, condition: string) {
    setData(d => {
      const prev = d.familyHistory[member] ?? [];
      const next = prev.includes(condition) ? prev.filter(c => c !== condition) : [...prev, condition];
      return { ...d, familyHistory: { ...d.familyHistory, [member]: next } };
    });
  }

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 lg:p-8 mb-6" style={{ boxShadow: "0 4px 20px -2px rgba(0,0,0,.05)" }}>
      <SectionHeader iconBg="bg-indigo-100" iconColor="text-indigo-600" Icon={Users} title="Family Health History" sub="Record illnesses among relatives" />
      <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
        {FAM_MEMBERS.map(({ key, label, Icon, color }) => (
          <div key={key} className="border-2 border-gray-200 rounded-xl p-4 lg:p-5">
            <div className={`flex items-center gap-2 mb-4 font-bold text-gray-800 ${color}`}>
              <Icon className="w-4 h-4 lg:w-5 lg:h-5" />
              <span className="lg:text-lg">{label}</span>
            </div>
            <div className="space-y-2 lg:space-y-3">
              {FAM_CONDITIONS.map(c => (
                <label key={c} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="check-custom"
                    checked={(data.familyHistory[key] ?? []).includes(c)}
                    onChange={() => toggle(key, c)} />
                  <span className="text-sm text-gray-700">{c}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Step 6 ───────────────────────────────────────────────────────────────────

function StepLifestyle({ data, setData }: StepProps) {
  const f = data.lifestyle;
  const set = (k: keyof Lifestyle) => (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) =>
    setData(d => ({ ...d, lifestyle: { ...d.lifestyle, [k]: e.target.value } }));

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 lg:p-8 mb-6" style={{ boxShadow: "0 4px 20px -2px rgba(0,0,0,.05)" }}>
      <SectionHeader iconBg="bg-teal-100" iconColor="text-teal-600" Icon={Dumbbell} title="Lifestyle Factors" sub="Help us understand your daily habits" />
      <div className="space-y-5 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
        <div>
          <FieldLabel Icon={Cigarette}>Smoking Status</FieldLabel>
          <select value={f.smoking} onChange={set("smoking")} className="input-field">
            <option value="">Select smoking status</option>
            <option value="never">Never smoked</option>
            <option value="former">Former smoker</option>
            <option value="current-light">Current smoker (light)</option>
            <option value="current-moderate">Current smoker (moderate)</option>
            <option value="current-heavy">Current smoker (heavy)</option>
          </select>
        </div>
        <div>
          <FieldLabel Icon={Wine}>Alcohol Consumption</FieldLabel>
          <select value={f.alcohol} onChange={set("alcohol")} className="input-field">
            <option value="">Select frequency</option>
            <option value="none">None</option>
            <option value="occasional">Occasional (1–2 drinks/month)</option>
            <option value="moderate">Moderate (3–7 drinks/week)</option>
            <option value="heavy">Heavy (8+ drinks/week)</option>
          </select>
        </div>
        <div>
          <FieldLabel Icon={Dumbbell}>Physical Activity Level</FieldLabel>
          <select value={f.activity} onChange={set("activity")} className="input-field">
            <option value="">Select activity level</option>
            <option value="sedentary">Sedentary (little or no exercise)</option>
            <option value="light">Light (1–2 days/week)</option>
            <option value="moderate">Moderate (3–5 days/week)</option>
            <option value="active">Active (6–7 days/week)</option>
            <option value="very-active">Very active (intense daily)</option>
          </select>
        </div>
        <div>
          <FieldLabel Icon={Utensils}>Diet Habits</FieldLabel>
          <select value={f.diet} onChange={set("diet")} className="input-field">
            <option value="">Select diet type</option>
            <option value="balanced">Balanced diet</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="vegan">Vegan</option>
            <option value="low-carb">Low-carb</option>
            <option value="high-protein">High-protein</option>
            <option value="fast-food">Mostly fast food</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <FieldLabel Icon={BedDouble}>Sleep Patterns</FieldLabel>
          <select value={f.sleep} onChange={set("sleep")} className="input-field">
            <option value="">Average hours per night</option>
            <option value="less-4">Less than 4 hours</option>
            <option value="4-5">4–5 hours</option>
            <option value="6-7">6–7 hours</option>
            <option value="7-8">7–8 hours</option>
            <option value="8-9">8–9 hours</option>
            <option value="more-9">More than 9 hours</option>
          </select>
        </div>
        <div>
          <FieldLabel Icon={MessageSquare}>Additional Notes</FieldLabel>
          <textarea rows={3} placeholder="Any other lifestyle information you'd like to share"
            value={f.notes} onChange={set("notes")} className="input-field resize-none" />
        </div>
      </div>
    </div>
  );
}

// ─── Step 7 ───────────────────────────────────────────────────────────────────

const EMPTY_CONTACT: Contact = { name: "", relationship: "", phone: "" };

function fmtPhone(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 10);
  if (d.length > 6) return `${d.slice(0,3)}-${d.slice(3,6)}-${d.slice(6)}`;
  if (d.length > 3) return `${d.slice(0,3)}-${d.slice(3)}`;
  return d;
}

function StepEmergencyContacts({ data, setData }: StepProps) {
  const [form, setForm] = useState<Contact>(EMPTY_CONTACT);
  const [open, setOpen] = useState(false);
  const contacts = data.contacts;

  function save() {
    if (!form.name || !form.relationship || !form.phone) return;
    setData(d => ({ ...d, contacts: [...d.contacts, form] }));
    setForm(EMPTY_CONTACT);
    setOpen(false);
  }
  function remove(i: number) {
    setData(d => ({ ...d, contacts: d.contacts.filter((_, idx) => idx !== i) }));
  }

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 lg:p-8 mb-6" style={{ boxShadow: "0 4px 20px -2px rgba(0,0,0,.05)" }}>
      <SectionHeader iconBg="bg-red-100" iconColor="text-red-600" Icon={Phone} title="Emergency Contacts" sub="People to notify in emergencies" />
      {contacts.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {contacts.map((c, i) => (
            <div key={i} className="slide-in bg-blue-50 border-2 border-blue-200 rounded-xl p-4 flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-800 mb-1 text-sm">{c.name}</p>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div><span className="font-semibold">Relationship:</span> <span className="capitalize">{c.relationship}</span></div>
                    <div><span className="font-semibold">Phone:</span> +1 {c.phone}</div>
                  </div>
                </div>
              </div>
              <button onClick={() => remove(i)} className="text-red-500 hover:text-red-700 p-2 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      {!open && (
        <button className="btn-dashed" onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4" /> Add Emergency Contact
        </button>
      )}
      {open && (
        <div className="mt-4 lg:mt-6 p-4 lg:p-6 bg-gray-50 rounded-xl border-2 border-gray-200 slide-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <div className="lg:col-span-2">
              <FieldLabel>Full Name</FieldLabel>
              <input type="text" placeholder="Contact's full name" className="input-field" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <FieldLabel>Relationship</FieldLabel>
              <select className="input-field" value={form.relationship}
                onChange={e => setForm(f => ({ ...f, relationship: e.target.value }))}>
                <option value="">Select relationship</option>
                <option value="spouse">Spouse</option>
                <option value="parent">Parent</option>
                <option value="child">Child</option>
                <option value="sibling">Sibling</option>
                <option value="friend">Friend</option>
                <option value="partner">Partner</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <FieldLabel>Phone Number</FieldLabel>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500 font-medium text-sm pointer-events-none">+1</span>
                <input type="tel" placeholder="876-555-0123" maxLength={12} className="input-field pl-12"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: fmtPhone(e.target.value) }))} />
              </div>
            </div>
            <div className="lg:col-span-2 flex gap-3">
              <button onClick={save} className="btn-primary flex-1 text-white font-semibold py-3 rounded-xl text-sm">
                Save Contact
              </button>
              <button onClick={() => { setForm(EMPTY_CONTACT); setOpen(false); }}
                className="px-6 lg:px-8 bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl text-sm hover:bg-gray-300 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Export FormData for useOnboarding hook ──────────────────────────────────
export type { FormData };

// ─── Initial data ─────────────────────────────────────────────────────────────

const INITIAL: FormData = {
  demographics:  { heightFt: "", heightIn: "", weight: "", bloodType: "", pregnancy: "", language: "english" },
  conditions:    { other: "" },
  medications:   [],
  allergies:     [],
  familyHistory: {},
  lifestyle:     { smoking: "", alcohol: "", activity: "", diet: "", sleep: "", notes: "" },
  contacts:      [],
};

const STEP_COMPONENTS: React.ComponentType<StepProps>[] = [
  StepDemographics, StepConditions, StepMedications,
  StepAllergies, StepFamilyHistory, StepLifestyle, StepEmergencyContacts,
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HealthOnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<FormData>(INITIAL);

  const { loadStatus, saveStatus, saveError, complete, saveStep } = useOnboarding(setData);

  const TOTAL    = STEPS.length;
  const progress = Math.round((step / TOTAL) * 100);
  const isLast   = step === TOTAL;

  async function goTo(s: number) {
    // Auto-save when moving forward
    if (s > step) await saveStep(data, step);
    setStep(s);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const StepContent = STEP_COMPONENTS[step - 1];

  // Show loading screen while fetching existing progress
  if (loadStatus === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin" style={{ color: "var(--color-juno-green)" }} />
          <p className="text-gray-600 font-medium">Loading your health profile…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">

      {/* ══ SIDEBAR — lg+ only ══════════════════════════════════════════════ */}
      <aside className="hidden lg:flex flex-col w-80 bg-white p-8 overflow-y-auto flex-shrink-0"
             style={{ boxShadow: "0 4px 20px -2px rgba(0,0,0,.05)" }}>

        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors mb-8 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "linear-gradient(135deg, var(--color-juno-green) 0%, #059669 100%)", boxShadow: "0 10px 30px -5px rgba(0,112,60,.15)" }}>
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
            Health Profile Setup
          </h1>
          <p className="text-sm text-gray-500">Complete all 7 steps to set up your health profile</p>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold" style={{ color: "var(--color-juno-green)" }}>
              Step {step} of {TOTAL}
            </span>
            <span className="text-xs text-gray-500">{progress}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: "linear-gradient(90deg, var(--color-juno-green), #059669)" }} />
          </div>
        </div>

        <nav className="space-y-2 flex-1">
          {STEPS.map(s => {
            const Icon = s.Icon;
            return (
              <button key={s.id} onClick={() => goTo(s.id)}
                className={`sidebar-step w-full text-left p-4 rounded-xl flex items-center gap-3 ${step === s.id ? "active" : ""} ${step > s.id ? "done" : ""}`}>
                <div className={`w-10 h-10 rounded-lg ${s.iconBg} flex items-center justify-center flex-shrink-0`}>
                  {step > s.id
                    ? <Check className="w-4 h-4" style={{ color: "var(--color-juno-green)" }} />
                    : <Icon className={`w-5 h-5 ${s.iconColor}`} />}
                </div>
                <div>
                  <div className="font-semibold text-gray-800 text-sm">{s.label}</div>
                  <div className="text-xs text-gray-500">{s.sub}</div>
                </div>
              </button>
            );
          })}
        </nav>

        <div className="mt-8 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-emerald-900 mb-1">Your Data is Secure</p>
              <p className="text-xs text-emerald-700">All information is encrypted and protected according to HIPAA standards.</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ══ MAIN CONTENT ════════════════════════════════════════════════════ */}
      <main className="flex-1 overflow-y-auto juno-bg px-4 py-6 lg:px-12 lg:py-8">
        <div className="max-w-2xl lg:max-w-5xl mx-auto fade-in">

          <button onClick={() => navigate(-1)}
            className="lg:hidden flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors mb-6 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div className="lg:hidden text-center mb-6">
            <div className="relative inline-flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, var(--color-juno-green) 0%, #059669 100%)", boxShadow: "0 10px 30px -5px rgba(0,112,60,.15)" }}>
                <Activity className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Health Profile Setup</h1>
            <p className="text-sm text-gray-500">Help us understand your health better</p>
          </div>

          <div className="lg:hidden bg-white rounded-3xl p-4 sm:p-6 mb-6"
               style={{ boxShadow: "0 4px 20px -2px rgba(0,0,0,.05)" }}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold" style={{ color: "var(--color-juno-green)" }}>Step {step} of {TOTAL}</span>
              <span className="text-xs text-gray-500">{progress}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, background: "linear-gradient(90deg, var(--color-juno-green), #059669)" }} />
            </div>
            <div className="grid grid-cols-7 gap-2 mt-4">
              {STEPS.map(s => (
                <div key={s.id} className="h-2 rounded-full transition-all duration-300"
                  style={{ background: s.id <= step ? "var(--color-juno-green)" : "#e5e7eb" }} />
              ))}
            </div>
          </div>

          <StepContent key={step} data={data} setData={setData} />

          {/* Save status indicator */}
          {saveStatus === 'saved' && (
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium mb-2">
              <CheckCircle2 className="w-4 h-4" /> Progress saved
            </div>
          )}
          {saveStatus === 'error' && saveError && (
            <div className="flex items-center gap-2 text-red-600 text-sm font-medium mb-2">
              <span>⚠ {saveError}</span>
            </div>
          )}

          <div className="flex gap-3 lg:gap-4 sticky bottom-0 pt-2 pb-4"
               style={{ background: "linear-gradient(to top, #f0fdf4 60%, transparent)" }}>
            {step > 1 && (
              <button onClick={() => goTo(step - 1)}
                className="btn-outline flex-1 lg:flex-none lg:px-12 flex items-center justify-center gap-2 font-bold py-4 px-6 rounded-xl text-gray-700 text-sm">
                <ArrowLeft className="w-4 h-4" /> Previous
              </button>
            )}
            <button
              onClick={isLast
                ? async () => { await complete(data); navigate("/dashboard"); }
                : () => goTo(step + 1)}
              disabled={saveStatus === 'saving'}
              className="btn-primary flex-1 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 text-sm disabled:opacity-70"
            >
              {saveStatus === 'saving' ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
              ) : isLast ? (
                <><Check className="w-4 h-4" /> Complete Setup</>
              ) : (
                <>Next Step <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4 pb-6">All information is encrypted and secure</p>
        </div>
      </main>
    </div>
  );
}