/**
 * Entité métier du compteur.
 *
 * Aucune mention de React, du DOM ou d'un quelconque affichage. C'est la règle
 * « Zéro Modèle dans le JSX » : ce fichier décrit ce qu'est un compteur, pas la
 * façon dont on le dessine.
 */
export interface Counter {
  readonly value: number;
  readonly min: number;
  readonly max: number;
  readonly step: number;
}

/**
 * Les refus possibles, énumérés.
 *
 * Franchir une borne n'est pas un incident technique, c'est une réponse
 * métier légitime. Elle est donc modélisée comme une donnée, pas levée comme
 * une exception. Voir « Gestion des erreurs » dans conventions.md, le Result Pattern.
 */
export type CounterError =
  | { readonly kind: "at_maximum"; readonly max: number }
  | { readonly kind: "at_minimum"; readonly min: number }
  | { readonly kind: "invalid_range"; readonly min: number; readonly max: number }
  | { readonly kind: "invalid_step"; readonly step: number };
