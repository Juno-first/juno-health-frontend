

export default function RememberRow() {
  return (
    <div className="flex items-center justify-between">
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox"
          className="w-4 h-4 rounded border-2 border-gray-300 accent-[var(--color-juno-green)]" />
        <span className="text-sm text-gray-600">Remember me</span>
      </label>
      <a href="#" className="text-sm font-semibold hover:underline transition-colors"
        style={{ color: "var(--color-juno-green)" }}>
        Forgot Password?
      </a>
    </div>
  );
}
