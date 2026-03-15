export default function PainSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const pct = (value / 10) * 100;

  return (
    <div className="px-1">
      <input
        type="range"
        min={0}
        max={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full mb-3 h-2 rounded-full outline-none cursor-pointer"
        style={{
          appearance: "none",
          background: `linear-gradient(to right,#10B981 0%,#10B981 ${pct}%,#E5E7EB ${pct}%,#E5E7EB 100%)`,
        }}
      />

      <style>{`
        input[type='range']::-webkit-slider-thumb{-webkit-appearance:none;width:24px;height:24px;border-radius:50%;background:white;border:3px solid #10B981;box-shadow:0 2px 8px rgba(0,0,0,0.2);cursor:pointer}
        input[type='range']::-moz-range-thumb{width:24px;height:24px;border-radius:50%;background:white;border:3px solid #10B981;cursor:pointer}
      `}</style>

      <div className="flex justify-between text-sm items-center">
        <span className="text-gray-500">0 – No pain</span>
        <span className="text-2xl font-bold" style={{ color: "var(--color-juno-green)" }}>
          {value}
        </span>
        <span className="text-gray-500">10 – Extreme</span>
      </div>
    </div>
  );
}
