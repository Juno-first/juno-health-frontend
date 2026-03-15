import {
  QrCode, Check,MapPin,
  Download, WifiOff,
} from "lucide-react";
import type { QueueStatus } from "../schemas/queue.schema";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

function queueProgress(position: number, depth: number): number {
  if (depth <= 0) return 0;
  return Math.max(0, Math.min(1, 1 - (position - 1) / depth));
}

function formatWait(mins: number): string {
  if (mins < 60) return `${mins} min${mins !== 1 ? "s" : ""}`;
  const h = Math.floor(mins / 60), m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function formatTime(ts: number | null): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleTimeString("en-JM", { hour: "numeric", minute: "2-digit" });
}

const CIRC = 2 * Math.PI * 50;

export default function QueueStatusCard({
  data, checkedInAt, isLive
}: {
  data: QueueStatus;
  checkedInAt: number | null;
  isLive: boolean;
  onLeave: () => void;
  leaving: boolean;
}) {
  const [flipped, setFlipped] = useState(false);
  const isCalled = data.status === "CALLED";
  const progress = queueProgress(data.position, data.queueDepth);
  const dash = CIRC * (1 - progress);

  const staffInitials =
    data.assignedStaffName
      ?.split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "DR";

  return (
    <div style={{ perspective: 1200 }}>
      <style>
        {`
          @keyframes floatBlob {
            0%, 100% {
              transform: translate(0px, 0px) scale(1);
              opacity: 0.08;
            }
            50% {
              transform: translate(10px, -10px) scale(1.1);
              opacity: 0.18;
            }
          }

          @keyframes ekgMove {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }

          @keyframes ekgGlow {
            0%, 100% {
              opacity: 0.18;
              filter: drop-shadow(0 0 4px rgba(255,255,255,0.18));
            }
            50% {
              opacity: 0.3;
              filter: drop-shadow(0 0 10px rgba(255,255,255,0.28));
            }
          }

          @keyframes calledRing {
            0%, 100% {
              transform: scale(1);
              opacity: 0.35;
            }
            50% {
              transform: scale(1.08);
              opacity: 0.16;
            }
          }
        `}
      </style>

      <div
        className="relative w-full min-h-[420px] lg:min-h-[460px]"
        style={{
          transformStyle: "preserve-3d",
          transition: "transform 0.65s cubic-bezier(0.4,0.2,0.2,1)",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* FRONT */}
        <div
          className={`rounded-3xl p-6 lg:p-8 overflow-hidden min-h-[420px] lg:min-h-[460px] ${
            isCalled
              ? "bg-gradient-to-br from-green-500 to-green-600"
              : "bg-gradient-to-br from-red-500 to-red-600"
          }`}
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            boxShadow: isCalled
              ? "0 0 30px rgba(16,185,129,.35)"
              : "0 10px 30px -5px rgba(239,68,68,.35)",
            pointerEvents: flipped ? "none" : "auto",
          }}
        >
          {/* Animated background blobs */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 pointer-events-none" />

          {/* bottom left corner */}
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16 pointer-events-none" />
          
          {/* Red waiting-state EKG background */}
          {!isCalled && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 w-[200%] flex items-center"
                style={{ animation: "ekgMove 8s linear infinite" }}
              >
                <svg
                  viewBox="0 0 1200 420"
                  className="w-full h-[75%]"
                  preserveAspectRatio="none"
                  style={{ animation: "ekgGlow 2.4s ease-in-out infinite" }}
                >
                  <path
                    d="
                      M0 210
                      L90 210
                      L120 180
                      L150 240
                      L180 210
                      L240 210
                      L270 110
                      L300 280
                      L340 140
                      L390 210
                      L480 210
                      L510 185
                      L540 230
                      L570 210
                      L660 210
                      L700 360
                      L760 40
                      L840 210
                      L930 210
                      L970 175
                      L1010 225
                      L1050 210
                      L1200 210
                    "
                    fill="none"
                    stroke="rgba(255,255,255,0.28)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="
                      M0 210
                      L90 210
                      L120 180
                      L150 240
                      L180 210
                      L240 210
                      L270 110
                      L300 280
                      L340 140
                      L390 210
                      L480 210
                      L510 185
                      L540 230
                      L570 210
                      L660 210
                      L700 360
                      L760 40
                      L840 210
                      L930 210
                      L970 175
                      L1010 225
                      L1050 210
                      L1200 210
                    "
                    fill="none"
                    stroke="rgba(255,255,255,0.12)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          )}

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-5">
              {isLive ? (
                <>
                  <div className="w-3 h-3 bg-white rounded-full pulse-dot" />
                  <span className="text-white/90 text-sm font-semibold">
                    {isCalled ? "Ready to See Doctor" : "Live · Active in Queue"}
                  </span>
                </>
              ) : (
                <>
                  <WifiOff size={13} className="text-white/60" />
                  <span className="text-white/60 text-sm font-semibold">Connecting…</span>
                </>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6">
              <div className="relative flex-shrink-0">
                {isCalled ? (
                  <div className="relative w-32 h-32 lg:w-40 lg:h-40">
                    {/* outer ripple */}
                    <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" />

                    {/* middle glow */}
                    <div className="absolute inset-2 rounded-full bg-white/15 animate-pulse" />

                    {/* main circle */}
                    <div className="absolute inset-3 rounded-full bg-white flex items-center justify-center shadow-lg">
                      <Check className="w-14 h-14 lg:w-16 lg:h-16 text-green-600 animate-pulse" />
                    </div>
                  </div>
                ) : (
                  <>
                    <svg className="w-32 h-32 lg:w-40 lg:h-40 -rotate-90" viewBox="0 0 128 128">
                      <circle cx="64" cy="64" r="50" stroke="rgba(255,255,255,0.2)" strokeWidth="8" fill="none" />
                      <circle
                        cx="64"
                        cy="64"
                        r="50"
                        stroke="white"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={CIRC}
                        strokeDashoffset={dash}
                        style={{ transition: "stroke-dashoffset 1s ease" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl lg:text-5xl font-bold text-white">{data.position}</span>
                      <span className="text-xs text-white/80">Position</span>
                    </div>
                  </>
                )}
              </div>

              <div className="flex-1 text-white">
                <h3 className="text-2xl lg:text-3xl font-bold mb-2">
                  {isCalled ? "It's Your Turn!" : "You're in the queue"}
                </h3>
                <p className="text-white/90 text-sm mb-2">
                  {isCalled
                    ? "Please proceed to treatment area"
                    : `${data.facilityName} — ${data.departmentName}`}
                </p>

                {isCalled && (
                  <p className="text-white/80 text-sm mb-4">
                    {data.facilityName} — {data.departmentName}
                  </p>
                )}

                {!isCalled ? (
                  <div className="flex flex-wrap gap-3">
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                      <div className="text-xs text-white/80 mb-0.5">Estimated Wait</div>
                      <div className="text-xl font-bold">{formatWait(data.estimatedWaitMinutes)}</div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                      <div className="text-xs text-white/80 mb-0.5">Check-in Time</div>
                      <div className="text-xl font-bold">{formatTime(checkedInAt)}</div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {isCalled ? (
              <>
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-5 mb-4">
                  <div className="text-center mb-3">
                    <div className="text-white/80 text-sm mb-1">Assigned Treatment Room</div>
                    <div className="text-5xl font-bold text-white mb-1">
                      {data.roomName ?? "ER"}
                    </div>
                    <div className="text-white/90 text-sm">Proceed here now</div>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-white/90 text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>Main Building, Ground Floor, East Wing</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                    <div className="text-white/80 text-xs mb-1">Wait Time</div>
                    <div className="text-2xl font-bold text-white">
                      {formatWait(data.estimatedWaitMinutes)}
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                    <div className="text-white/80 text-xs mb-1">Queue ID</div>
                    <div className="text-2xl font-bold text-white">
                      {data.queueEntryId.slice(0, 4).toUpperCase()}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-gray-600 text-xs mb-1">Attending Staff</div>
                    <div className="text-gray-900 font-bold text-lg">
                      {data.assignedStaffName ?? "Assigned Staff"}
                    </div>
                    <div className="text-gray-500 text-sm">
                      {data.assignedStaffRole ?? "Medical Staff"}
                    </div>
                  </div>

                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                    {staffInitials}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white/80 text-xs mb-1">Check-in Code</div>
                    <div className="text-white font-bold text-2xl tracking-[0.2em]">
                      {data.checkinCode}
                    </div>
                  </div>

                  <button
                    onClick={() => setFlipped(true)}
                    className="bg-white text-red-600 px-4 py-2 rounded-xl font-semibold text-sm hover:bg-white/90 transition-all flex items-center gap-2 active:scale-95"
                  >
                    <QrCode className="w-4 h-4" /> Show QR
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* BACK */}
        <div
          className={`absolute inset-0 rounded-3xl p-6 lg:p-8 overflow-hidden min-h-[420px] lg:min-h-[460px] ${
            isCalled
              ? "bg-gradient-to-br from-green-500 to-green-600"
              : "bg-gradient-to-br from-red-500 to-red-600"
          }`}
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            boxShadow: isCalled
              ? "0 0 30px rgba(16,185,129,.35)"
              : "0 10px 30px -5px rgba(239,68,68,.35)",
          }}
        >
          {/* top right decorative blob */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 pointer-events-none" />

          {/* bottom left corner */}
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16 pointer-events-none" />
          {!isCalled && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 w-[200%] flex items-center"
                style={{ animation: "ekgMove 8s linear infinite" }}
              >
                <svg
                  viewBox="0 0 1200 420"
                  className="w-full h-[75%]"
                  preserveAspectRatio="none"
                  style={{ animation: "ekgGlow 2.4s ease-in-out infinite" }}
                >
                  <path
                    d="
                      M0 210
                      L90 210
                      L120 180
                      L150 240
                      L180 210
                      L240 210
                      L270 110
                      L300 280
                      L340 140
                      L390 210
                      L480 210
                      L510 185
                      L540 230
                      L570 210
                      L660 210
                      L700 360
                      L760 40
                      L840 210
                      L930 210
                      L970 175
                      L1010 225
                      L1050 210
                      L1200 210
                    "
                    fill="none"
                    stroke="rgba(255,255,255,0.28)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="
                      M0 210
                      L90 210
                      L120 180
                      L150 240
                      L180 210
                      L240 210
                      L270 110
                      L300 280
                      L340 140
                      L390 210
                      L480 210
                      L510 185
                      L540 230
                      L570 210
                      L660 210
                      L700 360
                      L760 40
                      L840 210
                      L930 210
                      L970 175
                      L1010 225
                      L1050 210
                      L1200 210
                    "
                    fill="none"
                    stroke="rgba(255,255,255,0.12)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          )}

          <div className="relative z-10 h-full min-h-[372px] lg:min-h-[396px] flex flex-col items-center justify-center text-white text-center">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-3 h-3 bg-white rounded-full" />
              <span className="text-white/90 text-sm font-semibold">
                {isCalled ? "Ready for Treatment" : "Emergency Medical ID"}
              </span>
            </div>

            <div className="bg-white rounded-2xl p-4 mb-5 shadow-lg">
              <QRCodeSVG
                value={data.qrToken}
                size={160}
                bgColor="#ffffff"
                fgColor="#111827"
                level="H"
              />
            </div>

            <p className="text-2xl font-bold mb-1 tracking-[0.2em]">{data.checkinCode}</p>
            <p className="text-white/80 text-sm mb-6">
              {isCalled
                ? "Show this to the attending nurse or doctor"
                : "Show this code to ER staff for instant identification"}
            </p>

            <div className="flex gap-3 w-full max-w-xs">
              <button className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-sm font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95">
                <Download className="w-4 h-4" /> Save
              </button>

              <button
                onClick={() => setFlipped(false)}
                className={`flex-1 bg-white text-sm font-semibold py-3 rounded-xl hover:bg-white/90 transition-all active:scale-95 ${
                  isCalled ? "text-green-600" : "text-red-600"
                }`}
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
