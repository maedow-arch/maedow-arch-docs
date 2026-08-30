# __PROJECT_NAME__

Projet suivant [Maedow Arch](https://maedow-arch-docs.vercel.app), un standard d'architecture modulaire et découplé.

## Démarrer

```bash
npm install
npm run dev
```

## L'arborescence, et sa règle

```
src/
├── app/            Routes et assemblage. Peut tout importer.
├── features/       Écrans, hooks, ViewModels.
│   └── _shared/    Composites transverses, qui ne connaissent aucune feature.
├── core/           Domaine métier. Aucune dépendance à l'interface.
├── components/ui/  Présentationnel pur.
└── lib/            Utilitaires sans dépendance.
```

Le flux de dépendance descend, et ne remonte jamais : `app → features → core → lib`.

Cette règle n'est pas une convention d'équipe, elle est vérifiée au lint :

```bash
npm run lint
```

## Générateurs

```bash
npm run generate:domain billing     # src/core/billing/
npm run generate:feature checkout   # src/features/checkout/
```

Le domaine généré applique la **Règle de Lazy Abstraction** : accès direct à la donnée, sans `contract.ts` ni adapters, tant qu'une deuxième implémentation réelle n'est pas nécessaire.

## Vérifier que les frontières sont actives

Une configuration de frontières qui ne matche rien passe au vert. Le seul essai qui prouve quelque chose est le test négatif : ajoutez temporairement un import interdit et vérifiez que le lint échoue.

```ts
// dans src/core/<domaine>/service.ts
import { Something } from "@/features/quelque-chose/Screen"; // doit lever une erreur
```
