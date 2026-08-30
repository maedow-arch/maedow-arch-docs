/**
 * Marque de Maedow Arch : quatre barres empilées, de la plus large à la plus
 * étroite : les 4 couches `app → features → core → lib`, et le flux de
 * dépendance qui ne remonte jamais.
 */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect x="2" y="3" width="16" height="2.6" rx="1.3" fill="currentColor" opacity="0.95" />
        <rect x="4" y="7.7" width="12" height="2.6" rx="1.3" fill="currentColor" opacity="0.7" />
        <rect x="6" y="12.4" width="8" height="2.6" rx="1.3" fill="currentColor" opacity="0.45" />
        <rect x="8" y="17.1" width="4" height="2.6" rx="1.3" fill="currentColor" opacity="0.25" />
      </svg>
      <span className="font-bold tracking-tight">
        Maedow <span className="text-fd-primary">Arch</span>
      </span>
    </span>
  );
}
