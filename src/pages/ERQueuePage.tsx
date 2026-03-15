import { useEffect,useRef } from "react";
import {
  Bell, QrCode,Phone, X,
    Menu, Hospital,
   Loader2, Wifi, WifiOff,
} from "lucide-react";
import { Sidebar, BottomNav } from "../components/AppNav";
import { useQueueData, useQueueSocket } from "../store/hooks/useQueue";
import { useAudioAssistant } from "../store/hooks/useAudioAssistant";
import { useAppSelector } from "../store/hooks/hooks";
import { CheckInQuestionPopup } from "../components/CheckinQuestionPopup";
import { usePatientCheckIn } from "../store/hooks/usePatientCheckin";
import TriagePriorityCard from "../components/TriagePriorityCard";
import QueueStatusCard from "../components/QueueStatusCard";
import QuickActionsGrid from "../components/QuickActionsGrid";
import DepartmentCard from "../components/DepartmentCard";
import ImportantInfoCard from "../components/ImportantInfoCard";
import StatusUpdatesCard from "../components/StatusUpdatesCard";


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

  useQueueSocket(data?.queueEntryId);

  const unreadCount = updates.filter(u => Date.now() - u.time < 5 * 60 * 1000).length;

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
    </div>
  );
}