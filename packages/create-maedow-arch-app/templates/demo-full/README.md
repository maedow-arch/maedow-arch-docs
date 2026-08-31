# __PROJECT_NAME__

Projet suivant [Maedow Arch](https://maedow-arch-docs.vercel.app), livré avec une démonstration.

## Démarrer

```bash
npm install
npm run dev
```

## Ce que la démonstration montre

Un compteur borné. Le choix est délibéré : un compteur nu ne justifierait aucune séparation, puisque `useState(0)` suffirait. Ici les bornes et le pas sont une **règle métier**, et cela change tout.

```
src/core/counter/rules.ts        transitions pures, refus typés via Result
src/core/counter/rules.test.ts   le comportement métier, vérifié sans React
src/core/counter/types.ts        l'entité et ses erreurs possibles
src/core/counter/validation.ts   le contrat d'entrée, schéma Zod

src/features/counter/types.ts    le ViewModel, déjà prêt pour l'affichage
src/features/counter/hooks/      la jonction entre domaine et écran
src/features/counter/Screen.tsx  l'écran, qui ne décide de rien
src/features/_shared/Panel.tsx   un composite transverse

src/components/ui/               Button et Gauge, présentationnels purs
src/lib/format.ts                formatage, sans aucune dépendance
```

Lancez les tests du domaine :

```bash
npm run test
```

Ils s'exécutent en millisecondes, sans DOM et sans mock. C'est le bénéfice concret du découplage, et la raison d'être de la règle « Zéro Modèle dans le JSX ».

## Vérifier que les frontières tiennent

Ajoutez cet import interdit dans `src/core/counter/rules.ts` :

```ts
import { CounterScreen } from "@/features/counter/Screen";
```

Puis lancez le lint :

```bash
npm run lint
```

Il doit échouer :

```
Maedow Arch : core ne peut pas importer feature. Voir « Règle de dépendance et frontières » dans architecture.md.
```

Un lint qui reste vert sur cet essai signale une configuration inactive, pas une architecture saine.

## Repartir de zéro

La démonstration est là pour être lue puis supprimée. Effacez `src/core/counter/`, `src/features/counter/` et le contenu de `src/app/page.tsx`, puis générez votre premier domaine :

```bash
npm run generate:domain <votre-domaine>
```

Vous pouvez aussi scaffolder directement sans elle :

```bash
npx create-maedow-arch-app mon-projet --blank
```

## Typographie

La démonstration utilise Space Grotesk et Manrope, auto-hébergées par `next/font`. C'est un choix de produit, pas une contrainte d'architecture : remplacez-les sans scrupule dans `src/app/layout.tsx`.
