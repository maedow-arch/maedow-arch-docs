/**
 * Mode Light : les règles vivent dans la feature.
 *
 * Le compteur a les mêmes bornes que dans la version Full, mais il n'y a pas
 * de couche `core/` séparée. C'est ce que recommande architecture.md §9 pour
 * un site vitrine, un prototype ou un MVP : la logique est faible, la sortir
 * dans un domaine dédié coûterait plus qu'elle ne rapporte.
 *
 * Noter ce qu'on garde tout de même : des fonctions pures, qui ne mutent pas
 * leur entrée. C'est gratuit, et c'est ce qui rendra la bascule indolore.
 */

export interface Counter {
  readonly value: number;
  readonly min: number;
  readonly max: number;
  readonly step: number;
}

export const INITIAL: Counter = { value: 0, min: 0, max: 10, step: 1 };

export function increment(counter: Counter): Counter {
  return { ...counter, value: Math.min(counter.value + counter.step, counter.max) };
}

export function decrement(counter: Counter): Counter {
  return { ...counter, value: Math.max(counter.value - counter.step, counter.min) };
}

export function reset(counter: Counter): Counter {
  return { ...counter, value: counter.min };
}

export function progress(counter: Counter): number {
  return (counter.value - counter.min) / (counter.max - counter.min);
}

/*
 * Quand faut-il basculer en Mode Full ?
 *
 * Le jour où une deuxième feature a besoin de ces règles, où il devient utile
 * de distinguer « refusé parce qu'au plafond » de « refusé parce que le pas est
 * invalide », ou simplement où l'on veut tester le métier sans monter l'écran.
 * Ce fichier part alors dans `src/core/counter/`, les transitions retournent un
 * `Result`, et la feature ne garde que la traduction pour l'affichage.
 *
 * La bascule se fait domaine par domaine, jamais en un refactor global.
 * Voir architecture.md §9.
 */
