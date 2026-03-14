import type { ChangeEvent } from "react";

type PhoneInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function PhoneInput({ value, onChange }: PhoneInputProps) {
  function format(raw: string): string {
    const digits = raw.replace(/\D/g, "").slice(0, 10);

    if (digits.length > 6) {
      return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
    }

    if (digits.length > 3) {
      return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    }

    return digits;
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    onChange(format(e.target.value));
  }

  return (
    <div className="relative">
      <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500 font-medium text-sm pointer-events-none">
        +1
      </span>
      <input
        type="tel"
        placeholder="876-555-0123"
        value={value}
        onChange={handleChange}
        className="input-field pl-12"
      />
    </div>
  );
}
