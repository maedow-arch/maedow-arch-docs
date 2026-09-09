/**
 * Une jauge, et rien d'autre. Elle reçoit un pourcentage déjà calculé : le
 * calcul appartient au domaine, pas à l'affichage.
 */
export function Gauge({ percent, label }: { percent: number; label: string }) {
  return (
    <div className="gauge" role="img" aria-label={label}>
      <div className="gauge__fill" style={{ width: `${percent}%` }} />
    </div>
  );
}
