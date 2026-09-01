# Conventions & Standards de Maedow Arch

> **Standards de Développement et Règles de Qualité Logicielle sous Maedow Arch**  
> Ce document définit les conventions applicables à tout projet suivant les principes de Maedow Arch (*maedow-arch*).

---

## Règle d'Or Maedow Arch : Isolation des Responsabilités

1. **Les fichiers `.tsx` ne contiennent que du code de présentation** (JSX, layout, binding d'événements UI légers).
2. **Les fichiers `.ts` encapsulent toute la logique** (types, transformations, appels de services, validateurs, hooks).
3. **Les composants ne font pas d'appels directs à des bases de données ou API tierces** : ils consomment un hook ou un service d'abstraction.

---

## Conventions de Nommage et Extensions Maedow Arch

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

## Typage et TypeScript Strict sous Maedow Arch

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

## Gestion des Erreurs : Données Typées vs Exceptions (Result Pattern)

Dans Maedow Arch, **les erreurs prévisibles et fonctionnelles sont modélisées comme des données**, pas comme des exceptions système.

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

### Helpers Obligatoires pour le Result Pattern (Anti-Verbosité)

Sans helpers, le Result Pattern devient rapidement plus verbeux que les exceptions qu'il remplace (`if (!result.ok) { ... }` répété partout). Tout projet Maedow Arch doit définir ces helpers dès l'introduction du pattern :

```typescript
// core/common/result.ts (suite)

// Extrait la donnée ou retourne une valeur par défaut
export function unwrapOr<TData, TError>(result: Result<TData, TError>, fallback: TData): TData {
  return result.ok ? result.data : fallback;
}

// Transforme la donnée si succès, propage l'erreur telle quelle
export function mapResult<TData, TMapped, TError>(
  result: Result<TData, TError>,
  fn: (data: TData) => TMapped
): Result<TMapped, TError> {
  return result.ok ? { ok: true, data: fn(result.data) } : result;
}

// Pattern-matching explicite, aucune branche n'est oubliée
export function match<TData, TError, TReturn>(
  result: Result<TData, TError>,
  handlers: { ok: (data: TData) => TReturn; err: (error: TError) => TReturn }
): TReturn {
  return result.ok ? handlers.ok(result.data) : handlers.err(result.error);
}

// Enchaîne une opération faillible sur le succès de la précédente
export async function andThen<TData, TSuivant, TError>(
  result: Result<TData, TError> | Promise<Result<TData, TError>>,
  fn: (data: TData) => Result<TSuivant, TError> | Promise<Result<TSuivant, TError>>
): Promise<Result<TSuivant, TError>> {
  const resolu = await result;
  return resolu.ok ? fn(resolu.data) : resolu;
}

// Agrège une liste de résultats, en s'arrêtant à la première erreur
export function all<TData, TError>(results: Result<TData, TError>[]): Result<TData[], TError> {
  const donnees: TData[] = [];

  for (const result of results) {
    if (!result.ok) return result;
    donnees.push(result.data);
  }

  return { ok: true, data: donnees };
}
```

### Enchaîner plusieurs opérations faillibles

C'est le point où le Result Pattern tient ou s'écroule, et c'est celui qu'on documente le moins.

`mapResult` transforme une donnée, mais son résultat n'est pas faillible. Un service qui enchaîne trois appels pouvant chacun échouer retombe donc sur l'imbrication que le pattern devait supprimer :

```typescript
// ❌ Ce que le Result Pattern était censé faire disparaître
const commande = await trouverCommande(id);
if (!commande.ok) return commande;

const autorisee = await autoriserPaiement(commande.data);
if (!autorisee.ok) return autorisee;

const encaissee = await encaisser(autorisee.data);
if (!encaissee.ok) return encaissee;

return { ok: true, data: encaissee.data };
```

`andThen` enchaîne, et court-circuite à la première erreur :

```typescript
// ✅ Trois étapes faillibles, une seule expression
export async function payerCommande(id: string): Promise<Result<Paiement>> {
  return andThen(andThen(trouverCommande(id), autoriserPaiement), encaisser);
}
```

Chaque étape reçoit la donnée de la précédente et rend un `Result`. Dès qu'une échoue, les suivantes ne sont pas appelées et l'erreur remonte telle quelle, sans être enveloppée ni traduite.

`all` sert le cas parallèle plutôt que séquentiel, typiquement une validation :

```typescript
// ✅ Valider une liste, et s'arrêter à la première ligne fautive
const lignes = panier.map(validerLigne);
const validees = all(lignes);

if (!validees.ok) return validees; // la première erreur, telle quelle
```

**Pourquoi `andThen` est asynchrone même quand l'étape ne l'est pas.** Deux variantes, l'une synchrone et l'autre non, obligeraient à choisir à chaque appel selon ce que fait l'étape suivante, c'est-à-dire à connaître son implémentation. Rendre une opération asynchrone cesserait alors d'être un détail interne et deviendrait une rupture de contrat pour tous ses appelants.

**Exemple d'usage recommandé** (à documenter systématiquement dans le README d'un projet Maedow Arch) :

```typescript
const checkoutResult = await processCheckout(orderId);

match(checkoutResult, {
  ok: ({ transactionId }) => redirectToConfirmation(transactionId),
  err: (error) => showCheckoutError(error),
});
```

---

## Sécurité & Gestion des Données Sensibles

1. **Isolation Serveur / Client** :
   * Tout module manipulant des clés API secrètes, des tokens d'administration ou des accès directs à la base de données doit être restreint au serveur (`import "server-only"` ou convention `.server.ts`).
2. **Zéro Secret dans les Logs** :
   * Ne jamais logger d'objets bruts pouvant contenir des en-têtes d'autorisation, des mots de passe ou des tokens d'authentification.
   * Utiliser une allowlist d'en-têtes et de propriétés autorisées pour les rapports d'incidents.
3. **Validation Systématique aux Frontières** :
   * Toute entrée externe (requêtes HTTP, formulaires, webhooks, paramètres d'URL) doit être validée via un parseur de schéma (ex: Zod) avant d'atteindre le cœur de domaine.

---

## Générateurs de Code & Productivité (Scaffolding Maedow Arch)

Pour réduire le coût de création de fichiers liés au découplage de Maedow Arch, configurez un script de génération dans votre `package.json` :

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
