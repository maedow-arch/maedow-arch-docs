import type { ReactNode } from "react";

/**
 * Les deux balises que le corpus utilise pour distinguer ce qui appartient au
 * profil Full de ce qui appartient au profil Light.
 *
 * Elles ne rendent rien de conditionnel : elles posent un attribut, et la
 * feuille de style masque ce qui ne correspond pas au profil choisi. Le rendu
 * reste donc entièrement statique, et la bascule ne coûte pas un rendu React.
 *
 * Dans les `.md` de la racine, ces balises restent invisibles sur GitHub :
 * séparées du texte par une ligne vide, le markdown qu'elles entourent est
 * rendu normalement et la balise elle-même est ignorée.
 */
export function ModeFull({ children }: { children: ReactNode }) {
  return <div data-mode-only="full">{children}</div>;
}

export function ModeLight({ children }: { children: ReactNode }) {
  return <div data-mode-only="light">{children}</div>;
}
