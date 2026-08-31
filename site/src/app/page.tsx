import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FullSearchTrigger } from "fumadocs-ui/layouts/shared/slots/search-trigger";
import { ThemeSwitch } from "fumadocs-ui/layouts/shared/slots/theme-switch";
import { GithubIcon } from "@/components/GithubIcon";
import { CopyCommand } from "@/components/CopyCommand";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";
import { TechMarquee } from "@/components/TechMarquee";
import { BentoGrid } from "@/components/BentoGrid";
import { REPO_URL } from "@/lib/links";

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
          <Link
            href="/"
            aria-label="Maedow Arch, accueil"
            className="text-fd-foreground transition-opacity hover:opacity-80"
          >
            {/* Sous 400 pixels, quatre éléments à largeur fixe ne tiennent pas :
                la marque suffit à identifier le site, le libellé revient dès
                qu'il y a la place. */}
            <Logo className="max-[400px]:[&>span:last-child]:hidden" />
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
              className="rounded-lg bg-fd-primary px-3 py-2 text-sm font-semibold text-fd-primary-foreground transition-opacity hover:opacity-90 sm:px-4"
            >
              <span className="sm:hidden">Docs</span>
              <span className="max-sm:hidden">Documentation</span>
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

        <TechMarquee />

        <BentoGrid />
      </main>

      <Footer />
    </>
  );
}
