# Site de documentation de Maedow Arch

Site officiel de [Maedow Arch](https://github.com/maedow-arch/maedow-arch-docs), construit avec **Next.js 15**, **Tailwind CSS 4** et **Fumadocs**.

## Lancer en local

```bash
npm install
npm run dev
```

Ouvrir http://localhost:3000.

## Le contenu ne vit pas ici

Les pages de documentation sont **dérivées** des documents de référence à la racine du dépôt :

```
../architecture.md   →  content/docs/architecture.mdx
../models.md         →  content/docs/models.mdx
../conventions.md    →  content/docs/conventions.mdx
```

`scripts/sync-docs.mjs` fait la conversion (retrait du H1, injection du frontmatter) et tourne automatiquement en `predev` et `prebuild`.

> **Ne modifiez jamais `content/docs/*.mdx` à la main** : ces fichiers sont regénérés à chaque build. Éditez les `.md` de la racine. Seul `content/docs/index.mdx` est écrit à la main : c'est la page d'accueil de la documentation, pas le miroir d'un document.

Une copie manuelle a déjà divergé une fois : trois des quatre pages avaient perdu entre 23 % et 45 % de leur contenu sans que rien ne le signale. D'où ce script.

## Versions figées

`fumadocs-core`, `fumadocs-ui` et `fumadocs-mdx` sont épinglés à des versions exactes. Sous plages `^`, `fumadocs-mdx` avait dérivé jusqu'à renvoyer `files: () => [...]` là où le `loader()` de `fumadocs-core` attendait un tableau, et le site ne buildait plus. Voir le commentaire dans [`src/lib/source.ts`](src/lib/source.ts).

## Déploiement Vercel

- **Root Directory** : `site/`
- Framework : Next.js (détecté automatiquement)
- Aucune variable d'environnement requise

Le dépôt étant un monorepo, `outputFileTracingRoot` est fixé dans [`next.config.mjs`](next.config.mjs) pour que Next ne remonte pas au lockfile de la racine.
