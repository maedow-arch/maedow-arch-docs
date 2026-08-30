# __PROJECT_NAME__

Projet suivant [Maedow Arch](https://maedow-arch-docs.vercel.app) en **Mode Light**.

## Démarrer

```bash
npm install
npm run dev
```

## Pourquoi Light

Le corpus définit deux profils, et recommande celui-ci pour les sites vitrines, les prototypes et les MVP : quand la logique métier est faible, isoler un domaine coûte plus qu'il ne rapporte.

Il n'y a donc pas de couche `core/`. Les règles vivent dans la feature qui les utilise.

```
src/
├── app/            Routes et assemblage
├── features/       Écrans, hooks, et la logique métier de la feature
│   └── _shared/    Composites transverses, qui ne connaissent aucune feature
├── components/ui/  Présentationnel pur
└── lib/            Utilitaires sans dépendance
```

## Ce qui reste vérifié

Les frontières sont appliquées au lint, comme en Mode Full. Une feature n'importe jamais une autre feature, et `components/` demeure présentationnel. Ces règles sont utiles quelle que soit la taille du projet, et elles ne coûtent rien.

```bash
npm run lint
```

Pour vous assurer qu'elles sont bien actives, tentez un import interdit entre deux features. Le lint doit échouer :

```
Maedow Arch : feature ne peut pas importer feature. Voir architecture.md §6.
```

Un lint qui reste vert sur cet essai signale une configuration inactive, pas une architecture saine.

## Quand basculer en Mode Full

Trois signaux, et un seul suffit :

1. Une deuxième feature a besoin des mêmes règles.
2. Il devient utile de distinguer les motifs de refus les uns des autres.
3. On veut tester le métier sans monter l'écran.

La bascule se fait alors domaine par domaine, jamais en un refactor global. Les règles d'une feature partent dans `src/core/<domaine>/`, et la feature ne garde que la traduction pour l'affichage.

```bash
npm run generate:domain billing
```

Ce générateur crée un domaine dans `src/core/`. L'utiliser marque le début de la bascule, ce qui est parfaitement légitime le jour venu.

## Générateurs

```bash
npm run generate:feature contact   # src/features/contact/
npm run generate:domain billing    # src/core/billing/, début de la bascule
```
