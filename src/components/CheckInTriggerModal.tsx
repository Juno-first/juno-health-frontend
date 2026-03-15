
import {type AdminQueueEntry} from "../schemas/adminQueue.schema";
import { tierColors } from "./CallPatientModal";
import { useState } from "react";
import {Brain,X,CircleAlert, CircleCheck,Loader2} from "lucide-react";
import { initials } from "./CallPatientModal";


const BG     = "#0A0E1A";
const CARD   = "#1A1F2E";
const BORDER = "#2A3142";
const BORD2  = "#323A52";

export default function CheckInTriggerModal({ entry, departmentId, onClose, triggerCheckIn }: {
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