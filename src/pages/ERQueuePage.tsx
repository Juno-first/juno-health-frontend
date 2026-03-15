import { useEffect, useRef, useState } from "react";
import {
  Bell, QrCode, Phone, X,
  Menu, Hospital,
  Loader2, Wifi, WifiOff,
  AlertTriangle, Send, CheckCircle2,
} from "lucide-react";
import { Sidebar, BottomNav } from "../components/AppNav";
import { useQueueData, useQueueSocket } from "../store/hooks/useQueue";
import { useAudioAssistant } from "../store/hooks/useAudioAssistant";
import { useAppSelector } from "../store/hooks/hooks";
import { CheckInQuestionPopup } from "../components/CheckinQuestionPopup";
import { usePatientCheckIn } from "../store/hooks/usePatientCheckin";
import { useDiscomfortReport } from "../store/hooks/useDiscomfortReport";
import TriagePriorityCard from "../components/TriagePriorityCard";
import QueueStatusCard from "../components/QueueStatusCard";
import QuickActionsGrid from "../components/QuickActionsGrid";
import DepartmentCard from "../components/DepartmentCard";
import ImportantInfoCard from "../components/ImportantInfoCard";
import StatusUpdatesCard from "../components/StatusUpdatesCard";

// ── Preset messages ───────────────────────────────────────────────────────────
const PRESETS = [
  "My chest pain is getting a lot worse.",
  "I'm feeling dizzy and may faint.",
  "My breathing has become very difficult.",
  "My pain has increased significantly.",
  "I'm feeling nauseous and about to vomit.",
  "I'm experiencing a new symptom.",
];

// ── Discomfort Modal ──────────────────────────────────────────────────────────
function DiscomfortModal({
  onClose,
  onSubmit,
  sending,
  sent,
  error,
}: {
  onClose:  () => void;
  onSubmit: (message: string) => void;
  sending:  boolean;
  sent:     boolean;
  error:    string | null;
}) {
  const [message, setMessage] = useState("");

  function handlePreset(p: string) {
    setMessage(prev => prev ? `${prev} ${p}` : p);
  }

  if (sent) {
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: "rgba(0,0,0,.5)" }}>
        <div className="bg-white rounded-3xl p-8 w-full max-w-md text-center shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Report Sent</h3>
          <p className="text-gray-500 text-sm mb-6">
            The department has been notified. A staff member will attend to you shortly.
          </p>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl font-bold text-white"
            style={{ background: "var(--color-juno-green)" }}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: "rgba(0,0,0,.5)" }}>
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Report Worsening Condition</h3>
              <p className="text-xs text-gray-500">Notify the department immediately</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Presets */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Quick Select</p>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map(p => (
                <button
                  key={p}
                  onClick={() => handlePreset(p)}
                  className="text-xs px-3 py-1.5 rounded-full border-2 border-gray-200 text-gray-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700 transition-all"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Your Message</p>
            <textarea
              rows={4}
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Describe how your condition has changed…"
              className="w-full border-2 border-gray-200 rounded-xl p-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-red-400 resize-none"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-semibold text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => message.trim() && onSubmit(message.trim())}
              disabled={!message.trim() || sending}
              className="flex-1 py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg,#ef4444,#dc2626)" }}
            >
              {sending
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                : <><Send className="w-4 h-4" /> Send Report</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ERQueuePage() {
  const { data, checkedInAt, checkStatus, updates, isLive, leave } = useQueueData();
  useQueueSocket(data?.queueEntryId);

  const { playQueueAudio } = useAudioAssistant();
  const leaving = checkStatus === "leaving";

  const prevStatusRef = useRef<string | null>(null);
  const accessToken = useAppSelector((s) => s.user.accessToken);

  const { question, answered, submitAnswer, dismissQuestion } = usePatientCheckIn(
    data?.status === "CHECKED_IN" ? data?.visitId : undefined
  );

  const { status: discomfortStatus, error: discomfortError, report, reset: resetDiscomfort } = useDiscomfortReport();
  const [showDiscomfort, setShowDiscomfort] = useState(false);

  useEffect(() => {
    if (!data) return;
    const previousStatus = prevStatusRef.current;
    if (data.status === "CALLED" && previousStatus !== "CALLED") {
      playQueueAudio(
        {
          eventType: "CALLED",
          facilityName: data.facilityName,
          departmentName: data.departmentName,
          position: data.position,
          queueDepth: data.queueDepth,
          estimatedWaitMinutes: data.estimatedWaitMinutes,
          checkinCode: data.checkinCode,
          priorityTier: data.priorityTier,
          roomName: data.roomName,
          assignedStaffName: data.assignedStaffName,
          assignedStaffRole: data.assignedStaffRole,
        },
        accessToken
      );
    }
    prevStatusRef.current = data.status;
  }, [data, playQueueAudio, accessToken]);

  const unreadCount = updates.filter(u => Date.now() - u.time < 5 * 60 * 1000).length;

  function handleOpenDiscomfort() {
    resetDiscomfort();
    setShowDiscomfort(true);
  }

  function handleSubmitDiscomfort(message: string) {
    if (!data) return;
    // departmentId isn't in QueueStatus — derive it from the queue entry
    // The API needs visitId + departmentId. Since departmentId isn't exposed
    // on the patient-facing status, we pass queueEntryId as departmentId
    // if your backend uses it, or update QueueStatusSchema to include departmentId.
    report(data.visitId, data.departmentId, message);
  }

  if (checkStatus === "idle" || checkStatus === "checking" || checkStatus === "not_in_queue") {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin" style={{ color: "var(--color-juno-green)" }} />
            <p className="text-gray-600 font-medium">Loading your queue status…</p>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ── HEADER ── */}
        <header
          className="bg-white border-b border-gray-100 px-5 py-4 lg:px-8 flex items-center justify-between flex-shrink-0"
          style={{ boxShadow: "0 1px 4px rgba(0,0,0,.04)" }}
        >
          <div className="flex items-center gap-4">
            <button className="lg:hidden w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
              <Menu className="w-5 h-5 text-gray-700" />
            </button>
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: data.status === "CALLED"
                    ? "linear-gradient(135deg,#22c55e 0%,#16a34a 100%)"
                    : "linear-gradient(135deg,#ef4444 0%,#dc2626 100%)",
                  boxShadow: data.status === "CALLED"
                    ? "0 6px 20px -4px rgba(34,197,94,.4)"
                    : "0 6px 20px -4px rgba(239,68,68,.4)"
                }}
              >
                <Hospital className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">ER Queue Tracker</h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {isLive
                    ? <><Wifi size={11} className="text-green-500" /><span className="text-xs text-green-600 font-semibold">Live</span></>
                    : <><WifiOff size={11} className="text-gray-400" /><span className="text-xs text-gray-400">Connecting…</span></>
                  }
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Condition worsening button — visible on all sizes */}
            <button
              onClick={handleOpenDiscomfort}
              className="flex items-center gap-2 px-3 py-2 rounded-xl font-semibold text-sm text-white transition-all hover:brightness-90 active:scale-95"
              style={{ background: "linear-gradient(135deg,#ef4444,#dc2626)", boxShadow: "0 4px 14px -3px rgba(239,68,68,.5)" }}
            >
              <AlertTriangle className="w-4 h-4" />
              <span className="hidden sm:inline">Condition Worsening</span>
            </button>

            <button className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors relative">
              <Bell className="w-5 h-5 text-gray-700" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold pulse-dot">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 active:scale-95"
              style={{ background: "var(--color-juno-green)" }}
            >
              <QrCode className="w-4 h-4" /> Show QR
            </button>
          </div>
        </header>

        {/* ── BODY ── */}
        <main className="flex-1 overflow-y-auto pb-24 lg:pb-6">
          <div className="max-w-[1600px] mx-auto p-4 lg:p-6 space-y-6">

            {/* ROW 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <QueueStatusCard
                  data={data}
                  checkedInAt={checkedInAt}
                  isLive={isLive}
                  onLeave={leave}
                  leaving={leaving}
                />
              </div>
              <div className="space-y-4">
                <TriagePriorityCard data={data} compact />
                <div className="hidden lg:grid grid-cols-2 gap-3">
                  <button
                    className="bg-white rounded-2xl p-4 text-left border-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    style={{ borderColor: "var(--color-juno-green)" }}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2"
                         style={{ background: "rgba(0,112,60,.1)" }}>
                      <Phone className="w-5 h-5" style={{ color: "var(--color-juno-green)" }} />
                    </div>
                    <span className="text-sm font-bold" style={{ color: "var(--color-juno-green)" }}>Contact ER</span>
                  </button>
                  <button
                    onClick={leave}
                    disabled={leaving}
                    className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-2xl p-4 text-left transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70"
                    style={{ boxShadow: "0 8px 20px -4px rgba(239,68,68,.4)" }}
                  >
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-2">
                      {leaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <X className="w-5 h-5" />}
                    </div>
                    <span className="text-sm font-bold">{leaving ? "Leaving…" : "Leave Queue"}</span>
                  </button>
                </div>

                {/* Condition Worsening card — desktop sidebar */}
                <button
                  onClick={handleOpenDiscomfort}
                  className="hidden lg:flex w-full items-center gap-3 p-4 rounded-2xl text-white transition-all hover:brightness-90 active:scale-[0.98]"
                  style={{
                    background: "linear-gradient(135deg,#ef4444,#dc2626)",
                    boxShadow: "0 8px 20px -4px rgba(239,68,68,.4)",
                  }}
                >
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold">Condition Worsening?</p>
                    <p className="text-xs text-white/80">Notify the department now</p>
                  </div>
                </button>
              </div>
            </div>

            {/* ROW 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DepartmentCard data={data} />
              <StatusUpdatesCard updates={updates} />
            </div>

            {/* ROW 3 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ImportantInfoCard />
              <div className="flex flex-col gap-4">
                <h3 className="text-xl font-bold text-gray-900 hidden lg:block">Quick Actions</h3>
                <QuickActionsGrid onLeave={leave} leaving={leaving} />
              </div>
            </div>

          </div>
        </main>
      </div>

      <BottomNav />

      {question && (
        <CheckInQuestionPopup
          question={question}
          answered={answered}
          onAnswer={submitAnswer}
          onDismiss={dismissQuestion}
        />
      )}

      {showDiscomfort && (
        <DiscomfortModal
          onClose={() => setShowDiscomfort(false)}
          onSubmit={handleSubmitDiscomfort}
          sending={discomfortStatus === 'sending'}
          sent={discomfortStatus === 'sent'}
          error={discomfortError}
        />
      )}
    </div>
  );
}