import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

/**
 * Le vocabulaire d'animation du site.
 *
 * Une animation isolée se règle à l'œil et paraît juste. Vingt animations
 * réglées chacune à l'œil donnent un site qui bouge sans rythme, où chaque
 * section semble venir d'un autre projet. Toutes les valeurs de durée, de
 * courbe et de décalage sont donc ici, et nulle part ailleurs.
 *
 * Trois règles gouvernent l'ensemble.
 *
 * **L'animation doit dire quelque chose.** Le flux de dépendance descend, donc
 * ses couches se révèlent de haut en bas. Les compteurs comptent. Le titre se
 * déplie parce que la marque se déplie. Une entrée en fondu qui n'apprend rien
 * au lecteur est du décor, et le décor vieillit mal sur un site technique.
 *
 * **Rien ne rejoue.** Une documentation se relit, se parcourt de haut en bas
 * puis de bas en haut. Une animation qui se rejoue à chaque passage devient une
 * gêne dès la deuxième lecture : tout est en `once`.
 *
 * **Rien ne dépend de l'animation pour être lu.** Les entrées se font en
 * `from`, jamais en `to` depuis un état masqué en CSS : l'état de repos du
 * document est déjà l'état final. Si le script échoue, si le navigateur est
 * ancien, si le lecteur coupe le JavaScript, la page reste entière.
 */

let plugins = false;

/** Enregistre les plugins une seule fois, quel que soit le nombre de sections. */
export function enregistrerAnimation() {
  if (plugins) return;
  gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);
  plugins = true;
}

/**
 * Les courbes.
 *
 * `sortie` freine à l'arrivée sans rebond : un texte qui se pose doit s'arrêter,
 * pas osciller. `franc` sert aux éléments qui traversent une distance visible.
 */
export const COURBE = {
  sortie: "power3.out",
  franc: "power2.out",
  continu: "none",
} as const;

/**
 * Les durées, en secondes.
 *
 * L'écart entre `fragment` et `bloc` est délibéré : un caractère parcourt
 * quelques pixels, une carte en parcourt trente. À durée égale, le premier
 * paraîtrait lent et la seconde brutale.
 */
export const DUREE = {
  fragment: 0.5,
  bloc: 0.7,
  compte: 1.6,
} as const;

/**
 * Les décalages entre éléments d'une même série.
 *
 * Assez pour que l'œil suive une direction, assez peu pour que la série reste
 * un mouvement d'ensemble et non une file d'attente.
 */
export const DECALAGE = {
  caractere: 0.018,
  ligne: 0.09,
  carte: 0.1,
  couche: 0.13,
} as const;

/**
 * Le moment où une section s'anime.
 *
 * Assez haut pour que le mouvement ait commencé quand le lecteur y arrive, et
 * pas si haut qu'il se déclenche hors de vue.
 */
export const SEUIL = "top 85%";

/**
 * Réglages communs à tous les déclencheurs de défilement.
 *
 * `once` est la règle de la maison : voir la note en tête de fichier.
 */
export function auDefilement(declencheur: Element | null) {
  return { trigger: declencheur, start: SEUIL, once: true } as const;
}

export { gsap, ScrollTrigger, SplitText, useGSAP };
