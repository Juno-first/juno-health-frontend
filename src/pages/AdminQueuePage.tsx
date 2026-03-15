import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { AdminSidebar, AdminBottomNav } from "../components/AdminAppNav";
import {
  Users, Clock, HeartPulse, Hourglass, Gauge,
  Brain, Bell, RefreshCw, Filter, Wifi, WifiOff,
  Eye, UserCheck, TriangleAlert, ChevronDown, ChevronUp,
  GripVertical, ArrowUp, Ellipsis, X, Phone,
  Stethoscope, CircleAlert, CircleCheck, BedDouble,
  Lightbulb, ChartNoAxesCombined, UserRound, Loader2,
} from "lucide-react";
import {
  type AdminQueueEntry, type PriorityTier,
  PRIORITY_CONFIG, CATEGORY_LABEL,
} from "../schemas/adminQueue.schema";
import { useAdminQueue } from "../store/hooks/useAdminQueue";
import { useQueueInsights } from "../store/hooks/useQueueInsights";
import type { AvailableRoom } from "../libs/api/adminQueueClient";
import type { QueueInsight } from "../schemas/queueInsights.schema";

// ── Global styles ─────────────────────────────────────────────────────────────
const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  @keyframes pulse-border {
    0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.7); }
    50%       { box-shadow: 0 0 0 8px rgba(239,68,68,0); }
  }
  @keyframes heartbeat {
    0%, 100% { transform: scale(1); }
    10%, 30% { transform: scale(1.15); }
    20%, 40% { transform: scale(1); }
  }
  @keyframes fade-slide {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0);   }
  }
  .critical-pulse { animation: pulse-border 2s ease-in-out infinite; }
  .heartbeat-icon { animation: heartbeat 1.5s ease-in-out infinite; }
  .fade-slide     { animation: fade-slide 0.22s ease forwards; }
  .drag-over      { outline: 2px dashed rgba(99,102,241,.7) !important; outline-offset: 2px; background: rgba(99,102,241,.08) !important; }
  .dragging       { opacity: 0.4; }
  ::-webkit-scrollbar       { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: #1A1F2E; }
  ::-webkit-scrollbar-thumb { background: #2A3142; border-radius: 3px; }
`;

const BG     = "#0A0E1A";
const CARD   = "#1A1F2E";
const BORDER = "#2A3142";
const BORD2  = "#323A52";

const ALERT_CFG: Record<string, { bg:string; border:string; text:string }> = {
  red:    { bg:"rgba(239,68,68,.1)",   border:"rgba(239,68,68,.3)",   text:"#F87171" },
  orange: { bg:"rgba(249,115,22,.1)",  border:"rgba(249,115,22,.3)",  text:"#FB923C" },
  blue:   { bg:"rgba(59,130,246,.1)",  border:"rgba(59,130,246,.3)",  text:"#60A5FA" },
  purple: { bg:"rgba(168,85,247,.1)",  border:"rgba(168,85,247,.3)",  text:"#C084FC" },
  yellow: { bg:"rgba(234,179,8,.1)",   border:"rgba(234,179,8,.3)",   text:"#FACC15" },
  green:  { bg:"rgba(34,197,94,.1)",   border:"rgba(34,197,94,.3)",   text:"#4ADE80" },
};

const AI_INSIGHT_TYPE_CONFIG: Record<string, { color: keyof typeof ALERT_CFG; label: string; Icon: typeof Brain }> = {
  CRITICAL:             { color:"red",    label:"Critical",        Icon:CircleAlert },
  PATIENT_RISK:         { color:"red",    label:"Patient Risk",    Icon:HeartPulse },
  DETERIORATION_RISK:   { color:"red",    label:"Deterioration",   Icon:TriangleAlert },
  ESCALATION_REQUIRED:  { color:"red",    label:"Escalation",      Icon:ArrowUp },
  WAIT_RISK:            { color:"orange", label:"Wait Risk",       Icon:Clock },
  QUEUE_GROWTH:         { color:"orange", label:"Queue Growth",    Icon:Users },
  QUEUE_SURGE:          { color:"orange", label:"Queue Surge",     Icon:ChartNoAxesCombined },
  QUEUE_STAGNATION:     { color:"orange", label:"Stagnation",      Icon:Hourglass },
  CAPACITY_WARNING:     { color:"yellow", label:"Capacity",        Icon:BedDouble },
  CAPACITY_AVAILABLE:   { color:"green",  label:"Capacity",        Icon:BedDouble },
  THROUGHPUT_DROP:      { color:"yellow", label:"Throughput",      Icon:Gauge },
  EFFICIENCY_GAIN:      { color:"green",  label:"Efficiency",      Icon:CircleCheck },
  STAFFING_SHORTAGE:    { color:"yellow", label:"Staffing",        Icon:UserRound },
  STAFFING_AVAILABLE:   { color:"blue",   label:"Staffing",        Icon:UserRound },
  ROOM_UTILIZATION:     { color:"blue",   label:"Rooms",           Icon:BedDouble },
  ROOM_BLOCKED:         { color:"yellow", label:"Rooms",           Icon:BedDouble },
  PATTERN:              { color:"blue",   label:"Pattern",         Icon:ChartNoAxesCombined },
  SYMPTOM_CLUSTER:      { color:"blue",   label:"Symptoms",        Icon:Stethoscope },
  TIME_PATTERN:         { color:"blue",   label:"Time Pattern",    Icon:Clock },
  SURGE_PREDICTION:     { color:"purple", label:"Prediction",      Icon:Brain },
  QUEUE_COLLAPSE_RISK:  { color:"red",    label:"Collapse Risk",   Icon:TriangleAlert },
  DELAY_FORECAST:       { color:"orange", label:"Delay Forecast",  Icon:Hourglass },
  FLOW_IMBALANCE:       { color:"yellow", label:"Flow",            Icon:RefreshCw },
  TRANSFER_OPPORTUNITY: { color:"green",  label:"Transfer",        Icon:ArrowUp },
  BOTTLENECK:           { color:"yellow", label:"Bottleneck",      Icon:Filter },
  INSIGHT:              { color:"purple", label:"Insight",         Icon:Lightbulb },
  STATUS_UPDATE:        { color:"blue",   label:"Status",          Icon:Bell },
  TREND:                { color:"purple", label:"Trend",           Icon:ChartNoAxesCombined },
  SUGGESTION:           { color:"purple", label:"Suggestion",      Icon:Lightbulb },
  PATIENT_CHECK_RESULT: { color:"purple", label:"Patient Check",   Icon:Stethoscope },
};



function severityAccent(severity: string) {
  switch (severity) {
    case "CRITICAL":  return "#F87171";
    case "HIGH":      return "#FB923C";
    case "MODERATE":  return "#FACC15";
    case "LOW":
    default:          return "#93C5FD";
  }
}

// ── Live Insight Card ──────────────────────────────────────────────────────────
function LiveInsightCard({
  insight,
  entries,
  onSelectEntry,
}: {
  insight:        QueueInsight;
  entries:        AdminQueueEntry[];
  onSelectEntry?: (entry: AdminQueueEntry) => void;
}) {
  const related = typeof insight.subjectPosition === "number"
    ? entries.find(e => e.position === insight.subjectPosition) ?? null
    : null;

  const meta = AI_INSIGHT_TYPE_CONFIG[insight.type] ?? {
    color: "blue" as const,
    label: insight.type,
    Icon:  Brain,
  };
  const cfg      = ALERT_CFG[meta.color];
  const IconComp = meta.Icon;
  const clickable = !!related && !!onSelectEntry;

  return (
    <div
      className={`rounded-xl p-3 border transition-all ${clickable ? "cursor-pointer hover:brightness-110" : ""}`}
      style={{ background: cfg.bg, borderColor: cfg.border }}
      onClick={() => { if (related && onSelectEntry) onSelectEntry(related); }}
    >
      <div className="flex items-start justify-between mb-1.5 gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <IconComp size={12} style={{ color: cfg.text }} />
          <span className="text-xs font-black uppercase tracking-wider truncate" style={{ color: cfg.text }}>
            {meta.label}
          </span>
        </div>
        <span className="text-[10px] font-bold uppercase flex-shrink-0" style={{ color: severityAccent(insight.severity) }}>
          {insight.severity}
        </span>
      </div>
      <p className="text-xs text-white font-semibold mb-0.5">{insight.title}</p>
      <p className="text-xs text-gray-300 leading-relaxed">{insight.message}</p>
      <div className="flex items-center justify-between mt-2 gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {typeof insight.subjectPosition === "number" && (
            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold"
              style={{ background:"rgba(255,255,255,.06)", color:"#E5E7EB", border:"1px solid rgba(255,255,255,.08)" }}>
              Position {insight.subjectPosition}
            </span>
          )}
          {related && (
            <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold"
              style={{ background:"rgba(255,255,255,.04)", color:"#9CA3AF", border:"1px solid rgba(255,255,255,.06)" }}>
              {related.presentingComplaint.split(",")[0].trim()}
            </span>
          )}
        </div>
        <span className="text-[10px] text-gray-500 flex-shrink-0">
          {Math.round((insight.confidence ?? 0) * 100)}%
        </span>
      </div>
    </div>
  );
}

const TIER_GROUPS: { tier: PriorityTier; label: string; dot: string; text: string }[] = [
  { tier:"RESUSCITATION", label:"Immediate / Resuscitation", dot:"#111111", text:"#FFFFFF" },
  { tier:"EMERGENCY",     label:"Critical Priority",         dot:"#DC2626", text:"#F87171" },
  { tier:"URGENT",        label:"High Risk Priority",        dot:"#F97316", text:"#FB923C" },
  { tier:"SEMI_URGENT",   label:"Moderate Priority",         dot:"#FACC15", text:"#FDE047" },
  { tier:"NON_URGENT",    label:"Low Priority",              dot:"#22C55E", text:"#4ADE80" },
];

// Spring Boot LocalDateTime has no timezone suffix — append Z to parse as UTC
function toUtc(iso: string) { return iso.endsWith("Z") ? iso : iso + "Z"; }
function waitMins(iso: string) { return Math.max(0, Math.floor((Date.now() - new Date(toUtc(iso)).getTime()) / 60000)); }
function formatWait(iso: string) {
  const mins = waitMins(iso);
  if (mins < 1)  return "< 1m";
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}
function initials(n: string)   { return n.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase(); }

function tierColors(tier: PriorityTier) {
  const map: Record<PriorityTier, { avatar:string; border:string; gradFrom:string; score:string; btn:string }> = {
    RESUSCITATION: { avatar:"#111",    border:"rgba(0,0,0,.6)",       gradFrom:"rgba(0,0,0,.2)",        score:"#E5E7EB", btn:"#111"    },
    EMERGENCY:     { avatar:"#DC2626", border:"rgba(220,38,38,.5)",   gradFrom:"rgba(220,38,38,.15)",   score:"#F87171", btn:"#DC2626" },
    URGENT:        { avatar:"#F97316", border:"rgba(249,115,22,.5)",  gradFrom:"rgba(249,115,22,.15)",  score:"#FB923C", btn:"#EA580C" },
    SEMI_URGENT:   { avatar:"#CA8A04", border:"rgba(234,179,8,.5)",   gradFrom:"rgba(234,179,8,.15)",   score:"#FDE047", btn:"#B45309" },
    NON_URGENT:    { avatar:"#16A34A", border:"rgba(34,197,94,.5)",   gradFrom:"rgba(34,197,94,.15)",   score:"#4ADE80", btn:"#15803D" },
  };
  return map[tier];
}

// ── Call Patient Modal ────────────────────────────────────────────────────────
function CallPatientModal({ entry, rooms, loading, error, onConfirm, onClose }: {
  entry:     AdminQueueEntry;
  rooms:     AvailableRoom[];
  loading:   boolean;
  error:     string | null;
  onConfirm: (roomId: string) => Promise<void>;
  onClose:   () => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [calling,  setCalling]  = useState(false);
  const [callErr,  setCallErr]  = useState<string | null>(null);

  // Sync selection whenever rooms change — always default to first room
  useEffect(() => {
    if (rooms.length > 0) setSelected(prev => prev ?? rooms[0].id);
  }, [rooms]);

  const effectiveSelected = selected ?? rooms[0]?.id ?? null;

  async function handleConfirm() {
    if (!effectiveSelected) return;
    setCalling(true);
    setCallErr(null);
    try {
      await onConfirm(effectiveSelected);
      onClose();
    } catch {
      setCallErr("Failed to call patient. Please try again.");
      setCalling(false);
    }
  }

  const tc = tierColors(entry.priorityTier);

  return (
    <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center fade-slide">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full lg:max-w-md rounded-t-3xl lg:rounded-3xl border overflow-hidden"
        style={{ background: CARD, borderColor: BORD2 }}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b" style={{ borderColor: BORDER }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black"
                 style={{ background: `${tc.avatar}33`, color: tc.score }}>
              <Phone size={11} /> Call Patient
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/10 transition-all"
              style={{ background: BG }}
            >
              <X size={16} className="text-gray-400" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0"
              style={{ background: tc.avatar }}
            >
              {initials(entry.patientName)}
            </div>
            <div>
              <p className="text-white font-bold">{entry.patientName}</p>
              <p className="text-xs text-gray-400">
                #{entry.position} in queue
                {entry.age != null && ` · ${entry.age}y`}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            Select Available Room
          </p>

          {loading ? (
            <div className="flex items-center justify-center py-8 gap-3">
              <Loader2 size={20} className="text-blue-400 animate-spin" />
              <span className="text-sm text-gray-400">Loading rooms…</span>
            </div>
          ) : error ? (
            <div
              className="flex items-center gap-2 p-3 rounded-xl mb-3 text-sm text-red-300"
              style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.3)" }}
            >
              <CircleAlert size={14} className="text-red-400 flex-shrink-0" />
              {error}
            </div>
          ) : rooms.length === 0 ? (
            <div
              className="flex items-center gap-2 p-4 rounded-xl text-sm text-amber-300"
              style={{ background: "rgba(251,191,36,.08)", border: "1px solid rgba(251,191,36,.25)" }}
            >
              <TriangleAlert size={14} className="text-amber-400 flex-shrink-0" />
              No rooms are currently available. Free up a room first.
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {rooms.map(room => (
                <button
                  key={room.id}
                  onClick={() => setSelected(room.id)}
                  className="w-full text-left p-3 rounded-xl border-2 transition-all"
                  style={{
                    background:   effectiveSelected === room.id ? "rgba(0,112,60,.15)"  : BG,
                    borderColor:  effectiveSelected === room.id ? "rgba(0,112,60,.6)"   : BORDER,
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-white">{room.name}</span>
                    <div
                      className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                      style={{
                        borderColor: effectiveSelected === room.id ? "#00703C" : BORD2,
                        background:  effectiveSelected === room.id ? "#00703C" : "transparent",
                      }}
                    >
                      {effectiveSelected === room.id && <CircleCheck size={10} className="text-white" />}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mb-1">{room.description}</p>
                  {room.assignedStaffName && (
                    <div className="flex items-center gap-1.5">
                      <Stethoscope size={10} className="text-purple-400" />
                      <span className="text-xs text-purple-300">{room.assignedStaffName}</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {callErr && (
            <div
              className="flex items-center gap-2 p-3 rounded-xl mt-3 text-sm text-red-300"
              style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.3)" }}
            >
              <CircleAlert size={14} className="text-red-400 flex-shrink-0" />
              {callErr}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 rounded-xl font-bold text-sm text-gray-300 border transition-all hover:bg-white/5"
            style={{ background: BG, borderColor: BORD2 }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!effectiveSelected || rooms.length === 0 || calling || loading}
            className="flex-1 py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg,#00703C,#059669)" }}
          >
            {calling
              ? <><Loader2 size={14} className="animate-spin" /> Calling…</>
              : <><Phone size={14} /> Call to Room</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Check-In Trigger Modal ─────────────────────────────────────────────────────
function CheckInTriggerModal({ entry, departmentId, onClose, triggerCheckIn }: {
  entry:          AdminQueueEntry;
  departmentId:   string;
  onClose:        () => void;
  triggerCheckIn: (visitId: string, departmentId: string, payload: { question: string } | { intent: string }) => Promise<void>;
}) {
  const [mode,    setMode]    = useState<"question" | "intent">("intent");
  const [text,    setText]    = useState("");
  const [sending, setSending] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [err,     setErr]     = useState<string | null>(null);

  const tc = tierColors(entry.priorityTier);

  async function handleSend() {
    if (!text.trim()) return;
    setSending(true);
    setErr(null);
    try {
      await triggerCheckIn(
        entry.visitId,
        departmentId,
        mode === "question" ? { question: text.trim() } : { intent: text.trim() },
      );
      setSent(true);
      setTimeout(onClose, 1800);
    } catch {
      setErr("Failed to send check-in. Please try again.");
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center fade-slide">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full lg:max-w-md rounded-t-3xl lg:rounded-3xl border overflow-hidden"
        style={{ background: CARD, borderColor: BORD2 }}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b" style={{ borderColor: BORDER }}>
          <div className="flex items-center justify-between mb-4">
            <div
              className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black"
              style={{ background: "rgba(168,85,247,.2)", color: "#C084FC" }}
            >
              <Brain size={11} /> Patient Check-In
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/10 transition-all"
              style={{ background: BG }}
            >
              <X size={16} className="text-gray-400" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0"
              style={{ background: tc.avatar }}
            >
              {initials(entry.patientName)}
            </div>
            <div>
              <p className="text-white font-bold">{entry.patientName}</p>
              <p className="text-xs text-gray-400">
                #{entry.position} in queue{entry.age != null && ` · ${entry.age}y`}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {/* Mode toggle */}
          <div
            className="flex rounded-xl overflow-hidden border mb-4"
            style={{ borderColor: BORDER }}
          >
            {(["intent", "question"] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setText(""); setErr(null); }}
                className="flex-1 py-2.5 text-xs font-bold transition-all"
                style={{
                  background: mode === m ? "rgba(168,85,247,.25)" : BG,
                  color:      mode === m ? "#C084FC" : "#6B7280",
                }}
              >
                {m === "intent" ? "Describe Intent" : "Write Question"}
              </button>
            ))}
          </div>

          <p className="text-xs text-gray-500 mb-3">
            {mode === "intent"
              ? "Describe what you want to find out — the AI will write the question and audio for the patient."
              : "Write the exact question that will be sent to the patient verbatim."}
          </p>

          <textarea
            rows={4}
            value={text}
            onChange={e => { setText(e.target.value); setErr(null); }}
            placeholder={mode === "intent"
              ? "e.g. Find out if their chest pain has gotten worse since check-in…"
              : "e.g. Has your pain level changed since you arrived?"}
            disabled={sending || sent}
            className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-600 resize-none outline-none border transition-all disabled:opacity-50"
            style={{ background: BG, borderColor: text.trim() ? "rgba(168,85,247,.5)" : BORDER }}
          />

          {err && (
            <div
              className="flex items-center gap-2 p-3 rounded-xl mt-3 text-sm text-red-300"
              style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.3)" }}
            >
              <CircleAlert size={14} className="text-red-400 flex-shrink-0" />
              {err}
            </div>
          )}

          {sent && (
            <div
              className="flex items-center gap-2 p-3 rounded-xl mt-3 text-sm text-green-300"
              style={{ background: "rgba(34,197,94,.1)", border: "1px solid rgba(34,197,94,.3)" }}
            >
              <CircleCheck size={14} className="text-green-400 flex-shrink-0" />
              Check-in sent successfully!
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 rounded-xl font-bold text-sm text-gray-300 border transition-all hover:bg-white/5"
            style={{ background: BG, borderColor: BORD2 }}
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={!text.trim() || sending || sent}
            className="flex-1 py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg,#7C3AED,#6D28D9)" }}
          >
            {sending ? (
              <><Loader2 size={14} className="animate-spin" /> Sending…</>
            ) : sent ? (
              <><CircleCheck size={14} /> Sent!</>
            ) : (
              <><Brain size={14} /> Send Check-In</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Patient Drawer ─────────────────────────────────────────────────────────────
function PatientDrawer({ entry, onClose, onCallClick, onDischarge, onCheckIn }: {
  entry: AdminQueueEntry; onClose: ()=>void;
  onCallClick: (entry: AdminQueueEntry) => void;
  onDischarge: (id:string)=>void;
  onCheckIn:   (entry: AdminQueueEntry) => void;
}) {
  const tc = tierColors(entry.priorityTier);
  const pc = PRIORITY_CONFIG[entry.priorityTier];
  return (
    <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center fade-slide">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full lg:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl lg:rounded-3xl border"
           style={{ background:CARD, borderColor:BORD2 }}>
        <div className="sticky top-0 px-6 pt-6 pb-4 border-b z-10" style={{ background:CARD, borderColor:BORDER }}>
          <div className="flex items-center justify-between mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-black ${pc.bg} ${pc.text}`}>{pc.label}</span>
            <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:BG }}>
              <X size={16} className="text-gray-400" />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-xl flex-shrink-0"
                 style={{ background:tc.avatar }}>
              {initials(entry.patientName)}
            </div>
            <div>
              <h2 className="text-xl font-black text-white">{entry.patientName}</h2>
              <p className="text-sm text-gray-400">
                {entry.age != null && <span className="text-gray-300 font-semibold">{entry.age}y</span>}
                {entry.age != null && " · "}
                {entry.checkinCode ? <>Code <span className="font-bold tracking-widest text-gray-200">{entry.checkinCode}</span> · </> : null}
                #{entry.position} in queue
                {entry.departmentName && <> · <span className="text-gray-400">{entry.departmentName}</span></>}
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label:"Pain Level", val:`${entry.painLevel}/10` },
              { label:"Waiting",    val:formatWait(entry.checkedInAt) },
              { label:"AI Score",   val:entry.aiPriorityScore, red:true },
            ].map(s => (
              <div key={s.label} className="text-center p-3 rounded-xl" style={{ background:BG }}>
                <div className={`text-xl font-black ${(s as {red?:boolean}).red ? "text-red-400" : "text-white"}`}>{s.val}</div>
                <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Presenting Complaint</h4>
            <p className="text-sm text-gray-300 leading-relaxed p-4 rounded-xl" style={{ background:BG }}>{entry.presentingComplaint}</p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Symptom Categories</h4>
            <div className="flex flex-wrap gap-2">
              {entry.symptomCategories.map(c => (
                <span key={c} className="px-3 py-1 rounded-full text-xs font-semibold text-blue-300"
                      style={{ background:"rgba(59,130,246,.15)", border:"1px solid rgba(59,130,246,.3)" }}>
                  {CATEGORY_LABEL[c] ?? c}
                </span>
              ))}
            </div>
          </div>

          {entry.additionalNotes && (
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Additional Notes</h4>
              <p className="text-sm text-amber-300 p-4 rounded-xl leading-relaxed"
                 style={{ background:"rgba(251,191,36,.08)", border:"1px solid rgba(251,191,36,.2)" }}>
                {entry.additionalNotes}
              </p>
            </div>
          )}

          {entry.assignedTo && (
            <div className="flex items-center gap-2 p-3 rounded-xl"
                 style={{ background:"rgba(168,85,247,.1)", border:"1px solid rgba(168,85,247,.2)" }}>
              <Stethoscope size={14} className="text-purple-400" />
              <p className="text-sm font-semibold text-purple-300">Assigned to {entry.assignedTo}</p>
            </div>
          )}
        </div>

        {entry.status === "CHECKED_IN" && (
          <div className="sticky bottom-0 px-6 py-4 border-t flex flex-col gap-2" style={{ background:CARD, borderColor:BORDER }}>
            <div className="flex gap-3">
              <button onClick={() => { onClose(); onCallClick(entry); }}
                className="flex-1 py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2"
                style={{ background:"linear-gradient(135deg,#DC2626,#B91C1C)" }}>
                <Phone size={15} /> Call Patient
              </button>
              <button onClick={() => { onDischarge(entry.queueEntryId); onClose(); }}
                className="flex-1 py-3.5 rounded-xl font-bold text-sm text-gray-300 flex items-center justify-center gap-2"
                style={{ background:BG, border:`1px solid ${BORD2}` }}>
                <UserCheck size={15} /> Discharge
              </button>
            </div>
            <button
              onClick={() => { onClose(); onCheckIn(entry); }}
              className="w-full py-3 rounded-xl font-bold text-sm text-purple-300 flex items-center justify-center gap-2 transition-all hover:brightness-110 border"
              style={{ background:"rgba(168,85,247,.12)", borderColor:"rgba(168,85,247,.3)" }}
            >
              <Brain size={14} /> Send AI Check-In Question
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Patient Card ───────────────────────────────────────────────────────────────
function PatientCard({ entry, onSelect, onAssign, onEscalate, onDragStart, onDragOver, onDrop, onDragEnd }: {
  entry: AdminQueueEntry;
  onSelect:    (e: AdminQueueEntry) => void;
  onAssign:    (id: string) => void;
  onEscalate?: (id: string) => void;
  onDragStart: (id: string) => void;
  onDragOver:  (e: React.DragEvent) => void;
  onDrop:      (targetId: string) => void;
  onDragEnd:   () => void;
}) {
  const tc     = tierColors(entry.priorityTier);
  const isCrit = entry.priorityTier === "EMERGENCY" || entry.priorityTier === "RESUSCITATION";
  const [isOver, setIsOver] = useState(false);

  return (
    <div
      draggable
      onDragStart={() => onDragStart(entry.queueEntryId)}
      onDragOver={e => { e.preventDefault(); setIsOver(true); onDragOver(e); }}
      onDragLeave={() => setIsOver(false)}
      onDrop={() => { setIsOver(false); onDrop(entry.queueEntryId); }}
      onDragEnd={() => { setIsOver(false); onDragEnd(); }}
      onClick={() => onSelect(entry)}
      className={`rounded-xl p-4 cursor-pointer transition-all border-2 select-none
        ${isCrit ? "critical-pulse" : ""}
        ${isOver ? "drag-over" : ""}`}
      style={{
        background: `linear-gradient(135deg, ${tc.gradFrom}, ${tc.gradFrom.replace(".15",".04")})`,
        borderColor: isOver ? "rgba(99,102,241,.7)" : tc.border,
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-base text-white flex-shrink-0"
               style={{ background:tc.avatar }}>
            {initials(entry.patientName)}
          </div>
          <div>
            <span className="text-white font-bold text-sm">
              {entry.checkinCode ? `#${entry.checkinCode}` : entry.patientName}
            </span>
            {entry.age != null && (
              <span className="ml-1.5 text-xs text-gray-400">· {entry.age}y</span>
            )}
            <div className="flex items-center gap-1.5 mt-1">
              <HeartPulse size={11} style={{ color:tc.score }} className={isCrit ? "heartbeat-icon" : ""} />
              <span className="text-xs font-bold" style={{ color:tc.score }}>
                AI Score: {(entry.aiPriorityScore / 10).toFixed(1)}
              </span>
            </div>
          </div>
        </div>
        {/* Drag handle + wait time */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{formatWait(entry.checkedInAt)}</span>
          <div
            className="cursor-grab active:cursor-grabbing p-1 rounded-lg transition-colors hover:bg-white/10"
            title="Drag to swap position"
            onClick={e => e.stopPropagation()}
          >
            <GripVertical size={14} className="text-gray-500" />
          </div>
        </div>
      </div>

      <div className="mb-3">
        <p className="text-sm text-white font-semibold mb-0.5 line-clamp-1">
          {entry.presentingComplaint.split(",")[0].split("—")[0].trim()}
        </p>
        <p className="text-xs text-gray-400 line-clamp-1">
          {entry.presentingComplaint.split(",").slice(1).join(",").trim() ||
           entry.presentingComplaint.split("—").slice(1).join("").trim()}
        </p>
      </div>

      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <div className="px-2 py-1 rounded-lg" style={{ background:`${tc.avatar}33` }}>
          <span className="text-xs font-bold" style={{ color:tc.score }}>Pain: {entry.painLevel}/10</span>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background:"rgba(249,115,22,.2)" }}>
          <Clock size={10} className="text-orange-400" />
          <span className="text-xs font-bold text-orange-400">
            {entry.estimatedWaitMinutes == null || entry.estimatedWaitMinutes === 0 ? "Immediate" : `${entry.estimatedWaitMinutes}m`}
          </span>
        </div>
        {entry.status === "IN_PROGRESS" && (
          <span className="text-xs font-bold px-2 py-1 rounded-lg" style={{ background:"rgba(168,85,247,.2)", color:"#C084FC" }}>In Progress</span>
        )}
        {entry.status === "CALLED" && (
          <span className="text-xs font-bold px-2 py-1 rounded-lg" style={{ background:"rgba(96,165,250,.2)", color:"#93C5FD" }}>Called</span>
        )}
      </div>

      <div className="flex gap-2" onClick={e => e.stopPropagation()}>
        <button onClick={() => onSelect(entry)}
          className="flex-1 py-2 rounded-lg text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:brightness-110 transition-all"
          style={{ background:tc.btn }}>
          <Eye size={12} /> View
        </button>
        {isCrit ? (
          <button onClick={() => onAssign(entry.queueEntryId)}
            className="flex-1 py-2 rounded-lg text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
            style={{ background:BG, border:`1px solid ${BORD2}` }}>
            <UserCheck size={12} /> Assign
          </button>
        ) : onEscalate ? (
          <button onClick={() => onEscalate(entry.queueEntryId)}
            className="flex-1 py-2 rounded-lg text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
            style={{ background:BG, border:`1px solid ${BORD2}` }}>
            <ArrowUp size={12} /> Escalate
          </button>
        ) : (
          <button className="py-2 px-3 rounded-lg text-white transition-all" style={{ background:BG, border:`1px solid ${BORD2}` }}>
            <Ellipsis size={14} />
          </button>
        )}
      </div>
    </div>
  );
}



// ── Tier Section ───────────────────────────────────────────────────────────────
function TierSection({ tier, label, dotColor, textColor, entries, collapsed, onToggle, onSelect, onCallClick, onSwap }: {
  tier: PriorityTier; label: string; dotColor: string; textColor: string;
  entries: AdminQueueEntry[]; collapsed: boolean; onToggle: ()=>void;
  onSelect:    (e: AdminQueueEntry) => void;
  onCallClick: (e: AdminQueueEntry) => void;
  onSwap:      (idA: string, idB: string) => void;
}) {
  const dragId = useRef<string | null>(null);
  const isCrit = tier === "EMERGENCY" || tier === "RESUSCITATION";
  if (entries.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background:dotColor }} />
        <h3 className="text-sm font-black uppercase tracking-widest" style={{ color:textColor }}>{label}</h3>
        <span className="text-xs text-gray-500">{entries.length} patient{entries.length !== 1 ? "s" : ""}</span>
        <span className="text-xs text-gray-600 ml-1">· drag to swap</span>
        {entries.length > 2 && (
          <button onClick={onToggle} className="ml-auto text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-all">
            {collapsed ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
            {collapsed ? "Show All" : "Collapse"}
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {(collapsed ? entries.slice(0, 2) : entries).map(e => (
          <PatientCard
            key={e.queueEntryId}
            entry={e}
            onSelect={onSelect}
            onAssign={() => onCallClick(e)}
            onEscalate={!isCrit ? () => onCallClick(e) : undefined}
            onDragStart={id => { dragId.current = id; }}
            onDragOver={ev => ev.preventDefault()}
            onDrop={targetId => {
              if (dragId.current && dragId.current !== targetId) {
                onSwap(dragId.current, targetId);
              }
              dragId.current = null;
            }}
            onDragEnd={() => { dragId.current = null; }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Empty / Error states ───────────────────────────────────────────────────────
function EmptyBoard() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background:"rgba(34,197,94,.15)" }}>
        <CircleCheck size={32} className="text-green-400" />
      </div>
      <p className="text-white font-bold text-lg mb-1">Queue is clear</p>
      <p className="text-gray-500 text-sm">No patients are currently waiting</p>
    </div>
  );
}

function ErrorBanner({ message, onRetry }: { message:string; onRetry:()=>void }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl mb-4"
         style={{ background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.3)" }}>
      <div className="flex items-center gap-3">
        <CircleAlert size={16} className="text-red-400 flex-shrink-0" />
        <p className="text-sm text-red-300 font-medium">{message}</p>
      </div>
      <button onClick={onRetry} className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1 transition-all ml-4 flex-shrink-0">
        <RefreshCw size={12} /> Retry
      </button>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AdminQueuePage() {
  const { departmentId = "" } = useParams<{ departmentId: string }>();

  const {
    entries, socketStatus, loadStatus, error,
    fetchAvailableRooms, callPatient, removePatient, swapPatients, triggerCheckIn, refresh,
  } = useAdminQueue(departmentId);

  const { insights } = useQueueInsights(departmentId);

  const [selected,   setSelected]   = useState<AdminQueueEntry | null>(null);
  const [callTarget,     setCallTarget]     = useState<AdminQueueEntry | null>(null);
  const [checkInTarget,  setCheckInTarget]  = useState<AdminQueueEntry | null>(null);
  const [allInsights,    setAllInsights]    = useState<QueueInsight[]>([]);
  const [rooms,      setRooms]      = useState<AvailableRoom[]>([]);
  const [roomsLoad,  setRoomsLoad]  = useState(false);
  const [roomsErr,   setRoomsErr]   = useState<string | null>(null);
  const [time,       setTime]       = useState(new Date());
  const [collapsed,  setCollapsed]  = useState<Record<string, boolean>>({ SEMI_URGENT:true, NON_URGENT:true });
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    tickRef.current = setInterval(() => setTime(new Date()), 10000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, []);

  // Accumulate insights — prepend newest to top, cap at 100 to avoid memory growth
  useEffect(() => {
    if (!insights || insights.length === 0) return;
    setAllInsights(prev => {
      const incoming = insights.filter(
        n => !prev.some(p => p.title === n.title && p.type === n.type)
      );
      if (incoming.length === 0) return prev;
      return [...incoming, ...prev].slice(0, 100);
    });
  }, [insights]);

  // Keep drawer in sync with live data
  useEffect(() => {
    if (!selected) return;
    const live = entries.find(e => e.queueEntryId === selected.queueEntryId);
    if (!live) setSelected(null);
    else if (live !== selected) setSelected(live);
  }, [entries]);

  const openCallModal = useCallback(async (entry: AdminQueueEntry) => {
    setCallTarget(entry);
    setRooms([]);
    setRoomsErr(null);
    setRoomsLoad(true);
    try {
      const available = await fetchAvailableRooms(departmentId);
      setRooms(available);
    } catch {
      setRoomsErr("Could not load available rooms.");
    } finally {
      setRoomsLoad(false);
    }
  }, [departmentId, fetchAvailableRooms]);

  const handleCallConfirm = useCallback(async (roomId: string) => {
    if (!callTarget) return;
    await callPatient(callTarget.queueEntryId, roomId);
    setCallTarget(null);
  }, [callTarget, callPatient]);

  const handleSwap = useCallback((idA: string, idB: string) => {
    swapPatients(idA, idB);
  }, [swapPatients]);

  const isConnected   = socketStatus === "connected";
  const isLoading     = loadStatus === "loading";
  const criticalCount = entries.filter(e => e.priorityTier === "EMERGENCY" || e.priorityTier === "RESUSCITATION").length;
  const totalWaiting  = entries.filter(e => e.status === "CHECKED_IN").length;
  const avgWait       = entries.length ? Math.round(entries.reduce((s,e) => s + waitMins(e.checkedInAt), 0) / entries.length) : 0;
  const grouped       = TIER_GROUPS.map(g => ({ ...g, entries: entries.filter(e => e.priorityTier === g.tier) }));

  const STATS = [
    { label:"Patients Waiting",   val:totalWaiting,      Icon:Users,      iconBg:"rgba(59,130,246,.2)",  iconColor:"#60A5FA", pulse:false },
    { label:"Avg Wait Time",      val:`${avgWait}m`,     Icon:Clock,      iconBg:"rgba(249,115,22,.2)",  iconColor:"#FB923C", pulse:false },
    { label:"High-Risk Patients", val:criticalCount,     Icon:HeartPulse, iconBg:"rgba(239,68,68,.2)",   iconColor:"#F87171", pulse:criticalCount > 0 },
    { label:"Longest Waiting",    val:formatWait(entries.reduce((a, b) => waitMins(a.checkedInAt) > waitMins(b.checkedInAt) ? a : b, entries[0])?.checkedInAt ?? new Date().toISOString()), Icon:Hourglass,  iconBg:"rgba(234,179,8,.2)",   iconColor:"#FACC15", pulse:false },
    { label:"Throughput Rate",    val:"4.2/hr",          Icon:Gauge,      iconBg:"rgba(34,197,94,.2)",   iconColor:"#4ADE80", pulse:false },
  ];

  const socketLabel = { idle:"Idle", connecting:"Connecting…", connected:"Live", disconnected:"Reconnecting…", error:"Error" }[socketStatus];
  const socketColor = isConnected
    ? { fg:"#4ADE80", bg:"rgba(34,197,94,.1)" }
    : socketStatus === "error"
    ? { fg:"#F87171", bg:"rgba(239,68,68,.1)" }
    : { fg:"#FB923C", bg:"rgba(249,115,22,.1)" };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background:BG, fontFamily:"'Inter',sans-serif" }}>
      <style>{GLOBAL_STYLES}</style>
      <AdminSidebar alertCount={criticalCount} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="px-4 lg:px-6 py-4 border-b flex-shrink-0 flex items-center justify-between"
                style={{ background:CARD, borderColor:BORDER }}>
          <div className="flex items-center gap-4">
            <button className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:BG }}>
              <GripVertical size={18} className="text-white" />
            </button>
            <div>
              <h1 className="text-xl lg:text-2xl font-black text-white flex items-center gap-3">
                Emergency Triage Command Center
                <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-lg"
                      style={{ color:"#F87171", background:"rgba(239,68,68,.2)", border:"1px solid rgba(239,68,68,.3)" }}>
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> LIVE
                </span>
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                {departmentId && <><span className="text-gray-500 font-mono">{departmentId}</span> · </>}
                Last updated: <span className="text-white font-semibold">
                  {time.toLocaleTimeString([], { hour:"2-digit", minute:"2-digit", second:"2-digit" })}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-3">
            <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-semibold"
                 style={{ color:socketColor.fg, background:socketColor.bg }}>
              {isConnected ? <Wifi size={12}/>
                : socketStatus === "connecting" || socketStatus === "disconnected"
                ? <Loader2 size={12} className="animate-spin"/>
                : <WifiOff size={12}/>}
              <span className="hidden lg:inline">{socketLabel}</span>
            </div>

            <button className="w-10 h-10 rounded-xl flex items-center justify-center relative hover:bg-red-600/20 transition-all"
                    style={{ background:BG }}>
              <Bell size={18} className="text-white" />
              {criticalCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full text-white text-xs flex items-center justify-center font-black">
                  {criticalCount}
                </span>
              )}
            </button>

            <button className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl text-white font-bold text-sm transition-all hover:brightness-110"
                    style={{ background:"linear-gradient(135deg,#DC2626,#B91C1C)" }}>
              <TriangleAlert size={14}/> Emergency Alert
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6 space-y-5 pb-24 lg:pb-6">

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4">
              {STATS.map(({ label, val, Icon, iconBg, iconColor, pulse }) => (
                <div key={label} className={`rounded-2xl p-4 border ${pulse ? "critical-pulse" : ""}`}
                     style={{ background:CARD, borderColor: pulse ? "rgba(239,68,68,.4)" : BORDER }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background:iconBg }}>
                    <Icon size={18} style={{ color:iconColor }} className={pulse ? "heartbeat-icon" : ""} />
                  </div>
                  <div className="text-3xl font-black mb-1" style={{ color: pulse ? "#F87171" : "white" }}>{val}</div>
                  <div className="text-xs font-medium text-gray-400">{label}</div>
                </div>
              ))}
            </div>

            {/* Main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">

              {/* Triage board */}
              <div className="lg:col-span-3">
                <div className="rounded-2xl p-5 border" style={{ background:CARD, borderColor:BORDER }}>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:"rgba(239,68,68,.2)" }}>
                        <Filter size={16} className="text-red-400" />
                      </div>
                      <div>
                        <h2 className="text-lg font-black text-white">Real-Time Triage Board</h2>
                        <p className="text-xs text-gray-400">Click to view details · Drag to swap positions</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-2 rounded-lg text-gray-300 hover:text-white text-xs font-semibold transition-all"
                              style={{ background:BG }}>
                        <Filter size={11} className="inline mr-1"/>Filter
                      </button>
                      <button onClick={refresh} disabled={isLoading}
                        className="px-3 py-2 rounded-lg text-gray-300 hover:text-white text-xs font-semibold transition-all flex items-center gap-1 disabled:opacity-50"
                        style={{ background:BG }}>
                        <RefreshCw size={11} className={isLoading ? "animate-spin" : ""} />
                        {isLoading ? "Loading…" : "Refresh"}
                      </button>
                    </div>
                  </div>

                  {error && <ErrorBanner message={error} onRetry={refresh} />}

                  {isLoading && entries.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                      <Loader2 size={36} className="text-blue-400 animate-spin" />
                      <p className="text-gray-400 text-sm font-medium">Loading queue…</p>
                    </div>
                  ) : entries.length === 0 ? (
                    <EmptyBoard />
                  ) : (
                    <div className="space-y-6">
                      {grouped.map(g => (
                        <TierSection
                          key={g.tier}
                          tier={g.tier} label={g.label}
                          dotColor={g.dot} textColor={g.text}
                          entries={g.entries}
                          collapsed={!!collapsed[g.tier]}
                          onToggle={() => setCollapsed(p => ({ ...p, [g.tier]:!p[g.tier] }))}
                          onSelect={setSelected}
                          onCallClick={openCallModal}
                          onSwap={handleSwap}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* AI panel */}
              <div className="lg:col-span-1">
                <div className="rounded-2xl p-5 border" style={{ background:CARD, borderColor:BORDER }}>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:"rgba(168,85,247,.2)" }}>
                      <Brain size={18} className="text-purple-400" />
                    </div>
                    <div>
                      <h2 className="text-base font-black text-white">AI Intelligence</h2>
                      <p className="text-xs text-gray-400">Real-time insights &amp; monitoring</p>
                    </div>
                  </div>
                  <div
                    className="space-y-3 overflow-y-auto pr-1"
                    style={{ maxHeight: "520px" }}
                  >
                    {allInsights.length > 0 ? (
                      allInsights.map((insight, i) => (
                        <LiveInsightCard
                          key={`${insight.type}-${insight.title}-${i}`}
                          insight={insight}
                          entries={entries}
                          onSelectEntry={setSelected}
                        />
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                          style={{ background: "rgba(168,85,247,.15)" }}
                        >
                          <Brain size={22} className="text-purple-400" />
                        </div>
                        <p className="text-sm font-semibold text-gray-400">No insights yet</p>
                        <p className="text-xs text-gray-600 mt-1">Insights will appear as queue events occur</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {selected && (
        <PatientDrawer entry={selected} onClose={() => setSelected(null)}
          onCallClick={openCallModal} onDischarge={removePatient}
          onCheckIn={e => { setSelected(null); setCheckInTarget(e); }} />
      )}

      {checkInTarget && (
        <CheckInTriggerModal
          entry={checkInTarget}
          departmentId={departmentId}
          triggerCheckIn={triggerCheckIn}
          onClose={() => setCheckInTarget(null)}
        />
      )}

      {callTarget && (
        <CallPatientModal
          entry={callTarget}
          rooms={rooms}
          loading={roomsLoad}
          error={roomsErr}
          onConfirm={handleCallConfirm}
          onClose={() => setCallTarget(null)}
        />
      )}

      <AdminBottomNav />
    </div>
  );
}