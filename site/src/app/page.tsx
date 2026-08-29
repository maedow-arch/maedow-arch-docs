import Link from 'next/link';
import { ArrowRight, BookOpen, Layers, ShieldCheck, Cpu, Terminal } from 'lucide-react';
import { GithubIcon } from '@/components/GithubIcon';
import { CopyCommand } from '@/components/CopyCommand';
import { Logo } from '@/components/Logo';
import { Footer } from '@/components/Footer';
import { REPO_URL } from '@/lib/links';

const PILLARS = [
  {
    icon: Layers,
    title: 'Zéro Modèle dans le JSX',
    body: 'Les types du domaine et la logique métier vivent en TypeScript pur, loin de la couche de rendu — donc testables sans monter d’arbre React.',
  },
  {
    icon: Cpu,
    title: 'Agnostique Auth & DB',
    body: 'Ports & Adapters, introduits au bon moment : la Règle de Lazy Abstraction interdit l’indirection tant qu’une deuxième implémentation n’existe pas.',
  },
  {
    icon: ShieldCheck,
    title: 'Frontières outillées',
    body: 'Le flux app → features → core → lib est vérifié par ESLint à chaque commit. L’architecture ne dépend pas de la mémoire de l’équipe.',
  },
];

const CHAPTERS = [
  {
    href: '/docs/architecture',
    title: 'Blueprint & 4 Couches',
    body: 'La structure en couches, l’agnosticisme de l’infrastructure, les frontières et les modes Light / Full.',
  },
  {
    href: '/docs/models',
    title: 'Modélisation & Séparation du JSX',
    body: 'La typologie des 5 formes de données, du modèle de persistance aux props de composant.',
  },
  {
    href: '/docs/conventions',
    title: 'Conventions & Standards',
    body: 'TypeScript strict, Result Pattern et ses helpers, sécurité et scaffolding.',
  },
];

export default function HomePage() {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-fd-border bg-fd-background/80 backdrop-blur">
        <nav className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-fd-foreground hover:opacity-80 transition-opacity">
            <Logo />
          </Link>
          <div className="flex items-center gap-1">
            <Link
              href="/docs"
              className="px-3 py-1.5 rounded-md text-sm text-fd-muted-foreground hover:text-fd-foreground hover:bg-fd-accent transition-colors"
            >
              Documentation
            </Link>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="Dépôt GitHub"
              className="p-2 rounded-md text-fd-muted-foreground hover:text-fd-foreground hover:bg-fd-accent transition-colors"
            >
              <GithubIcon className="w-4 h-4" />
            </a>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            className="absolute inset-0 maedow-dots maedow-dots-fade opacity-60 pointer-events-none"
            aria-hidden
          />
          <div className="relative max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-fd-primary/10 text-fd-primary mb-8 border border-fd-primary/20">
              <span className="w-1.5 h-1.5 rounded-full bg-fd-primary" />
              Standard ouvert — licence MIT
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-fd-foreground mb-6 text-balance">
              Une architecture qui <span className="text-fd-primary">tient</span> dans le temps
            </h1>

            <p className="text-lg text-fd-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed text-pretty">
              Maedow Arch sépare strictement le domaine métier de l’interface et garde votre
              infrastructure interchangeable. Les frontières ne sont pas une convention d’équipe :
              elles sont vérifiées par le linter.
            </p>

            <div className="max-w-xl mx-auto mb-6">
              <CopyCommand command="npx create-maedow-arch-app mon-projet" />
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-fd-primary text-fd-primary-foreground font-semibold hover:opacity-90 transition-opacity text-sm"
              >
                <BookOpen className="w-4 h-4" />
                Lire la documentation
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href={REPO_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-fd-secondary text-fd-secondary-foreground font-semibold hover:bg-fd-accent transition-colors text-sm border border-fd-border"
              >
                <GithubIcon className="w-4 h-4" />
                GitHub
              </a>
            </div>
          </div>
        </section>

        {/* Les trois piliers */}
        <section className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PILLARS.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="p-6 rounded-xl border border-fd-border bg-fd-card/50 text-left"
              >
                <div className="w-9 h-9 rounded-lg bg-fd-primary/10 flex items-center justify-center text-fd-primary mb-4">
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <h2 className="text-base font-bold text-fd-foreground mb-2">{title}</h2>
                <p className="text-sm text-fd-muted-foreground leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Démarrage détaillé */}
        <section className="max-w-6xl mx-auto px-6 py-16 border-t border-fd-border">
          <div className="flex items-center gap-2 mb-2">
            <Terminal className="w-4 h-4 text-fd-primary" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-fd-muted-foreground">
              Démarrage
            </h2>
          </div>
          <p className="text-fd-muted-foreground text-sm mb-8 max-w-2xl">
            Le projet généré porte déjà les quatre couches, le Result Pattern et ses helpers, et les
            générateurs de domaine et de feature.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-6 rounded-xl border border-fd-border bg-fd-card/50">
              <h3 className="text-sm font-bold text-fd-foreground mb-3">
                Générer domaines et features
              </h3>
              <p className="text-sm text-fd-muted-foreground mb-4">
                L’arborescence conforme, sans boilerplate à recopier.
              </p>
              <CopyCommand command="npm run generate:domain billing" compact />
              <div className="h-2" />
              <CopyCommand command="npm run generate:feature checkout" compact />
            </div>

            <div className="p-6 rounded-xl border border-fd-border bg-fd-card/50">
              <h3 className="text-sm font-bold text-fd-foreground mb-3">
                Frontières vérifiées au lint
              </h3>
              <p className="text-sm text-fd-muted-foreground mb-4">
                Une violation du flux de dépendance fait échouer le lint, avec le motif exact.
              </p>
              <CopyCommand command="npm run lint" compact />
              <p className="mt-4 px-3 py-2 rounded-md bg-fd-muted/40 border border-fd-border text-xs font-mono text-fd-muted-foreground leading-relaxed">
                Maedow Arch : core ne peut pas importer components.
              </p>
            </div>
          </div>
        </section>

        {/* Chapitres */}
        <section className="max-w-6xl mx-auto px-6 py-16 border-t border-fd-border">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-fd-muted-foreground mb-8">
            Explorer le corpus
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {CHAPTERS.map((chapter) => (
              <Link
                key={chapter.href}
                href={chapter.href}
                className="group p-6 rounded-xl border border-fd-border bg-fd-card/50 hover:border-fd-primary/40 hover:bg-fd-accent/40 transition-colors"
              >
                <h3 className="text-base font-bold text-fd-foreground mb-2 flex items-center gap-2">
                  {chapter.title}
                  <ArrowRight className="w-4 h-4 text-fd-muted-foreground group-hover:text-fd-primary group-hover:translate-x-0.5 transition-all" />
                </h3>
                <p className="text-sm text-fd-muted-foreground leading-relaxed">{chapter.body}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
