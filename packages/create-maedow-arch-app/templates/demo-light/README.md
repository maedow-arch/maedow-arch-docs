# __PROJECT_NAME__

Projet suivant [Maedow Arch](https://maedow-arch-docs.vercel.app) en **Mode Light**, avec une démonstration.

## Démarrer

```bash
npm install
npm run dev
```

## Pourquoi Light

Le corpus définit deux profils, et recommande celui-ci pour les sites vitrines, les prototypes et les MVP : quand la logique métier est faible, isoler un domaine coûte plus qu'il ne rapporte.

Concrètement, il n'y a pas de couche `core/`. Les règles vivent dans la feature qui les utilise.

```
src/
├── app/            Routes et assemblage
├── features/
│   ├── counter/    Écran, hook, et rules.ts juste à côté
│   └── _shared/    Composites transverses
├── components/ui/  Présentationnel pur
└── lib/            Utilitaires sans dépendance
```

## Ce qui ne change pas par rapport au Mode Full

Les frontières restent vérifiées au lint. Une feature n'importe jamais une autre feature, et `components/` demeure présentationnel. Ces règles sont utiles quelle que soit la taille du projet, et elles ne coûtent rien.

```bash
npm run lint
```

Pour le vérifier, ajoutez un import interdit entre deux features et relancez le lint. Il doit échouer :

```
Maedow Arch : feature ne peut pas importer feature. Voir « Règle de dépendance et frontières » dans architecture.md.
```

## Quand basculer en Mode Full

Trois signaux, et un seul suffit :

1. Une deuxième feature a besoin des mêmes règles.
2. Il devient utile de distinguer les motifs de refus les uns des autres, plutôt que d'échouer silencieusement.
3. On veut tester le métier sans monter l'écran.

La bascule se fait alors domaine par domaine, jamais en un refactor global. `features/counter/rules.ts` part dans `src/core/counter/`, les transitions retournent un `Result` typé, et la feature ne garde que la traduction pour l'affichage.

Pour voir à quoi ressemble cette étape suivante sur le même compteur :

```bash
npx create-maedow-arch-app comparaison --mode full
```

Vous obtiendrez neuf tests du domaine qui s'exécutent sans React ni DOM. Comparer les deux arborescences est le moyen le plus court de comprendre ce que la séparation apporte, et ce qu'elle coûte.

## Générateurs

```bash
npm run generate:feature contact   # src/features/contact/
```

`generate:domain` existe aussi, mais il crée un domaine dans `src/core/`. L'utiliser revient à commencer la bascule vers le Mode Full, ce qui est parfaitement légitime le jour venu.

## Typographie

Space Grotesk et Manrope, auto-hébergées par `next/font`. C'est un choix de produit, pas une contrainte d'architecture : remplacez-les sans scrupule dans `src/app/layout.tsx`.
