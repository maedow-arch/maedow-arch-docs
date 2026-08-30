"use client";

import { Button } from "@/components/ui/Button";
import { Gauge } from "@/components/ui/Gauge";
import { Panel } from "@/features/_shared/Panel";
import { useCounter } from "./hooks/useCounter";

export function CounterScreen() {
  const { value, percent, canIncrement, canDecrement, increment, decrement, reset } = useCounter();

  return (
    <Panel
      title="Compteur borné"
      hint="Mode Light : les règles vivent dans la feature, juste à côté, dans rules.ts."
    >
      <p className="counter__value">{value}</p>

      <Gauge percent={percent} label={`Progression : ${percent} %`} />

      <div className="counter__actions">
        <Button variant="ghost" onClick={decrement} disabled={!canDecrement}>
          Retirer
        </Button>
        <Button onClick={increment} disabled={!canIncrement}>
          Ajouter
        </Button>
        <Button variant="ghost" onClick={reset}>
          Réinitialiser
        </Button>
      </div>
    </Panel>
  );
}
