import { useEffect, useState } from "react";
import { X, Stethoscope, Loader2, CheckCircle2 } from "lucide-react";
import type { CheckInQuestion } from "../schemas/patientCheckIn.schema";

interface Props {
  question:       CheckInQuestion;
  answered:       boolean;
  onAnswer:       (answer: string) => void;
  onDismiss:      () => void;
}

export function CheckInQuestionPopup({ question, answered, onAnswer, onDismiss }: Props) {
  const [visible,  setVisible]  = useState(false);
  const [closing,  setClosing]  = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  // Mount animation
  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  function handleAnswer(answer: string) {
    if (answered) return;
    setSelected(answer);
    onAnswer(answer);
  }

  function handleClose() {
    setClosing(true);
    setTimeout(onDismiss, 300);
  }

  const isYesNo = question.questionType === "YES_NO";
  const options = isYesNo ? ["Yes", "No"] : (question.options ?? []);

  return (
    <>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes slideDown {
          from { opacity: 1; transform: translateY(0)    scale(1);    }
          to   { opacity: 0; transform: translateY(24px) scale(0.97); }
        }
        @keyframes popupPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(0,112,60,0.35); }
          50%       { box-shadow: 0 0 0 10px rgba(0,112,60,0);  }
        }
      `}</style>

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        style={{ opacity: visible && !closing ? 1 : 0 }}
        onClick={handleClose}
      />

      {/* Card — slides up from bottom on mobile, centred on desktop */}
      <div
        className="fixed z-[100] left-0 right-0 bottom-0 lg:inset-0 lg:flex lg:items-center lg:justify-center pointer-events-none"
      >
        <div
          className="pointer-events-auto w-full lg:max-w-md lg:mx-auto"
          style={{
            animation: closing
              ? "slideDown 0.3s ease-out forwards"
              : "slideUp 0.3s ease-out forwards",
          }}
        >
          <div
            className="bg-white rounded-t-3xl lg:rounded-3xl shadow-[0_-8px_40px_-8px_rgba(0,0,0,0.18)] lg:shadow-[0_24px_60px_-16px_rgba(0,0,0,0.22)] overflow-hidden mx-0 lg:mx-4"
            style={{ animation: !closing ? "popupPulse 2.5s ease-in-out 0.4s 2" : "none" }}
          >
            {/* Header */}
            <div
              className="px-6 pt-6 pb-4"
              style={{ background: "linear-gradient(135deg,#00703C 0%,#059669 100%)" }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Stethoscope className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white/80 uppercase tracking-wider mb-0.5">
                      Juno Health Check
                    </p>
                    <p className="text-sm font-semibold text-white/90">
                      Quick question while you wait
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Question */}
            <div className="px-6 py-5">
              <p className="text-base font-bold text-gray-900 leading-snug mb-5">
                {question.question}
              </p>

              {/* Options */}
              <div className={`grid gap-3 ${isYesNo ? "grid-cols-2" : "grid-cols-1"}`}>
                {options.map((opt) => {
                  const isSelected = selected === opt;
                  const isWaiting  = answered && isSelected;

                  return (
                    <button
                      key={opt}
                      onClick={() => handleAnswer(opt)}
                      disabled={answered}
                      className="relative flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-bold text-sm border-2 transition-all active:scale-[0.97] disabled:cursor-not-allowed"
                      style={{
                        background:   isSelected ? "var(--color-juno-green)" : "transparent",
                        borderColor:  isSelected ? "var(--color-juno-green)" : "#E5E7EB",
                        color:        isSelected ? "#fff" : "#374151",
                        opacity:      answered && !isSelected ? 0.45 : 1,
                      }}
                    >
                      {isWaiting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Sending…
                        </>
                      ) : isSelected && !answered ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          {opt}
                        </>
                      ) : (
                        opt
                      )}
                    </button>
                  );
                })}
              </div>

              <p className="text-xs text-gray-400 text-center mt-4">
                Your response helps the medical team monitor your condition
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}