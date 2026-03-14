import type { ReactNode } from "react";

type SectionDividerProps = {
  icon: ReactNode;
  title: string;
};

export default function SectionDivider({
  icon,
  title,
}: SectionDividerProps) {
  return (
    <>
      <div className="border-t-2 border-gray-100 my-8" />
      <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
        <span style={{ color: "var(--color-juno-green)" }}>{icon}</span>
        {title}
      </h2>
    </>
  );
}
