import { CheckCircle2, Loader2, XCircle} from "lucide-react";

export default function CodeInput({
  value,
  onChange,
  loading,
  found,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  loading: boolean;
  found: boolean;
  error: boolean;
}) {
  return (
    <div className="relative">
      <input
        type="text"
        placeholder="e.g., TZCIET or FAC-a1b2c3…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl text-lg font-semibold focus:outline-none transition-all pr-12"
        onFocus={(e) => (e.target.style.borderColor = "#00703C")}
        onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
      />
      {loading && <Loader2 size={18} className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-gray-400" />}
      {found && <CheckCircle2 size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500" />}
      {error && <XCircle size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500" />}
    </div>
  );
}