# maedow-arch

Audite un projet existant au regard du standard [Maedow Arch](https://github.com/maedow-arch/maedow-arch-docs), **sans rien installer ni modifier**.

```bash
npx maedow-arch check
```

## Pourquoi cette commande existe

Le reste de l'outillage ne s'adresse qu'aux projets qui n'existent pas encore. Or personne ne repart de zéro pour adopter une architecture : les équipes ont déjà quarante mille lignes, et la première question qu'elles se posent est « combien ça va me coûter ».

`check` répond à cette question, et à la suivante : par quoi commencer.

## Ce qu'elle produit

Un rapport ordonné **par ce qui débloque le reste**, et non par gravité. Chaque section dit ce que la correction rend possible, montre les cinq premiers fichiers concernés, et compte le reste.

```
  1. Activer le typage strict  ·  TS-STRICT  ·  2 violations
     Sans strict, les couches basses ne peuvent pas garantir ce qu'elles
     annoncent, et les corrections suivantes reposeraient sur des types qui mentent.
```

Un projet qui découvre deux cents violations doit voir un chemin, pas un verdict.

## Options

| Option | Effet |
| :--- | :--- |
| `--json` | sortie machine, pour l'intégration continue |
| `--seuil <n>` | échoue au-delà de n violations. Sans seuil, la commande réussit toujours |
| `--fix` | applique les corrections sûres, aujourd'hui les options manquantes du `tsconfig.json` |

Le seuil existe parce qu'une équipe en migration a besoin de **mesurer sa progression**, pas d'un pipeline rouge au premier jour. Descendez-le à mesure que vous corrigez.

`--fix` ne déplace aucun fichier. Les déplacements sont proposés, jamais appliqués : un outil qui déplace du code sans qu'on le lui demande ne se fait pardonner qu'une fois.

## Ce qu'elle ne fait pas

**Elle ne garantit pas, elle dénombre.** L'audit lit les chemins d'import sans compiler le projet, ce qui lui permet de tourner sur une cible non installée, qui ne compile pas encore, et sans lui imposer la moindre configuration. C'est ce qui la rend utilisable **avant** d'avoir décidé d'adopter le standard.

Le prix est quelques cas limites, et il est assumé. Une fois la migration faite, c'est [`eslint-config-maedow-arch`](https://www.npmjs.com/package/eslint-config-maedow-arch) qui tient les frontières à chaque commit.

**Elle n'invente aucune règle.** Chaque contrôle porte un code du [registre](https://github.com/maedow-arch/maedow-arch-docs/blob/main/rules.md). MA-008 et MA-009 en sont absentes parce qu'elles sont tenues par l'équipe : repérer mécaniquement un secret ou un adaptateur mal nommé produirait surtout du bruit.

## Zéro dépendance

Ce paquet n'en a aucune, et c'est délibéré. Une commande qui exigerait d'installer une configuration ESLint, de déclarer un résolveur et d'écrire un `eslint.config.mjs` ne serait jamais lancée par l'équipe qui hésite encore, c'est-à-dire par la seule à qui elle s'adresse.

## Licence

MIT
