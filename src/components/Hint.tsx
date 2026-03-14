import type { ReactNode } from "react";

type HintProps = {
  children: ReactNode;
};

export default function Hint({ children }: HintProps) {
  return <p className="mt-1.5 text-xs text-gray-400">{children}</p>;
}
