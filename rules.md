# Registre des règles Maedow Arch

Ce document recense les règles normatives du standard, leur donne un code stable, et dit pour chacune si elle est **vérifiée par la machine** ou **tenue par l'équipe**.

Il existe pour une raison simple : un standard qui laisse croire que tout est appliqué est moins crédible qu'un standard qui distingue clairement ce qu'il outille de ce qu'il demande. Les deux catégories ont leur place. Ce qui n'en a pas, c'est le flou entre les deux.

## Comment lire ce registre

**Vérifiée** signifie qu'une violation fait échouer le lint, donc la CI, avant d'atteindre la revue. La règle possède une fixture invalide qui échoue et une fixture valide qui passe : sans cette paire, une règle peut être chargée, valide, et ne rien regarder du tout, ce que ce dépôt a rencontré quatre fois et documente de [F-001](./FRICTIONS.md) à F-015.

**Tenue par l'équipe** signifie que la règle relève de la revue et de la discipline. Ce n'est pas un aveu d'échec, et ce n'est pas une étape en attendant mieux : certaines exigences ne se réduisent pas à un motif syntaxique sans produire plus de faux positifs que de vraies détections. La règle reste normative, et sa violation reste une violation.

Les deux règles qui restent dans cette catégorie, MA-008 et MA-009, **y sont par décision et non par manque de travail**. Chacune dit en quoi l'outiller coûterait plus qu'elle ne rapporte. Le rapport de sept règles vérifiées sur neuf n'est donc pas une dette à combler : c'est la part du standard qui se prête à la vérification automatique, et l'autre part est reconnue comme telle plutôt que passée sous silence.

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
| **MA-004** | Zéro fichier `.tsx` et zéro JSX dans `core/` | vérifiée | `no-restricted-syntax`, `no-restricted-imports` |
| **MA-005** | `any` interdit, `unknown` et gardes de type à la place | vérifiée | `@typescript-eslint/no-explicit-any` · entrée `strict` |
| **MA-006** | Double assertion `as unknown as` interdite | vérifiée | `no-restricted-syntax` · entrée `strict` |
| **MA-007** | Aucun cycle d'import entre modules | vérifiée | `import-x/no-cycle` · entrée `strict` |
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

**Vérifiée.** Deux règles la portent, et il en faut bien deux. Le runtime JSX automatique ne demande aucun import de React : un composant peut donc vivre dans `core/` sans qu'aucune règle d'import ne se déclenche, ce qui a été constaté avant d'écrire la règle. `no-restricted-imports` seul aurait donné l'illusion d'une protection, en n'attrapant que le cas devenu rare où quelqu'un écrit encore `import React from "react"`.

La règle vise le contenu, pas l'extension. Un fichier `.tsx` sans JSX dans `core/` ne casse rien, et un `.ts` ne peut pas en contenir : le parser le refuserait avant nous.

Énoncé dans [architecture.md](./architecture.md), tableau des couches : « **ZÉRO fichier `.tsx`**, aucun import React/DOM ».

Fixtures : `core/audit/Widget.tsx` pour le JSX sans import, `core/audit/useTheme.ts` pour la dépendance d'interface.

## MA-005 · `any` interdit

**Vérifiée**, dans l'entrée `strict`. `unknown` avec des gardes de type, ou une validation à l'entrée des frontières.

Énoncé dans [conventions.md](./conventions.md), section « TypeScript strict ».

Fixtures : `strict-invalid/src/core/billing/types.ts` et sa contrepartie valide, qui montre la garde de type attendue à la place.

## MA-006 · Double assertion interdite

**Vérifiée**, dans l'entrée `strict`. `as unknown as TargetType` force un type au lieu de le valider. La validation appartient au moment du parsing.

Aucune règle publiée ne vise cette forme, d'où un sélecteur qui cible l'assertion vers `unknown` dont le parent est une autre assertion. Un `as unknown` isolé reste permis : c'est l'enchaînement qui pose problème, pas le passage par `unknown`.

Énoncé dans [conventions.md](./conventions.md), section « TypeScript strict ».

Fixtures : `strict-invalid/src/core/billing/cast.ts` et sa contrepartie valide.

## MA-007 · Aucun cycle d'import entre modules

**Vérifiée**, dans l'entrée `strict`. Deux modules qui s'importent mutuellement ne peuvent plus être lus, testés ni déplacés séparément. Le cycle ne viole aucune frontière de couche, ce qui le rend invisible aux règles MA-001 à MA-003 : il se forme à l'intérieur d'une même couche.

Cette règle a été introduite par le registre. Le corpus ne l'énonçait pas, alors qu'elle conditionne la testabilité que le standard revendique.

Fixtures : `strict-invalid/src/core/billing/aller.ts` et `retour.ts`, qui forment un cycle sans franchir la moindre frontière.

## MA-008 · Les modules à secrets sont marqués `server-only`

**Tenue par l'équipe.** Tout module manipulant des clés d'API, des jetons d'administration ou un accès direct à la base doit être restreint au serveur, par `import "server-only"` ou par la convention `.server.ts`.

Énoncé dans [conventions.md](./conventions.md), section « Sécurité et données sensibles ».

**Elle reste tenue par l'équipe par décision.** Reconnaître mécaniquement ce qui constitue un secret demanderait une liste de motifs de noms, qui signalerait des modules inoffensifs et manquerait ceux qui comptent. Une règle qui se trompe souvent finit désactivée, et l'exigence disparaît alors complètement. La revue, elle, sait lire ce que fait un module.

## MA-009 · Le nommage des adaptateurs, dépôts et contrats

**Tenue par l'équipe.** `payment.contract.ts` pour un port, `stripePayment.adapter.ts` et `postgresOrder.repository.ts` pour ses implémentations.

Énoncé dans [conventions.md](./conventions.md), table de nommage.

**Elle reste tenue par l'équipe par décision.** Une règle de nom ne sait pas distinguer un adaptateur mal nommé d'un fichier qui n'en est pas un. Elle imposerait donc de nommer selon ce que la règle sait reconnaître, plutôt que selon ce que le fichier fait, ce qui est exactement l'inverse du but.

---

## Les Règles de conception, distinctes des neuf codes

Le corpus porte une seconde famille d'exigences, qui n'a pas de code et n'en aura pas. Elle n'était recensée nulle part : les cinq règles ci-dessous vivaient dispersées dans trois documents, sans que rien ne dise ce qui les sépare du registre.

| Règle | Ce qu'elle demande | Où elle est énoncée |
| :--- | :--- | :--- |
| **Règle d'Or Maedow Arch** | Une erreur attendue est une donnée typée, pas une exception | [`conventions.md`](./conventions.md) |
| **Zéro Modèle dans le JSX** | Les types métier ne traversent pas la couche de rendu | [`models.md`](./models.md) |
| **Règle du Pragmatisme Typé** | Ne pas dupliquer un modèle qui n'a pas divergé | [`models.md`](./models.md) |
| **Règle de Lazy Abstraction** | Pas de contrat ni d'adaptateur avant la deuxième implémentation réelle | [`architecture.md`](./architecture.md) |
| **Règle de Dégradation de `features/_shared/`** | Un composant partagé par une seule feature en redescend | [`architecture.md`](./architecture.md) |
| **Règle de Logique Extraite** | Plus de trois états ou un appel réseau : la logique de vue passe dans un hook | [`architecture.md`](./architecture.md) |

### Ce qui les sépare d'un code `MA`

**Un code se constate, une Règle de conception s'apprécie.** Un fichier `.tsx` est dans `core/` ou il n'y est pas : MA-004 se tranche sans discussion, et c'est ce qui permet à une machine ou à une revue de rendre un verdict. « La logique de vue est-elle extraite ? » n'a pas de réponse binaire, et le seuil de trois états est **indicatif** : un écran à quatre états ne viole rien, il mérite un regard.

C'est aussi pourquoi elles ne figurent pas dans la clause de conformité. Se dire conforme, c'est affirmer que MA-008 et MA-009 sont tenues, deux questions auxquelles une revue répond par oui ou par non. Une clause qui reposerait sur une appréciation cesserait d'être une clause.

**Elles ne sont pas pour autant facultatives.** Une Règle de conception ignorée ne fait échouer aucun contrôle, et c'est précisément son danger : un projet réel a passé dix-neuf lots sans appliquer la Règle de Logique Extraite, avec des écrans montés à 443 lignes, pendant que le lint, l'audit et les neuf règles restaient au vert. Ce que le standard vérifie mécaniquement ne dit rien de ce qu'il demande par ailleurs.

### Pourquoi ne pas leur donner un code quand même

Un registre dont les entrées mêlent le constatable et l'appréciable perd ce qui fait sa valeur : le rapport de sept règles vérifiées sur neuf, et la raison donnée pour chacune des deux autres. Diluer ce compte avec des exigences qu'aucun outil ne pourra jamais trancher rendrait le registre moins crédible, pas plus complet.

Le flou entre les deux catégories est ce que ce document existe pour supprimer. Les nommer et les recenser ici, sans les numéroter, est la façon de les rendre citables en revue sans effacer cette frontière.

## Se dire conforme à Maedow Arch

Un projet est **conforme à Maedow Arch 1.0** lorsque les quatre conditions suivantes sont réunies.

1. **Les sept règles vérifiables passent.** `eslint-config-maedow-arch` est installé et son lint est vert, entrée `strict` comprise. C'est la seule condition qu'une machine constate.
2. **Les deux règles humaines sont tenues.** MA-008 et MA-009 relèvent de la revue, et se dire conforme, c'est affirmer qu'elle a lieu.
3. **Le typage est strict.** `strict`, `noUncheckedIndexedAccess` et `exactOptionalPropertyTypes` sont activés, et aucun n'est désactivé fichier par fichier.
4. **Les renoncements sont locaux et écrits.** Une assertion commentée à l'endroit où elle s'applique reste conforme ; une option retirée du `tsconfig.json` ne l'est pas.

`npx maedow-arch check` mesure la première et la troisième. Il ne décerne pas la conformité : il dit ce qui vous en sépare.

### Ce qui constitue une rupture du standard

Une rupture est un changement qui **rend non conforme un projet qui l'était**. C'est une notion distincte du versionnage des paquets : `eslint-config-maedow-arch` peut publier une version majeure sans que le standard bouge, et l'inverse est vrai aussi.

Trois changements constituent une rupture :

- **Une règle passe de tenue par l'équipe à vérifiée**, et fait donc échouer un lint qui passait.
- **Une règle change de sens**, et interdit ce qu'elle autorisait.
- **Une règle nouvelle rejoint l'entrée par défaut.**

Ne constituent pas une rupture : l'ajout d'une règle à l'entrée `strict`, qui se charge explicitement ; la reformulation d'un message ; l'ajout d'une section au corpus ; le retrait d'une règle, qui ne peut que faire passer un lint qui échouait.

Toute rupture est annoncée dans le `CHANGELOG.md` sous cette forme, avec le chemin de migration. Un standard qui change sans le dire ne vaut pas mieux qu'une convention d'équipe.
