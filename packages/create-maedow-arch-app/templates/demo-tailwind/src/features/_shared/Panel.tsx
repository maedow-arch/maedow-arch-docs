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
    <section className="bg-surface border border-line rounded-[14px] p-7">
      <header className="mb-5">
        <h2 className="text-[1.1rem] font-bold font-display tracking-tight m-0">{title}</h2>
        {hint ? (
          <p className="mt-[0.4rem] mb-0 text-ink-faint text-sm text-pretty">{hint}</p>
        ) : null}
      </header>
      {children}
    </section>
  );
}
