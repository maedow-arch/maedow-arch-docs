# Documentation de l'Architecture Maedow (maedow-architecture)

Bienvenue dans la documentation officielle de l'**Architecture Maedow** (*Maedow Architecture*). Ce corpus méthodologique définit un standard d'ingénierie logicielle universel, modulaire et découplé, conçu pour le développement d'applications web et fullstack modernes (TypeScript, React, Next.js, etc.).

---

## 📚 Sommaire des Guides

### 1. [Guide de Référence de l'Architecture Maedow (`architecture.md`)](./architecture.md)
* **Les Piliers de l'Architecture Maedow** : Découplage strict, flux unidirectionnel, machine-enforced boundaries.
* **Les 4 Couches du Système** (`app`, `features`, `core`, `components/lib`).
* **Agnosticisme de l'Infrastructure (Ports & Adapters)** : Interchangeabilité de la base de données (Postgres, Drizzle, Prisma, IndexedDB, Firebase...) et de l'authentification (BetterAuth, Supabase, Auth.js, JWT...).
* **Gestion des Composants Métier Partagés** (`features/_shared/`).
* **Règles de Dépendance Unidirectionnelle** vérifiées automatiquement par linter (`eslint-plugin-boundaries`).
* **Template d'Arborescence Maedow Standard**.

---

### 2. [Modélisation & Séparation du Domaine dans l'Architecture Maedow (`models.md`)](./models.md)
* **La Règle « Zéro Modèle dans le JSX »** : Pourquoi et comment isoler les types métier de la couche de rendu.
* **Typologie des 5 Catégories de Modèles Maedow** :
  1. *Entités Métier* (`core/<domaine>/types.ts`)
  2. *Modèles de Persistance* (`core/database/` ou `core/storage/`)
  3. *DTOs & Validation de Contrats réseau* (`core/<domaine>/dto.ts`)
  4. *ViewModels Spécifiques à la Vue* (`features/<feature>/types.ts`)
  5. *Props de Composants React uniquement* (`Composant.tsx`)
* **Pragmatisme Typé & Inférence Zod** : Éviter l'over-engineering sur les cas simples.
* Exemples comparatifs Avant / Après (Anti-Pattern vs Pattern Maedow).

---

### 3. [Conventions & Standards de l'Architecture Maedow (`conventions.md`)](./conventions.md)
* **TypeScript Strict Maedow** (`noUncheckedIndexedAccess`, interdiction de `any` et double assertion).
* **Gestion des Erreurs par Données Typées (Result Pattern)** plutôt que des exceptions masquées.
* **Sécurité & Données Sensibles** (`server-only`, sanitization des logs).
* **Générateurs & Scaffolding Maedow** (`npm run generate:feature`).
* **Pyramide de Tests & Testabilité** (Tests purs et ultra-rapides du domaine sans mock UI).
