import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar, BottomNav } from "../components/AppNav";
import {
  ArrowLeft, QrCode, Camera, Keyboard, ArrowRight, CheckCircle2,
     Stethoscope, ShieldCheck,
  AlertCircle, Info, Loader2
} from "lucide-react";
import { useQueueGate } from "../store/hooks/useQueue";
import { useFacilityLookup } from "../store/hooks/useFacility";
import {
  SEVERITY_MAP, CATEGORY_MAP, DURATION_MAP,
  type CheckInRequest,
} from "../schemas/queue.schema";
import { useAudioAssistant } from "../store/hooks/useAudioAssistant";
import { useAppSelector } from "../store/hooks/hooks";
import { QrScanner } from "../components/QrScanner";
import FacilityCard from "../components/FacilityCard";
import ScannerFrame from "../components/ScannerFrame";
import WhatNextCard from "../components/WhatNextCard";
import CodeInput from "../components/CodeInput";
import QueueForm from "../components/QueueForm";
import type { FormState } from "../components/QueueForm";



type CheckInMethod = "CODE" | "QR";


export default function JoinQueuePage() {
  const navigate = useNavigate();
  const { checking, joining, error, join } = useQueueGate();
  const { playWelcomeAudio } = useAudioAssistant();
  const [showScanner, setShowScanner] = useState(false);
  const accessToken = useAppSelector((s) => s.user.accessToken);

  const [method, setMethod] = useState<CheckInMethod>("CODE");
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [form, setForm] = useState<FormState>({
    symptoms: "",
    severity: null,
    painLevel: 5,
    checkedCategories: [],
    duration: "",
    notes: "",
    queueCode: "",
  });

  const {
    facility,
    status: lookupStatus,
    error: lookupError,
    reset: resetFacility,
  } = useFacilityLookup(form.queueCode);

  const lookupLoading = lookupStatus === "loading";
  const lookupFound = lookupStatus === "found";
  const lookupErrorBool = lookupStatus === "error";
  const showFacilityCard = form.queueCode.trim().length >= 4;
  const showSymptoms = lookupFound;

  function handleWrongFacility() {
    setForm((f) => ({ ...f, queueCode: "" }));
    setFormErrors([]);
    resetFacility();
  }

  function buildPayload(): CheckInRequest | null {
    const errs: string[] = [];

    if (!form.queueCode.trim()) errs.push("Please enter or scan a facility code.");
    if (!facility) errs.push("Please wait for facility lookup to complete.");
    if (!form.symptoms.trim()) errs.push("Please describe your symptoms.");
    if (!form.severity) errs.push("Please select a severity level.");
    if (form.checkedCategories.length === 0) errs.push("Please select at least one symptom category.");
    if (!form.duration) errs.push("Please select symptom duration.");

    if (errs.length) {
      setFormErrors(errs);
      return null;
    }

    setFormErrors([]);
    const token = form.queueCode.trim();
    return {
      method: token.toUpperCase().startsWith("FAC-") ? "QR" : "CODE",
      token: form.queueCode.trim(),
      presentingComplaint: form.symptoms.trim(),
      symptomSeverity: SEVERITY_MAP[form.severity!],
      painLevel: form.painLevel,
      symptomCategories: form.checkedCategories.map((id) => CATEGORY_MAP[id]).filter(Boolean),
      symptomDuration: DURATION_MAP[form.duration],
      additionalNotes: form.notes.trim() || null,
      visitType: form.severity === "emergency" ? "EMERGENCY" : "WALK_IN",
    } as CheckInRequest;
  }

  async function handleSubmit() {
    const payload = buildPayload();
    if (!payload) return;

    const queueResult = await join(payload);
    if (!queueResult) return;

    await playWelcomeAudio(
      {
        method: payload.method,
        token: payload.token,
        presentingComplaint: payload.presentingComplaint,
        symptomSeverity: payload.symptomSeverity,
        painLevel: payload.painLevel,
        symptomCategories: payload.symptomCategories,
        symptomDuration: payload.symptomDuration,
        additionalNotes: payload.additionalNotes,
        visitType: payload.visitType,

        facilityName: queueResult.facilityName,
        departmentName: queueResult.departmentName,
        queuePosition: queueResult.position,
        queueDepth: queueResult.queueDepth,
        estimatedWaitMinutes: queueResult.estimatedWaitMinutes,
        checkinCode: queueResult.checkinCode,
        queueEntryId: queueResult.queueEntryId,
        checkedInAt: queueResult.checkedInAt,
      },
      accessToken
    );
  }

  const facilityCardProps = {
    facility,
    loading: lookupLoading,
    lookupError,
    onWrongFacility: handleWrongFacility,
  };

  const canSubmit = lookupFound && !joining;

  if (checking) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin" style={{ color: "var(--color-juno-green)" }} />
            <p className="text-gray-600 font-medium">Checking your queue status…</p>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  const codeSection = (
    <>
      <div className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(0,112,60,0.1)" }}
          >
            <QrCode size={22} style={{ color: "var(--color-juno-green)" }} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Scan QR Code</h3>
            <p className="text-sm text-gray-500">Point camera at facility QR code</p>
          </div>
        </div>

        {showScanner ? (
          <QrScanner
            id="qr-scanner-mobile"
            onScan={(decoded) => {
              setMethod("QR");
              setForm(f => ({ ...f, queueCode: decoded }));
              setShowScanner(false);
            }}
            onError={() => setShowScanner(false)}
          />
        ) : (
          <ScannerFrame />
        )}

        <button
          onClick={() => setShowScanner(s => !s)}
          type="button"
          className="w-full text-white rounded-2xl py-4 font-bold text-lg flex items-center justify-center gap-3 hover:brightness-90 transition-all shadow-[0_10px_30px_-5px_rgba(0,112,60,0.3)]"
          style={{ background: "linear-gradient(135deg,#00703C,#059669)" }}
        >
          <Camera size={22} /> {showScanner ? "Cancel Scan" : "Open Camera to Scan"}
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-gray-300" />
        <span className="text-gray-500 font-semibold text-sm">OR</span>
        <div className="flex-1 h-px bg-gray-300" />
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Keyboard size={22} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Enter Queue Code</h3>
            <p className="text-sm text-gray-500">Type the facility code manually</p>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Queue Code</label>
          <CodeInput
            value={form.queueCode}
            onChange={(v) => {
              setForm((f) => ({ ...f, queueCode: v }));
              if (formErrors.length) setFormErrors([]);
            }}
            loading={lookupLoading}
            found={lookupFound}
            error={lookupErrorBool}
          />
          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1.5">
            <Info size={12} /> Find the code at the facility entrance or reception
          </p>
        </div>

        <button
          onClick={() => setMethod("CODE")}
          type="button"
          className="w-full bg-blue-600 text-white rounded-2xl py-4 font-bold text-lg flex items-center justify-center gap-3 hover:bg-blue-700 transition-all"
        >
          <ArrowRight size={20} /> Continue with Code
        </button>
      </div>
    </>
  );

  const submitSection = (
    <>
      {formErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-1.5">
          {formErrors.map((e) => (
            <p key={e} className="text-sm text-red-600 flex items-center gap-2">
              <AlertCircle size={14} className="flex-shrink-0" /> {e}
            </p>
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <p className="text-sm text-red-600 flex items-center gap-2">
            <AlertCircle size={14} /> {error}
          </p>
        </div>
      )}

      {!lookupFound && showFacilityCard && !lookupLoading && !lookupErrorBool && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <p className="text-sm text-amber-700 flex items-center gap-2">
            <Info size={14} className="flex-shrink-0" />
            Confirm the facility code before submitting your check-in.
          </p>
        </div>
      )}

      <div
        className="rounded-3xl p-6 shadow-[0_10px_30px_-5px_rgba(0,112,60,0.3)]"
        style={{ background: "linear-gradient(135deg,#00703C,#059669)" }}
      >
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full bg-white rounded-2xl py-5 font-bold text-xl flex items-center justify-center gap-3 hover:bg-gray-50 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          style={{ color: "var(--color-juno-green)" }}
        >
          {joining ? (
            <>
              <Loader2 size={24} className="animate-spin" /> Joining queue…
            </>
          ) : (
            <>
              <CheckCircle2 size={24} /> Submit and Join Queue
            </>
          )}
        </button>

        <p className="text-white/90 text-center text-sm mt-4 flex items-center justify-center gap-2">
          <ShieldCheck size={16} /> Your information is secure and confidential
        </p>
      </div>
    </>
  );

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "linear-gradient(135deg,#F7F9FC 0%,#E8F5E9 100%)" }}
    >
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="lg:hidden flex items-center justify-between px-4 pt-6 pb-4 flex-shrink-0">
          <button
            onClick={() => navigate(-1)}
            className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center hover:shadow-md transition-all"
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </button>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800">Join Medical Queue</h1>
            <p className="text-sm text-gray-500">Scan QR or enter code</p>
          </div>

          <div className="w-12" />
        </header>

        <header className="hidden lg:block bg-white border-b border-gray-200 px-8 py-5 flex-shrink-0">
          <div className="flex items-center gap-4 max-w-7xl mx-auto">
            <button
              onClick={() => navigate(-1)}
              className="w-11 h-11 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-all"
            >
              <ArrowLeft size={18} className="text-gray-700" />
            </button>

            <div>
              <h1 className="text-3xl font-bold text-gray-800 leading-tight">Join Medical Queue</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Scan QR code or enter facility code to join the queue
              </p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="lg:hidden px-4 py-4 pb-28 space-y-6">
            {codeSection}
            {showFacilityCard && <FacilityCard {...facilityCardProps} />}
            {showSymptoms && (
              <div className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)]">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Stethoscope size={22} className="text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Tell Us How You're Feeling</h3>
                    <p className="text-sm text-gray-500">Help us prioritize your care</p>
                  </div>
                </div>

                <QueueForm form={form} setForm={setForm} />
              </div>
            )}
            {showSymptoms && submitSection}
            <WhatNextCard />
          </div>

          <div className="hidden lg:block px-8 py-8">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-3 gap-8">
                <div className="col-span-2 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)]">
                      <div className="flex items-center gap-3 mb-5">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: "rgba(0,112,60,0.1)" }}
                        >
                          <QrCode size={22} style={{ color: "var(--color-juno-green)" }} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">Scan QR Code</h3>
                          <p className="text-sm text-gray-500">Point camera at facility code</p>
                        </div>
                      </div>

                      {showScanner ? (
                        <QrScanner
                          id="qr-scanner-desktop"
                          onScan={(decoded) => {
                            setMethod("QR");
                            setForm(f => ({ ...f, queueCode: decoded }));
                            setShowScanner(false);
                          }}
                          onError={() => setShowScanner(false)}
                        />
                      ) : (
                        <ScannerFrame />   
                      )}

                      <button
                        onClick={() => setShowScanner(s => !s)}
                        type="button"
                        className="w-full text-white rounded-2xl py-4 font-bold text-lg flex items-center justify-center gap-3 hover:brightness-90 transition-all shadow-[0_10px_30px_-5px_rgba(0,112,60,0.3)]"
                        style={{ background: "linear-gradient(135deg,#00703C,#059669)" }}
                      >
                        <Camera size={22} /> {showScanner ? "Cancel Scan" : "Open Camera to Scan"}
                      </button>
                    </div>

                    <div className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)]">
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <Keyboard size={22} className="text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">Enter Queue Code</h3>
                          <p className="text-sm text-gray-500">Type the facility code manually</p>
                        </div>
                      </div>

                      <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Queue Code</label>
                        <CodeInput
                          value={form.queueCode}
                          onChange={(v) => {
                            setForm((f) => ({ ...f, queueCode: v }));
                            if (formErrors.length) setFormErrors([]);
                          }}
                          loading={lookupLoading}
                          found={lookupFound}
                          error={lookupErrorBool}
                        />
                        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1.5">
                          <Info size={12} /> Find the code at the facility entrance or reception
                        </p>
                      </div>

                      <button
                        onClick={() => setMethod("CODE")}
                        type="button"
                        className="w-full bg-blue-600 text-white rounded-2xl py-4 font-bold text-base flex items-center justify-center gap-3 hover:bg-blue-700 transition-all"
                      >
                        <ArrowRight size={18} /> Continue with Code
                      </button>
                    </div>
                  </div>

                  {showSymptoms && (
                    <>
                      <div className="bg-white rounded-3xl p-8 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)]">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                            <Stethoscope size={26} className="text-purple-600" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-gray-800">Tell Us How You're Feeling</h3>
                            <p className="text-base text-gray-500">
                              Help us prioritize your care and reduce wait times
                            </p>
                          </div>
                        </div>

                        <QueueForm form={form} setForm={setForm} />
                      </div>

                      {submitSection}
                    </>
                  )}
                </div>

                <div className="col-span-1">
                  <div className="sticky top-6 space-y-6">
                    {showFacilityCard && <FacilityCard {...facilityCardProps} compact />}
                    <WhatNextCard />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}