/**
 * Une jauge, et rien d'autre. Elle reçoit un pourcentage déjà calculé : le
 * calcul appartient au domaine, pas à l'affichage.
 */
export function Gauge({ percent, label }: { percent: number; label: string }) {
  return (
    <div className="h-2 bg-line rounded-full overflow-hidden" role="img" aria-label={label}>
      <div
        className="h-full bg-accent rounded-full transition-[width] duration-250"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
