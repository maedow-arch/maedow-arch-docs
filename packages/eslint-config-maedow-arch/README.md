# eslint-config-maedow-arch

Règles ESLint officielles de [Maedow Arch](https://github.com/maedow-arch/maedow-arch-docs). Elles appliquent les frontières entre `app`, `features`, `core`, `components` et `lib`, au moyen d'[`eslint-plugin-boundaries`](https://www.jsboundaries.dev/).

## Installation

```bash
npm install --save-dev eslint-config-maedow-arch eslint-plugin-boundaries eslint-import-resolver-typescript
```

> **`eslint-import-resolver-typescript` n'est pas optionnel.** Sans résolveur TypeScript, le plugin classe les imports `.ts` et `.tsx` en « unknown », et aucune règle ne se déclenche : le lint passe au vert sans rien vérifier. C'est le mode de défaillance le plus sournois de ce type de configuration.

## Usage

```js
// eslint.config.mjs
import maedowArchConfig from "eslint-config-maedow-arch";

export default [
  ...maedowArchConfig,
  // vos règles additionnelles ici
];
```

La configuration n'impose aucun parser. Apportez le vôtre, `typescript-eslint` dans un projet TypeScript.

## Ce qui est appliqué

Le flux de dépendance est unidirectionnel, `app → features → core → lib` :

| Depuis | Peut importer |
| :--- | :--- |
| `app/` | tout |
| `features/<x>/` | `features/_shared/`, `core/`, `components/`, `lib/`, et sa propre feature |
| `features/_shared/` | `core/`, `components/`, `lib/`, jamais une feature |
| `core/` | `core/` et `lib/`, sans aucune dépendance UI |
| `components/` | `components/` et `lib/` |
| `lib/` | `lib/` uniquement |

Une violation produit un message explicite :

```
Maedow Arch : core ne peut pas importer components. Voir « Règle de dépendance et frontières » dans architecture.md.
```

## Dispositions supportées

Les patterns ne sont pas ancrés à la racine du projet. `core/` et `src/core/` fonctionnent l'un comme l'autre, sans configuration supplémentaire.

## Vérifier que les frontières sont bien actives

Une configuration de frontières qui ne matche rien passe au vert. Le seul test qui prouve quelque chose est donc le test négatif : ajoutez temporairement un import interdit et vérifiez qu'ESLint échoue.

```ts
// src/core/billing/service.ts
import { Button } from "../../components/ui/Button"; // doit lever une erreur
```

Ce package embarque ce test. Voir `test/run.mjs`, lancé par `npm run test:boundaries` à la racine du dépôt.

## Licence

MIT
