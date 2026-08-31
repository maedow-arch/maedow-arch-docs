import { ArrowRight, Ban } from "lucide-react";

/*
 * Le flux de dépendance, montré plutôt qu'énoncé.
 *
 * C'est la seule chose que Maedow Arch impose vraiment, et celle qu'aucun autre
 * standard ne formule de la même façon : la page d'accueil la donne à voir
 * avant de la raconter.
 *
 * La liste est ordonnée parce que l'ordre est l'information. Les numéros
 * restent masqués : les flèches disent déjà le sens, les chiffres seraient une
 * décoration de plus.
 */
const LAYERS = [
  { name: "app", gloss: "routes et pages" },
  { name: "features", gloss: "cas d’usage" },
  { name: "core", gloss: "domaine et contrats" },
  { name: "lib", gloss: "utilitaires purs" },
];

/**
 * `nu` retire le cadre : la figure est alors posée dans une carte qui porte
 * déjà le sien, et deux bordures imbriquées se voient toujours.
 */
export function LayerFlow({ nu = false }: { nu?: boolean }) {
  return (
    <figure
      data-anime="flux"
      className={nu ? "" : "rounded-2xl border border-fd-border bg-fd-card p-7 sm:p-9"}
    >
      <figcaption className="mb-7 text-xs font-semibold tracking-[0.14em] text-fd-muted-foreground uppercase">
        Le flux de dépendance
      </figcaption>

      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <ol className="flex min-w-max list-none items-stretch gap-2 sm:gap-3">
          {LAYERS.map((layer, index) => (
            <li key={layer.name} className="flex items-center gap-2 sm:gap-3">
              <div
                data-anime="couche"
                className="rounded-xl border border-fd-border bg-fd-background px-4 py-3 sm:px-5"
              >
                <span className="block font-mono text-sm font-semibold text-fd-foreground sm:text-base">
                  {layer.name}
                </span>
                <span className="mt-1 block text-xs text-fd-muted-foreground">{layer.gloss}</span>
              </div>
              {index < LAYERS.length - 1 && (
                <ArrowRight
                  data-anime="fleche"
                  className="size-4 shrink-0 text-fd-primary"
                  aria-label="dépend de"
                />
              )}
            </li>
          ))}
        </ol>
      </div>

      <p className="mt-7 flex items-start gap-2.5 border-t border-fd-border pt-5 text-sm leading-relaxed text-fd-muted-foreground">
        <Ban className="mt-0.5 size-4 shrink-0 text-fd-error" aria-hidden />
        <span>
          Le sens inverse est refusé. Un import de <code className="font-mono">core</code> vers{" "}
          <code className="font-mono">features</code> fait échouer le lint, et donc la CI, avant
          d’atteindre la revue.
        </span>
      </p>
    </figure>
  );
}
