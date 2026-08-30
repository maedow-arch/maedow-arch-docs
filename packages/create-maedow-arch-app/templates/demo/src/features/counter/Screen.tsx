"use client";

import { Button } from "@/components/ui/Button";
import { Gauge } from "@/components/ui/Gauge";
import { Panel } from "@/features/_shared/Panel";
import { useCounter } from "./hooks/useCounter";

/**
 * L'écran ne décide de rien.
 *
 * Il n'y a pas une seule condition métier ici : pas de `value < max`, pas de
 * calcul de pourcentage. Tout arrive prêt à l'emploi dans le ViewModel. C'est
 * à ce signe qu'on reconnaît une frontière correctement placée.
 */
export function CounterScreen() {
  const { view, increment, decrement, reset } = useCounter();

  return (
    <Panel
      title="Compteur borné"
      hint="Les bornes sont une règle métier, vérifiée dans core/, pas dans ce fichier."
    >
      <p className="counter__value">{view.value}</p>

      <Gauge percent={view.percent} label={`Progression : ${view.percent} %`} />

      <div className="counter__actions">
        <Button variant="ghost" onClick={decrement} disabled={!view.canDecrement}>
          Retirer
        </Button>
        <Button onClick={increment} disabled={!view.canIncrement}>
          Ajouter
        </Button>
        <Button variant="ghost" onClick={reset}>
          Réinitialiser
        </Button>
      </div>

      <p className="counter__notice" role="status" aria-live="polite">
        {view.notice ?? "\u00a0"}
      </p>
    </Panel>
  );
}
