# Travailler sur ce dépôt

Ce fichier s'adresse aux agents et aux nouveaux venus. Il ne remplace pas [CONTRIBUTING.md](./CONTRIBUTING.md), il dit ce qu'il faut savoir **avant** de modifier quoi que ce soit.

## Ce que contient ce dépôt

Un standard d'architecture logicielle, son outillage, et le site qui le publie.

| Chemin | Rôle |
| :--- | :--- |
| `architecture.md`, `models.md`, `conventions.md` | le corpus, **source de vérité** |
| `rules.md` | le registre des règles, avec un code stable par règle |
| `FRICTIONS.md` | ce qui a résisté en conditions réelles |
| `packages/create-maedow-arch-app/` | la CLI de génération |
| `packages/eslint-config-maedow-arch/` | les règles ESLint |
| `packages/maedow-arch/` | la commande d'audit d'un projet existant |
| `site/` | le site de documentation, Next.js et Fumadocs |

## Les cinq règles à connaître

**Le corpus vit à la racine.** `site/content/docs/*.mdx` en est **dérivé** par `site/scripts/sync-docs.mjs`, et n'est pas versionné. Modifier un `.mdx` revient à écrire dans un fichier généré : le travail sera écrasé au prochain build.

**Chaque règle porte un code.** `MA-001` à `MA-009`, définis dans [`rules.md`](./rules.md). Les messages de lint citent le code, jamais un titre de section, parce qu'un titre se réécrit et casse le renvoi en silence.

**Une règle n'entre pas dans une configuration sans sa fixture.** Une fixture invalide qui échoue, une valide qui passe, et le test doit échouer quand on retire la règle. Ce n'est pas de la documentation : c'est le seul moyen de savoir qu'une règle regarde vraiment quelque chose. Le journal compte quatre occurrences d'un contrôle qui rendait un verdict favorable sans rien vérifier, de [F-001](./FRICTIONS.md) à F-015.

**Toute modification du corpus prend une ligne au `CHANGELOG.md`.** Une ligne qui dit ce qui change pour celui qui applique le standard, pas ce qui change dans le fichier.

**Chaque exemple de code du corpus doit compiler**, sous `strict` avec `exactOptionalPropertyTypes` et `noUncheckedIndexedAccess`. Un exemple qui ne compile pas est pire que pas d'exemple.

## Le flux

```
votre branche  ──PR──▶  develop  ──PR──▶  main
```

`develop` est la branche par défaut et le point d'entrée. `main` porte les versions publiées, les tags et le déploiement en production, et ne reçoit que ce qui vient de `develop` : une pull request qui vise `main` depuis ailleurs est refusée par la CI.

**La remontée de `develop` vers `main` appartient au mainteneur.** Préparez la pull request, rendez-la verte, arrêtez-vous là.

## Avant de pousser

```bash
npm run test:boundaries          # les frontières se déclenchent vraiment
npm run format:check             # Prettier est d'accord
npm --prefix site run build      # le corpus reste convertible, le site se construit
npm --prefix packages/create-maedow-arch-app test
npm --prefix packages/maedow-arch test
```

Un paquet dont le code change **doit** changer de version, sans quoi la CI refuse la pull request : `npm publish` rejette une version déjà en ligne, et il le rejette après la construction et après l'authentification.

## Où chercher une réponse

| Question | Document |
| :--- | :--- |
| Comment le code est-il organisé ? | [`architecture.md`](./architecture.md) |
| Où va ce type, cette donnée ? | [`models.md`](./models.md) |
| Comment écrit-on ici ? | [`conventions.md`](./conventions.md) |
| Cette règle est-elle vérifiée ou tenue à la main ? | [`rules.md`](./rules.md) |
| Pourquoi cette décision bizarre ? | [`FRICTIONS.md`](./FRICTIONS.md) |

`FRICTIONS.md` est le document le plus utile des cinq pour comprendre le dépôt : il consigne ce qui a échoué, pourquoi, et ce qu'on en a tiré. Plusieurs choix qui paraissent arbitraires y trouvent leur raison.

## Pour lire la documentation en ligne

Le site expose [`/llms.txt`](https://maedow-arch-docs.vercel.app/llms.txt), qui rassemble le corpus entier en texte brut. C'est le chemin le plus court pour en prendre connaissance sans parcourir le HTML.
