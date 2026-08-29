# Documentation de Maedow Arch (maedow-arch)

Bienvenue dans la documentation officielle de **Maedow Arch**. Ce corpus méthodologique définit un standard d'ingénierie logicielle universel, modulaire et découplé, conçu pour le développement d'applications web et fullstack modernes (TypeScript, React, Next.js, etc.).

**Documentation en ligne : [maedow-arch-docs.vercel.app](https://maedow-arch-docs.vercel.app)**

[![create-maedow-arch-app](https://img.shields.io/npm/v/create-maedow-arch-app?label=create-maedow-arch-app&color=8b5cf6)](https://www.npmjs.com/package/create-maedow-arch-app)
[![eslint-config-maedow-arch](https://img.shields.io/npm/v/eslint-config-maedow-arch?label=eslint-config-maedow-arch&color=8b5cf6)](https://www.npmjs.com/package/eslint-config-maedow-arch)
[![licence MIT](https://img.shields.io/badge/licence-MIT-8b5cf6)](./LICENSE)
[![CI](https://github.com/maedow-arch/maedow-arch-docs/actions/workflows/ci.yml/badge.svg)](https://github.com/maedow-arch/maedow-arch-docs/actions/workflows/ci.yml)

---

## 🚀 Démarrage Rapide

```bash
npx create-maedow-arch-app mon-projet
cd mon-projet
npm install
```

Génère un projet avec la structure complète Maedow Arch (`app/ → features/ → core/ → lib/`), le Result Pattern avec ses helpers, et les scripts de scaffolding prêts à l'emploi :

```bash
npm run generate:domain billing
npm run generate:feature checkout
```

Pour enforcer les frontières architecturales via ESLint :

```bash
npm install --save-dev eslint-config-maedow-arch eslint-plugin-boundaries eslint-import-resolver-typescript
```

```js
// eslint.config.mjs
import maedowArchConfig from "eslint-config-maedow-arch";
export default [...maedowArchConfig];
```

> `eslint-import-resolver-typescript` n'est pas optionnel : sans résolveur TypeScript, les imports `.ts`/`.tsx` sont classés « unknown » et **aucune règle de frontière ne se déclenche**. Le lint passe alors au vert sans rien vérifier.

---

## 📚 Sommaire des Guides

### 1. [Guide de Référence de Maedow Arch (`architecture.md`)](./architecture.md)
* **Les Piliers de Maedow Arch** : Découplage strict, flux unidirectionnel, machine-enforced boundaries.
* **Les 4 Couches du Système** (`app`, `features`, `core`, `components/lib`).
* **Agnosticisme de l'Infrastructure (Ports & Adapters)** : Interchangeabilité de la base de données (Postgres, Drizzle, Prisma, IndexedDB, Firebase...) et de l'authentification (BetterAuth, Supabase, Auth.js, JWT...).
* **Gestion des Composants Métier Partagés** (`features/_shared/`) et sa règle de dégradation anti-fourre-tout.
* **Règle de Lazy Abstraction** : quand (et seulement quand) introduire contracts et adapters.
* **Règles de Dépendance Unidirectionnelle** vérifiées automatiquement par linter (`eslint-plugin-boundaries`).
* **Template d'Arborescence Maedow Arch Standard**.
* **Mode Light vs Mode Full** : quel niveau de rigueur appliquer selon le type de projet.

---

### 2. [Modélisation & Séparation du Domaine dans Maedow Arch (`models.md`)](./models.md)
* **La Règle « Zéro Modèle dans le JSX »** : Pourquoi et comment isoler les types métier de la couche de rendu.
* **Typologie des 5 Catégories de Modèles Maedow Arch** :
  1. *Entités Métier* (`core/<domaine>/types.ts`)
  2. *Modèles de Persistance* (`core/database/` ou `core/storage/`)
  3. *DTOs & Validation de Contrats réseau* (`core/<domaine>/dto.ts`)
  4. *ViewModels Spécifiques à la Vue* (`features/<feature>/types.ts`)
  5. *Props de Composants React uniquement* (`Composant.tsx`)
* **Pragmatisme Typé & Inférence Zod** : Éviter l'over-engineering sur les cas simples.
* Exemples comparatifs Avant / Après (Anti-Pattern vs Pattern Maedow Arch).

---

### 3. [Conventions & Standards de Maedow Arch (`conventions.md`)](./conventions.md)
* **TypeScript Strict Maedow Arch** (`noUncheckedIndexedAccess`, interdiction de `any` et double assertion).
* **Gestion des Erreurs par Données Typées (Result Pattern)** plutôt que des exceptions masquées, avec ses helpers obligatoires (`unwrapOr`, `mapResult`, `match`) pour éviter la verbosité.
* **Sécurité & Données Sensibles** (`server-only`, sanitization des logs).
* **Générateurs & Scaffolding Maedow Arch** (`npm run generate:feature`).
* **Pyramide de Tests & Testabilité** (Tests purs et ultra-rapides du domaine sans mock UI).

---

## 🛠️ Outillage Officiel

| Package | Description |
| :--- | :--- |
| [`create-maedow-arch-app`](https://www.npmjs.com/package/create-maedow-arch-app) | CLI de scaffolding. Génère un projet Maedow Arch complet en une commande. |
| [`eslint-config-maedow-arch`](https://www.npmjs.com/package/eslint-config-maedow-arch) | Config ESLint prête à l'emploi qui enforce les frontières `app/features/core/components/lib`. |

---

## 📦 Organisation du dépôt

```
maedow-arch-docs/
├── architecture.md · models.md · conventions.md   # le corpus, source de vérité
├── site/                                          # le site de documentation (Next.js + Fumadocs)
└── packages/
    ├── create-maedow-arch-app/                    # la CLI de scaffolding
    └── eslint-config-maedow-arch/                 # les règles de frontières
```

Les pages du site sont **dérivées** des `.md` de cette racine par `site/scripts/sync-docs.mjs`. Ne modifiez jamais `site/content/docs/*.mdx` à la main.

```bash
npm run test:boundaries   # vérifie que les frontières se déclenchent vraiment
npm run site:dev          # lance le site en local
```

---

## 📝 Licence & Contribution

Maedow Arch est un standard ouvert, sous licence MIT.

Les retours d'usage réel constituent l'apport le plus utile : frictions rencontrées, cas limites, règles trop strictes ou pas assez. Ils passent par les issues du dépôt et alimentent [`FRICTIONS.md`](./FRICTIONS.md), le journal de ce qui a résisté en conditions réelles.
