/** A tiny tree: root node and two children, drawn in the theme's colours. */
export function BrandMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" className="shrink-0" aria-hidden>
      <rect width="28" height="28" rx="7" fill="var(--bg-tertiary)" />
      <path d="M14 9.5 L9 18.5 M14 9.5 L19 18.5" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="14" cy="9" r="3" fill="var(--accent-primary)" />
      <circle cx="9" cy="19" r="2.5" fill="var(--text-secondary)" />
      <circle cx="19" cy="19" r="2.5" fill="var(--text-secondary)" />
    </svg>
  );
}
