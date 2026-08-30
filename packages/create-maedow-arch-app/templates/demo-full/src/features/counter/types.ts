/**
 * ViewModel de la feature.
 *
 * Tout est déjà prêt pour l'affichage : la valeur est une chaîne formatée, le
 * refus est un message lisible, les boutons savent s'ils sont actifs. L'écran
 * n'a plus aucune décision à prendre.
 *
 * Noter ce qui n'est PAS ici : ni `min`, ni `max`, ni `step`. La vue n'en a pas
 * besoin pour se dessiner, donc elle ne les reçoit pas.
 */
export interface CounterView {
  readonly value: string;
  readonly percent: number;
  readonly canIncrement: boolean;
  readonly canDecrement: boolean;
  readonly notice: string | null;
}
