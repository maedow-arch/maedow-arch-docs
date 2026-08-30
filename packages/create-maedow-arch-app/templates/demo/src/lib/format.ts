/**
 * Helpers purs, sans aucune dépendance. C'est la feuille de l'arbre : `lib/`
 * ne connaît ni le domaine, ni l'interface.
 */

export function formatNumber(value: number, locale = "fr-FR"): string {
  return new Intl.NumberFormat(locale).format(value);
}

/** Borne un ratio dans [0, 1] avant de le passer à un affichage. */
export function toPercent(ratio: number): number {
  return Math.round(Math.min(Math.max(ratio, 0), 1) * 100);
}
