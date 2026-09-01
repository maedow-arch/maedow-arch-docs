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
| **Test** | le nom de ce qu'il teste (`*.test.ts` ou `*.test.tsx`) | `.ts` / `.tsx` | `result.test.ts`, `CheckoutScreen.test.tsx` |

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
4. **Sérialisation Décrite en Sortie** :
   * Ce qui part vers le client est décrit par un schéma, jamais laissé au hasard de la forme de l'entité. Voir [Le DTO de Sortie](./models.md) dans `models.md`.
   * La règle 2 protège les journaux, celle-ci protège les réponses. C'est la seconde qui fuit le plus souvent : un `return user` renvoie l'entité entière, rien n'échoue, et le champ interne ajouté ce matin part vers le client le jour même.
   * Une liste d'inclusions, jamais une liste d'exclusions. Un `Omit<User, "passwordHash">` laisse passer par défaut et n'exclut que ce dont on s'est souvenu : il est en retard d'un champ en permanence.

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

---

## Pyramide de Tests et Testabilité

### Où vivent les tests

**À côté de ce qu'ils testent, toujours.** `core/billing/billing.test.ts` accompagne `core/billing/service.ts`, et `features/checkout/Checkout.test.tsx` accompagne son écran.

Ce n'est pas un goût de rangement. Un test séparé de son sujet se met à mentir dès le premier déplacement de fichier : il continue de passer alors qu'il teste une version antérieure du comportement, ou il est oublié lors d'une suppression et devient un test orphelin qui vérifie du code mort. Colocalisé, il se déplace, se relit et se supprime avec ce qu'il couvre.

C'est aussi ce que produisent les deux générateurs : `generate:domain` et `generate:feature` amorcent chacun leur test au bon endroit.

Un projet Maedow Arch ne livre donc **aucun dossier `tests/`**. Une arborescence par nature de test, `unit/`, `integration/`, `e2e/`, oblige à ranger avant d'écrire, et la question « ceci est-il unitaire ou d'intégration ? » n'a aucune réponse utile pour un service de domaine qui appelle deux fonctions pures.

### Ce que chaque couche appelle un test

La pyramide de Maedow Arch ne se lit pas en pourcentages, elle se lit en **coût d'exécution**. Chaque couche se teste par le moyen le moins cher qui prouve quelque chose.

| Couche | Ce qu'on teste | Ce dont on n'a pas besoin |
| :--- | :--- | :--- |
| `core/` | les règles métier, les transitions d'état, les contrats | ni DOM, ni mock, ni rendu |
| `lib/` | les fonctions d'aide, sur leurs cas limites | rien non plus |
| `components/` | le rendu d'une primitive à partir de ses props | un moteur de rendu, sans données métier |
| `features/` | le parcours d'un écran, avec son domaine réel | un moteur de rendu, et rien de simulé côté domaine |
| `app/` | l'assemblage, de bout en bout, sur les chemins critiques seulement | un navigateur, donc le test le plus cher |

La base large de la pyramide n'est pas une consigne de quantité, c'est une conséquence : **si le domaine est pur, ses tests sont si rapides et si simples à écrire qu'ils deviennent naturellement les plus nombreux.** Une pyramide qui ne se remplit pas par le bas signale que la logique a fui vers le haut, dans les écrans ou dans les routes, ce que la règle « zéro modèle dans le JSX » cherche précisément à empêcher.

### Ce que la pyramide ne dit pas

**Elle ne fixe aucun taux de couverture.** Une exigence de couverture chiffrée sur `core/` produit des tests écrits pour la métrique : on teste les accesseurs et on saute la règle de gestion, parce que la première ligne compte autant que la seconde dans le calcul.

L'exigence utile est vérifiable autrement, et elle l'est déjà : **`core/` doit se tester sans DOM, sans mock et sans rendu.** Un test du domaine qui a besoin de simuler quelque chose signale que le domaine dépend de quelque chose dont il ne devrait pas dépendre, et c'est une violation de frontière avant d'être un problème de test.

### En Mode Light

La couche domaine n'existe pas, la base de la pyramide non plus. Les tests portent alors sur `lib/` et sur les écrans. C'est cohérent, et c'est même l'argument du profil : un site vitrine n'a pas de règles de gestion à protéger.

Le jour où il en acquiert, `generate:domain` fait naître `core/` avec son premier test, et la pyramide se remplit par le bas.
