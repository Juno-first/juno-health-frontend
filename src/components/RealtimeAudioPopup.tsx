import { useEffect, useState } from "react";
import { X, Square } from "lucide-react";
import { useAudioAssistant } from "../store/hooks/useAudioAssistant";

// ── Waveform bars — animated while talking ────────────────────────────────────
function TalkingWaveform({ active }: { active: boolean }) {
  const bars = [0.4, 0.7, 1, 0.85, 0.55, 0.9, 0.65, 0.45, 0.8, 0.6];
  return (
    <div className="flex items-center gap-[3px] h-8">
      {bars.map((height, i) => (
        <div
          key={i}
          className="w-1 rounded-full transition-all"
          style={{
            background: active ? "#16a34a" : "#d1d5db",
            height: active ? `${height * 100}%` : "25%",
            animation: active
              ? `barBounce ${0.6 + i * 0.07}s ease-in-out infinite alternate`
              : "none",
            animationDelay: active ? `${i * 0.06}s` : "0s",
          }}
        />
      ))}
    </div>
  );
}

// ── Main popup ────────────────────────────────────────────────────────────────
export function RealtimeAudioPopup() {
  const { isOpen, isPlaying, isLoading, title, text, close, stop } =
    useAudioAssistant();

  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  // Only show once audio is actually ready — hide while still loading/preparing
  const shouldShow = isOpen && !isLoading;

  useEffect(() => {
    if (shouldShow) {
      setClosing(false);
      setVisible(true);
    } else if (visible) {
      setClosing(true);
      const t = setTimeout(() => {
        setVisible(false);
        setClosing(false);
      }, 320);
      return () => clearTimeout(t);
    }
  }, [shouldShow]);

  if (!visible) return null;

  const animMobile  = closing ? "popupOutMobile"  : "popupInMobile";
  const animDesktop = closing ? "popupOutDesktop" : "popupInDesktop";

  return (
    <>
      <style>{`
        @keyframes popupInMobile {
          from { opacity: 0; transform: translateY(-16px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)     scale(1);    }
        }
        @keyframes popupInDesktop {
          from { opacity: 0; transform: translateX(28px) scale(0.96); }
          to   { opacity: 1; transform: translateX(0)    scale(1);    }
        }
        @keyframes popupOutMobile {
          from { opacity: 1; transform: translateY(0)     scale(1);    }
          to   { opacity: 0; transform: translateY(-16px) scale(0.96); }
        }
        @keyframes popupOutDesktop {
          from { opacity: 1; transform: translateX(0)    scale(1);    }
          to   { opacity: 0; transform: translateX(28px) scale(0.96); }
        }
        @keyframes barBounce {
          from { transform: scaleY(0.35); }
          to   { transform: scaleY(1);    }
        }
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* ── MOBILE ─────────────────────────────────────────────────────────── */}
      <div className="lg:hidden fixed top-4 left-0 right-0 mx-auto z-[100] w-[calc(100%-1.5rem)] max-w-md">
        <div
          className="rounded-3xl border border-white/60 bg-white/96 backdrop-blur-xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.22)] overflow-hidden"
          style={{ animation: `${animMobile} 0.32s ease-out forwards` }}
        >
          <div className="p-4">
            <div className="flex items-start gap-3">

              {/* Icon / waveform */}
              <div className="flex-shrink-0 mt-1 flex flex-col items-center gap-2">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center transition-colors"
                  style={{ background: isPlaying ? "rgba(22,163,74,0.12)" : "#f0fdf4" }}
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-green-600">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zm-1 18.93A7 7 0 0 1 5 13H3a9 9 0 0 0 8 8.94V24h2v-2.06A9 9 0 0 0 21 13h-2a7 7 0 0 1-6 6.93z" />
                  </svg>
                </div>
                <TalkingWaveform active={isPlaying} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-1">
                      {title || "Juno is speaking"}
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                      {text || ""}
                    </p>
                  </div>
                  <button
                    onClick={close}
                    className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center flex-shrink-0 mt-0.5"
                  >
                    <X className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2 mt-3">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="inline-block w-2 h-2 rounded-full"
                      style={{
                        background: isPlaying ? "#16a34a" : "#d1d5db",
                        boxShadow: isPlaying ? "0 0 6px #16a34a88" : "none",
                      }}
                    />
                    <span className="text-xs text-gray-500">
                      {isPlaying ? "Playing now" : "Done"}
                    </span>
                  </div>
                  {isPlaying && (
                    <button
                      onClick={stop}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors"
                    >
                      <Square className="w-3 h-3 fill-current" /> Stop
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          {isPlaying && (
            <div className="h-1 w-full bg-gray-100 overflow-hidden">
              <div
                className="h-full w-full"
                style={{
                  background: "linear-gradient(90deg,#16a34a 0%,#22c55e 30%,#86efac 50%,#22c55e 70%,#16a34a 100%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.8s linear infinite",
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── DESKTOP ────────────────────────────────────────────────────────── */}
      <div className="hidden lg:block fixed top-6 right-6 z-[100] w-[400px]">
        <div
          className="rounded-3xl border border-white/60 bg-white/96 backdrop-blur-xl shadow-[0_24px_60px_-16px_rgba(0,0,0,0.25)] overflow-hidden"
          style={{ animation: `${animDesktop} 0.32s ease-out forwards` }}
        >
          <div className="p-5">
            <div className="flex items-start gap-4">

              {/* Icon + waveform column */}
              <div className="flex-shrink-0 flex flex-col items-center gap-3">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center transition-colors"
                  style={{ background: isPlaying ? "rgba(22,163,74,0.12)" : "#f0fdf4" }}
                >
                  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-green-600">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zm-1 18.93A7 7 0 0 1 5 13H3a9 9 0 0 0 8 8.94V24h2v-2.06A9 9 0 0 0 21 13h-2a7 7 0 0 1-6 6.93z" />
                  </svg>
                </div>
                <TalkingWaveform active={isPlaying} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-1">
                      {title || "Juno is speaking"}
                    </p>
                    <h4 className="text-sm font-bold text-gray-900">Patient Audio Update</h4>
                  </div>
                  <button
                    onClick={close}
                    className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center flex-shrink-0"
                  >
                    <X className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                </div>

                <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-4">
                  {text || ""}
                </p>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="inline-block w-2 h-2 rounded-full"
                      style={{
                        background: isPlaying ? "#16a34a" : "#d1d5db",
                        boxShadow: isPlaying ? "0 0 6px #16a34a88" : "none",
                      }}
                    />
                    <span className="text-xs text-gray-500">
                      {isPlaying ? "Playing now" : "Done"}
                    </span>
                  </div>
                  {isPlaying && (
                    <button
                      onClick={stop}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors"
                    >
                      <Square className="w-3 h-3 fill-current" /> Stop playback
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          {isPlaying && (
            <div className="h-1.5 w-full bg-gray-100 overflow-hidden">
              <div
                className="h-full w-full"
                style={{
                  background: "linear-gradient(90deg,#16a34a 0%,#22c55e 30%,#86efac 50%,#22c55e 70%,#16a34a 100%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.8s linear infinite",
                }}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}