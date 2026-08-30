# Journal de frictions

Ce qui a résisté, en conditions réelles. Chaque entrée note le symptôme, la cause et ce qu'on en a fait. Une friction résolue devient une entrée du [CHANGELOG](./CHANGELOG.md).

La règle : on écrit ici à chaud, pendant qu'on bute. Une friction reconstruite après coup perd ce qui la rendait instructive.

---

## F-001 : une config de frontières qui passe au vert sans rien vérifier

**Symptôme.** `npm run lint` restait vert sur un projet où `core/` importait une feature.

**Cause.** Deux défauts cumulés dans `eslint-config-maedow-arch` :

1. Les patterns ciblaient `app/**` et `core/**` alors que le template génère dans `src/`.
2. Sans résolveur TypeScript, `eslint-plugin-boundaries` classe tout import `.ts` ou `.tsx` en « unknown ». Or une dépendance inconnue ne déclenche aucune règle.

**Ce qu'on en a fait.** Les patterns ne sont plus ancrés à la racine : `core` couvre aussi bien `core/` que `src/core/`. Et `eslint-import-resolver-typescript` devient une peerDependency obligatoire, signalée comme telle dès le README du package.

**La leçon, et elle vaut au-delà d'ESLint.** Un lint vert ne prouve rien tant qu'on n'a pas vu la règle échouer. D'où `npm run test:boundaries`, dont l'essentiel porte sur la fixture `invalid/` : cinq imports interdits doivent produire cinq erreurs. Le test positif seul aurait laissé passer ce défaut.

---

## F-002 : `features/_shared` classé comme une feature ordinaire

**Symptôme.** La règle interdisant à `features/_shared/` d'importer une feature ne se déclenchait jamais.

**Cause.** L'élément `feature` (`features/*`) était déclaré avant `shared-feature` (`features/_shared`). Le premier pattern qui matche l'emporte : `features/_shared` tombait donc dans `feature`, et `shared-feature` ne matchait plus rien.

**Ce qu'on en a fait.** L'ordre de déclaration a été inversé, avec un commentaire en tête du fichier. Cet ordre est une contrainte de correction, pas une préférence de style.

---

## F-003 : un projet fraîchement scaffoldé ne démarrait pas

**Symptôme.** `npx create-maedow-arch-app demo && npm install && npm run dev` échouait.

**Cause.** Le `package.json.template` déclarait les scripts `next dev`, `next build` et `eslint .` sans avoir `next`, `react`, `react-dom` ni `eslint` en dépendances. Le dossier `src/app/` ne contenait qu'un `.gitkeep`, donc aucun `layout.tsx` et rien à servir. Enfin `zod` figurait en `devDependencies` alors que le code produit par `scaffold-domain.mjs` l'importe à l'exécution.

**Ce qu'on en a fait.** Les dépendances ont été complétées, `zod` est passé en `dependencies`, et le template porte désormais `layout.tsx`, `page.tsx`, `eslint.config.mjs`, `next.config.mjs`, `vitest.config.ts` ainsi qu'un `.gitignore`.

**La leçon.** Un générateur ne se teste pas en lisant son template. Il se teste en le lançant, puis en lançant ce qu'il produit.

---

## F-004 : npm supprime les `.gitignore` des packages publiés

**Symptôme.** Le `.gitignore` du template aurait disparu du tarball publié. Le défaut restait invisible en test local, puisqu'on y exécute la CLI depuis le dépôt.

**Cause.** npm exclut d'office les fichiers nommés `.gitignore` des packages.

**Ce qu'on en a fait.** Le template le transporte sous le nom `_gitignore`, et la CLI le renomme à la génération. Contrôlé par `npm pack --dry-run`, qui liste le contenu réel du tarball.

**La leçon.** Tester depuis le dépôt et tester depuis le paquet publié sont deux tests différents.

---

## F-005 : une duplication manuelle qui avait déjà divergé

**Symptôme.** Le site servait une version tronquée de la documentation. La page `architecture` avait perdu 23 % de son contenu, `models` 38 %, `conventions` 45 %, et toutes affichaient encore l'ancienne marque. Rien ne le signalait.

**Cause.** Les `.mdx` du site étaient une copie manuelle des `.md` de référence, faite une fois puis jamais resynchronisée.

**Ce qu'on en a fait.** `site/scripts/sync-docs.mjs` dérive les pages depuis les documents de la racine, en `predev` et `prebuild`. Le troisième exemplaire, le dossier `docs/`, a été supprimé. Les `.mdx` générés sont désormais exclus du versionnement.

**La leçon.** Une source de vérité dupliquée à la main n'en est plus une. Elle diverge, et le pire est qu'elle diverge en silence.

---

## F-006 : deux paquets d'un même framework qui dérivent sous `^`

**Symptôme.** `next build` échouait sur `TypeError: a.map is not a function`, dans une trace minifiée qui pointait vers la route de recherche. Une piste a été suivie puis abandonnée, celle du schéma Orama, et deux contournements ont été écrits pour rien.

**Cause.** `fumadocs-mdx@11.10.1` renvoie `{ files: () => [...] }`, c'est-à-dire une fonction, quand le `loader()` de `fumadocs-core@15.8.5` appelle `files.map(...)` et attend donc un tableau. Les plages `^` avaient laissé les deux paquets dériver l'un de l'autre. L'erreur de recherche n'était qu'un symptôme aval : l'arbre de pages restant vide, les breadcrumbs valaient `undefined`.

**Ce qu'on en a fait.** Un raccord explicite et commenté dans `site/src/lib/source.ts`, et les trois paquets `fumadocs-*` épinglés à des versions exactes.

**La leçon.** `npm run build` n'avait jamais été lancé sur ce projet. Seul `next dev` l'avait été, et il masquait l'erreur sur les routes non visitées. Un projet dont on n'a jamais produit le build de production n'est pas un projet qui marche.

**Soldé le 2026-08-30.** La migration vers `fumadocs-core` et `fumadocs-ui` 16.15.4 avec `fumadocs-mdx` 15.4.0 a retiré le raccord. Elle a coûté plus cher que prévu : `fumadocs-ui` 16 exige `next@16.x.x`, la migration en entraînait donc une seconde, de Next 15 vers 16. Trois ruptures d'API à traiter, plus une quatrième non documentée dans les notes de version : `fumadocs-mdx` 15 ne génère plus un `.source/index.ts` unique mais plusieurs points d'entrée, et il faut importer depuis `.source/server`. Au passage, `next lint` n'existe plus en Next 16, et le script correspondant du site a été retiré plutôt que laissé mort.

---

## F-007 : npm refuse désormais toute publication sans 2FA

**Symptôme.** `npm publish --access public` sur un compte fraîchement créé renvoyait un `403 Forbidden`.

```
Two-factor authentication or granular access token with bypass 2fa
enabled is required to publish packages.
```

**Cause.** npm a durci sa politique. La publication directe exige la 2FA sur le compte, ou un *granular access token* explicitement autorisé à la contourner. Un compte neuf ayant la 2FA désactivée par défaut, publier reste impossible tant qu'on ne l'a pas activée.

Une fois la 2FA en place, le refus change de nature : `EOTP`, un code à usage unique est réclamé à chaque publication.

**Ce qu'on en a fait.** 2FA activée en `auth-and-writes`, puis publication.

**La leçon.** Créer le compte npm ne suffit pas à pouvoir publier. Pour un projet qui vise une publication automatisée en CI, il faut prévoir dès le départ un *granular access token* limité aux paquets concernés. C'est la seule voie non interactive qui reste ouverte.

---

## F-008 : Vercel ne voit pas un dépôt fraîchement transféré

**Symptôme.** La création du projet Vercel sur `maedow-arch/maedow-arch-docs` était refusée.

```
400 : To link a GitHub repository, you need to install the GitHub
integration first.
```

**Cause.** L'App GitHub de Vercel était installée sur le compte personnel, pas sur l'organisation `maedow-arch` créée le jour même. Une App GitHub s'installe par compte ou par organisation : transférer un dépôt ne transfère pas ses autorisations.

**Ce qu'on en a fait.** Installation de l'App sur l'organisation, puis création du projet avec `site/` comme répertoire racine et le déploiement continu sur `main`.

**La leçon.** Après un transfert de dépôt vers une organisation, toutes les intégrations tierces sont à réautoriser. Le dépôt est identique, ses autorisations ne le sont plus.

---

## F-009 : `baseUrl` déprécié, remonté par un vrai projet

**Symptôme.** Sur un projet généré par la CLI, l'éditeur signale une erreur dans `tsconfig.json` :

```
Option 'baseUrl' is deprecated and will stop functioning in TypeScript 7.0.
Specify compilerOption '"ignoreDeprecations": "6.0"' to silence this error.
```

**Cause.** Le template déclarait `"baseUrl": "."` en plus de `"paths"`. C'était nécessaire avant TypeScript 4.1, plus depuis. TypeScript 6 déprécie l'option et la 7 la supprimera. La version installée dans le projet importe peu, puisque l'éditeur analyse avec la sienne : l'alerte apparaît dès que l'environnement de développement est à jour.

**Ce qu'on en a fait.** `baseUrl` a été retiré du template et des deux fixtures de test. Une seconde correction s'est imposée dans la foulée : sans `baseUrl`, les substitutions de `paths` doivent être relatives. Le compilateur est explicite sur ce point, `Non-relative paths are not allowed when 'baseUrl' is not set`. L'alias est donc devenu `"@/*": ["./src/*"]`.

Vérifié par `tsc --noEmit` sur un projet réellement scaffoldé, contenant un import par alias, sous TypeScript 5.9 puis sous 7.0.2. Aucune erreur dans les deux cas.

**En marge, une contrainte à connaître.** En vérifiant sous TypeScript 7, le lint s'est mis à échouer avec un code de sortie 2, celui d'une erreur fatale de configuration et non d'une violation. Le message est sans ambiguïté : `typescript-eslint does not support TS 7.0`. Le `tsconfig.json` généré est donc valide sous TypeScript 5, 6 et 7, mais la chaîne de lint, elle, ne suit pas encore. C'est la raison pour laquelle le template continue d'épingler `typescript@^5.7.0`. Ce pin est délibéré, pas un oubli.

**La leçon.** Une option de configuration héritée survit longtemps après être devenue inutile, parce que rien ne la remet en cause tant que tout compile. Ici, c'est l'usage sur un vrai projet qui l'a fait apparaître, pas la chaîne de vérification : celle-ci utilisait une version de TypeScript qui ne signalait rien encore. Un outillage qui n'est testé que sur les versions qu'il épingle ne voit pas venir ce que ses utilisateurs voient déjà.

---

## F-010 : le risque pnpm, anticipé puis démenti

**Le soupçon.** pnpm n'aplatit pas `node_modules`. Or `eslint-config-maedow-arch` déclare trois peerDependencies et charge `eslint-plugin-boundaries` depuis sa propre position dans l'arborescence. C'est exactement le type de résolution que l'arborescence stricte de pnpm met en défaut. Et d'après F-001, une résolution qui échoue ne fait pas hurler ESLint : **elle le fait passer au vert**. Un utilisateur pnpm aurait donc pu croire ses frontières protégées alors qu'elles ne l'étaient pas.

**Ce qu'on a mesuré.** Un projet généré, installé par `pnpm install`, puis soumis au test négatif. Les frontières se déclenchent normalement :

```
Maedow Arch : core ne peut pas importer feature. Voir architecture.md §6
lint sain          EXIT 0
lint avec violation  EXIT 1
```

Le lint, le typecheck et le build passent également.

**Ce qu'on en a fait.** Rien à corriger, mais la vérification est désormais permanente. La CI exécute une matrice de six combinaisons, deux variantes de template sous npm, pnpm et bun, chacune allant jusqu'au test négatif.

**La leçon.** Un risque théorique se vérifie, il ne se suppose pas. Celui-ci était plausible et documenté par le comportement de F-001, mais il ne se matérialise pas. L'inscrire ici évite qu'on le redoute à nouveau dans six mois, et la matrice de CI garantit qu'on le saura le jour où il apparaîtra vraiment.

---

## F-011 : le risque de résolution s'est produit, mais pas là où je l'attendais

**Le contexte.** En F-010, j'avais anticipé que l'arborescence stricte de pnpm casserait la résolution de `eslint-plugin-boundaries` depuis `eslint-config-maedow-arch`, avec pour conséquence un lint vert qui ne vérifie rien. Mesure faite, pnpm tenait parfaitement.

**Ce qui s'est passé.** À la première exécution de la matrice de CI, les quatre combinaisons sous pnpm passaient, et les huit autres échouaient. Sous npm comme sous bun :

```
Cannot find package 'eslint-plugin-boundaries' imported from
packages/eslint-config-maedow-arch/index.js
```

**Cause.** La CI installait la config locale par un lien `file:`. npm et bun résolvent ce lien par un symlink vers le dossier réel du dépôt, qui n'a pas de `node_modules`. Le paquet y cherchait donc ses peerDependencies, sans les trouver. pnpm, lui, matérialise le paquet dans le store et la résolution aboutit, d'où l'inversion complète du résultat attendu.

**Ce que cela ne change pas pour les utilisateurs.** Un projet qui installe `eslint-config-maedow-arch` depuis le registre place le paquet dans son propre `node_modules`, où la résolution remonte naturellement jusqu'au plugin. Vérifié à plusieurs reprises sur des projets réels. L'échec était donc un artefact du banc d'essai, pas un défaut du paquet.

**Ce qu'on en a fait.** La CI empaquette désormais la config par `npm pack` et installe le tarball obtenu, ce qui reproduit exactement ce qu'un utilisateur reçoit. Reproduit puis vérifié en local avant d'être poussé : `lint EXIT 0` là où la CI renvoyait 2.

**La leçon, et elle en dit long.** Le risque était réel, mon diagnostic de son emplacement était faux. J'avais désigné pnpm parce que son arborescence stricte est réputée fragile sur ce point, et c'est npm, le plus courant, qui trébuchait. Un risque anticipé n'est pas un risque compris : seule la matrice l'a localisé.

C'est aussi F-004 qui revient sous un autre visage. Tester par un lien vers le dépôt et tester par le paquet publié ne sont pas le même test, et c'est la deuxième fois que cette confusion produit un défaut.
