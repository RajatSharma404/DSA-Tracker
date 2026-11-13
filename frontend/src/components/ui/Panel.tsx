import type { ReactNode } from "react";

interface PanelProps {
  title?: ReactNode;
  description?: ReactNode;
  /** Right-aligned header slot: a link or a small button */
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Remove body padding (for lists that run edge to edge) */
  flush?: boolean;
  as?: "section" | "div";
}

/**
 * The one card primitive for page content: quiet surface, consistent header.
 */
export function Panel({ title, description, action, children, className = "", flush = false, as = "section" }: PanelProps) {
  const Tag = as;
  return (
    <Tag className={`surface overflow-hidden ${className}`}>
      {(title || action) && (
        <header className="flex items-start justify-between gap-4 px-5 pt-4 pb-3">
          <div className="min-w-0">
            {title && <h2 className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">{title}</h2>}
            {description && <p className="mt-0.5 text-[13px] text-[var(--text-muted)]">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      <div className={flush ? "" : "px-5 pb-5"}>{children}</div>
    </Tag>
  );
}

export function PanelLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
    >
      {children}
    </a>
  );
}
