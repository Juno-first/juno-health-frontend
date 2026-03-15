import { useState, useEffect, useRef } from "react";
import { Sidebar, BottomNav } from "../components/AppNav";
import {
  Send, Mic, Paperclip, SlidersHorizontal, Sparkles,
  Pill, FlaskConical, HeartPulse, CalendarCheck, TrendingUp,
  FileText, Bot, X, ChevronRight, Clock, RotateCcw, Volume2,
} from "lucide-react";
import { useAppSelector } from "../store/hooks/hooks";
import { useProfile }     from "../store/hooks/useProfile";
import { useMedBot }      from "../store/hooks/useMedBot";
import type { MedBotChatMessage } from "../store/hooks/useMedBot";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Suggestion {
  id:    string;
  Icon:  React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
  title: string;
  sub:   string;
  color: string;
  bg:    string;
}

// ── Data ──────────────────────────────────────────────────────────────────────

const SUGGESTIONS: Suggestion[] = [
  { id:"meds",    Icon: Pill,          title: "Explain my medications",       sub: "Understand prescriptions & dosages",     color: "#9333EA", bg: "rgba(147,51,234,.08)" },
  { id:"labs",    Icon: FlaskConical,  title: "What do my lab results mean?", sub: "Simple breakdown of recent tests",       color: "#0EA5E9", bg: "rgba(14,165,233,.08)" },
  { id:"score",   Icon: HeartPulse,    title: "Check my health score",        sub: "Review overall status & risks",          color: "#EF4444", bg: "rgba(239,68,68,.08)"  },
  { id:"appt",    Icon: CalendarCheck, title: "Upcoming appointments",        sub: "View and manage scheduled visits",       color: "#00703C", bg: "rgba(0,112,60,.08)"   },
  { id:"trends",  Icon: TrendingUp,    title: "Health trends",                sub: "Track changes in vital signs over time", color: "#F59E0B", bg: "rgba(245,158,11,.08)" },
  { id:"history", Icon: FileText,      title: "Medical history summary",      sub: "Overview of your health journey",        color: "#6366F1", bg: "rgba(99,102,241,.08)" },
];

const RECENT = [
  { Icon: Pill,         label: "Medication questions",  time: "2h ago",    color: "#9333EA", bg: "rgba(147,51,234,.1)" },
  { Icon: FlaskConical, label: "Lab results review",    time: "Yesterday",  color: "#0EA5E9", bg: "rgba(14,165,233,.1)" },
  { Icon: HeartPulse,   label: "Blood pressure trends", time: "3 days ago", color: "#EF4444", bg: "rgba(239,68,68,.1)"  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeStr(d: Date) {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ── Sub-components ────────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-gray-300"
          style={{ animation: `typingBounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
        />
      ))}
    </div>
  );
}

function MessageBubble({ msg }: { msg: MedBotChatMessage }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"} mb-4`}>
      {!isUser && (
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-1"
          style={{ background: "linear-gradient(135deg,#0EA5E9,#6366F1)" }}
        >
          <Bot size={14} className="text-white" />
        </div>
      )}
      <div className={`max-w-[75%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
        <div
          className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
          style={{
            background:   isUser ? "var(--color-juno-green)" : "white",
            color:        isUser ? "white" : "#1A202C",
            borderRadius: isUser ? "20px 20px 6px 20px" : "20px 20px 20px 6px",
            boxShadow:    isUser
              ? "0 4px 15px rgba(0,112,60,.25)"
              : "0 2px 12px rgba(0,0,0,.06)",
          }}
        >
          {msg.content}
          {!isUser && msg.playing && (
            <span className="inline-flex items-center gap-1 ml-2 opacity-60">
              <Volume2 size={10} className="text-gray-400" />
              <span className="w-1 h-1 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms"   }} />
              <span className="w-1 h-1 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1 h-1 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
            </span>
          )}
        </div>
        <span className="text-[10px] text-gray-400 px-1">{timeStr(msg.timestamp)}</span>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function MedBotPage() {
  const authToken       = useAppSelector(s => s.user.accessToken);
  const { profile }     = useProfile();
  const textareaRef     = useRef<HTMLTextAreaElement>(null);
  const bottomRef       = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");

  const { messages, typing, started, send, reset } = useMedBot(
    profile,
    authToken ?? undefined,
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  function autoResize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }

  async function handleSend(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    await send(trimmed);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  }

  // Derive display name from profile or token
  const userName = useAppSelector(s => {
    const u = s.user.user;
    if (!u) return "there";
    return u.firstName ?? u.fullName?.split(" ")[0] ?? "there";
  });

  // Build health context sidebar items from profile
  const activeMeds = profile?.medications ?? [];
  const healthScore = profile?.conditions && profile.conditions.length > 0 ? 65 : 82;

  return (
    <>
      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: .4; }
          30%            { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.3s ease forwards; }
        .suggestion-card:hover { transform: translateY(-2px); }
        .suggestion-card { transition: transform 0.18s ease, box-shadow 0.18s ease; }
      `}</style>

      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar />

        <div className="flex-1 flex overflow-hidden">

          {/* ── LEFT PANEL (desktop) ── */}
          <aside className="hidden xl:flex flex-col w-72 bg-white border-r border-gray-100 flex-shrink-0 overflow-y-auto">
            <div className="p-5 border-b border-gray-100">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Recent Chats</h3>
              <div className="space-y-2">
                {RECENT.map(r => (
                  <button
                    key={r.label}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left group"
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: r.bg }}
                    >
                      <r.Icon size={15} style={{ color: r.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{r.label}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock size={10} /> {r.time}
                      </p>
                    </div>
                    <ChevronRight size={13} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                  </button>
                ))}
              </div>

              <button
                className="w-full mt-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110"
                style={{ background: "var(--color-juno-green)" }}
                onClick={reset}
              >
                + New Conversation
              </button>
            </div>

            {/* Health context */}
            <div className="p-5 space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Health Context</h3>

              {/* Score */}
              <div
                className="rounded-2xl p-4 border border-green-100"
                style={{ background: "rgba(0,112,60,.04)" }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-gray-500">Health Score</span>
                  <HeartPulse size={14} style={{ color: "var(--color-juno-green)" }} />
                </div>
                <div className="text-3xl font-black" style={{ color: "var(--color-juno-green)" }}>
                  {healthScore}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {healthScore >= 80 ? "Good overall health" : healthScore >= 60 ? "Moderate — some risk factors" : "Needs attention"}
                </p>
              </div>

              {/* Conditions */}
              {profile?.conditions && profile.conditions.length > 0 && (
                <div className="rounded-2xl p-4 bg-gray-50">
                  <h4 className="text-xs font-bold text-gray-500 mb-3">Active Conditions</h4>
                  <div className="space-y-2">
                    {profile.conditions.slice(0, 4).map(c => (
                      <div key={c.name} className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${c.dot}`} />
                        <span className="text-xs text-gray-700">{c.name}</span>
                        <span className={`ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${c.bCls}`}>
                          {c.badge}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Medications */}
              {activeMeds.length > 0 && (
                <div className="rounded-2xl p-4 bg-gray-50">
                  <h4 className="text-xs font-bold text-gray-500 mb-3">Active Medications</h4>
                  <div className="space-y-2.5">
                    {activeMeds.slice(0, 4).map(m => (
                        <div key={m.name} className="flex items-center gap-2.5">
                            <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: "rgba(147,51,234,.1)" }}
                            >
                            <Pill size={12} style={{ color: "#9333EA" }} />
                            </div>
                            <div>
                            <p className="text-xs font-semibold text-gray-800">{m.name}</p>
                            <p className="text-[10px] text-gray-500">{m.dose}</p>
                            </div>
                        </div>
                        ))}
                  </div>
                </div>
              )}

              {/* Allergies */}
              {profile?.allergies && profile.allergies.length > 0 && (
                <div className="rounded-2xl p-4 bg-red-50 border border-red-100">
                  <h4 className="text-xs font-bold text-red-600 mb-2">Allergies</h4>
                  <div className="space-y-1.5">
                    {profile.allergies.slice(0, 3).map(a => (
                      <div key={a.name} className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-red-700">{a.name}</span>
                        <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 uppercase">
                          {a.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Last updated */}
              {profile?.lastUpdatedAt && (
                <p className="text-[10px] text-gray-400 text-center">
                  Profile updated {new Date(profile.lastUpdatedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </aside>

          {/* ── MAIN CHAT ── */}
          <main className="flex-1 flex flex-col min-w-0">

            {/* Header */}
            <header
              className="bg-white border-b border-gray-100 px-4 lg:px-6 py-4 flex items-center justify-between flex-shrink-0"
              style={{ boxShadow: "0 1px 4px rgba(0,0,0,.04)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg,#0EA5E9,#6366F1)" }}
                >
                  <Bot size={18} className="text-white" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-gray-900">JUNO Health Assistant</h1>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                    AI-powered health guidance
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {started && (
                  <button
                    onClick={reset}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <RotateCcw size={12} /> New chat
                  </button>
                )}
                <button className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors">
                  <Clock size={12} /> History
                </button>
                <button className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">
                  <X size={16} />
                </button>
              </div>
            </header>

            {/* Chat body */}
            <div className="flex-1 overflow-y-auto">
              {!started ? (
                /* ── Welcome state ── */
                <div className="max-w-3xl mx-auto px-4 lg:px-8 py-10 pb-4 fade-up">
                  <div className="flex flex-col items-center text-center mb-10">
                    <div
                      className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
                      style={{
                        background: "linear-gradient(135deg,#0EA5E9,#6366F1)",
                        boxShadow:  "0 0 0 12px rgba(99,102,241,.08), 0 16px 40px -8px rgba(14,165,233,.35)",
                      }}
                    >
                      <Bot size={36} className="text-white" />
                    </div>
                    <h1 className="text-2xl lg:text-3xl font-light text-gray-500 mb-1">
                      Hey {userName},{" "}
                      <span className="font-bold text-gray-900">how can I help?</span>
                    </h1>
                    <p className="text-sm text-gray-500">Let's review your health data together.</p>
                    <p className="text-sm text-gray-500">Select a prompt or just ask away!</p>

                    {profile && !profile.isComplete && (
                      <div className="mt-4 px-4 py-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-700 max-w-sm">
                        Your health profile is incomplete — complete it for more personalised responses.
                      </div>
                    )}
                  </div>

                  {/* Suggestion grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {SUGGESTIONS.map((s, i) => (
                      <button
                        key={s.id}
                        onClick={() => handleSend(s.title)}
                        className="suggestion-card bg-white border border-gray-100 rounded-2xl p-5 text-left hover:shadow-md"
                        style={{ animationDelay: `${i * 0.06}s` }}
                      >
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                          style={{ background: s.bg }}
                        >
                          <s.Icon size={20} style={{ color: s.color }} />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-1">{s.title}</h3>
                        <p className="text-xs text-gray-500">{s.sub}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* ── Messages ── */
                <div className="max-w-3xl mx-auto px-4 lg:px-8 py-6 pb-4">
                  {messages.map(msg => (
                    <div key={msg.id} className="fade-up">
                      <MessageBubble msg={msg} />
                    </div>
                  ))}
                  {typing && (
                    <div className="flex items-center gap-3 mb-4 fade-up">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: "linear-gradient(135deg,#0EA5E9,#6366F1)" }}
                      >
                        <Bot size={14} className="text-white" />
                      </div>
                      <div
                        className="bg-white rounded-2xl"
                        style={{ boxShadow: "0 2px 12px rgba(0,0,0,.06)" }}
                      >
                        <TypingDots />
                      </div>
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>
              )}
            </div>

            {/* Input */}
            <div className="bg-white border-t border-gray-100 px-4 lg:px-8 py-4 flex-shrink-0">
              <div className="max-w-3xl mx-auto">
                <div
                  className="rounded-2xl border border-gray-100 p-3"
                  style={{ background: "#F8FAFB", boxShadow: "0 2px 8px rgba(0,0,0,.04)" }}
                >
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <Sparkles size={12} className="text-blue-400" />
                    <span className="text-xs text-gray-400">
                      {profile?.isComplete
                        ? "Juno has access to your health profile"
                        : "Assistant is here to support your health journey"}
                    </span>
                  </div>

                  <textarea
                    ref={textareaRef}
                    value={input}
                    rows={1}
                    onChange={e => { setInput(e.target.value); autoResize(); }}
                    onKeyDown={handleKey}
                    placeholder="Ask about your health, medications, test results…"
                    className="w-full bg-transparent border-none focus:outline-none resize-none text-sm text-gray-800 placeholder-gray-400 px-1 min-h-[36px] max-h-[120px]"
                    style={{ scrollbarWidth: "none" }}
                    disabled={typing}
                  />

                  <div className="flex items-center justify-between mt-2 px-1">
                    <div className="flex items-center gap-2">
                      {[
                        { Icon: SlidersHorizontal, label: "Context" },
                        { Icon: Mic,               label: "Voice"   },
                        { Icon: Paperclip,         label: "Attach"  },
                      ].map(({ Icon, label }) => (
                        <button
                          key={label}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          <Icon size={11} className="text-gray-400" />
                          <span className="hidden sm:inline">{label}</span>
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => handleSend(input)}
                      disabled={!input.trim() || typing}
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110"
                      style={{ background: input.trim() && !typing ? "var(--color-juno-green)" : "#CBD5E1" }}
                    >
                      <Send size={14} />
                    </button>
                  </div>
                </div>

                <p className="text-[10px] text-gray-400 text-center mt-3 leading-relaxed">
                  This assistant provides educational information and does not replace professional medical advice.
                </p>
              </div>
            </div>
          </main>
        </div>

        <BottomNav />
      </div>
    </>
  );
}