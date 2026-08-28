# Conventions & Standards de l'Architecture Maedow

> **Standards de Développement et Règles de Qualité Logicielle sous l'Architecture Maedow**  
> Ce document définit les conventions applicables à tout projet suivant les principes de l'Architecture Maedow (*maedow-architecture*).

---

## 1. Règle d'Or Maedow : Isolation des Responsabilités

1. **Les fichiers `.tsx` ne contiennent que du code de présentation** (JSX, layout, binding d'événements UI légers).
2. **Les fichiers `.ts` encapsulent toute la logique** (types, transformations, appels de services, validateurs, hooks).
3. **Les composants ne font pas d'appels directs à des bases de données ou API tierces** : ils consomment un hook ou un service d'abstraction.

---

## 2. Conventions de Nommage et Extensions Maedow

| Type d'Élément | Format | Extension | Exemple |
| :--- | :--- | :--- | :--- |
| **Composant React d'Écran** | PascalCase | `.tsx` | `OrderSummaryCard.tsx` |
| **Composant Métier Partagé** | PascalCase | `.tsx` | `features/_shared/AddressPicker.tsx` |
| **Hook React** | camelCase (`use*`) | `.ts` | `useOrderPayment.ts` |
| **Entité / Types Métier** | camelCase | `.ts` | `types.ts`, `entities.ts` |
| **Service / Use Case** | camelCase | `.ts` | `calculateDiscount.ts`, `orderService.ts` |
| **Schéma de Validation** | camelCase | `.ts` | `order.schema.ts`, `validation.ts` |
| **Contrat d'Interface (Port)** | camelCase | `.ts` | `payment.contract.ts` |
| **Adaptateur d'Infrastructure** | camelCase (`*.adapter.ts` ou `*.repository.ts`) | `.ts` | `stripePayment.adapter.ts`, `postgresOrder.repository.ts` |

---

## 3. Typage et TypeScript Strict sous Maedow

Pour éviter les erreurs silencieuses à l'exécution, les règles suivantes sont imposées :

```json
// tsconfig.json (Extrait recommandé)
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### Règles de programmation :
* ⛔ **`any` est strictement interdit** : Utiliser `unknown` avec des gardes de types ou de la validation Zod/Valibot à l'entrée des frontières.
* ⛔ **Double assertion interdite (`as unknown as TargetType`)** : Ne forcez pas les types, validez-les au moment du parsing.
* ✅ **Inférence de types Zod (`z.infer`)** : Dérivez systématiquement les types de DTOs depuis les schémas de validation plutôt que de les dupliquer.
* ✅ **Branded Types pour les identifiants critiques** : Pour éviter d'inverser accidentellement deux IDs de même type primitif (ex: `userId` et `organizationId`), utiliser des types opaques/marqués :

```typescript
export type UserId = string & { readonly __brand: unique symbol };
export type OrganizationId = string & { readonly __brand: unique symbol };
```

---

## 4. Gestion des Erreurs : Données Typées vs Exceptions (Result Pattern)

Dans l'Architecture Maedow, **les erreurs prévisibles et fonctionnelles sont modélisées comme des données**, pas comme des exceptions système.

### Le Pattern Résultat (Discriminated Union) :

```typescript
// core/common/result.ts
export type Result<TData, TError = string> =
  | { ok: true; data: TData }
  | { ok: false; error: TError };

// Exemple d'usage métier
export type CheckoutFailure =
  | { kind: "insufficient-funds"; amountMissing: number }
  | { kind: "item-out-of-stock"; itemId: string }
  | { kind: "payment-gateway-timeout" };

export async function processCheckout(orderId: string): Promise<Result<{ transactionId: string }, CheckoutFailure>> {
  // Traitement...
  if (stockIssue) {
    return { ok: false, error: { kind: "item-out-of-stock", itemId: "123" } };
  }
  return { ok: true, data: { transactionId: "tx_abc" } };
}
```

---

## 5. Sécurité & Gestion des Données Sensibles

1. **Isolation Serveur / Client** :
   * Tout module manipulant des clés API secrètes, des tokens d'administration ou des accès directs à la base de données doit être restreint au serveur (`import "server-only"` ou convention `.server.ts`).
2. **Zéro Secret dans les Logs** :
   * Ne jamais logger d'objets bruts pouvant contenir des en-têtes d'autorisation, des mots de passe ou des tokens d'authentification.
   * Utiliser une allowlist d'en-têtes et de propriétés autorisées pour les rapports d'incidents.
3. **Validation Systématique aux Frontières** :
   * Toute entrée externe (requêtes HTTP, formulaires, webhooks, paramètres d'URL) doit être validée via un parseur de schéma (ex: Zod) avant d'atteindre le cœur de domaine.

---

## 6. Générateurs de Code & Productivité (Scaffolding Maedow)

Pour réduire le coût de création de fichiers liés au découplage de l'Architecture Maedow, configurez un script de génération dans votre `package.json` :

```json
// package.json
{
  "scripts": {
    "generate:feature": "node scripts/scaffold-feature.mjs",
    "generate:domain": "node scripts/scaffold-domain.mjs"
  }
}
```

Ce script initialise automatiquement :
* `features/<nom>/Screen.tsx`
* `features/<nom>/types.ts`
* `features/<nom>/hooks/use<Nom>.ts`
* `features/<nom>/<Nom>.test.tsx`
