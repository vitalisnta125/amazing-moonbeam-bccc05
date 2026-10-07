import type { ReactNode } from "react";

// Section header used inside panels: a small caps label on the left, optional
// meta / actions on the right.
export function SectionHeader({
  label,
  meta,
  right,
  accent,
}: {
  label: ReactNode;
  meta?: ReactNode;
  right?: ReactNode;
  accent?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 min-h-5">
      <div className="flex items-baseline gap-2 min-w-0">
        <h2 className="label-caps m-0 truncate" style={accent ? { color: accent } : undefined}>
          {label}
        </h2>
        {meta && <span className="text-[11px] text-fg-3 truncate">{meta}</span>}
      </div>
      {right && <div className="flex items-center gap-2 flex-shrink-0">{right}</div>}
    </div>
  );
}

// The standard container for every block of information in the app.
export function Panel({
  label,
  meta,
  right,
  accent,
  children,
  className = "",
  bodyClassName = "",
  flush = false,
}: {
  label?: ReactNode;
  meta?: ReactNode;
  right?: ReactNode;
  accent?: string;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  flush?: boolean;
}) {
  return (
    <section className={`panel flex flex-col min-w-0 ${className}`}>
      {label && (
        <div className="px-4 pt-3.5 pb-2.5">
          <SectionHeader label={label} meta={meta} right={right} accent={accent} />
        </div>
      )}
      <div className={`${flush ? "" : "px-4 pb-4"} ${label ? "" : flush ? "" : "pt-4"} flex-1 min-w-0 ${bodyClassName}`}>
        {children}
      </div>
    </section>
  );
}
