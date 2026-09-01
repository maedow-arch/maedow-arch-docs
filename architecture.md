# Maedow Arch (Maedow Arch Blueprint)

> **Standard d'Architecture Logicielle Modulaire, Découplée & Agnostique pour Applications Web Modernes (TypeScript / React / Next.js / etc.)**  
> **Maedow Arch** (*maedow-arch*) définit un pattern de conception robuste, agnostique de vos choix de base de données, d'authentification ou d'outils tiers, conçu pour garantir une maintenabilité, une évolutivité et une testabilité optimales.

---

## Vision et Piliers Fondamentaux de Maedow Arch

**Maedow Arch** repose sur 6 principes cardinaux :

1. **Séparation Stricte du Domaine Métier et de l'UI (Zéro Modèle dans le JSX)** : Les règles métier, les interfaces de données, les schémas de validation et les transitions d'état sont 100 % isolés du code de présentation React/HTML.
2. **Architecture en Couches à Dépendance Unidirectionnelle** : Le flux de dépendance est strict (`app -> features -> core -> lib`). Le domaine métier (`core`) n'a aucune connaissance des composants d'interface (`features` / `components`).
3. **Agnosticisme de l'Infrastructure (Pattern Ports & Adapters / Hexagonal)** : La base de données, l'authentification et les API tierces sont masquées derrière des contrats d'interfaces. Changer de base (Postgres, SQLite, MongoDB, IndexedDB, Prisma, Drizzle) ou d'auth (BetterAuth, Auth.js, Supabase, Firebase, JWT custom) ne touche jamais le cœur métier ni l'UI.
4. **Erreurs Typées & Prévisibles (Result Pattern)** : Les refus attendus et les échecs fonctionnels sont retournés comme des données discriminées (`{ ok: false, error: "..." }`) et non levés comme des exceptions silencieuses.
5. **Garde-fous Outillés (Machine-Enforced Architecture)** : Les frontières architecturales ne reposent pas sur la simple discipline humaine mais sont vérifiées par le compilateur TypeScript (`strict`) et des règles de linter (`eslint-plugin-boundaries`).
6. **Pragmatisme & Composition Évolutive** : L'architecture évite l'over-engineering grâce à l'inférence de types, des générateurs de code et un pattern de composants partagés (`features/_shared/`).

---

## Vue d'Ensemble des Couches Maedow Arch

```mermaid
flowchart TD
    APP["1 · APP ROUTING ET ENTRY<br/>app/ ou pages/<br/>Pages, layouts, API route handlers"]
    FEAT["2 · FEATURES, LES SURFACES UI<br/>features/[feature]/ : écrans, hooks locaux, composants dédiés<br/>features/_shared/ : composants métier transverses partagés"]
    CORE["3 · CORE, LE DOMAINE PUR<br/>core/[module]/ : types, services<br/>Modèles et entités purs, moteurs d'états, contrats de ports<br/>ZÉRO JSX, ZÉRO dépendance UI"]
    LIB["4 · COMPONENTS ET LIB<br/>components/ui/, lib/utils.ts<br/>Primitives UI agnostiques, fonctions d'aide pures<br/>ZÉRO logique métier"]

    APP -->|assemble| FEAT
    FEAT -->|consomme| CORE
    FEAT -->|consomme| LIB
```

---

## Matrice des Rôles par Couche

| Couche | Répertoire | Responsabilité | Ce qu'elle CONTIENT | Ce qu'elle NE CONTIENT JAMAIS |
| :--- | :--- | :--- | :--- | :--- |
| **App** | `app/` | Point d'entrée, routing, injection de dépendances. | Les fichiers d'amorçage et de routing du framework hôte. Sous Next.js : `page.tsx`, `layout.tsx`, `route.ts`, middlewares. Voir [Maedow Arch hors Next.js](#maedow-arch-hors-nextjs). | Logique métier détaillée, requêtes directes non encapsulées. |
| **Features** | `features/<feature>/` | Écrans et modules fonctionnels utilisateur. | Composants `.tsx`, hooks React dédiés, adaptateurs de vue. | Définitions de modèles de données partagés, logique de persistance brute. |
| **Shared Features** | `features/_shared/` | Composants UI métier utilisés par $\ge$ 2 features. | Composants composites métier partagés (`UserAvatarCard`, `AddressPicker`). | Primitives UI agnostiques (qui vont dans `components/ui/`). |
| **Core** | `core/<module>/` | Cœur métier, domaine pur, persistance, contrats. | Types/Interfaces purs (`.ts`), machines d'états, validateurs, interfaces de repositories. | **ZÉRO fichier `.tsx`**, aucun import React/DOM. |
| **UI Primitives** | `components/ui/` | Composants atomiques réutilisables (Design System). | Boutons, Modales, Inputs, Dropdowns, etc. | Types métier, appels API, état applicatif global. |
| **Lib** | `lib/` | Utilitaires transverses non liés au métier. | Formatage, manipulation de chaînes/dates, helpers CSS (`cn`). | Types spécifiques au métier, règles de gestion. |

---

<ModeFull>

## Agnosticisme Technique : Adapters & Infrastructure dans Maedow Arch

> **Règle de Lazy Abstraction (Introduction Différée des Contrats)** : un `contract.ts` + un système d'adapters ne doit être introduit **qu'au moment où une deuxième implémentation réelle est nécessaire** (migration de base, multi-tenant avec fournisseurs différents, besoin de mock avancé en test). Tant qu'un seul fournisseur (une seule DB, un seul provider d'auth) est utilisé et qu'aucun changement n'est prévu à court terme, l'accès direct dans `core/<domaine>/repository.ts` est conforme à Maedow Arch. Abstraire par anticipation sans second cas d'usage concret est un anti-pattern Maedow Arch : ça ajoute de l'indirection sans bénéfice mesurable.

### Gestion de l'Authentification (Auth Agnostic)

Le code applicatif interagit avec une abstraction d'identité :

```typescript
// core/auth/types.ts
export interface UserSession {
  userId: string;
  email?: string;
  role: "admin" | "member" | "guest";
}

export interface AuthService {
  getSession(req: Request): Promise<UserSession | null>;
  requireUser(req: Request): Promise<UserSession>;
}
```

* **Implémentations interchangeables** :
  * `core/auth/better-auth.adapter.ts` (BetterAuth)
  * `core/auth/supabase.adapter.ts` (Supabase)
  * `core/auth/authjs.adapter.ts` (NextAuth / Auth.js)
  * `core/auth/jwt.adapter.ts` (API backend externe / JWT custom)

### Gestion de la Persistance (Database Agnostic)

Le domaine définit ses interfaces de Repository (Ports) :

```typescript
// core/users/repository.contract.ts
import type { UserEntity, CreateUserInput } from "./types";

export interface UserRepository {
  findById(id: string): Promise<UserEntity | null>;
  create(input: CreateUserInput): Promise<UserEntity>;
  update(id: string, partial: Partial<UserEntity>): Promise<UserEntity>;
}
```

* **Implémentations concrètes (Adapters)** :
  * `core/users/postgres.repository.ts` (SQL brut / `pg`)
  * `core/users/prisma.repository.ts` (Prisma ORM)
  * `core/users/drizzle.repository.ts` (Drizzle ORM)
  * `core/users/dexie.repository.ts` (IndexedDB / Local-first)
  * `core/users/firestore.repository.ts` (Firebase / Firestore)

---

</ModeFull>

## Composition de Features & Éléments Partagés (`features/_shared/`)

Pour respecter la règle de Maedow Arch « *Une feature n'importe pas une autre feature* », les éléments d'interface composites transverses sont placés dans `features/_shared/` :

```
features/
├── checkout/                 # Feature autonome
│   └── CheckoutScreen.tsx    # Consomme _shared/AddressPicker
├── account/                  # Feature autonome
│   └── ProfileScreen.tsx     # Consomme _shared/AddressPicker
└── _shared/                  # Composants métier partagés
    └── AddressPicker.tsx     # Dépend de core/, mais réutilisable
```

### Règle de Dégradation de `features/_shared/` (Anti Fourre-Tout)

Pour empêcher `features/_shared/` de devenir un dépotoir avec le temps, deux règles s'appliquent :

1. **Extraction a posteriori uniquement** : un composant n'est **jamais créé directement** dans `_shared/`. Il naît dans une feature, et n'est déplacé vers `_shared/` que lorsqu'une **deuxième feature en a réellement besoin**.
2. **Revue périodique d'usage** : à intervalle régulier (ex. tous les X sprints, ou via un script listant les imports réels de chaque fichier de `_shared/`), tout composant qui n'est plus consommé que par une seule feature **redescend** dans cette feature.

---

## Règle de Dépendance et Frontières Maedow Arch (`eslint-plugin-boundaries`)

Ces frontières portent les codes **MA-001**, **MA-002** et **MA-003** du [registre des règles](./rules.md), et ce sont les codes que citent les messages de lint. Le registre dit, pour chacune des neuf règles du standard, si elle est vérifiée par la machine ou tenue par l'équipe : c'est là qu'il faut regarder avant de se demander si une exigence sera attrapée automatiquement.

```javascript
// eslint.config.mjs
import boundaries from "eslint-plugin-boundaries";

export default [
  {
    plugins: { boundaries },
    settings: {
      "boundaries/elements": [
        { type: "app", pattern: "app/**" },
        { type: "feature", pattern: "features/*", capture: ["feature"] },
        { type: "shared-feature", pattern: "features/_shared/**" },
        { type: "core", pattern: "core/**" },
        { type: "components", pattern: "components/**" },
        { type: "lib", pattern: "lib/**" },
      ],
    },
    rules: {
      "boundaries/dependencies": [
        "error",
        {
          default: "disallow",
          policies: [
            { from: { element: { type: "app" } }, allow: { to: { element: { types: { anyOf: ["feature", "shared-feature", "core", "components", "lib"] } } } } },
            { from: { element: { type: "feature" } }, allow: { to: { element: { types: { anyOf: ["shared-feature", "core", "components", "lib"] } } } } },
            { from: { element: { type: "feature" } }, allow: { to: { element: { type: "feature", captured: { feature: "{{from.feature}}" } } } } },
            { from: { element: { type: "shared-feature" } }, allow: { to: { element: { types: { anyOf: ["core", "components", "lib"] } } } } },
            { from: { element: { type: "core" } }, allow: { to: { element: { types: { anyOf: ["core", "lib"] } } } } },
            { from: { element: { type: "components" } }, allow: { to: { element: { types: { anyOf: ["components", "lib"] } } } } },
            { from: { element: { type: "lib" } }, allow: { to: { element: { type: "lib" } } } },
          ],
        },
      ],
    },
  },
];
```

---

## Structure Recommandée d'un Projet sous Maedow Arch

```text
src/
├── app/                        # Routing & Points d'entrée
│   ├── (auth)/
│   ├── (dashboard)/
│   ├── api/
│   ├── layout.tsx
│   └── page.tsx
│
├── core/                       # Domaine & Logique Métier Pure (100% .ts)
│   ├── <domaine>/              # Ex: billing, users, catalog...
│   │   ├── types.ts            # Entités et modèles
│   │   ├── validation.ts       # Schémas Zod
│   │   ├── service.ts          # Cas d'usage
│   │   ├── contract.ts         # Interfaces de repositories/services
│   │   └── repository.ts       # Adapter de persistance
│   ├── auth/                   # Abstraction d'authentification
│   └── server/                 # Infra serveur (DB Pool, Env)
│
├── features/                   # Écrans & Surfaces UI
│   ├── _shared/                # Composants composites métier partagés
│   ├── <feature_A>/
│   │   ├── components/         # Composants .tsx dédiés
│   │   ├── hooks/              # Hooks React locaux (.ts)
│   │   ├── Screen.tsx          # Composant principal d'écran (.tsx)
│   │   └── types.ts            # Types d'affichage locaux (.ts)
│   └── <feature_B>/
│
├── components/                 # Primitives UI Agnostiques
│   └── ui/                     # Design System (Button, Modal, Input...)
│
├── lib/                        # Utilitaires Génériques Transverses
│   ├── utils.ts
│   └── dates.ts
│
└── tests/                      # Tests automatisés
    ├── unit/                   # Tests unitaires du core/ (ultra rapides)
    ├── integration/            # Tests adaptateurs & DB
    └── e2e/                    # Tests bout en bout (Playwright)
```

---

## Génération Rapide de Code (Scaffolding Anti-Boilerplate)

Pour accélérer le développement sous Maedow Arch :

```bash
# Générer une nouvelle feature avec toute son arborescence
npm run generate:feature orders

# Générer un nouveau domaine core avec contrat et types
npm run generate:domain billing
```

---

## Mode Light vs Mode Full : Quand Appliquer Maedow Arch Intégralement

La Maedow Arch complète (4 couches, contracts, adapters, générateurs) est conçue pour des produits qui grandissent dans le temps (SaaS, applications métier durables). Elle est disproportionnée pour un site vitrine, un prototype ou une landing page. Pour éviter la sur-ingénierie, **Maedow Arch définit deux profils explicites** :

| Critère | **Maedow Arch Light** | **Maedow Arch Full** |
| :--- | :--- | :--- |
| Type de projet | Site vitrine, prototype, MVP jetable, landing page | SaaS, produit avec cycle de vie long, produit multi-clients |
| Durée de vie prévue | Courte (< 6 mois) ou usage unique | Longue, avec évolutions régulières |
| Logique métier | Faible ou inexistante | Significative (règles, calculs, transitions d'état) |
| Structure recommandée | `app/`, `features/`, `components/` et `lib/`, avec la logique directement dans la feature et **sans couche `core/`** | Structure complète : `app/ → features/ → core/ → lib/` |
| Contracts / Adapters | Aucun, accès direct à la donnée | Introduits uniquement via la Règle de Lazy Abstraction, voir [Agnosticisme technique](#agnosticisme-technique--adapters--infrastructure-dans-maedow-arch) |
| Result Pattern | Optionnel | Recommandé, avec helpers, voir « Helpers obligatoires pour le Result Pattern » dans `conventions.md` |

### Ce que Light conserve

Light retire la couche domaine, rien d'autre. `components/ui/` et `lib/` restent légitimes : un site vitrine a des boutons et des helpers de formatage sans que cela constitue de la sur-ingénierie, et les garder à part rend la bascule ultérieure indolore.

Les **règles de frontières s'appliquent identiquement dans les deux profils**, voir [Règle de dépendance et frontières](#règle-de-dépendance-et-frontières-maedow-arch-eslint-plugin-boundaries). Une feature n'importe jamais une autre feature, `components/` demeure présentationnel, `lib/` ne dépend de rien. Ces contraintes ne coûtent rien et valent quelle que soit la taille du projet. Les deux profils ne sont donc pas deux jeux de règles, mais une relation d'inclusion : Light ne peuple pas `core/`, il ne l'autorise pas différemment.

Conséquence pratique : `eslint-config-maedow-arch` sert les deux profils sans configuration distincte.

### Passer de Light à Full

La bascule n'est pas une migration, c'est une addition. Rien de ce qui existe ne bouge : `app/`, `features/`, `components/` et `lib/` gardent leur place et leurs règles, et la couche domaine apparaît à côté.

Elle se produit au moment où un domaine devient nécessaire, et le générateur la porte :

```bash
npm run generate:domain order-item
```

Sur un projet Light, cette commande crée `core/common/result.ts` avant d'écrire le domaine, puis annonce le changement de profil. Il n'y a rien d'autre à faire, et surtout rien à déplacer.

C'est pour cette raison que `core/` reste vide en Light plutôt que d'être livré avec un Result Pattern inutilisé : une couche présente mais vide invite à y écrire du domaine par anticipation, ce que la Règle de Lazy Abstraction interdit. La couche naît de son premier habitant.

Le mouvement inverse n'est pas outillé, et c'est délibéré : retirer une couche domaine peuplée demande de décider où va chacune de ses règles, et cette décision n'appartient pas à un générateur.

### Choisir son profil à l'installation

```bash
npx create-maedow-arch-app mon-projet --mode full    # les quatre couches
npx create-maedow-arch-app mon-projet --mode light   # sans couche core
```

Sans drapeau, la CLI pose la question lorsqu'elle est lancée depuis un terminal, et retient `full` sinon.

Chaque profil se décline en deux contenus : `--template demo` livre un compteur borné illustrant le profil choisi, `--template blank` livre l'arborescence seule. Générer la même démonstration dans les deux profils et comparer les arborescences est le moyen le plus court de saisir ce que la séparation apporte, et ce qu'elle coûte.

**Règle de bascule** : un projet démarré en Mode Light qui gagne en complexité (nouvelle feature qui duplique de la logique, besoin de tester le métier indépendamment de l'UI, montée en charge du produit) doit migrer progressivement vers le Mode Full, domaine par domaine, jamais en un seul refactor global.

---

## Maedow Arch hors Next.js

Le standard revendique l'agnosticisme technique. Il doit donc valoir au-delà du framework qui a servi à le formuler.

**Trois couches sur quatre ne bougent pas, à une condition.** `features/`, `core/`, `components/` et `lib/` ne connaissent ni routeur, ni convention de fichiers, ni rendu serveur. Elles sont portables telles quelles **si les écrans reçoivent leurs données au lieu d'aller les chercher**.

Cette condition n'est pas une réserve de style : c'est elle qui fait tout tenir. Un projet dont les écrans appellent eux-mêmes leurs sources verra le coût du portage se répandre dans `features/`, et l'affirmation ci-dessus sera fausse pour lui. Le [chargement de données côté serveur](#le-chargement-de-données-côté-serveur) donne le test à faire sur votre propre code avant de vous lancer.

**Seule la couche `app/` s'adapte.** Sa définition reste inchangée : point d'entrée, routing, injection de dépendances. Ce sont ses fichiers qui diffèrent, parce que chaque framework déclare ses routes à sa façon.

| Responsabilité | Next.js App Router | React sur Vite |
| :--- | :--- | :--- |
| Point d'entrée | `app/layout.tsx` | `app/main.tsx` |
| Coquille et injection | `app/layout.tsx` | `app/App.tsx` |
| Déclaration des routes | l'arborescence de `app/` | `app/routes.tsx` |

L'interdiction, elle, ne change jamais : aucune logique métier détaillée dans cette couche, quel que soit le framework.

### Le chargement de données côté serveur

C'est le point où le portage se joue vraiment, et la question difficile de cette section. Les Server Components et les Server Actions n'ont pas d'équivalent hors Next.js.

**La condition qui fait tenir l'affirmation.** Les trois couches ne bougent pas *à condition que vos écrans reçoivent leurs données au lieu d'aller les chercher*. Ce n'est pas le framework qui rend le portage possible, c'est la règle « zéro modèle dans le JSX » appliquée avant lui.

Le test à faire sur votre propre code, avant de vous lancer :

> Ouvrez trois écrans de `features/`. Reçoivent-ils leurs données en props, ou appellent-ils eux-mêmes une source ?

Si les écrans reçoivent, ce qui suit vous coûtera une couche. **S'ils vont chercher, le portage vous coûtera les quatre**, parce que chaque écran devra être repris, et l'affirmation ci-dessus ne vaut pas pour votre projet.

#### Deux chemins, deux destins

La donnée lue par une route API et la donnée lue dans un Server Component ne se portent pas du tout pareil.

**La route API se porte presque telle quelle.** Le corps de la fonction est identique, seuls son emplacement et sa signature d'export changent :

```typescript
// Next : app/api/catalogue/route.ts
export async function GET() {
  const resultat = verifierCatalogue(SOURCE);
  if (!resultat.ok) return Response.json({ erreur: resultat.error }, { status: 404 });
  return Response.json(resultat.data);
}
```

Le même corps se pose dans un gestionnaire Express, Hono ou Fastify. Rien à repenser.

**Le Server Component, lui, n'a pas d'équivalent.** Il faut le remplacer, et le remplacement change de nature :

| | Server Component | Effet client, hors Next |
| :--- | :--- | :--- |
| Moment de la lecture | pendant le rendu | après le montage |
| États à exprimer | aucun | trois : chargement, erreur, données |
| Route intermédiaire | inutile | obligatoire |
| Annulation | rien à gérer | à gérer au démontage |
| Premier rendu | avec les données | sans les données |
| Coût mesuré | 27 lignes | 41 lignes |

Les vingt-sept et quarante et une lignes ne sont pas une estimation : ce sont les deux versions du même écran, écrites et compilées pour rédiger cette section.

```tsx
// Next : app/catalogue.tsx · la lecture se fait pendant le rendu
export default async function Page() {
  const resultat = verifierCatalogue(SOURCE);
  if (!resultat.ok) return <p>Catalogue indisponible</p>;

  return <CatalogueScreen articles={resultat.data.map(versVue)} />;
}
```

```tsx
// Vite : app/CataloguePage.tsx · la lecture devient un effet, avec ses états
export function CataloguePage() {
  const [articles, setArticles] = useState<ArticleView[] | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    let annule = false;
    fetch("/api/catalogue")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("indisponible"))))
      .then((donnees: Article[]) => {
        if (!annule) setArticles(donnees.map(versVue));
      })
      .catch(() => {
        if (!annule) setErreur("Catalogue indisponible");
      });
    return () => {
      annule = true;
    };
  }, []);

  if (erreur !== null) return <p>{erreur}</p>;
  if (articles === null) return <p>Chargement…</p>;

  return <CatalogueScreen articles={articles} />;
}
```

**`CatalogueScreen` est le même fichier dans les deux projets, à l'octet près.** C'est tout l'objet du standard : l'écran ne sait pas d'où viennent ses données, donc il ne bouge pas quand leur provenance change.

#### Ce que le compromis coûte vraiment

Puisque la route API se porte facilement, la tentation est de tout y faire passer. **Ce serait acheter la portabilité au prix d'un aller-retour réseau permanent.**

Un Server Component lit la donnée là où elle se trouve, pendant le rendu, sans que le navigateur n'ait rien à demander. Le remplacer par un `fetch` vers votre propre serveur ajoute un aller-retour, un temps d'affichage vide, et un état d'erreur à traiter, pour chaque écran converti. Sur une application de contenu, cela se voit.

Le choix se pose donc à l'endroit habituel, et le standard ne le tranche pas à votre place :

- **Vous restez sur Next et l'assumez** : gardez les Server Components, le portage éventuel coûtera cette conversion.
- **La portabilité prime** : traitez les Server Components comme une optimisation locale, et gardez les routes API comme chemin par défaut. Vous payez le réseau tout de suite plutôt que la conversion plus tard.

Dans les deux cas, la règle reste la même : **le chargement appartient à `app/`, jamais à l'écran.** C'est elle qui garantit que le choix ci-dessus se rejoue à un seul endroit, et non dans chaque feature.

#### Ce qui a été vérifié

Les deux projets de cette section ont été générés par la CLI, complétés du même domaine et du même écran, puis compilés et lintés. Après portage, `core/`, `features/` et `lib/` sont **identiques fichier pour fichier**, et tout ce qui diffère est dans `app/`.

### Ce que cela implique pour les frontières

Rien. Les [règles de frontières](#règle-de-dépendance-et-frontières-maedow-arch-eslint-plugin-boundaries) portent sur des répertoires, pas sur des fichiers : `app` peut tout importer, une feature n'en importe pas une autre, `core` ignore l'interface. Ces énoncés ne mentionnent aucun framework.

`eslint-config-maedow-arch` sert donc les deux, sans configuration distincte. C'est le même constat que dans [Ce que Light conserve](#ce-que-light-conserve) pour les profils Light et Full : les axes de variation d'un projet ne changent pas ses frontières.

### Choisir son framework à l'installation

```bash
npx create-maedow-arch-app mon-projet --framework next   # Next.js App Router
npx create-maedow-arch-app mon-projet --framework vite   # React sur Vite
```

Sans drapeau, la CLI pose la question lorsqu'elle est lancée depuis un terminal, et retient `next` sinon.

### Porter Maedow Arch vers un autre framework

La démarche tient en trois questions, à poser dans cet ordre.

1. **Où démarre l'application ?** Ce fichier appartient à `app/`.
2. **Où sont déclarées les routes ?** Ce fichier appartient à `app/`.
3. **Où sont injectées les dépendances, contextes et fournisseurs ?** Ce fichier appartient à `app/`.

Tout le reste va dans les couches inférieures, sans adaptation. Si l'une de ces trois réponses vous conduit à écrire de la logique métier dans `app/`, c'est le signe que cette logique appartenait à `core/` ou à la feature.
