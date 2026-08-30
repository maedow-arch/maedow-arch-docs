# create-maedow-arch-app

CLI de scaffolding de [Maedow Arch](https://github.com/maedow-arch/maedow-arch-docs), un standard d'architecture logicielle modulaire, découplé et agnostique de l'infrastructure, pensé pour TypeScript, React et Next.js.

## Démarrage

```bash
npx create-maedow-arch-app mon-projet
cd mon-projet
npm install
npm run dev
```

pnpm, yarn et bun installent depuis le même registre, la CLI fonctionne à l'identique et adapte les commandes qu'elle affiche :

```bash
pnpm dlx create-maedow-arch-app mon-projet
bunx create-maedow-arch-app mon-projet
yarn dlx create-maedow-arch-app mon-projet
```

## Choisir son profil

Le corpus définit deux profils d'architecture, et la CLI produit l'un ou l'autre.

```bash
npx create-maedow-arch-app mon-projet --mode full    # les quatre couches
npx create-maedow-arch-app mon-projet --mode light   # sans couche core
```

**Full** installe `app/ → features/ → core/ → lib/`. C'est le profil des produits qui durent : SaaS, application métier, cycle de vie long, logique significative.

**Light** retire la couche domaine. Les règles vivent dans la feature qui les utilise. C'est le profil des sites vitrines, des prototypes et des MVP, quand isoler un domaine coûterait plus qu'il ne rapporte.

Les frontières restent vérifiées dans les deux cas : une feature n'importe jamais une autre feature, `components/` demeure présentationnel. Les deux profils ne sont pas deux jeux de règles, mais une relation d'inclusion.

Sans drapeau, la CLI pose la question lorsqu'elle est lancée depuis un terminal, et retient `full` sinon. Elle ne bloque jamais un script ni une intégration continue.

## Choisir son style

```bash
npx create-maedow-arch-app mon-projet --css vanilla     # par défaut
npx create-maedow-arch-app mon-projet --css tailwind
```

**CSS natif** ne pose aucune dépendance de style. La démonstration livrée prouve qu'il n'en faut aucune pour obtenir quelque chose de soigné.

**Tailwind CSS 4** arrive configuré et prêt à l'emploi, avec ses jetons de design déclarés dans un bloc `@theme`.

Dans la démonstration Tailwind, les composants réutilisables sont écrits en idiome Tailwind, parce que ce sont eux qu'on recopie dans son propre projet. La mise en page des pages reste en classes sémantiques : elle se prête mal aux utilitaires, et la dupliquer aurait créé deux versions à garder synchronisées.

Ce choix n'a aucune incidence sur les frontières architecturales.

## Choisir son contenu

```bash
npx create-maedow-arch-app mon-projet --template demo    # par défaut
npx create-maedow-arch-app mon-projet --template blank
```

La **démonstration** livre un compteur borné, décliné selon le profil. Le choix du compteur est délibéré : un compteur nu ne justifierait aucune séparation, puisque `useState(0)` suffirait. Ici les bornes sont une règle métier, ce qui change tout.

En **Full**, ces règles vivent dans `core/counter/`, retournent un refus typé, et se vérifient par neuf tests qui s'exécutent sans React ni DOM. En **Light**, les mêmes bornes tiennent dans la feature, en trois fois moins de lignes.

Générer les deux et comparer est le moyen le plus court de saisir ce que la séparation apporte, et ce qu'elle coûte :

```bash
npx create-maedow-arch-app comparaison-light --mode light
npx create-maedow-arch-app comparaison-full  --mode full
```

Le **squelette vierge** livre l'arborescence, la configuration et les générateurs, sans code d'exemple ni parti pris typographique.

## Ce qui est généré

```
mon-projet/
├── src/
│   ├── app/            # Routes et orchestration. Peut tout importer.
│   ├── features/       # Écrans et logique de vue
│   │   └── _shared/    # Composants métier transverses
│   ├── core/           # Domaine métier, sans aucune dépendance UI
│   │   └── common/
│   │       └── result.ts   # Result Pattern et ses helpers unwrapOr, mapResult, match
│   ├── components/ui/  # Présentationnel pur
│   ├── lib/            # Utilitaires sans dépendance
│   └── tests/          # unit, integration, e2e
├── scripts/            # Générateurs de domaine et de feature
├── eslint.config.mjs   # Frontières architecturales appliquées au lint
├── tsconfig.json       # TypeScript strict : noUncheckedIndexedAccess, exactOptionalPropertyTypes
└── vitest.config.ts
```

## Générateurs

```bash
npm run generate:domain billing    # src/core/billing/ : types, validation Zod, service
npm run generate:feature checkout  # src/features/checkout/ : Screen, hook, types, test
```

Le domaine généré applique la **Règle de Lazy Abstraction** : il accède directement à la donnée, sans `contract.ts` ni adapters, tant qu'une deuxième implémentation réelle n'est pas nécessaire.

## Frontières architecturales

Le flux de dépendance est unidirectionnel, `app → features → core → lib`, et vérifié au lint :

```bash
npm run lint
```

```
Maedow Arch : core ne peut pas importer components. Voir architecture.md §6.
```

Les règles vivent dans [`eslint-config-maedow-arch`](https://www.npmjs.com/package/eslint-config-maedow-arch), installé par défaut dans le projet généré.

## Documentation

Le corpus complet couvre les quatre couches, la typologie des modèles, le Result Pattern, les conventions et les modes Light et Full. Il est publié sur [maedow-arch-docs.vercel.app](https://maedow-arch-docs.vercel.app).

## Licence

MIT
