import type { ReactNode } from "react";

// Standard page container: full workspace width up to 1440px.
export function Page({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 py-5 lg:py-6 ${className}`}>
      {children}
    </div>
  );
}

// Compact page heading. Headings stay small — the content carries the page.
// The section (Command, Control…) is already shown in the top bar breadcrumb.
export function PageHeader({
  title,
  description,
  actions,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
      <div className="min-w-0">
        <h1 className="text-[20px] leading-7 font-semibold tracking-[-0.01em] m-0 text-fg">{title}</h1>
        {description && (
          <p className="text-[13px] text-fg-2 m-0 mt-1 max-w-2xl">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}
