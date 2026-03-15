import {type AdminQueueEntry,type PriorityTier} from "../schemas/adminQueue.schema";
import type { AvailableRoom } from "../libs/api/adminQueueClient";
import { useState,useEffect } from "react";
import {
    TriangleAlert, 
   X, Phone,
  Stethoscope, CircleAlert, CircleCheck, 
   Loader2,
} from "lucide-react";

export function tierColors(tier: PriorityTier) {
  const map: Record<PriorityTier, { avatar:string; border:string; gradFrom:string; score:string; btn:string }> = {
    RESUSCITATION: { avatar:"#111",    border:"rgba(0,0,0,.6)",       gradFrom:"rgba(0,0,0,.2)",        score:"#E5E7EB", btn:"#111"    },
    EMERGENCY:     { avatar:"#DC2626", border:"rgba(220,38,38,.5)",   gradFrom:"rgba(220,38,38,.15)",   score:"#F87171", btn:"#DC2626" },
    URGENT:        { avatar:"#F97316", border:"rgba(249,115,22,.5)",  gradFrom:"rgba(249,115,22,.15)",  score:"#FB923C", btn:"#EA580C" },
    SEMI_URGENT:   { avatar:"#CA8A04", border:"rgba(234,179,8,.5)",   gradFrom:"rgba(234,179,8,.15)",   score:"#FDE047", btn:"#B45309" },
    NON_URGENT:    { avatar:"#16A34A", border:"rgba(34,197,94,.5)",   gradFrom:"rgba(34,197,94,.15)",   score:"#4ADE80", btn:"#15803D" },
  };
  return map[tier];
}

export function initials(n: string)   { return n.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase(); }

const BG     = "#0A0E1A";
const CARD   = "#1A1F2E";
const BORDER = "#2A3142";
const BORD2  = "#323A52";


export default function CallPatientModal({ entry, rooms, loading, error, onConfirm, onClose }: {
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