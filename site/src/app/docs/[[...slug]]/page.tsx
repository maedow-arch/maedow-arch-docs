import { existsSync } from "node:fs";
import { join } from "node:path";
import { source } from "@/lib/source";
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/page";
import { Cards, Card } from "fumadocs-ui/components/card";
import { Tabs, Tab } from "fumadocs-ui/components/tabs";
import { Steps, Step } from "fumadocs-ui/components/steps";
import defaultMdxComponents from "fumadocs-ui/mdx";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { REPO_URL } from "@/lib/links";
import { ModeFull, ModeLight } from "@/components/ModeOnly";
import { ModeToc } from "@/components/ModeToc";
import { Mermaid } from "@/components/Mermaid";

/**
 * Où vit la source de chaque page, pour le lien « modifier sur GitHub ».
 *
 * Le corpus de la racine est la source de quatre pages ; les trois autres ont
 * la leur ailleurs. Une table le dit, là où une transformation du nom de
 * fichier se trompait en silence : un lien mort ne casse aucun build.
 */
const SOURCES: Record<string, string> = {
  "index.mdx": "README.md",
  "adoption.mdx": "site/content/docs/adoption.mdx",
  "frictions.mdx": "FRICTIONS.md",
};

/**
 * Le chemin de la source, vérifié au build.
 *
 * Un lien mort ne casse rien : la page se construit, le bouton s'affiche, et le
 * 404 n'apparaît qu'au visiteur qui clique. Deux y ont vécu sans être vus, dont
 * un depuis la création de la page d'adoption.
 *
 * Cette vérification les fait échouer à la construction, là où on les corrige.
 */
function sourceDe(chemin: string): string {
  const relatif = SOURCES[chemin] ?? chemin.replace(/\.mdx$/, ".md");

  if (!existsSync(join(process.cwd(), "..", relatif))) {
    throw new Error(
      `Le lien « modifier sur GitHub » de ${chemin} pointe vers ${relatif}, qui n'existe pas ` +
        `dans le dépôt. Ajoutez sa source à SOURCES dans docs/[[...slug]]/page.tsx.`
    );
  }

  return relatif;
}

export default async function Page(props: { params: Promise<{ slug?: string[] }> }) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <DocsPage
      toc={page.data.toc ?? []}
      full={page.data.full}
      /* La liste native est neutralisée et remplacée par la nôtre : la sienne
         ne supporte pas qu'une entrée disparaisse selon le profil de lecture.
         Vidée de sa hauteur, elle abandonne son tracé d'elle-même. */
      tableOfContent={{
        style: "clerk",
        single: false,
        list: { className: "hidden" },
        footer: <ModeToc items={page.data.toc ?? []} />,
      }}
      tableOfContentPopover={{
        style: "clerk",
        list: { className: "hidden" },
        footer: <ModeToc items={page.data.toc ?? []} />,
      }}
      editOnGithub={{
        owner: "maedow-arch",
        repo: "maedow-arch-docs",
        sha: "main",
        // La source réelle de chaque page, et non une déduction.
        //
        // Le chemin était calculé en remplaçant `.mdx` par `.md`, ce qui marche
        // pour les quatre pages dérivées du corpus et casse pour les deux
        // autres : `FRICTIONS.md` porte des majuscules, et la page d'adoption
        // n'a pas de source à la racine puisqu'elle est écrite directement dans
        // le dossier de contenu. Les deux liens rendaient 404, sans que rien ne
        // le signale.
        path: sourceDe(page.path),
      }}
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        {/* Les composants par défaut portent la coloration syntaxique des blocs
            de code et les callouts : sans eux, le MDX retombe sur du HTML brut.
            Tabs et Steps sont ajoutés explicitement, Fumadocs ne les livre pas
            dans le jeu par défaut. */}
        {/* ModeFull et ModeLight marquent dans le corpus ce qui appartient à
            un seul profil de lecture. Le masquage lui-même est en CSS. */}
        <MDX
          components={{
            ...defaultMdxComponents,
            Cards,
            Card,
            Tabs,
            Tab,
            Steps,
            Step,
            ModeFull,
            ModeLight,
            Mermaid,
          }}
        />
      </DocsBody>
    </DocsPage>
  );
}

export function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      title: page.data.title,
      description: page.data.description,
      url: `${REPO_URL}`,
      type: "article",
    },
  };
}
