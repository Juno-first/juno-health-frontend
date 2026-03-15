import { QrCode } from "lucide-react";

export default function ScannerFrame() {
  return (
    <div
      className="relative w-full mb-6 rounded-3xl overflow-hidden flex items-center justify-center"
      style={{ height: 280, background: "linear-gradient(135deg, #00703C 0%, #059669 100%)" }}
    >
      <QrCode size={100} className="text-white/20" />

      <div className="absolute inset-5 rounded-2xl border-2 border-white/40 pointer-events-none">
        <span className="absolute -top-px -left-px w-7 h-7 border-t-4 border-l-4 border-white rounded-tl-2xl" />
        <span className="absolute -top-px -right-px w-7 h-7 border-t-4 border-r-4 border-white rounded-tr-2xl" />
        <span className="absolute -bottom-px -left-px w-7 h-7 border-b-4 border-l-4 border-white rounded-bl-2xl" />
        <span className="absolute -bottom-px -right-px w-7 h-7 border-b-4 border-r-4 border-white rounded-br-2xl" />
      </div>

      <div
        className="absolute left-5 right-5 h-0.5 rounded"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.85), transparent)",
          animation: "scanning 2s ease-in-out infinite",
        }}
      />

      <p className="absolute bottom-5 left-0 right-0 text-center text-white text-sm font-semibold">
        Position QR code within frame
      </p>

      <style>{`@keyframes scanning { 0%,100%{top:20px} 50%{top:calc(100% - 20px)} }`}</style>
    </div>
  );
}
