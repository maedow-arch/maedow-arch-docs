# Contribuer à Maedow Arch

Merci de l'intérêt que vous portez à ce standard. Ce document décrit le seul
chemin par lequel une modification entre dans le dépôt, et ce que la
vérification automatique attend de vous.

Si vous travaillez avec un assistant, [`AGENTS.md`](./AGENTS.md) rassemble ce qu'il doit savoir avant de modifier ce dépôt, et la documentation entière est servie en texte brut sur [`/llms.txt`](https://maedow-arch-docs.vercel.app/llms.txt).

## Le flux en un coup d'œil

```
votre branche  ──PR──▶  develop  ──PR──▶  main
   le travail            l'intégration      les versions publiées
```

`develop` est la branche par défaut et le point d'entrée de toute
contribution. `main` ne reçoit que ce qui a déjà vécu sur `develop`, et porte
les versions publiées ainsi que les tags. Les deux branches refusent le push
direct, la réécriture d'historique et la suppression, sans exception pour
personne, mainteneur compris.

## Selon que vous ayez ou non les droits d'écriture

**Contributeur externe.** Forkez le dépôt, travaillez sur une branche de votre
fork, puis ouvrez une pull request vers `develop`. Vous n'avez pas besoin de
demander l'accès en écriture : le modèle du fork suffit, et c'est lui qui
garantit qu'aucune modification n'atterrit sans relecture.

**Mainteneur.** Créez la branche directement dans le dépôt, puis ouvrez la
pull request vers `develop`. La branche est supprimée automatiquement une fois
la PR fusionnée.

Dans les deux cas, une pull request qui vise `main` sans venir de `develop`
est refusée par la vérification automatique. C'est délibéré : cela évite qu'un
correctif rejoigne les versions publiées sans être passé par l'intégration.

## Nommer sa branche

Le préfixe annonce la nature du travail, et rien d'autre n'est imposé :

| Préfixe | Usage |
| :--- | :--- |
| `feat/` | une capacité nouvelle |
| `fix/` | une correction |
| `docs/` | le corpus ou la documentation du site |
| `chore/` | outillage, CI, dépendances |

## Ce que la vérification automatique contrôle

Trois contrôles conditionnent la fusion, sur `develop` comme sur `main` :

| Contrôle | Ce qu'il prouve |
| :--- | :--- |
| **Frontières architecturales** | les règles de dépendance se déclenchent réellement, test négatif à l'appui |
| **Formatage** | Prettier ne trouve rien à réécrire |
| **Build du site** | le corpus reste convertible et le site se construit |

S'y ajoute la matrice de scaffolding, qui génère un projet pour chaque
combinaison de framework, de mode, de template et de gestionnaire de paquets,
puis le lint, le typecheck et le construit.

Avant de pousser, ces trois commandes vous évitent l'aller-retour :

```bash
npm run test:boundaries    # les frontières se déclenchent vraiment
npm run format:check       # Prettier est d'accord
npm --prefix site run build   # le site se construit
```

`npm run format` réécrit ce que `format:check` refuse.

## Deux règles propres à ce dépôt

**Le corpus vit à la racine.** `architecture.md`, `models.md` et
`conventions.md` sont la source de vérité. Les pages `site/content/docs/*.mdx`
en sont dérivées par `site/scripts/sync-docs.mjs` et ne sont pas versionnées.
Les modifier à la main revient à écrire dans un fichier généré, votre travail
sera écrasé au prochain build.

**Toute modification du corpus s'accompagne d'une entrée au `CHANGELOG.md`.**
Une ligne suffit, mais elle doit dire ce qui change pour celui qui applique le
standard, pas ce qui change dans le fichier.

## Auditer un projet avant de contribuer

Si vous appliquez ce standard à un projet existant, la commande d'audit dit où vous en êtes :

```bash
npx maedow-arch check
```

Elle ne modifie rien, n'installe rien, et n'a pas besoin que le projet compile. Les frictions rencontrées pendant une migration réelle sont le retour le plus utile qu'on puisse faire à ce dépôt.

## Signaler une friction plutôt qu'un bug

L'apport le plus utile à un standard n'est pas le correctif, c'est le
témoignage d'usage : une règle trop stricte, un cas limite qu'elle n'avait pas
prévu, une consigne qui coûte plus qu'elle ne rapporte. Ces retours passent par
les issues du dépôt et alimentent [`FRICTIONS.md`](./FRICTIONS.md), le journal
de ce qui a résisté en conditions réelles.

## Licence

En contribuant, vous acceptez que votre travail soit publié sous la licence
MIT du dépôt.
