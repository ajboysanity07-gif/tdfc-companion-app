import React from "react";

type Props = {
  children: React.ReactNode;
  /** Optional big title at the top (centered) */
  title?: string;
  /** Optional subtitle under the title (centered) */
  subtitle?: string;
  /** Extra classes if you need to tweak spacing per page */
  className?: string;
  /** Optional header-right area (e.g., link) */
  headerRight?: React.ReactNode;
};

/**
 * AuthCard — shared card UI for all auth pages.
 * Matches the visual used in register.tsx:
 * - bg-gray-200/80 + backdrop blur + soft border + subtle shadow
 * - rounded corners, same internal padding
 */
export default function AuthCard({
  children,
  title,
  subtitle,
  className = "",
  headerRight,
}: Props) {
  return (
    <div
      className={`mt-6 rounded-[1.25rem] bg-gray-200/80 backdrop-blur-md border border-gray-300/50 shadow-lg p-5 sm:p-6 ${className}`}
    >
      {(title || subtitle || headerRight) && (
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex-1 text-center">
            {title && (
              <h2 className="text-2xl font-extrabold tracking-tight">{title}</h2>
            )}
            {subtitle && (
              <p className="mt-1 text-sm text-black/70">{subtitle}</p>
            )}
          </div>
          {headerRight && <div className="shrink-0">{headerRight}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
