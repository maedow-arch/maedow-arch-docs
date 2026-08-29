# create-maedow-arch-app

CLI de scaffolding de [Maedow Arch](https://github.com/maedow-arch/maedow-arch-docs) — un standard d'architecture logicielle modulaire, découplé et agnostique de l'infrastructure, pour TypeScript / React / Next.js.

## Démarrage

```bash
npx create-maedow-arch-app mon-projet
cd mon-projet
npm install
npm run dev
```

## Ce qui est généré

```
mon-projet/
├── src/
│   ├── app/            # Routes et orchestration — peut tout importer
│   ├── features/       # Écrans et logique de vue
│   │   └── _shared/    # Composants métier transverses
│   ├── core/           # Domaine métier — zéro dépendance UI
│   │   └── common/
│   │       └── result.ts   # Result Pattern + helpers unwrapOr / mapResult / match
│   ├── components/ui/  # Présentationnel pur
│   ├── lib/            # Utilitaires sans dépendance
│   └── tests/          # unit / integration / e2e
├── scripts/            # Générateurs de domaine et de feature
├── eslint.config.mjs   # Frontières architecturales appliquées au lint
├── tsconfig.json       # TypeScript strict (noUncheckedIndexedAccess, exactOptionalPropertyTypes…)
└── vitest.config.ts
```

## Générateurs

```bash
npm run generate:domain billing    # src/core/billing/     — types, validation Zod, service
npm run generate:feature checkout  # src/features/checkout/ — Screen, hook, types, test
```

Le domaine généré applique la **Règle de Lazy Abstraction** : accès direct à la donnée, et pas de `contract.ts` ni d'adapters tant qu'une deuxième implémentation réelle n'est pas nécessaire.

## Frontières architecturales

Le flux de dépendance est unidirectionnel — `app → features → core → lib` — et vérifié au lint :

```bash
npm run lint
```

```
Maedow Arch : core ne peut pas importer components. Voir architecture.md §6.
```

Les règles vivent dans [`eslint-config-maedow-arch`](https://www.npmjs.com/package/eslint-config-maedow-arch), installé par défaut dans le projet généré.

## Documentation

Le corpus complet — les 4 couches, la typologie des modèles, le Result Pattern, les conventions et les modes Light / Full — est sur [github.com/maedow-arch/maedow-arch-docs](https://github.com/maedow-arch/maedow-arch-docs).

## Licence

MIT
