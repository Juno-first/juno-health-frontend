import {
  type AdminQueueEntry,
} from "../schemas/adminQueue.schema";
import { initials } from "./CallPatientModal";
import { useState } from "react";
import {
   Clock, HeartPulse,
  Eye, UserCheck,
  GripVertical, ArrowUp, Ellipsis,
 
} from "lucide-react";
import { tierColors } from "./CallPatientModal";

function waitMins(iso: string) { return Math.floor((Date.now() - new Date(iso).getTime()) / 60000); }
function formatWait(iso: string) {
  const mins = waitMins(iso);
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

const BG     = "#0A0E1A";
const BORD2  = "#323A52";

export default function PatientCard({ entry, onSelect, onAssign, onEscalate, onDragStart, onDragOver, onDrop, onDragEnd }: {
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