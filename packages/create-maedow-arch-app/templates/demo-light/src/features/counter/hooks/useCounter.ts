"use client";

import { useState } from "react";
import { formatNumber, toPercent } from "@/lib/format";
import { INITIAL, decrement, increment, progress, reset, type Counter } from "../rules";

/**
 * En Mode Light, le hook porte l'état et le peu de traduction nécessaire.
 * Il n'y a pas de ViewModel séparé : l'écran est le seul consommateur, et
 * inventer un type intermédiaire n'apporterait rien ici.
 */
export function useCounter() {
  const [counter, setCounter] = useState<Counter>(INITIAL);

  return {
    value: formatNumber(counter.value),
    percent: toPercent(progress(counter)),
    canIncrement: counter.value < counter.max,
    canDecrement: counter.value > counter.min,
    increment: () => setCounter(increment),
    decrement: () => setCounter(decrement),
    reset: () => setCounter(reset),
  };
}
