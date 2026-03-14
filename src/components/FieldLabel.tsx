import type { ReactNode } from "react";

type FieldLabelProps = {
  icon: ReactNode;
  children: ReactNode;
};

export default function FieldLabel({ icon, children }: FieldLabelProps) {
  return (
    <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
      <span style={{ color: "var(--color-juno-green)" }}>{icon}</span>
      {children}
    </label>
  );
}
