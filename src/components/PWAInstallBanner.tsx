import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { Download, X, Smartphone, Share, Plus } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

declare global {
  interface Navigator {
    standalone?: boolean;
  }

  interface Window {
    MSStream?: unknown;
  }
}

function isIOS(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
}

function isInStandaloneMode(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [iosMode, setIosMode] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (isInStandaloneMode()) return;
    if (sessionStorage.getItem("pwa-banner-dismissed")) return;

    if (isIOS()) {
      setIosMode(true);
      setShow(true);
      return;
    }

    const handler = (e: Event) => {
      const installEvent = e as BeforeInstallPromptEvent;
      installEvent.preventDefault();
      setDeferredPrompt(installEvent);
      setShow(true);
    };

    const onInstalled = () => setShow(false);

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  function dismiss(): void {
    sessionStorage.setItem("pwa-banner-dismissed", "1");
    setShow(false);
  }

  async function handleInstall(): Promise<void> {
    if (!deferredPrompt) return;

    setInstalling(true);

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    setInstalling(false);

    if (outcome === "accepted") {
      setShow(false);
    }

    setDeferredPrompt(null);
  }

  if (!show) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-[60] lg:hidden"
        onClick={dismiss}
      />

      <div
        className="fixed bottom-0 left-0 right-0 z-[70] lg:bottom-auto lg:top-auto"
        style={{ animation: "slideUp 0.3s ease-out both" }}
      >
        <div className="hidden lg:block fixed bottom-6 right-6 w-80">
          <DesktopCard
            iosMode={iosMode}
            installing={installing}
            onInstall={handleInstall}
            onDismiss={dismiss}
          />
        </div>

        <div className="lg:hidden">
          {iosMode ? (
            <IOSSheet onDismiss={dismiss} />
          ) : (
            <AndroidSheet
              installing={installing}
              onInstall={handleInstall}
              onDismiss={dismiss}
            />
          )}
        </div>
      </div>
    </>
  );
}

type AndroidSheetProps = {
  installing: boolean;
  onInstall: () => void | Promise<void>;
  onDismiss: () => void;
};

function AndroidSheet({
  installing,
  onInstall,
  onDismiss,
}: AndroidSheetProps) {
  return (
    <div className="bg-white rounded-t-3xl px-5 pt-5 pb-8 shadow-2xl">
      <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
      <div className="flex items-start gap-4 mb-5">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{
            background:
              "linear-gradient(135deg, var(--color-juno-green) 0%, #059669 100%)",
          }}
        >
          <Smartphone className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-0.5">
            Add JUNO to Home Screen
          </h3>
          <p className="text-sm text-gray-500">
            Install for faster access, offline support, and a full-screen
            experience.
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      <div className="flex gap-3 mb-3">
        <FeaturePill emoji="⚡" text="Instant load" />
        <FeaturePill emoji="📶" text="Works offline" />
        <FeaturePill emoji="🔔" text="Notifications" />
      </div>

      <button
        type="button"
        onClick={onInstall}
        disabled={installing}
        className="w-full py-4 rounded-2xl text-white font-bold text-base transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
        style={{
          background:
            "linear-gradient(135deg, var(--color-juno-green) 0%, #059669 100%)",
        }}
      >
        <Download className="w-5 h-5" />
        {installing ? "Installing…" : "Install App"}
      </button>

      <button
        type="button"
        onClick={onDismiss}
        className="w-full py-3 text-sm text-gray-400 font-medium mt-1"
      >
        Maybe later
      </button>
    </div>
  );
}

type IOSSheetProps = {
  onDismiss: () => void;
};

function IOSSheet({ onDismiss }: IOSSheetProps) {
  return (
    <div className="bg-white rounded-t-3xl px-5 pt-5 pb-8 shadow-2xl">
      <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, var(--color-juno-green) 0%, #059669 100%)",
            }}
          >
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Install JUNO</h3>
            <p className="text-sm text-gray-500">Add to your Home Screen</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      <div className="space-y-3 mb-5">
        <IOSStep
          num={1}
          icon={<Share className="w-5 h-5 text-blue-500" />}
          iconBg="bg-blue-50"
          text={
            <>
              Tap the <strong>Share</strong> button at the bottom of your browser
            </>
          }
        />
        <IOSStep
          num={2}
          icon={<Plus className="w-5 h-5 text-green-600" />}
          iconBg="bg-green-50"
          text={
            <>
              Scroll down and tap <strong>"Add to Home Screen"</strong>
            </>
          }
        />
        <IOSStep
          num={3}
          icon={<Smartphone className="w-5 h-5 text-purple-600" />}
          iconBg="bg-purple-50"
          text={
            <>
              Tap <strong>"Add"</strong> — JUNO will appear on your home screen
            </>
          }
        />
      </div>

      <button
        type="button"
        onClick={onDismiss}
        className="w-full py-3 rounded-2xl border-2 text-sm font-semibold text-gray-600"
        style={{ borderColor: "#e2e8f0" }}
      >
        Got it
      </button>
    </div>
  );
}

type DesktopCardProps = {
  iosMode: boolean;
  installing: boolean;
  onInstall: () => void | Promise<void>;
  onDismiss: () => void;
};

function DesktopCard({
  iosMode,
  installing,
  onInstall,
  onDismiss,
}: DesktopCardProps) {
  return (
    <div
      className="bg-white rounded-2xl p-5 shadow-2xl border border-gray-100"
      style={{ animation: "slideUp 0.3s ease-out both" }}
    >
      <div className="flex items-start gap-3 mb-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background:
              "linear-gradient(135deg, var(--color-juno-green) 0%, #059669 100%)",
          }}
        >
          <Smartphone className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 text-sm">Install JUNO</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Add to your home screen for the best experience
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0"
        >
          <X className="w-3.5 h-3.5 text-gray-500" />
        </button>
      </div>

      {!iosMode && (
        <button
          type="button"
          onClick={onInstall}
          disabled={installing}
          className="w-full py-2.5 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          style={{
            background:
              "linear-gradient(135deg, var(--color-juno-green) 0%, #059669 100%)",
          }}
        >
          <Download className="w-4 h-4" />
          {installing ? "Installing…" : "Install App"}
        </button>
      )}

      <button
        type="button"
        onClick={onDismiss}
        className="w-full pt-2 text-xs text-gray-400 text-center"
      >
        Maybe later
      </button>
    </div>
  );
}

type FeaturePillProps = {
  emoji: string;
  text: string;
};

function FeaturePill({ emoji, text }: FeaturePillProps) {
  return (
    <div className="flex items-center gap-1.5 bg-gray-50 rounded-xl px-3 py-2 flex-1 justify-center">
      <span>{emoji}</span>
      <span className="text-xs font-semibold text-gray-700">{text}</span>
    </div>
  );
}

type IOSStepProps = {
  num: number;
  icon: ReactNode;
  iconBg: string;
  text: ReactNode;
};

function IOSStep({ num, icon, iconBg, text }: IOSStepProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-bold text-gray-600">{num}</span>
      </div>
      <div
        className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}
      >
        {icon}
      </div>
      <p className="text-sm text-gray-700 leading-snug">{text}</p>
    </div>
  );
}
