// resources/js/components/ui/InputError.tsx
import React from "react";

type Props = {
  message?: string;
  /** Reserve vertical space even if there’s no error (prevents card jump). Default: true */
  fixedHeight?: boolean;
};

export default function InputError({ message, fixedHeight = true }: Props) {
  if (!message && !fixedHeight) return null;

  return (
    <div className={`mt-1 text-xs ${fixedHeight ? "min-h-[1.25rem]" : ""}`}>
      {message && <span className="text-[#DC2626]">{message}</span>}
    </div>
  );
}
