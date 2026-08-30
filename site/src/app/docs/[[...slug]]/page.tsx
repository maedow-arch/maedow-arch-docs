import { source } from '@/lib/source';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from 'fumadocs-ui/page';
import { Cards, Card } from 'fumadocs-ui/components/card';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { REPO_URL } from '@/lib/links';

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <DocsPage
      toc={page.data.toc ?? []}
      full={page.data.full}
      tableOfContent={{ style: 'clerk', single: false }}
      editOnGithub={{
        owner: 'maedow-arch',
        repo: 'maedow-arch-docs',
        sha: 'main',
        // Les pages sont dérivées des documents de la racine du dépôt :
        // on renvoie vers la source, pas vers le .mdx généré.
        // `page.path` est relatif au dossier de contenu, par exemple
        // `architecture.mdx`.
        path: page.path === 'index.mdx' ? 'README.md' : page.path.replace(/\.mdx$/, '.md'),
      }}
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        {/* Les composants par défaut portent la coloration syntaxique des blocs
            de code et les callouts : sans eux, le MDX retombe sur du HTML brut. */}
        <MDX components={{ ...defaultMdxComponents, Cards, Card }} />
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
      type: 'article',
    },
  };
}
