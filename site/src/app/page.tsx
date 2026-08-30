import Link from "next/link";
import { ArrowRight, Cpu, Layers, ScrollText, ShieldCheck, Shapes, BookOpen } from "lucide-react";
import { FullSearchTrigger } from "fumadocs-ui/layouts/shared/slots/search-trigger";
import { ThemeSwitch } from "fumadocs-ui/layouts/shared/slots/theme-switch";
import { GithubIcon } from "@/components/GithubIcon";
import { CopyCommand } from "@/components/CopyCommand";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";
import { LayerFlow } from "@/components/LayerFlow";
import { REPO_URL, NPM_CLI_URL, NPM_ESLINT_URL } from "@/lib/links";

/*
 * Les trois documents du corpus. Ils ouvrent la page parce qu'ils sont ce que
 * le visiteur est venu chercher : le standard lui-même, pas sa présentation.
 */
const CHAPTERS = [
  {
    href: "/docs/architecture",
    icon: Layers,
    title: "Blueprint & 4 Couches",
    body: "La structure en couches, l’agnosticisme de l’infrastructure, les frontières et les modes Light et Full.",
  },
  {
    href: "/docs/models",
    icon: Shapes,
    title: "Modélisation & Séparation du JSX",
    body: "La typologie des cinq formes de données, du modèle de persistance aux props de composant.",
  },
  {
    href: "/docs/conventions",
    icon: ScrollText,
    title: "Conventions & Standards",
    body: "TypeScript strict, Result Pattern et ses helpers, sécurité et scaffolding.",
  },
];

const PILLARS = [
  {
    icon: Shapes,
    title: "Zéro modèle dans le JSX",
    body: "Les types du domaine et la logique métier vivent en TypeScript pur, loin de la couche de rendu, donc testables sans monter d’arbre React.",
  },
  {
    icon: Cpu,
    title: "Agnostique d’auth et de base",
    body: "Ports et Adapters, introduits au bon moment : la Règle de Lazy Abstraction interdit l’indirection tant qu’une deuxième implémentation n’existe pas.",
  },
  {
    icon: ShieldCheck,
    title: "Frontières outillées",
    body: "Le flux de dépendance est vérifié par ESLint à chaque commit. L’architecture ne repose pas sur la mémoire de l’équipe.",
  },
];

/* Quatre entrées vers ce que les lecteurs cherchent en premier. */
const SHORTCUTS = [
  { label: "Result Pattern", href: "/docs/conventions" },
  { label: "Les 4 couches", href: "/docs/architecture" },
  { label: "Mode Light ou Full", href: "/docs/architecture" },
  { label: "Générateurs", href: "/docs/conventions" },
];

export default function HomePage() {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-fd-border bg-fd-background/80 backdrop-blur">
        <nav className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-6">
          <Link href="/" className="text-fd-foreground transition-opacity hover:opacity-80">
            <Logo />
          </Link>

          <div className="ml-auto flex items-center gap-1">
            <ThemeSwitch mode="light-dark" />
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="Dépôt GitHub"
              className="rounded-md p-2 text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-foreground"
            >
              <GithubIcon className="size-4" />
            </a>
            <Link
              href="/docs"
              className="rounded-lg bg-fd-primary px-4 py-2 text-sm font-semibold text-fd-primary-foreground transition-opacity hover:opacity-90"
            >
              Documentation
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            className="maedow-dots maedow-dots-fade pointer-events-none absolute inset-0 opacity-70"
            aria-hidden
          />
          <div className="relative mx-auto max-w-4xl px-6 pt-20 pb-14 text-center">
            {/* Le nom, posé en deux étages. Le « Arch » du logo se déplie ici
                en « Architecture » : la page d'accueil est le seul endroit où
                la marque a la place de s'écrire en entier. Le second étage
                prend la couleur d'accent, comme dans le logo. */}
            <h1 className="font-heading mb-6 text-6xl leading-[0.92] font-extrabold tracking-[-0.04em] text-fd-foreground sm:text-7xl lg:text-8xl">
              Maedow
              <br />
              <span className="text-fd-primary">Architecture</span>
            </h1>

            <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-pretty text-fd-muted-foreground">
              Le domaine métier reste séparé de l’interface et l’infrastructure interchangeable. Les
              frontières ne dépendent pas de la mémoire de l’équipe : le linter les vérifie.
            </p>

            {/* La commande qui crée un projet, là où le visiteur convaincu la
                cherche : sous la promesse, avant la recherche. */}
            <div className="mx-auto mb-8 max-w-xl">
              <CopyCommand command="npx create-maedow-arch-app mon-projet" tone="terminal" />
            </div>

            <div className="mx-auto mb-6 max-w-2xl">
              <FullSearchTrigger className="w-full rounded-xl border border-fd-primary/25 bg-fd-card px-4 py-4 text-base" />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
              <span className="text-fd-muted-foreground">Aller droit au but :</span>
              {SHORTCUTS.map((shortcut) => (
                <Link
                  key={shortcut.label}
                  href={shortcut.href}
                  className="rounded-lg border border-fd-primary/25 px-3 py-1.5 font-medium text-fd-primary transition-colors hover:bg-fd-primary/10"
                >
                  {shortcut.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* La règle qui distingue ce standard, montrée plutôt qu'énoncée. */}
        <section className="mx-auto max-w-6xl px-6 pb-20">
          <LayerFlow />
        </section>

        {/* Le corpus */}
        <section className="mx-auto max-w-6xl border-t border-fd-border px-6 py-20">
          <h2 className="font-heading mb-2 text-3xl font-bold tracking-tight text-fd-foreground">
            Explorer le corpus
          </h2>
          <p className="mb-10 text-fd-muted-foreground">
            Trois documents, une seule source de vérité. Le site en est dérivé, jamais l’inverse.
          </p>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {CHAPTERS.map(({ href, icon: Icon, title, body }) => (
              <Link
                key={href}
                href={href}
                className="group rounded-2xl border border-fd-border bg-fd-card p-7 transition-colors hover:border-fd-primary/40"
              >
                <span className="mb-6 flex size-11 items-center justify-center rounded-xl bg-fd-primary/10 text-fd-primary">
                  <Icon className="size-5" />
                </span>
                <h3 className="font-heading mb-2 flex items-center gap-2 text-lg font-bold text-fd-foreground">
                  {title}
                  <ArrowRight className="size-4 text-fd-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-fd-primary" />
                </h3>
                <p className="text-sm leading-relaxed text-fd-muted-foreground">{body}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Les garanties */}
        <section className="mx-auto max-w-6xl border-t border-fd-border px-6 py-20">
          <h2 className="font-heading mb-2 text-3xl font-bold tracking-tight text-fd-foreground">
            Ce que le standard garantit
          </h2>
          <p className="mb-10 text-fd-muted-foreground">
            Trois règles qui survivent au départ de celui qui les a écrites.
          </p>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {PILLARS.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-2xl border border-fd-border bg-fd-card p-7">
                <span className="mb-6 flex size-11 items-center justify-center rounded-xl bg-fd-primary/10 text-fd-primary">
                  <Icon className="size-5" />
                </span>
                <h3 className="font-heading mb-2 text-lg font-bold text-fd-foreground">{title}</h3>
                <p className="text-sm leading-relaxed text-fd-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* L'outillage */}
        <section className="mx-auto max-w-6xl border-t border-fd-border px-6 py-20">
          <h2 className="font-heading mb-2 text-3xl font-bold tracking-tight text-fd-foreground">
            Outillage officiel
          </h2>
          <p className="mb-10 text-fd-muted-foreground">
            Le projet généré porte déjà les quatre couches, le Result Pattern et ses helpers, et les
            générateurs de domaine et de feature.
          </p>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-fd-border bg-fd-card p-7">
              <h3 className="font-heading mb-2 text-lg font-bold text-fd-foreground">
                Générer un projet conforme
              </h3>
              <p className="mb-5 text-sm leading-relaxed text-fd-muted-foreground">
                Une commande, et l’arborescence est en place. Aucun boilerplate à recopier.
              </p>
              <CopyCommand command="npx create-maedow-arch-app mon-projet" />
              <div className="mt-5 flex flex-wrap gap-3 text-sm">
                <a
                  href={NPM_CLI_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-fd-primary hover:underline"
                >
                  create-maedow-arch-app
                </a>
              </div>
            </div>

            <div className="rounded-2xl border border-fd-border bg-fd-card p-7">
              <h3 className="font-heading mb-2 text-lg font-bold text-fd-foreground">
                Faire échouer le lint sur une violation
              </h3>
              <p className="mb-5 text-sm leading-relaxed text-fd-muted-foreground">
                Un import qui remonte le flux arrête la vérification, avec le motif exact.
              </p>
              <CopyCommand command="npm run lint" compact />
              <p className="mt-4 rounded-lg border border-fd-error/30 bg-fd-error/10 px-3 py-2 font-mono text-xs leading-relaxed text-fd-foreground">
                Maedow Arch : core ne peut pas importer components.
              </p>
              <div className="mt-5 flex flex-wrap gap-3 text-sm">
                <a
                  href={NPM_ESLINT_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-fd-primary hover:underline"
                >
                  eslint-config-maedow-arch
                </a>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 rounded-lg bg-fd-primary px-5 py-2.5 text-sm font-semibold text-fd-primary-foreground transition-opacity hover:opacity-90"
            >
              <BookOpen className="size-4" />
              Lire la documentation
              <ArrowRight className="size-4" />
            </Link>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-fd-border bg-fd-secondary px-5 py-2.5 text-sm font-semibold text-fd-secondary-foreground transition-colors hover:bg-fd-accent"
            >
              <GithubIcon className="size-4" />
              GitHub
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
