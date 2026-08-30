import { describe, it, expect } from "vitest";
import { createCounter, increment, decrement, reset, progress } from "./rules";
import type { Counter } from "./types";

/**
 * Tout le comportement métier, vérifié sans React, sans DOM, sans mock.
 *
 * C'est le bénéfice concret du découplage : ces tests s'exécutent en
 * millisecondes et ne cassent pas quand l'interface change.
 */

const base: Counter = { value: 0, min: 0, max: 10, step: 2 };

describe("createCounter", () => {
  it("refuse un intervalle incohérent", () => {
    const result = createCounter({ value: 0, min: 10, max: 0, step: 1 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.kind).toBe("invalid_range");
  });

  it("refuse un pas nul ou négatif", () => {
    const result = createCounter({ value: 0, min: 0, max: 10, step: 0 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.kind).toBe("invalid_step");
  });

  it("ramène une valeur hors bornes dans l'intervalle", () => {
    const result = createCounter({ value: 99, min: 0, max: 10, step: 1 });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.value).toBe(10);
  });
});

describe("increment", () => {
  it("avance d'un pas", () => {
    const result = increment(base);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.value).toBe(2);
  });

  it("refuse de dépasser le maximum", () => {
    const result = increment({ ...base, value: 10 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toEqual({ kind: "at_maximum", max: 10 });
  });

  it("ne mute pas son entrée", () => {
    increment(base);
    expect(base.value).toBe(0);
  });
});

describe("decrement", () => {
  it("refuse de passer sous le minimum", () => {
    const result = decrement(base);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toEqual({ kind: "at_minimum", min: 0 });
  });
});

describe("reset", () => {
  it("ramène au plancher", () => {
    expect(reset({ ...base, value: 8 }).value).toBe(0);
  });
});

describe("progress", () => {
  it("situe la valeur dans l'intervalle", () => {
    expect(progress({ ...base, value: 5 })).toBe(0.5);
  });
});
