import type { Result } from "../common/result";
import type { Counter, CounterError } from "./types";

/**
 * Les transitions du compteur, toutes pures.
 *
 * Aucune ne mute son entrée : chacune retourne un nouveau Counter, ou un refus
 * typé. C'est ce qui rend ce fichier testable en quelques millisecondes, sans
 * monter le moindre composant. Voir `rules.test.ts`.
 */

export function createCounter(settings: {
  value: number;
  min: number;
  max: number;
  step: number;
}): Result<Counter, CounterError> {
  if (settings.min >= settings.max) {
    return { ok: false, error: { kind: "invalid_range", min: settings.min, max: settings.max } };
  }
  if (settings.step <= 0) {
    return { ok: false, error: { kind: "invalid_step", step: settings.step } };
  }

  const value = Math.min(Math.max(settings.value, settings.min), settings.max);
  return { ok: true, data: { ...settings, value } };
}

export function increment(counter: Counter): Result<Counter, CounterError> {
  const next = counter.value + counter.step;
  if (next > counter.max) {
    return { ok: false, error: { kind: "at_maximum", max: counter.max } };
  }
  return { ok: true, data: { ...counter, value: next } };
}

export function decrement(counter: Counter): Result<Counter, CounterError> {
  const next = counter.value - counter.step;
  if (next < counter.min) {
    return { ok: false, error: { kind: "at_minimum", min: counter.min } };
  }
  return { ok: true, data: { ...counter, value: next } };
}

/** Revenir au plancher ne peut pas échouer : pas de Result ici. */
export function reset(counter: Counter): Counter {
  return { ...counter, value: counter.min };
}

/** Position dans l'intervalle, entre 0 et 1. Sert à l'affichage, pas à la règle. */
export function progress(counter: Counter): number {
  return (counter.value - counter.min) / (counter.max - counter.min);
}
