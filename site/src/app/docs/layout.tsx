import { DocsLayout } from "fumadocs-ui/layouts/notebook";
import type { ReactNode } from "react";
import { BookOpen, Layers, ListChecks, ScrollText, Shapes } from "lucide-react";
import { source } from "@/lib/source";
import { Logo } from "@/components/Logo";
import { REPO_URL } from "@/lib/links";
import { ModeSwitcher } from "@/components/ModeSwitcher";

/*
 * Les onglets de l'en-tête reprennent les cinq entrées réelles du corpus, et
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
  {
    title: "Règles",
    url: "/docs/rules",
    icon: <ListChecks className="size-4" />,
    description: "Les neuf règles, vérifiées par la machine ou tenues par l'équipe",
  },
];

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
      }}
    >
      {children}
    </DocsLayout>
  );
}
