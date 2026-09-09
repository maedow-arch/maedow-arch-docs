# Évaluation architecturale — Maedow Arch

**Source évaluée :** https://maedow-arch-docs.vercel.app/
**Documents analysés :** Introduction, Architecture (4 couches), Conventions & Standards, Registre des règles
**Packages analysés :** `eslint-config-maedow-arch`, `create-maedow-arch-app`, `maedow-arch` (npm)

---

## 1. Résumé exécutif

Maedow Arch est un standard d'architecture logicielle pour applications React / Next.js, construit autour de quatre couches à dépendance unidirectionnelle (`app → features → core → lib`), d'un Result Pattern pour la gestion d'erreurs, et d'un jeu de règles vérifiées par ESLint (`eslint-plugin-boundaries`).

**Verdict en une phrase :** le standard architectural est mature et bien pensé, et mérite d'être retenu comme référence conceptuelle ; l'implémentation npm associée ne doit pas être adoptée en l'état pour un projet en production.

Ce sont deux verdicts distincts qu'il ne faut pas fusionner :

| | Verdict |
|---|---|
| **Les idées documentées** | Recommandées comme base de convention interne |
| **Les packages npm en dépendance** | Non recommandés en l'état (voir §5) |

---

## 2. Présentation du standard

### 2.1 Les 4 couches et le flux de dépendance

```
app/        → routing, points d'entrée, injection de dépendances
features/   → écrans et modules fonctionnels (+ features/_shared/)
core/       → domaine métier pur, aucun .tsx, aucun import React/DOM
lib/        → utilitaires transverses purs
```

Le sens de dépendance est strict et **vérifié par lint** (`eslint-plugin-boundaries`) : un import remontant (`core` → `features`, par exemple) fait échouer la CI avant la revue de code.

### 2.2 Deux profils explicites

- **Light** : 3 couches, sans `core/`, pour site vitrine / prototype / MVP.
- **Full** : 4 couches complètes, pour SaaS et produits à cycle de vie long.
- Migration Light → Full outillée par génération de code, jamais l'inverse.

### 2.3 Result Pattern

Erreurs fonctionnelles modélisées comme données typées (`{ ok: true, data }` / `{ ok: false, error }`), avec helpers fournis : `unwrapOr`, `mapResult`, `match`, `andThen`, `all`.

### 2.4 Registre des règles (MA-001 à MA-009)

| Code | Règle | Statut |
|---|---|---|
| MA-001 | Flux de dépendance unidirectionnel | Vérifiée (lint) |
| MA-002 | Une feature n'importe jamais une autre feature | Vérifiée (lint) |
| MA-003 | `features/_shared/` ne connaît aucune feature | Vérifiée (lint) |
| MA-004 | Zéro `.tsx` / JSX dans `core/` | Vérifiée (lint) |
| MA-005 | `any` interdit | Vérifiée (strict) |
| MA-006 | Double assertion `as unknown as` interdite | Vérifiée (strict) |
| MA-007 | Aucun cycle d'import | Vérifiée (strict) |
| MA-008 | Modules à secrets marqués `server-only` | Tenue par l'équipe |
| MA-009 | Nommage des adaptateurs/dépôts/contrats | Tenue par l'équipe |

Le standard distingue aussi des **Règles de conception** non codifiées (Lazy Abstraction, Règle de Logique Extraite, Règle de Dégradation de `_shared/`) — appréciables, pas automatisables.

---

## 3. Points forts

1. **Les frontières sont réellement outillées, pas seulement documentées.** La configuration `eslint-plugin-boundaries` traduit les règles MA-001 à MA-003 en échec de CI concret, pas en convention d'équipe qu'on oublie.

2. **Honnêteté du registre des règles.** Distinguer explicitement 7 règles vérifiées par la machine des 2 règles tenues par l'équipe (avec justification de pourquoi elles ne sont pas automatisables) est un signe de maturité rare — la plupart des standards internes laissent croire que tout est appliqué.

3. **Result Pattern complet, pas seulement illustré.** Les helpers (`andThen`, `match`, `all`) évitent le piège classique où le Result Pattern devient plus verbeux que les exceptions qu'il remplace.

4. **Lazy Abstraction comme anti-sur-ingénierie.** Ne pas introduire `contract.ts` + adapters avant une deuxième implémentation réelle évite le piège du DDD/hexagonal cargo-culté (interfaces écrites "au cas où" pour un seul fournisseur).

5. **Règle de Logique Extraite.** Comble un angle mort fréquent des architectures en couches : un écran de 400 lignes avec douze `useState` reste conforme à toutes les règles de frontière tout en étant intestable. Le seuil ("plus de trois états ou un appel réseau → extraire dans un hook") rend ce problème actionnable.

6. **Traitement sérieux de `exactOptionalPropertyTypes`.** La distinction entre propriété absente et propriété valant `undefined`, avec les quatre cas de remède documentés, trahit une vraie expérience de production TypeScript strict — pas un copier-coller de documentation officielle.

7. **Sécurité pragmatique.** Isolation serveur/client, liste d'inclusion plutôt que d'exclusion pour les DTO de sortie, zéro secret dans les logs — des réflexes de production correctement priorisés.

8. **Tests colocalisés plutôt qu'arborescence par type.** Éviter les dossiers `unit/`, `integration/`, `e2e/` séparés du code réduit le risque de tests orphelins qui survivent à la suppression de ce qu'ils testaient.

9. **Réflexion honnête sur l'agnosticisme framework.** La comparaison Server Component vs effet client (27 vs 41 lignes, mesurées et non estimées) montre un standard qui documente ses compromis plutôt que de les nier.

---

## 4. Points de vigilance et risques (analyse approfondie)

### 4.1 Tension non résolue : Lazy Abstraction vs testabilité de `core/`

Le standard exige que `core/` se teste "sans DOM, sans mock, sans rendu", mais autorise l'accès direct au client DB tant qu'il n'y a qu'un seul fournisseur (Lazy Abstraction). Sans clarification, un développeur sous pression écrira :

```ts
// core/orders/service.ts
import { db } from "@/core/server/db";

export async function cancelOrder(id: string) {
  const order = await db.order.findUnique({ where: { id } });
  // ...
}
```

Ce code respecte Lazy Abstraction mais rend `service.ts` impossible à tester sans mock de `db` — cassant la promesse de testabilité qui est l'argument central du standard.

**Résolution recommandée (à documenter explicitement) :** injecter le repository en paramètre avec un type structurel inline, sans fichier `contract.ts` séparé :

```ts
type OrderStore = {
  findById(id: string): Promise<Order | null>;
  update(id: string, patch: Partial<Order>): Promise<Order>;
};

export async function cancelOrder(store: OrderStore, id: string) {
  const order = await store.findById(id);
  if (order === null) return { ok: false, error: { kind: "not-found" } } as const;
  return { ok: true, data: await store.update(id, { status: "cancelled" }) };
}
```

Ceci respecte Lazy Abstraction (aucun `contract.ts`, aucun second adapter) **et** la testabilité sans mock-framework.

### 4.2 Angle mort : conversion exception → Result aux frontières

Rien ne documente comment convertir les exceptions externes (Prisma sur contrainte violée, `fetch` sur timeout) en `Result` typé. Sans convention, chaque repository improvise, et une exception non catchée remonte à travers un `andThen` qui suppose n'avoir que des `Result` à gérer.

**Helper manquant à ajouter à côté de `unwrapOr`/`mapResult`/`andThen` :**

```ts
export async function fromThrowable<TData, TError>(
  fn: () => Promise<TData>,
  onError: (e: unknown) => TError
): Promise<Result<TData, TError>> {
  try {
    return { ok: true, data: await fn() };
  } catch (e) {
    return { ok: false, error: onError(e) };
  }
}
```

À utiliser systématiquement à la frontière `repository.ts`, jamais plus haut.

### 4.3 MA-008 (secrets) : le filet de sécurité manquant

Laisser la détection des secrets à la revue humaine est défendable en théorie, mais statistiquement fragile à l'échelle d'une équipe qui tourne (turnover, onboarding) — c'est l'une des causes les plus fréquentes de fuite de clé côté client en écosystème Next.js.

**Mitigations complémentaires recommandées :**
- Validation d'environnement fail-fast avec séparation stricte serveur/client (type `@t3-oss/env-nextjs`), échec au build si une variable serveur est référencée côté client.
- Scan du bundle produit en CI (grep sur `.next/static` à la recherche de patterns de clé connus) avant déploiement.

### 4.4 Angle mort : état serveur côté client (cache / TanStack Query)

Le standard ne dit rien de l'endroit où vit la logique de cache client (React Query, SWR), pourtant quasi incontournable à l'échelle de plusieurs milliers d'utilisateurs actifs.

**Recommandation cohérente avec MA-001 :** les hooks `useQuery`/`useMutation` vivent dans `features/<x>/hooks/`, appellent une fonction de `core/<x>/service.ts` comme `queryFn`, et ne contiennent eux-mêmes aucune règle métier — seulement l'orchestration de cache.

```ts
export function usePanier(clientId: string) {
  return useQuery({
    queryKey: ["panier", clientId],
    queryFn: () => chargerPanier(clientId), // vit dans core/panier/service.ts
  });
}
```

### 4.5 Multi-tenant / SaaS : mentionné, non outillé

Le mode Full cite le "multi-tenant avec fournisseurs différents" comme déclencheur de Lazy Abstraction, mais aucune convention n'adresse l'isolation des tenants elle-même (row-level security, scoping systématique par `organizationId`). Les branded types (`UserId`/`OrganizationId`) évitent la confusion d'identifiants mais ne garantissent pas qu'une requête oublie le filtre tenant.

**Recommandation :** imposer par convention (idéalement une règle ESLint maison en complément des 7 déjà présentes) que toute méthode de repository touchant des données tenant-scopées prenne `organizationId` en premier paramètre obligatoire.

### 4.6 Portée : un standard de code, pas une architecture système complète

Rien n'est dit sur l'observabilité (logs structurés, tracing, alerting), le rate limiting, la stratégie de migration de schéma DB, ou les feature flags. Pour un produit à fort trafic, ce standard doit être traité comme **un sous-ensemble** de l'architecture globale, pas comme la totalité.

---

## 5. Maturité de l'outillage npm — données factuelles

Recherche effectuée directement sur le registre npm et l'API GitHub (le moteur de recherche web n'indexe pas encore ces packages).

| Package | Dernière version | Historique de publication | Mainteneur(s) |
|---|---|---|---|
| `eslint-config-maedow-arch` | 0.4.0 | 6 versions en 10 jours (29 août → 8 sept 2026) | 1 seule personne |
| `create-maedow-arch-app` | 0.10.0 | 10 versions en 10 jours | même personne |
| `maedow-arch` (CLI d'audit) | 0.1.3 | 4 versions en 7 jours | même personne |

**Constats :**
- Premier package publié le 29 août 2026 → **moins de deux semaines d'existence** au moment de cette évaluation.
- Les trois packages ont été republiés le 8 septembre 2026 entre 21h42 et 22h55 UTC — soit à peine plus de 12 heures avant l'analyse. Le standard est en réécriture active.
- **Un seul mainteneur** (identifiant npm `jmk18`), propriétaire des trois packages et du dépôt GitHub unique qui les héberge en monorepo.
- **Aucune version 1.0.** Tout est en `0.x.y` ; en convention semver, un incrément mineur peut casser la compatibilité sans préavis — déjà observé deux fois pour `eslint-config-maedow-arch` en 10 jours.
- Numérotation de `create-maedow-arch-app` avec des sauts (0.3.0 → 0.5.0 → 0.7.0), signe de versions retirées ou de refontes rapides plutôt que d'un cycle de release stabilisé.
- Aucune dépendance directe (bonne hygiène), mais peer dependencies sur `eslint-plugin-boundaries`, `eslint-import-resolver-typescript`, `typescript-eslint`.
- API GitHub inaccessible (rate limit) pour confirmer étoiles/contributeurs, mais les données npm suffisent à établir le constat.

---

## 6. Tableau de notation

| Axe | Note | Justification |
|---|---|---|
| Qualité conceptuelle du standard | **8,5 / 10** | Synthèse mature de Clean Architecture / Hexagonal / Feature-Sliced Design, honnête sur ses limites, pragmatique |
| Complétude comme architecture système | **6 / 10** | Ne couvre ni observabilité, ni multi-tenant/RLS, ni cache client, ni CI de sécurité des secrets |
| Maturité de l'outillage npm | **2 / 10** | 11 jours d'existence, mainteneur unique, pré-1.0, réécrit la veille de l'évaluation |
| Adoptabilité en dépendance directe | **Non recommandée** | Bus factor = 1, aucun historique de stabilité |
| Adoptabilité des idées, réimplémentées en interne | **Recommandée** | Coût de réplication faible, valeur élevée |

---

## 7. Recommandation finale

> Maedow Arch documente un standard d'architecture React/Next.js pertinent et bien pensé, en particulier sur la séparation domaine/UI, le Result Pattern et la discipline de frontières via lint. Nous recommandons de nous en inspirer pour définir notre propre convention interne — en vendorisant la configuration ESLint et en écrivant notre propre `result.ts` — plutôt que de dépendre des packages npm associés, ceux-ci étant en développement solo actif depuis moins de deux semaines et ne présentant pas la stabilité requise pour un projet en production.

**Actions concrètes si le standard est retenu comme référence :**
1. Copier la configuration `eslint-plugin-boundaries` (fournie dans leur documentation) directement dans le repo, plutôt que d'installer `eslint-config-maedow-arch` en dépendance versionnée.
2. Écrire son propre `core/common/result.ts` avec les helpers `unwrapOr`, `mapResult`, `match`, `andThen`, `all`, complétés par un `fromThrowable` (voir §4.2).
3. Documenter explicitement la clarification sur Lazy Abstraction et l'injection de repository (§4.1) dans le guide d'onboarding interne.
4. Ajouter les compléments de sécurité (§4.3) et de multi-tenant (§4.5) si pertinents pour le produit.
5. Ne pas utiliser `maedow-arch` (CLI d'audit) comme gate bloquant en CI pour l'instant ; l'exécuter en mode informatif uniquement.

## 8. Conditions pour réévaluer l'adoption des packages npm

- Sortie d'une **version 1.0** stable sur au moins un des trois packages.
- Apparition d'un **second mainteneur** ou d'une organisation derrière le projet.
- Historique de releases espacées, signe d'un plateau de stabilité plutôt que d'une phase de rodage.
- Adoption externe visible (issues d'utilisateurs tiers, retours d'expérience publiés, activité communautaire).

---

*Évaluation réalisée à partir de la documentation publique du site, du registre npm et de l'API GitHub. Dernière vérification des données de version : 9 septembre 2026.*
