import Link from "next/link";
import { ArrowRight, Ban, GitBranch, Sparkles } from "lucide-react";
import { LayerFlow } from "@/components/LayerFlow";
import { CopyCommand } from "@/components/CopyCommand";
import { Extrait } from "@/components/Extrait";
import { NPM_CLI_URL, NPM_ESLINT_URL } from "@/lib/links";

/**
 * La grille de la page d'accueil.
 *
 * Les cartes sont de tailles inégales à dessein : une grille régulière donne à
 * tout le même poids, et le lecteur ne sait plus par où entrer. Ici la plus
 * grande porte la seule règle que ce standard impose vraiment, et les autres
 * répondent à la question qu'elle soulève.
 *
 * Ce que montrent les cartes est réel : un message de lint tel qu'il sort, une
 * arborescence telle qu'elle est générée, des chiffres pris dans la matrice du
 * workflow. Sur le site d'un standard d'ingénierie, une capture inventée
 * s'entend tout de suite.
 */
function Carte({
  children,
  className = "",
  etiquette,
}: {
  children: React.ReactNode;
  className?: string;
  etiquette?: string;
}) {
  return (
    <div
      className={`relative flex flex-col overflow-hidden rounded-2xl border border-fd-border bg-fd-card p-7 ${className}`}
    >
      {etiquette ? (
        <p className="mb-4 text-xs font-semibold tracking-[0.14em] text-fd-muted-foreground uppercase">
          {etiquette}
        </p>
      ) : null}
      {children}
    </div>
  );
}

export async function BentoGrid() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <h2 className="font-heading mb-3 text-3xl font-bold tracking-tight text-balance text-fd-foreground sm:text-4xl">
        Ce que la machine vérifie à votre place
      </h2>
      <p className="mb-12 max-w-2xl text-lg text-pretty text-fd-muted-foreground">
        Une architecture qui repose sur la discipline se dégrade au premier sprint tendu. Celle-ci
        tient parce qu&rsquo;un outil refuse ce qui la contredit.
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        {/* La règle centrale occupe la plus grande carte : c'est elle qui
            justifie toutes les autres. */}
        <Carte className="md:col-span-7" etiquette="La règle">
          <LayerFlow nu />
          <p className="mt-6 text-sm leading-relaxed text-fd-muted-foreground">
            La dépendance descend, jamais l&rsquo;inverse. Un écran peut appeler le domaine, le domaine
            ignore qu&rsquo;un écran existe. Tout le reste vient de là.
          </p>
        </Carte>

        <div className="flex flex-col gap-4 md:col-span-5">
          {/* Le message est celui que le développeur verra vraiment. */}
          <Carte etiquette="Le garde-fou">
            <div className="mb-4 flex items-center gap-2 text-fd-foreground">
              <Ban className="size-4 text-fd-error" />
              <span className="font-heading text-lg font-bold">Le lint refuse</span>
            </div>
            <pre className="overflow-x-auto rounded-lg border border-fd-error/30 bg-fd-error/10 px-3 py-2.5 text-xs leading-relaxed">
              <code className="text-fd-foreground">
                error Maedow Arch : core ne peut pas importer components
              </code>
            </pre>
            <p className="mt-4 text-sm leading-relaxed text-fd-muted-foreground">
              Pas une convention d&rsquo;équipe que l&rsquo;on se rappelle. Une erreur, à chaque commit.
            </p>
          </Carte>

          <Carte etiquette="Deux exigences">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-heading mb-1 text-base font-bold text-fd-foreground">Light</p>
                <p className="text-sm leading-relaxed text-fd-muted-foreground">
                  Trois couches, pour un projet qui doit sortir.
                </p>
              </div>
              <div className="border-s border-fd-border ps-4">
                <p className="font-heading mb-1 text-base font-bold text-fd-primary">Full</p>
                <p className="text-sm leading-relaxed text-fd-muted-foreground">
                  Le domaine isolé, pour un projet qui doit durer.
                </p>
              </div>
            </div>
            <Link
              href="/docs/architecture"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-fd-primary hover:underline"
            >
              Choisir son mode
              <ArrowRight className="size-3.5" />
            </Link>
          </Carte>
        </div>

        {/* L'arborescence telle qu'elle sort de la CLI. */}
        <Carte className="md:col-span-4" etiquette="Ce qui est généré">
          <pre className="overflow-x-auto text-xs leading-relaxed text-fd-muted-foreground">
            <code>
              <span className="text-fd-foreground">app/</span>
              {"\n"}
              <span className="text-fd-foreground">features/</span>
              {"\n  checkout/\n  _shared/\n"}
              <span className="text-fd-foreground">core/</span>
              {"\n  billing/\n    types.ts\n    service.ts\n"}
              <span className="text-fd-foreground">components/ui/</span>
              {"\n"}
              <span className="text-fd-foreground">lib/</span>
            </code>
          </pre>
        </Carte>

        {/* Le Result Pattern, dans sa forme réelle. */}
        <Carte className="md:col-span-4" etiquette="Les erreurs">
          <Extrait
            langage="ts"
            code={`type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E };`}
          />
          <p className="mt-4 text-sm leading-relaxed text-fd-muted-foreground">
            L&rsquo;échec est une donnée typée que le compilateur oblige à traiter, pas une exception que
            l&rsquo;on oublie d&rsquo;attraper.
          </p>
        </Carte>

        {/* Les chiffres viennent de la matrice du workflow, pas d'une promesse. */}
        <Carte className="md:col-span-4" etiquette="À chaque commit">
          <div className="flex flex-1 flex-col justify-center gap-5">
            <div>
              <p className="font-heading text-4xl font-extrabold tracking-tight text-fd-foreground">
                20
              </p>
              <p className="text-sm text-fd-muted-foreground">
                projets générés, puis lintés, typés et construits
              </p>
            </div>
            <div className="border-t border-fd-border pt-5">
              <p className="font-heading text-4xl font-extrabold tracking-tight text-fd-foreground">
                23
              </p>
              <p className="text-sm text-fd-muted-foreground">
                contrôles verts exigés avant toute fusion
              </p>
            </div>
          </div>
          <p className="mt-5 inline-flex items-center gap-1.5 text-xs text-fd-muted-foreground">
            <GitBranch className="size-3.5" />
            next et vite, Light et Full, npm, pnpm et bun
          </p>
        </Carte>

        {/* Le seul aplat plein de la page : l'appel à l'action. Un second
            annulerait le premier. */}
        <div className="flex flex-col justify-between gap-6 rounded-2xl bg-fd-primary p-7 text-fd-primary-foreground md:col-span-12 md:flex-row md:items-center md:p-9">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] uppercase opacity-80">
              <Sparkles className="size-3.5" />
              Une commande
            </p>
            <h3 className="font-heading text-2xl font-bold tracking-tight text-balance sm:text-3xl">
              L&rsquo;arborescence, les frontières et les générateurs, déjà en place.
            </h3>
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <a href={NPM_CLI_URL} target="_blank" rel="noreferrer" className="underline">
                create-maedow-arch-app
              </a>
              <a href={NPM_ESLINT_URL} target="_blank" rel="noreferrer" className="underline">
                eslint-config-maedow-arch
              </a>
            </div>
          </div>

          <div className="w-full shrink-0 md:w-96">
            <CopyCommand command="npx create-maedow-arch-app mon-projet" tone="terminal" />
          </div>
        </div>
      </div>
    </section>
  );
}
