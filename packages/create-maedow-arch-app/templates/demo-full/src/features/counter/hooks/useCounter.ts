"use client";

import { useMemo, useState } from "react";
import { createCounter, decrement, increment, progress, reset } from "@/core/counter/rules";
import type { Counter, CounterError } from "@/core/counter/types";
import { formatNumber, toPercent } from "@/lib/format";
import type { CounterView } from "../types";

/**
 * Le point de jonction entre le domaine et l'écran.
 *
 * Le hook détient l'état, appelle les transitions pures et traduit leur
 * résultat en ViewModel. C'est la seule couche qui connaît les deux mondes, et
 * c'est voulu : le domaine ignore React, l'écran ignore les règles.
 */

const INITIAL = { value: 0, min: 0, max: 10, step: 1 };

/** Un refus métier devient une phrase. La traduction appartient à la vue. */
function toNotice(error: CounterError): string {
  switch (error.kind) {
    case "at_maximum":
      return `Plafond atteint : ${error.max}.`;
    case "at_minimum":
      return `Plancher atteint : ${error.min}.`;
    case "invalid_range":
      return `Intervalle incohérent : ${error.min} à ${error.max}.`;
    case "invalid_step":
      return `Pas invalide : ${error.step}.`;
  }
}

export function useCounter() {
  const created = createCounter(INITIAL);
  const [counter, setCounter] = useState<Counter>(
    created.ok ? created.data : { ...INITIAL, value: INITIAL.min }
  );
  const [notice, setNotice] = useState<string | null>(null);

  /** Toute transition suit le même chemin : on applique, on lit le Result. */
  const apply = (transition: (current: Counter) => ReturnType<typeof increment>) => {
    const result = transition(counter);
    if (result.ok) {
      setCounter(result.data);
      setNotice(null);
    } else {
      setNotice(toNotice(result.error));
    }
  };

  const view: CounterView = useMemo(
    () => ({
      value: formatNumber(counter.value),
      percent: toPercent(progress(counter)),
      canIncrement: counter.value + counter.step <= counter.max,
      canDecrement: counter.value - counter.step >= counter.min,
      notice,
    }),
    [counter, notice]
  );

  return {
    view,
    increment: () => apply(increment),
    decrement: () => apply(decrement),
    reset: () => {
      setCounter(reset(counter));
      setNotice(null);
    },
  };
}
