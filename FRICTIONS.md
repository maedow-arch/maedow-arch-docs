# Journal de frictions

Ce qui a résisté, en conditions réelles. Chaque entrée note le symptôme, la cause et ce qu'on en a fait. Une friction résolue devient une entrée du [CHANGELOG](./CHANGELOG.md).

La règle : on écrit ici **à chaud**, pendant qu'on bute. Une friction reconstruite après coup perd ce qui la rendait instructive.

---

## F-001 — Une config de frontières qui passe au vert sans rien vérifier

**Symptôme.** `npm run lint` vert sur un projet où `core/` importait une feature.

**Cause.** Deux défauts cumulés dans `eslint-config-maedow-arch` :

1. Les patterns ciblaient `app/**`, `core/**`… alors que le template génère dans `src/`.
2. Sans résolveur TypeScript, `eslint-plugin-boundaries` classe tout import `.ts`/`.tsx` en « unknown » — et **une dépendance inconnue ne déclenche aucune règle**.

**Ce qu'on en a fait.** Patterns non ancrés (`core` couvre `core/` et `src/core/`), et `eslint-import-resolver-typescript` promu en peerDependency **obligatoire**, documenté comme tel dans le README du package.

**La leçon, et elle vaut au-delà d'ESLint.** Un lint vert ne prouve rien tant qu'on n'a pas vu la règle échouer. D'où `npm run test:boundaries`, qui vérifie surtout la fixture `invalid/` : cinq imports interdits doivent produire cinq erreurs. Le test positif seul aurait laissé passer ce bug.

---

## F-002 — `features/_shared` classé comme une feature ordinaire

**Symptôme.** La règle interdisant à `features/_shared/` d'importer une feature ne se déclenchait jamais.

**Cause.** L'élément `feature` (`features/*`) était déclaré **avant** `shared-feature` (`features/_shared`). Le premier pattern qui matche gagne : `features/_shared` tombait dans `feature`, et `shared-feature` ne matchait plus rien.

**Ce qu'on en a fait.** Inversion de l'ordre de déclaration, et un commentaire en tête du fichier — l'ordre est ici une contrainte de correction, pas de style.

---

## F-003 — Un projet fraîchement scaffoldé ne démarrait pas

**Symptôme.** `npx create-maedow-arch-app demo && npm install && npm run dev` → échec.

**Cause.** Le `package.json.template` déclarait les scripts `next dev` / `next build` / `eslint .` sans avoir `next`, `react`, `react-dom` ni `eslint` en dépendances. `src/app/` ne contenait qu'un `.gitkeep` — pas de `layout.tsx`, donc rien à servir. Et `zod` était en `devDependencies` alors que le code généré par `scaffold-domain.mjs` l'importe à l'exécution.

**Ce qu'on en a fait.** Dépendances complétées, `zod` passé en `dependencies`, et le template porte désormais `layout.tsx`, `page.tsx`, `eslint.config.mjs`, `next.config.mjs`, `vitest.config.ts` et un `.gitignore`.

**La leçon.** Un générateur ne se teste pas en lisant son template. Il se teste en le lançant, puis en lançant ce qu'il produit.

---

## F-004 — npm supprime les `.gitignore` des packages publiés

**Symptôme.** Le `.gitignore` du template aurait disparu du tarball publié — invisible en test local, où l'on exécute la CLI depuis le dépôt.

**Cause.** npm exclut d'office les fichiers nommés `.gitignore` des packages.

**Ce qu'on en a fait.** Le template le transporte sous le nom `_gitignore` ; la CLI le renomme à la génération. Vérifié par `npm pack --dry-run`, qui liste le contenu réel du tarball.

**La leçon.** Tester depuis le dépôt et tester depuis le paquet publié ne sont pas le même test.

---

## F-005 — Une duplication manuelle qui avait déjà divergé

**Symptôme.** Le site servait une version tronquée de la documentation : `architecture` avait perdu 23 % de son contenu, `models` 38 %, `conventions` 45 % — et affichait encore l'ancienne marque. Rien ne le signalait.

**Cause.** Les `.mdx` du site étaient une copie manuelle des `.md` de référence, faite une fois et jamais resynchronisée.

**Ce qu'on en a fait.** `site/scripts/sync-docs.mjs` dérive les pages des documents de la racine, en `predev` et `prebuild`. Le troisième exemplaire (`docs/`) a été supprimé.

**La leçon.** Une source de vérité dupliquée à la main n'est pas une source de vérité. Elle diverge, et le pire est qu'elle diverge en silence.

---

## F-006 — Deux paquets d'un même framework qui dérivent sous `^`

**Symptôme.** `next build` échouait sur `TypeError: a.map is not a function`, dans une trace minifiée pointant vers la route de recherche. Piste suivie puis abandonnée : le schéma Orama. Deux contournements écrits pour rien.

**Cause.** `fumadocs-mdx@11.10.1` renvoie `{ files: () => [...] }` — une fonction — quand le `loader()` de `fumadocs-core@15.8.5` fait `files.map(...)`. Les plages `^` avaient laissé les deux paquets dériver l'un de l'autre. L'erreur de recherche n'était qu'un symptôme aval : l'arbre de pages étant vide, les breadcrumbs valaient `undefined`.

**Ce qu'on en a fait.** Un raccord explicite et commenté dans `site/src/lib/source.ts`, et les trois paquets `fumadocs-*` **épinglés à des versions exactes**.

**La leçon.** `npm run build` n'avait jamais été lancé sur ce projet : seul `next dev` l'avait été, et il masquait l'erreur sur les routes non visitées. Un projet dont on n'a jamais produit le build de production n'est pas un projet qui marche.

**Reste à faire.** Migrer vers `fumadocs-core`/`ui` 16.x + `fumadocs-mdx` 15.x, où `loader()` accepte nativement la forme fonction — et retirer le raccord.
