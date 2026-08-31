# Registre des règles Maedow Arch

Ce document recense les règles normatives du standard, leur donne un code stable, et dit pour chacune si elle est **vérifiée par la machine** ou **tenue par l'équipe**.

Il existe pour une raison simple : un standard qui laisse croire que tout est appliqué est moins crédible qu'un standard qui distingue clairement ce qu'il outille de ce qu'il demande. Les deux catégories ont leur place. Ce qui n'en a pas, c'est le flou entre les deux.

## Comment lire ce registre

**Vérifiée** signifie qu'une violation fait échouer le lint, donc la CI, avant d'atteindre la revue. La règle possède une fixture invalide qui échoue et une fixture valide qui passe : sans cette paire, une règle peut cesser de fonctionner sans que rien ne le signale, ce que ce dépôt a déjà vécu et documente sous [F-001](./FRICTIONS.md).

**Tenue par l'équipe** signifie que la règle relève de la revue et de la discipline. Ce n'est pas un aveu d'échec : certaines exigences ne se réduisent pas à un motif syntaxique sans produire plus de faux positifs que de vraies détections. La règle reste normative, et sa violation reste une violation.

## À quoi sert un code stable

Les messages de lint renvoyaient jusqu'ici vers un titre de section. Un titre se réécrit, et le lien casse en silence : c'est arrivé au commit `71c0a3f`, quand la numérotation des titres a été retirée du corpus.

Un code ne bouge pas. `MA-002` relie le message d'erreur, la section du corpus, la fixture qui la teste et l'entrée du journal, quelle que soit la façon dont chacun de ces textes évolue ensuite.

Les codes ne sont jamais réattribués. Une règle retirée laisse son code vacant plutôt que de le céder à une autre.

## Le registre

| Code | Règle | Statut | Où elle est appliquée |
| :--- | :--- | :--- | :--- |
| **MA-001** | Le flux `app → features → core → lib` est unidirectionnel | vérifiée | `boundaries/dependencies` |
| **MA-002** | Une feature n'importe jamais une autre feature | vérifiée | `boundaries/dependencies` |
| **MA-003** | `features/_shared/` ne connaît aucune feature | vérifiée | `boundaries/dependencies` |
| **MA-004** | Zéro fichier `.tsx` et zéro JSX dans `core/` | tenue par l'équipe | revue |
| **MA-005** | `any` interdit, `unknown` et gardes de type à la place | tenue par l'équipe | revue |
| **MA-006** | Double assertion `as unknown as` interdite | tenue par l'équipe | revue |
| **MA-007** | Aucun cycle d'import entre modules | tenue par l'équipe | revue |
| **MA-008** | Les modules à secrets sont marqués `server-only` | tenue par l'équipe | revue |
| **MA-009** | Les adaptateurs, dépôts et contrats suivent leur nommage | tenue par l'équipe | revue |

---

## MA-001 · Le flux de dépendance est unidirectionnel

**Vérifiée.** `app` peut tout importer, une feature descend la pile, `core` ne connaît que `core` et `lib`, `components` reste présentationnel, et `lib` ne dépend que de lui-même. Le sens inverse est refusé.

Énoncé dans [architecture.md](./architecture.md), section « Règle de dépendance et frontières ».

Fixtures : `core/billing/render.ts` (core vers components), `core/billing/service.ts` (core vers feature) et `lib/bad.ts` (lib vers core) dans `packages/eslint-config-maedow-arch/test/fixtures/invalid/`.

## MA-002 · Une feature n'importe jamais une autre feature

**Vérifiée.** Les imports internes à une feature restent libres. Ce qu'une feature partage avec une autre passe par `features/_shared/`, par `core/` ou par `components/`, jamais en ligne directe.

Énoncé dans [architecture.md](./architecture.md), section « Règle de dépendance et frontières ».

Fixture : `features/checkout/Screen.tsx`.

## MA-003 · `features/_shared/` ne connaît aucune feature

**Vérifiée.** Le partagé est transverse par définition. S'il devait importer une feature, il n'aurait plus rien de transverse et deviendrait un fourre-tout, ce que la Règle de Dégradation décrit précisément.

Énoncé dans [architecture.md](./architecture.md), section « Composition de features et éléments partagés ».

Fixture : `features/_shared/Card.tsx`.

## MA-004 · Zéro `.tsx` et zéro JSX dans `core/`

**Tenue par l'équipe.** C'est la règle non outillée la plus visible, et la plus facile à enfreindre sans mauvaise intention : le runtime JSX automatique ne demande aucun import de React, si bien qu'un composant peut vivre dans `core/` sans qu'aucune règle d'import ne se déclenche.

Énoncé dans [architecture.md](./architecture.md), tableau des couches : « **ZÉRO fichier `.tsx`**, aucun import React/DOM ».

## MA-005 · `any` interdit

**Tenue par l'équipe.** `unknown` avec des gardes de type, ou une validation à l'entrée des frontières.

Énoncé dans [conventions.md](./conventions.md), section « TypeScript strict ».

## MA-006 · Double assertion interdite

**Tenue par l'équipe.** `as unknown as TargetType` force un type au lieu de le valider. La validation appartient au moment du parsing.

Énoncé dans [conventions.md](./conventions.md), section « TypeScript strict ».

## MA-007 · Aucun cycle d'import entre modules

**Tenue par l'équipe.** Deux modules qui s'importent mutuellement ne peuvent plus être lus, testés ni déplacés séparément. Le cycle ne viole aucune frontière de couche, ce qui le rend invisible aux règles MA-001 à MA-003 : il se forme à l'intérieur d'une même couche.

Cette règle est introduite par le registre. Le corpus ne l'énonçait pas, alors qu'elle conditionne la testabilité que le standard revendique.

## MA-008 · Les modules à secrets sont marqués `server-only`

**Tenue par l'équipe.** Tout module manipulant des clés d'API, des jetons d'administration ou un accès direct à la base doit être restreint au serveur, par `import "server-only"` ou par la convention `.server.ts`.

Énoncé dans [conventions.md](./conventions.md), section « Sécurité et données sensibles ».

Cette règle restera tenue par l'équipe tant qu'un besoin réel ne justifiera pas de l'outiller : reconnaître mécaniquement ce qui constitue un secret demanderait une liste de motifs qui produirait surtout des faux positifs.

## MA-009 · Le nommage des adaptateurs, dépôts et contrats

**Tenue par l'équipe.** `payment.contract.ts` pour un port, `stripePayment.adapter.ts` et `postgresOrder.repository.ts` pour ses implémentations.

Énoncé dans [conventions.md](./conventions.md), table de nommage.

Comme MA-008, elle reste tenue par l'équipe : une règle de nom ne sait pas distinguer un adaptateur mal nommé d'un fichier qui n'en est pas un.
