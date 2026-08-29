# eslint-config-maedow-arch

Règles ESLint officielles de [Maedow Arch](https://github.com/maedow-arch/maedow-arch-docs) : enforce les frontières entre `app`, `features`, `core`, `components` et `lib` via [`eslint-plugin-boundaries`](https://www.jsboundaries.dev/).

## Installation

```bash
npm install --save-dev eslint-config-maedow-arch eslint-plugin-boundaries eslint-import-resolver-typescript
```

> **`eslint-import-resolver-typescript` n'est pas optionnel.** Sans résolveur TypeScript, les imports `.ts`/`.tsx` sont classés « unknown » par le plugin et **aucune règle ne se déclenche** : le lint passe au vert sans rien vérifier. C'est le mode de défaillance le plus sournois de ce type de configuration.

## Usage

```js
// eslint.config.mjs
import maedowArchConfig from "eslint-config-maedow-arch";

export default [
  ...maedowArchConfig,
  // tes règles additionnelles ici
];
```

La config n'impose pas de parser : apporte le tien (`typescript-eslint` dans un projet TypeScript).

## Ce que ça enforce

Le flux de dépendance est unidirectionnel — `app → features → core → lib` :

| Depuis | Peut importer |
| :--- | :--- |
| `app/` | tout |
| `features/<x>/` | `features/_shared/`, `core/`, `components/`, `lib/`, et **sa propre feature** |
| `features/_shared/` | `core/`, `components/`, `lib/` — jamais une feature |
| `core/` | `core/`, `lib/` — **zéro dépendance UI** |
| `components/` | `components/`, `lib/` |
| `lib/` | `lib/` uniquement |

Une violation produit un message explicite :

```
Maedow Arch : core ne peut pas importer components. Voir architecture.md §6.
```

## Dispositions supportées

Les patterns ne sont pas ancrés à la racine du projet : `core/` et `src/core/` fonctionnent tous les deux, sans configuration supplémentaire.

## Vérifier que les frontières sont bien actives

Une config de frontières qui ne matche rien passe au vert. Le seul test qui prouve quelque chose est le test **négatif** : ajoute temporairement un import interdit et vérifie qu'ESLint échoue.

```ts
// src/core/billing/service.ts
import { Button } from "../../components/ui/Button"; // doit lever une erreur
```

Ce package embarque ce test — voir `test/run.mjs`, lancé par `npm run test:boundaries` à la racine du dépôt.

## Licence

MIT
