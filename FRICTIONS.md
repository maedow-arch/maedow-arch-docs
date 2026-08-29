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

---

## F-007 — npm refuse désormais toute publication sans 2FA

**Symptôme.** `npm publish --access public` sur un compte fraîchement créé : `403 Forbidden`.

```
Two-factor authentication or granular access token with bypass 2fa
enabled is required to publish packages.
```

**Cause.** npm a durci sa politique : la publication directe exige la 2FA sur le compte, ou un *granular access token* explicitement autorisé à la contourner. Un compte tout neuf a la 2FA désactivée par défaut — donc publier est impossible tant qu'on ne l'a pas activée.

Une fois la 2FA activée, le refus change de nature : `EOTP`, un code à usage unique est demandé à chaque publication.

**Ce qu'on en a fait.** 2FA activée en `auth-and-writes`, puis publication.

**La leçon.** Créer le compte npm ne suffit pas à pouvoir publier. Pour un projet qui vise une publication automatisée (CI), il faut prévoir dès le départ un *granular access token* limité aux paquets concernés — c'est la seule voie non interactive qui reste ouverte.

---

## F-008 — Vercel ne voit pas un dépôt fraîchement transféré

**Symptôme.** Création du projet Vercel refusée sur `maedow-arch/maedow-arch-docs` :

```
400 — To link a GitHub repository, you need to install the GitHub
integration first.
```

**Cause.** L'App GitHub de Vercel était installée sur le compte personnel, pas sur l'organisation `maedow-arch` créée le jour même. Une App GitHub s'installe par compte ou par organisation : transférer un dépôt ne transfère pas les autorisations.

**Ce qu'on en a fait.** Installation de l'App sur l'organisation, puis création du projet — Root Directory `site/`, déploiement continu sur `main`.

**La leçon.** Après un transfert de dépôt vers une organisation, toutes les intégrations tierces sont à réautoriser. Le dépôt est identique, ses autorisations ne le sont pas.
