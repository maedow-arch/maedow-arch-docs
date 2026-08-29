# Changelog

Toutes les évolutions notables de Maedow Arch : le corpus documentaire, le site et l'outillage.

Le format suit [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/), et le versionnage suit [SemVer](https://semver.org/lang/fr/).

Les frictions à l'origine des corrections sont détaillées dans [FRICTIONS.md](./FRICTIONS.md).

## [0.1.0] : 2026-08-29

Première publication. `create-maedow-arch-app` et `eslint-config-maedow-arch` sont disponibles sur npm, et la documentation est en ligne sur https://maedow-arch-docs.vercel.app.

### Ajouté

**Corpus**

- **Règle de Lazy Abstraction** (`architecture.md` §4) : un `contract.ts` et ses adapters ne s'introduisent qu'à la deuxième implémentation réelle.
- **Règle de dégradation de `features/_shared/`** (`architecture.md` §5.1) : un garde-fou contre le fourre-tout.
- **Mode Light ou Mode Full** (`architecture.md` §9) : deux profils explicites, et une règle de bascule progressive.
- **Helpers du Result Pattern** (`conventions.md` §4.1) : `unwrapOr`, `mapResult` et `match`.

**Dépôt**

- Structure monorepo : le corpus à la racine, le site dans `site/`, les deux packages npm dans `packages/`.
- `LICENSE` (MIT), ce `CHANGELOG.md` et `FRICTIONS.md`.
- `npm run test:boundaries`, un test de non-régression des frontières qui repose sur une fixture valide et une fixture invalide de cinq imports interdits.
- Intégration continue en trois jobs : les frontières, le build du site, et un projet réellement scaffoldé mené jusqu'au build puis soumis à un import interdit.
- Gabarits d'issue et de pull request.

**Outillage**

- `create-maedow-arch-app` : le template porte désormais `layout.tsx`, `page.tsx`, `eslint.config.mjs`, `next.config.mjs`, `vitest.config.ts` et un `.gitignore`.
- `create-maedow-arch-app` : validation du nom de projet, et un `README.md` qui manquait alors que c'est la page affichée sur npmjs.com.
- `eslint-config-maedow-arch` : un message d'erreur explicite, `Maedow Arch : core ne peut pas importer components. Voir architecture.md §6.`

**Site**

- `site/scripts/sync-docs.mjs` dérive les pages depuis les `.md` de la racine, en `predev` et `prebuild`.
- Une section d'installation en page d'accueil, avec commandes copiables.
- Recherche, page 404, favicon, image OpenGraph et pied de page.

### Modifié

- Rebranding « Architecture Maedow » vers **Maedow Arch** sur l'ensemble du corpus, du site et de l'outillage.
- `eslint-config-maedow-arch` : `eslint-import-resolver-typescript` devient une peerDependency obligatoire, et `eslint-plugin-boundaries` passe à `>=7`.
- `create-maedow-arch-app` : `zod` passe de `devDependencies` à `dependencies`, puisque le code généré l'importe à l'exécution.
- Les paquets `fumadocs-*` du site sont épinglés à des versions exactes.
- Les `.mdx` générés sortent du versionnement, car ils sont reconstruits à chaque build.

### Corrigé

- **Les frontières ESLint ne se déclenchaient jamais** (F-001). Les patterns ciblaient la racine alors que le template génère dans `src/`, et sans résolveur TypeScript toute dépendance `.ts` ou `.tsx` était classée « unknown ». Le lint passait au vert sans rien vérifier.
- **`features/_shared` était classé comme une feature ordinaire** (F-002) : l'ordre de déclaration des éléments décide, et le premier pattern qui matche l'emporte.
- **Un projet fraîchement scaffoldé ne démarrait pas** (F-003) : `next`, `react` et `eslint` manquaient au template, et `src/app/` était vide.
- **Le `.gitignore` du template aurait disparu du paquet publié** (F-004), npm excluant ce nom de fichier. Il voyage désormais sous `_gitignore`.
- **Le site servait une documentation tronquée** (F-005) : les `.mdx` copiés à la main avaient perdu de 23 % à 45 % de leur contenu et portaient encore l'ancienne marque.
- **Le site ne buildait pas** (F-006) : `fumadocs-mdx` et `fumadocs-core` avaient dérivé sous leurs plages `^` jusqu'à des formes de `source` incompatibles.
- `architecture.md` : une ancre de conversion parasite sous le titre §9, et un renvoi vers `conventions.md` §7 au lieu de §4.1.
- Les quatre références à l'ancien dépôt `Jean-Marc18/maedow-docs` pointent vers `maedow-arch/maedow-arch-docs`.
