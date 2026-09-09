import type { ReactNode } from "react";

/**
 * Élément d'interface composite, partagé entre features.
 *
 * Il vit dans `features/_shared/` parce qu'il porte une intention métier
 * (présenter un bloc de l'application), là où `components/ui/` ne porte qu'une
 * apparence. Il n'importe aucune feature : c'est la règle de dégradation
 * d'architecture.md, « Règle de dégradation de features/_shared/ ».
 */
export function Panel({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section className="panel">
      <header className="panel__head">
        <h2 className="panel__title">{title}</h2>
        {hint ? <p className="panel__hint">{hint}</p> : null}
      </header>
      {children}
    </section>
  );
}
