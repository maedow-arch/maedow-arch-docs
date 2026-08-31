import { DocsLayout } from "fumadocs-ui/layouts/notebook";
import type { ReactNode } from "react";
import { ArrowRight, BookOpen, Layers, ScrollText, Shapes } from "lucide-react";
import { source } from "@/lib/source";
import { Logo } from "@/components/Logo";
import { REPO_URL } from "@/lib/links";
import { ModeSwitcher } from "@/components/ModeSwitcher";

/*
 * Les onglets de l'en-tête reprennent les quatre entrées réelles du corpus, et
 * rien de plus. Une rubrique sans page derrière serait une promesse en l'air,
 * c'est le défaut le plus courant des barres de navigation copiées d'une
 * maquette.
 */
const TABS = [
  {
    title: "Introduction",
    url: "/docs",
    icon: <BookOpen className="size-4" />,
    description: "Pourquoi ce standard existe, et par où commencer",
  },
  {
    title: "Architecture",
    url: "/docs/architecture",
    icon: <Layers className="size-4" />,
    description: "Les quatre couches et le flux de dépendance",
  },
  {
    title: "Modèles",
    url: "/docs/models",
    icon: <Shapes className="size-4" />,
    description: "Zéro modèle dans le JSX, et les cinq formes de données",
  },
  {
    title: "Conventions",
    url: "/docs/conventions",
    icon: <ScrollText className="size-4" />,
    description: "TypeScript strict, Result Pattern, sécurité",
  },
];

/*
 * Le seul aplat magenta plein de la barre latérale. La maquette place ici un
 * appel unique, et c'est ce qui lui donne sa force : un second bouton de cette
 * intensité annulerait le premier.
 */
function SidebarCta() {
  return (
    <a
      href={`${REPO_URL}/blob/main/CHANGELOG.md`}
      target="_blank"
      rel="noreferrer"
      className="group flex items-center gap-3 rounded-xl bg-fd-primary px-4 py-3 text-fd-primary-foreground transition-opacity hover:opacity-90"
    >
      <span className="size-2 shrink-0 rounded-full bg-current opacity-70" />
      <span className="flex-1 text-sm font-semibold">Voir le journal</span>
      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
    </a>
  );
}

export default function RootDocsLayout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={source.pageTree}
      /*
       * `notebook` place la navigation en pleine largeur et pose le contenu dans
       * un panneau encadré, ce que la maquette de référence fait aussi. Reprendre
       * ce layout plutôt que de le réécrire garde le site sur le chemin de mise à
       * jour de Fumadocs.
       */
      tabMode="navbar"
      tabs={TABS}
      nav={{ title: <Logo />, url: "/", mode: "top" }}
      githubUrl={REPO_URL}
      sidebar={{
        defaultOpenLevel: 1,
        /* Le profil de lecture ouvre la barre latérale : c'est le premier
           choix à faire, il conditionne ce que les pages montreront. */
        banner: <ModeSwitcher />,
        footer: <SidebarCta />,
      }}
    >
      {children}
    </DocsLayout>
  );
}
