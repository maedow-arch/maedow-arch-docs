# Remontées outillage · relevé de terrain

## Objet

Ce que le projet ABBA a rencontré sur l'outillage qui n'est pas Maedow Arch : Next.js, shadcn, et ce qui viendra. Même méthode que `docs/REMONTEES-MAEDOW.md`, constat vérifié, reproduction, correctif proposé.

**Deux fichiers plutôt qu'un, parce que les destinataires diffèrent.** Un relevé se range par qui va le lire, pas par sujet. Mêler des défauts de Vercel à un rapport destiné à l'équipe qui maintient Maedow Arch obligerait chaque lecteur à trier ce qui le concerne, et brouillerait l'objet des deux.

---

## Environnement de test

| Élément | Valeur |
| :--- | :--- |
| Système | Windows 11 Pro 26200 |
| Node | 25.9.0 |
| npm | 11.12.1 |
| Next | 16.3.4, monté depuis 15.5.25 |
| ESLint | 9.39.5 |
| Date du relevé | 1er septembre 2026 |

---

## Synthèse

| Code | Constat | Gravité | Outil |
| :--- | :--- | :--- | :--- |
| N-001 | Le codemod de montée impose ses propres versions et échoue à l'installation | moyenne | `@next/codemod` |
| N-002 | Le build qui reconfigure `tsconfig.json` échoue, et lui seul | **haute** | `next build` |

---

## N-001 · Le codemod de montée impose ses propres versions de dépendances

**Gravité moyenne.** Contournable, mais l'outil officiel de migration devient inutilisable sur une configuration courante.

### Constat

```bash
npx @next/codemod@canary upgrade latest
```

La commande ne monte pas seulement `next`. Elle aligne aussi `eslint` sur la dernière version publiée, soit `10.9.1`, sans vérifier que l'écosystème installé la supporte. L'installation s'arrête avant toute transformation :

```text
npm error code ERESOLVE
npm error Found: eslint@10.9.1
npm error Could not resolve dependency:
npm error peer eslint@"^2 || ^3 || ... || ^8 || ^9" from eslint-plugin-import@2.32.0
npm error   4 more (eslint-config-maedow-arch, eslint-config-next, ...)
Error: Failed to install dependencies
```

### Pourquoi la portée est large

`eslint-plugin-import` est une dépendance de la configuration ESLint recommandée par Next lui-même. **Tout projet qui suit cette recommandation rencontre l'échec**, et `eslint-plugin-import` n'a aujourd'hui aucune version compatible avec ESLint 10.

La montée d'ESLint n'était par ailleurs pas demandée : `eslint-config-next@16.3.4` déclare `eslint: ">=9.0.0"`, et rien dans Next 16 ne réclame ESLint 10.

### Correctif proposé

Ne monter que ce que la montée de Next entraîne réellement, et laisser le reste de l'écosystème là où il est. Un outil de migration qui aligne au passage des dépendances sans rapport avec sa cible produit des échecs que l'utilisateur ne peut pas relier à ce qu'il demandait.

À défaut, échouer avec un message qui distingue les deux : « la montée de Next a réussi, l'alignement d'ESLint a échoué pour telle raison » plutôt qu'un `Failed to install dependencies` qui laisse croire que la montée elle-même est impossible.

### Contournement appliqué sur ABBA

Montée à la main, `npm install next@16.3.4`. Le diff de `package.json` tient en une ligne, et les quatre codemods postérieurs à 15.5.25 passés à blanc n'ont eu aucune transformation à appliquer.

---

## N-002 · Le build qui reconfigure `tsconfig.json` échoue

**Gravité haute.** Le défaut se présente comme intermittent alors qu'il est parfaitement déterministe, ce qui est le pire des deux mondes pour un diagnostic.

### Constat

Premier `next build` après la montée en Next 16 :

```text
  Collecting page data using 4 workers ...
Error [PageNotFoundError]: Cannot find module for page: /_not-found/page
    at ignore-listed frames { code: 'ENOENT' }

> Build error occurred
Error: Failed to collect page data for /_not-found
```

Le second build, sans aucun changement, passe.

La page introuvable est `/_not-found`, c'est-à-dire la page 404 interne de Next, que le projet ne définit pas.

### Reproduction

Deux expériences, résultat reproduit deux fois sur deux :

| Expérience | Conditions | Résultat |
| :--- | :--- | :--- |
| 1 | `.next` supprimé, `tsconfig.json` déjà reconfiguré par Next | **succès** |
| 2 | `.next` supprimé, `tsconfig.json` remis en `"jsx": "preserve"` | **échec identique** |

### Cause

Au premier build sous Next 16, Next réécrit `tsconfig.json` en cours d'exécution :

```text
  We detected TypeScript in your project and reconfigured your tsconfig.json file for you.
  The following mandatory changes were made to your tsconfig.json:
  	- jsx was set to react-jsx (next.js uses the React automatic runtime)
```

La collecte des données de page se poursuit ensuite sur un état incohérent et ne retrouve pas sa propre page 404. **C'est le build pendant lequel la réécriture a lieu qui échoue, et lui seul.**

### Pourquoi c'est coûteux au-delà de l'échec lui-même

Un clone neuf du dépôt échoue à son premier build et réussit au second. En intégration continue, où l'espace de travail est neuf à chaque fois, l'échec est systématique. Sur un poste de développement, il ne se produit qu'une fois et disparaît avant qu'on ait fini de lire le message.

C'est le genre de défaut qu'une équipe met des semaines à imputer correctement, parce que la moitié des observations le contredisent.

### Correctif proposé

Appliquer la reconfiguration avant la collecte des pages, ou refuser de bâtir en indiquant les changements à faire, plutôt que de les faire à mi-parcours.

### Contournement appliqué sur ABBA

Les deux valeurs que Next déclare obligatoires sont versionnées dans `tsconfig.json`, appliquées à la main pour éviter le reformatage complet du fichier par la réécriture automatique. Vérifié ensuite par empreinte : `.next` supprimé, build relancé, fichier inchangé et plus aucun message de reconfiguration.
