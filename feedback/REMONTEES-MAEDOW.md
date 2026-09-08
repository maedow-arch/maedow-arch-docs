<!-- markdownlint-disable MD024 -->

# Remontées Maedow Arch · relevé de terrain

## Objet

Ce document répertorie tout ce que le projet ABBA a rencontré en utilisant Maedow Arch en conditions réelles. Il est destiné à l'équipe qui maintient le standard.

Chaque entrée porte un constat vérifié, une reproduction, l'écart entre le comportement attendu et le comportement observé, un correctif proposé et l'impact mesuré. **Rien n'y figure sur la seule foi d'un rapport :** tout a été reproduit indépendamment, soit dans le code source des paquets publiés, soit par exécution.

Le document est vivant. Il se complète à chaque lot.

---

## Environnement de test

| Élément | Valeur |
| :--- | :--- |
| Système | Windows 11 Pro 26200 |
| Node | 25.9.0 |
| npm | 11.12.1 |
| Projet | ABBA, Next.js 15.5.25, React 19.2.8, TypeScript 5.9.3 |
| Profil | Maedow Arch Full, framework Next, template blank |
| `create-maedow-arch-app` | 0.8.0 |
| `eslint-config-maedow-arch` | 0.3.0 |
| `maedow-arch` | 0.1.2 |
| Date du relevé | 1er septembre 2026 |

---

## Synthèse

| Code | Constat | Type | Gravité | Paquet |
| :--- | :--- | :--- | :--- | :--- |
| R-001 | Charger `strict` après l'entrée par défaut éteint la moitié de MA-004 | défaut | **haute** | `eslint-config-maedow-arch` |
| R-002 | L'audit prend les génériques TypeScript pour du JSX | défaut | moyenne | `maedow-arch` |
| R-003 | Le scaffold épingle une version sans entrée `strict` | défaut | **haute** | `create-maedow-arch-app` |
| R-004 | `eslint-plugin-import` est déclaré optionnel alors qu'il est requis | défaut | moyenne | `eslint-config-maedow-arch` |
| R-005 | Le template `framework-next` n'importe pas sa feuille de style | défaut | **haute** | `create-maedow-arch-app` |
| R-006 | Le scaffold épingle `vitest` sur une plage entièrement vulnérable | défaut | moyenne | `create-maedow-arch-app` |
| R-007 | Le mode Full livre `result.ts`, le corpus dit que la couche naît de son premier habitant | documentation | moyenne | corpus |
| R-008 | La structure recommandée montre `contract.ts` que la Lazy Abstraction interdit | documentation | basse | corpus |
| R-009 | Les rapports d'audit peuvent diverger selon le cache `npx` | ergonomie | basse | corpus |
| R-010 | La bascule Light vers Full livre `result.ts` sans son test | défaut | basse | `create-maedow-arch-app` |
| R-011 | `strict` verrouille les projets sur ESLint 9, passé en maintenance | conception | **haute à terme** | `eslint-config-maedow-arch` |
| R-012 | shadcn dépose ses hooks hors des couches, invisibles à l'audit et aux frontières | intégration | moyenne | corpus et `maedow-arch` |
| R-013 | Le corpus montre `hooks/` sans dire ce qu'on y met ni pourquoi | documentation | moyenne | corpus |

Les trois entrées de gravité haute partagent le même trait : **elles sont silencieuses**. Aucune ne produit d'erreur, toutes laissent le lint et le build au vert, et aucune ne se découvre sans aller chercher.

---

## R-001 · Charger `strict` après l'entrée par défaut éteint la moitié de MA-004

**Défaut. Gravité haute.** Un garde-fou annoncé comme actif cesse de l'être, avec la composition que le corpus recommande.

### Constat

Les deux entrées déclarent `no-restricted-syntax` sur des périmètres qui se recouvrent :

| Fichier | `files` | Sélecteurs |
| :--- | :--- | :--- |
| `index.js` ligne 155 | `**/core/**/*.{js,jsx,ts,tsx,mjs,cjs}` | `JSXElement`, `JSXFragment` (MA-004) |
| `strict.js` ligne 68 | `**/*.{ts,tsx,mts,cts}` | `TSAsExpression > TSAsExpression[typeAnnotation.type="TSUnknownKeyword"]` (MA-006) |

En configuration plate, deux objets qui ciblent le même fichier et déclarent la même règle **ne fusionnent pas leurs options** : la dernière déclaration remplace la précédente en entier. Pour un fichier `core/**/*.tsx`, `strict.js` arrive après et efface les sélecteurs JSX.

### Reproduction

Un fichier `src/core/x.tsx` contenant du JSX et aucun import de React :

| Configuration ESLint | Résultat |
| :--- | :--- |
| `[...maedowArch]` | `error` MA-004, le JSX est refusé |
| `[...maedowArch, ...maedowArchStrict]`, la composition prescrite | **aucune erreur** |

### Pourquoi cela compte particulièrement

`no-restricted-imports` reste actif, mais le commentaire d'`index.js` explique lui-même pourquoi il ne suffit pas : « le runtime JSX automatique n'exige aucun import de React », et cette règle seule « aurait donné l'illusion d'une protection ». C'est exactement cette illusion qui revient.

Et `strict.js` porte en tête un commentaire qui cite F-001, « un lint vert sans rien vérifier, ce qui est le défaut que ce dépôt documente ». Le fichier qui nomme le défaut le réintroduit.

### Correctif proposé

Dans `strict.js`, ajouter un dernier bloc ciblant `**/core/**` qui redéclare les trois sélecteurs ensemble, JSX et double assertion. Une règle ESLint ne pouvant être déclarée qu'une fois par périmètre, c'est la seule composition qui préserve les deux intentions.

Test de non-régression suggéré : une fixture `core/**/*.tsx` avec du JSX, attendue en échec **sous les deux compositions**. La fixture actuelle ne teste vraisemblablement que l'entrée par défaut.

### Contournement appliqué sur ABBA

Bloc de configuration projet en fin de `eslint.config.mjs` redéclarant les trois sélecteurs pour `**/core/**`, à retirer dès qu'une version amont corrigera le point.

---

## R-002 · L'audit prend les génériques TypeScript pour du JSX

**Défaut. Gravité moyenne.** Faux positifs MA-004 en série, sur du code parfaitement conforme.

### Constat

`maedow-arch@0.1.2`, `src/audit.mjs` ligne 99 :

```js
function detecterJsx(contenu) {
  // Une balise ouvrante suivie d'un nom, ou un fragment. On écarte les
  // génériques TypeScript, qui commencent par une majuscule suivie de `>`.
  return /<[A-Za-z][\w.]*(\s[^<>]*)?\/?>/.test(contenu) || /<>\s*$/m.test(contenu);
}
```

Le commentaire annonce que les génériques sont écartés. **Le motif ne le fait pas.**

### Reproduction

```js
const detecterJsx = (c) => /<[A-Za-z][\w.]*(\s[^<>]*)?\/?>/.test(c) || /<>\s*$/m.test(c);
```

Appliqué à des lignes d'un fichier `.ts` de `core/` :

| Ligne | Attendu | Observé |
| :--- | :--- | :--- |
| `export type Result<T> = Ok<T> \| Err;` | rien | **JSX détecté** |
| `async findById(id: string): Promise<UserEntity>` | rien | **JSX détecté** |
| `async findAll(): Promise<UserEntity \| null>` | rien | **JSX détecté** |
| `const noms: Array<string> = [];` | rien | **JSX détecté** |
| `type Partiel = Partial<DemandeEntity>;` | rien | **JSX détecté** |
| `const m = new Map<string, number>();` | rien | rien |
| `type R = Record<string, number>;` | rien | rien |
| `const x = <div>bonjour</div>;` | JSX | JSX |

Seuls échappent les génériques dont le premier argument est immédiatement suivi d'une virgule. **Tous les génériques à un seul argument sont attrapés.**

**Portée élargie, constatée le 2 septembre 2026.** Le défaut ne se limite pas aux génériques. Le motif ne distingue pas non plus une balise écrite **dans un littéral de chaîne** d'une balise JSX :

```ts
toApiError(httpFailure(400, "<html>503 Service Unavailable</html>"));
```

Cette ligne, dans un fichier `.ts` de `core/`, est signalée « contient du JSX ». Tout fichier qui manipule du HTML sous forme de texte est concerné : fixtures de test, gabarits de courriel, messages d'erreur d'un service tiers. Le correctif proposé ci-dessous ferme aussi ce cas.

### Portée réelle

`Promise<UserEntity | null>` est la signature du contrat de dépôt que **le corpus donne lui-même en exemple**, section « Agnosticisme technique ». L'audit officiel signalerait donc l'exemple officiel comme contenant du JSX.

La couche visée est précisément celle où vivent `Result<T>`, les dépôts et les validateurs génériques. Le taux de faux positifs sur un `core/` réel sera élevé, et le rapport perdra sa crédibilité au moment même où il devient utile.

Premier signalement rencontré sur ABBA : `src/core/common/result.test.ts`, fichier écrit par le générateur officiel.

**Suivi de l'accumulation, quatorze lots plus tard.** Le nombre croît avec le domaine, et il est resté **entièrement faux** du premier au dernier :

| Lot | Violations MA-004 annoncées | Réelles, confirmées par ESLint |
| :--- | ---: | ---: |
| 004 | 4 | **0** |
| 008 | 8 | **0** |
| 011 | 11 | **0** |

Onze lignes rouges en tête d'un rapport dont l'ordre de migration dit « commencer par sortir l'interface de `core/` », alors que `find src/core -name "*.tsx"` rend zéro fichier.

**Un rapport qui se trompe onze fois de suite cesse d'être lu**, et c'est le vrai coût de ce défaut : il ne fait pas perdre du temps, il fait perdre la confiance dans l'outil. Il a fallu inscrire une décision de projet, D-015, pour dire que le critère de vérité est `npx eslint` et non le compteur de l'audit. Un standard ne devrait pas avoir besoin qu'un projet écrive cela.

### Correctif proposé

Ne chercher du JSX que dans les fichiers `.tsx` et `.jsx`. Le corpus porte déjà la justification, au registre, MA-004 : « un `.ts` ne peut pas en contenir : le parser le refuserait avant nous ». Un `.ts` n'a donc aucune raison d'être examiné pour du JSX, et le faux positif disparaît sans qu'aucune détection réelle ne soit perdue.

La détection par expression régulière sur du texte ne peut pas distinguer de façon fiable une balise d'un paramètre de type. Restreindre l'extension évite d'avoir à essayer.

---

## R-003 · Le scaffold épingle une version sans entrée `strict`

**Défaut. Gravité haute, parce qu'il est silencieux.**

### Constat

`create-maedow-arch-app@0.8.0`, `templates/base/package.fragment.json` :

```json
"devDependencies": {
  "eslint-config-maedow-arch": "^0.1.0",
  ...
}
```

L'entrée `strict`, que le corpus prescrit et que le registre associe à MA-005, MA-006 et MA-007, **n'existe qu'à partir de `0.3.0`**. Le champ `exports` de `0.1.2` ne déclare que `"."`.

Un `npm install eslint-config-maedow-arch` ultérieur reste dans la plage `^0.1.0` et résout `0.1.2`. Le développeur qui suit la documentation à la lettre obtient donc un socle **sans MA-005, MA-006 ni MA-007**, et rien ne le lui dit : le lint est vert.

### Correctif proposé

Porter le fragment à `^0.3.0`. Accessoirement, un projet généré ne devrait jamais avoir besoin d'un `npm install` manuel pour obtenir la configuration que le corpus décrit à la page suivante.

### Contournement appliqué sur ABBA

Installation explicite en `@latest`.

---

## R-004 · `eslint-plugin-import` est déclaré optionnel alors qu'il est requis

**Défaut. Gravité moyenne.**

### Constat

`eslint-config-maedow-arch@0.3.0` :

```json
"peerDependenciesMeta": { "eslint-plugin-import": { "optional": true } }
```

Or `strict.js` l'importe directement. Absent, la commande ne lint rien :

```text
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'eslint-plugin-import'
imported from node_modules/eslint-config-maedow-arch/strict.js
```

Il ne figure pas non plus dans les `devDependencies` du fragment de scaffold.

La dépendance est effectivement optionnelle pour l'entrée par défaut, et obligatoire pour `strict`. Le champ `peerDependenciesMeta` ne sait pas exprimer cette nuance.

### Correctif proposé

La documentation le peut, elle. La commande `npm install` du corpus ne mentionne pas `eslint-plugin-import`, alors qu'elle installe une configuration dont c'est une dépendance réelle dès la section suivante. Une ligne dans la commande, ou une phrase à l'endroit où `strict` est introduit, suffit.

---

## R-005 · Le template `framework-next` n'importe pas sa feuille de style

**Défaut. Gravité haute, et entièrement silencieux.** Tailwind est installé, configuré, et ne s'applique nulle part.

### Constat

`create-maedow-arch-app@0.8.0` dépose `templates/css-tailwind/src/app/globals.css` quel que soit le framework. L'import de cette feuille, lui, dépend du template :

| Template | Fichier | Importe `globals.css` |
| :--- | :--- | :--- |
| `demo-app-next` | `src/app/layout.tsx` ligne 3 | **oui** |
| `framework-vite` | `src/app/main.tsx` ligne 4 | **oui** |
| `framework-next` | `src/app/layout.tsx` | **non** |

La combinaison **Next plus template blank**, c'est-à-dire `--mode full --template blank`, produit donc un projet où Tailwind est installé, la feuille présente, et aucun style appliqué.

Rien ne le signale : `npm run lint`, `npm run typecheck`, `npm run build` et `npm run arch` passent tous au vert. Le défaut ne se découvre qu'au premier composant stylé, c'est-à-dire longtemps après la génération, quand l'attention est ailleurs.

### Reproduction

```bash
npx create-maedow-arch-app@0.8.0 demo --mode full --template blank
grep -c "globals.css" demo/src/app/layout.tsx   # 0
```

### Correctif proposé

Ajouter `import "./globals.css";` à `templates/framework-next/src/app/layout.tsx`. Le template `demo-app-next` montre déjà la forme attendue.

Plus largement, c'est un trou dans une matrice de deux frameworks fois deux templates, dont trois cases sur quatre sont correctes. Un test de génération qui vérifie la présence de l'import dans chaque combinaison fermerait la classe entière de ce défaut.

### Contournement appliqué sur ABBA

Import ajouté à la main.

---

## R-006 · Le scaffold épingle `vitest` sur une plage entièrement vulnérable

**Défaut. Gravité moyenne.**

### Constat

`templates/base/package.fragment.json` porte `"vitest": "^2.1.0"`, qui résout `2.1.9`.

`npm audit` sur un projet fraîchement généré remonte 7 vulnérabilités, dont une critique :

```text
CRITICAL  vitest    via @vitest/mocker, vite   range <=3.2.5
HIGH      vite                                 range <=6.4.2
```

La plage vulnérable va jusqu'à `3.2.5` inclus. **La contrainte `^2.1.0` ne permet aucune sortie de la plage vulnérable**, puisqu'elle interdit de passer en 3.x. La dernière version publiée est `4.1.11`.

Aucune de ces vulnérabilités n'atteint le code livré au navigateur, elles vivent dans l'outillage de test. Mais tout projet généré démarre avec un `npm audit` rouge et une critique, ce qui use la vigilance : une équipe qui s'habitue à un audit rouge cesse de le lire.

### Correctif proposé

Porter le fragment à la dernière majeure de `vitest`.

---

## R-007 · Le mode Full livre `result.ts`, le corpus dit que la couche naît de son premier habitant

**Documentation. Gravité moyenne : la contradiction a produit une erreur réelle.**

### Constat

`templates/mode-full/src/core/common/result.ts` et son test sont livrés par le générateur en mode Full. C'est délibéré, `scripts/bascule-full.mjs` le documente.

Le corpus, section « Mode Light vs Mode Full », écrit à l'inverse :

> C'est pour cette raison que `core/` reste vide en Light plutôt que d'être livré avec un Result Pattern inutilisé : une couche présente mais vide invite à y écrire du domaine par anticipation, ce que la Règle de Lazy Abstraction interdit. **La couche naît de son premier habitant.**

La phrase vise le mode Light, mais rien dans sa formulation ne le restreint, et elle apparaît dans la section qui compare les deux profils.

### Impact constaté

Le lead tech d'ABBA, ayant lu le corpus avant le générateur, a écrit dans un plan d'implémentation une consigne explicite de **ne pas** créer `core/common/result.ts`. Le développeur l'a suivie, a retiré deux fichiers livrés par le générateur officiel, et `npm test` est passé au rouge, faute de test à exécuter. La consigne a dû être annulée au lot suivant.

Le coût est faible ici, mais l'origine est une contradiction lisible entre deux sources également officielles.

### Correctif proposé

Une phrase dans la section du mode Full, disant que le helper `Result` est livré avec la couche et n'est pas concerné par la Lazy Abstraction, qui vise les contrats et les adaptateurs. La distinction est claire dans l'esprit du standard, elle ne l'est pas encore dans le texte.

---

## R-008 · La structure recommandée montre `contract.ts` que la Lazy Abstraction interdit

**Documentation. Gravité basse.**

### Constat

La section « Structure recommandée d'un projet sous Maedow Arch » présente l'arborescence type d'un domaine :

```text
core/<domaine>/
  types.ts
  validation.ts
  service.ts
  contract.ts       # Interfaces de repositories/services
  repository.ts
```

La Règle de Lazy Abstraction, énoncée quelques paragraphes plus haut, dit qu'un `contract.ts` ne doit être introduit **qu'au moment où une deuxième implémentation réelle est nécessaire**, et qu'abstraire par anticipation « est un anti-pattern Maedow Arch ».

Un lecteur pressé, humain ou agent, reproduit l'arborescence type et crée un `contract.ts` par défaut, ce que la règle proscrit.

### Correctif proposé

Marquer la ligne comme conditionnelle dans l'arborescence, par exemple `contract.ts` suivi de « seulement à partir de la deuxième implémentation, voir Lazy Abstraction ». Un commentaire dans le bloc coûte moins qu'une règle que personne n'applique.

---

## R-009 · Les rapports d'audit peuvent diverger selon le cache `npx`

**Ergonomie. Gravité basse, mais elle se paie en temps perdu.**

### Constat

Le corpus présente `npx maedow-arch check` comme la façon d'auditer sans rien installer, ce qui est juste pour un audit ponctuel sur un projet qu'on découvre.

Sur un projet qui l'exécute à chaque lot, `npx` peut réutiliser une version mise en cache. Deux postes rendent alors deux rapports différents sur le même code, sans que rien n'explique l'écart. Constaté en direct sur ABBA entre `0.1.1` et `0.1.2`, à une heure d'intervalle.

### Correctif proposé

Mentionner l'installation en dépendance de développement pour l'usage continu, en gardant `npx` pour l'audit de découverte. Deux usages, deux recommandations.

---

## R-010 · La bascule Light vers Full livre `result.ts` sans son test

**Défaut. Gravité basse.** Même écart de matrice que R-005, sur une autre case.

### Constat

Deux chemins mènent au mode Full, et ils ne livrent pas la même chose :

| Chemin | `core/common/result.ts` | `core/common/result.test.ts` |
| :--- | :--- | :--- |
| `create-maedow-arch-app --mode full` | oui | oui |
| `npm run generate:domain` sur un projet Light, via `bascule-full.mjs` | oui | **non** |

La sortie de la bascule annonce d'ailleurs une seule ligne, `- src/core/common/result.ts`.

Un projet arrivé en Full par la bascule obtient donc le helper sans le test qui le couvre, alors qu'un projet généré directement en Full a les deux. La différence est invisible : rien ne signale l'absence, et `npm test` reste vert tant qu'un autre test existe.

### Correctif proposé

Aligner `bascule-full.mjs` sur le template `mode-full`, qui contient déjà les deux fichiers.

Plus largement, R-005 et R-010 relèvent du même schéma : plusieurs chemins produisent un projet, et ils divergent sur un fichier que personne ne pense à vérifier. Un test qui compare les sorties des différents chemins, plutôt que de vérifier chaque chemin isolément, fermerait la classe entière.

### Constaté sur ABBA

Au lot 002, en rétablissant `result.ts` par le générateur. Le test a dû être récupéré depuis le projet témoin généré au lot 001, où il était présent.

---

## R-011 · `strict` verrouille les projets Maedow Arch sur ESLint 9

**Défaut de conception. Gravité haute à moyen terme.** Ce n'est pas un bogue, c'est une conséquence d'un choix de dépendance, et elle vieillit mal.

### Constat

`eslint-config-maedow-arch/strict` importe `eslint-plugin-import`, pour MA-007 (`import/no-cycle`). Ce plugin est aujourd'hui dans cet état :

| Élément | Valeur |
| :--- | :--- |
| Dernière version publiée | 2.32.0 |
| Plage de pairs ESLint | `^2 \|\| ^3 \|\| ... \|\| ^8 \|\| ^9` |
| Préversion supportant ESLint 10 | **aucune**, sur 132 versions publiées |

Or ESLint a changé de génération :

| Étiquette npm | Version |
| :--- | :--- |
| `latest` | **10.9.1** |
| `maintenance` | **9.39.5** |

**Tout projet qui applique l'entrée `strict` est donc bloqué sur une version d'ESLint que son propre éditeur classe en maintenance.** Et l'entrée `strict` n'est pas optionnelle : c'est elle qui porte MA-005, MA-006 et MA-007, donc trois des neuf règles du standard.

### Constaté sur ABBA

Au lot 003, en tentant la montée en Next 16 par l'outil officiel :

```text
npm error code ERESOLVE
npm error Found: eslint@10.9.1
npm error Could not resolve dependency:
npm error peer eslint@"^2 || ... || ^9" from eslint-plugin-import@2.32.0
npm error   4 more (eslint-config-maedow-arch, eslint-config-next, ...)
```

La montée a dû être faite à la main. Le blocage n'a rien coûté cette fois, ESLint 10 n'étant pas requis par Next 16, mais il se paiera dès qu'un outil de l'écosystème exigera la version courante.

### Correctif proposé

Remplacer `eslint-plugin-import` par **`eslint-plugin-import-x`**, son fork activement maintenu :

| Élément | `eslint-plugin-import` | `eslint-plugin-import-x` |
| :--- | :--- | :--- |
| Dernière version | 2.32.0 | 4.17.1 |
| Plage de pairs ESLint | jusqu'à 9 | `^8.57.0 \|\| ^9.0.0 \|\| ^10.0.0` |

Les règles portent les mêmes noms sous le préfixe `import-x/`, `no-cycle` compris. Le changement se limite au nom du plugin et au préfixe des règles dans `strict.js`.

Cela réglerait aussi R-004 au passage : `import-x` déclare ses propres dépendances de façon complète, et l'ambiguïté du champ `peerDependenciesMeta` disparaîtrait avec le paquet qui la portait.

### Ce que cela dit du standard, au-delà du paquet

Maedow Arch revendique des garde-fous vérifiés par la machine plutôt que tenus par la mémoire. Ce choix a un prix rarement énoncé : **le standard hérite du cycle de vie des plugins qu'il utilise**. Une règle appliquée par un plugin abandonné devient, à terme, une règle qui empêche de mettre à jour le reste.

Une ligne dans le corpus, disant quels plugins portent quelles règles et pourquoi ceux-là, permettrait de suivre ce risque plutôt que de le découvrir un jour d'ERESOLVE.

---

## R-012 · shadcn dépose ses hooks dans un répertoire que le standard ne connaît pas

**Défaut d'intégration. Gravité moyenne, et silencieuse.**

### Constat

`components.json`, écrit par `shadcn init`, déclare `"hooks": "@/hooks"`. Tout composant shadcn embarquant un hook le dépose donc dans **`src/hooks/`**. C'est le cas de `sidebar`, qui installe `use-mobile`.

Or `src/hooks/` **n'est aucune des cinq couches de Maedow Arch**. Ses fichiers échappent à deux garde-fous à la fois :

1. **L'audit ne les examine pas.** Ils tombent dans « hors des couches, non examinés », au même titre qu'un fichier de configuration.
2. **`eslint-plugin-boundaries` ne leur applique aucune politique.** Le répertoire ne correspond à aucun `type` déclaré, donc un hook peut importer n'importe quoi, y compris remonter le flux.

Un hook est pourtant du code applicatif, et il peut parfaitement importer `core/` ou une feature.

### Ce que cela a produit sur ABBA

Au lot 013, l'installation de `sidebar` a déposé `use-mobile` dans `src/hooks/`. Le dev l'a descendu dans `lib/`, **et pas pour l'architecture** : `npm run lint` échouait pour une autre raison, et il a constaté en passant qu'un répertoire échappait à l'audit.

**Le standard a donc été rétabli par accident.** Sans cette panne sans rapport, `src/hooks/` serait aujourd'hui peuplé, invisible à l'audit et non gouverné par les frontières, sans qu'aucune des six vérifications ne le signale.

### Pourquoi la portée dépasse ce projet

shadcn est l'une des bases de composants les plus employées de l'écosystème React, et son assistant propose cet alias par défaut. Tout projet qui suit Maedow Arch et utilise shadcn se retrouve, sans le savoir, avec un répertoire de code applicatif hors couches.

### Correctifs proposés

1. **Une phrase dans le corpus**, là où une base de composants est évoquée : `components.json` doit pointer `"hooks"` vers un répertoire couvert, ou l'alias doit être retiré.
2. **Que `maedow-arch check` signale les fichiers applicatifs hors couches.** L'audit sait déjà les compter : il pourrait distinguer un `.ts` ou `.tsx` hors des cinq couches, presque toujours une erreur de rangement, d'un fichier de configuration. C'est ce qui aurait attrapé le cas ici, et c'est peu coûteux.
3. Un `type` supplémentaire côté ESLint qui refuse ce qui vit hors des couches. Plus radical, à réserver à l'entrée `strict`.

---

## R-013 · Le corpus montre `hooks/` sans dire ce qu'on y met, ni pourquoi

**Documentation. Gravité moyenne, et elle se paie tard.**

### Constat

La structure recommandée d'une feature comporte quatre entrées :

```text
features/<feature_A>/
├── components/         # Composants .tsx dédiés
├── hooks/              # Hooks React locaux (.ts)
├── Screen.tsx          # Composant principal d'écran (.tsx)
└── types.ts            # Types d'affichage locaux (.ts)
```

`hooks/` y figure avec un commentaire de trois mots. **Rien dans le corpus ne dit ce qu'on y met, quand on l'emploie, ni ce qu'on y gagne.** Aucune des neuf règles ne le mentionne, aucun code MA ne s'y rapporte, et la section « Modélisation, zéro modèle dans le JSX » parle des modèles de données, pas de la logique de vue.

### Ce que cela a produit sur ABBA

Quatorze lots, **aucun dossier `hooks/` créé**, un seul hook personnalisé dans tout le projet et il vient de shadcn. Pendant ce temps, les écrans ont grossi jusqu'à 443 lignes, portant douze `useState` et leurs appels réseau.

**Et rien ne l'a signalé.** Le lint est vert, l'audit est vert, les neuf règles sont tenues, MA-001 et MA-004 compris, vérifié à chaque lot. Un écran de 443 lignes qui mêle logique et rendu est parfaitement conforme aux règles vérifiables du standard.

C'est le product owner, en lisant le code, qui a posé la question : « ils ont un hook qui gère tout et que le composant consomme en une déclaration, non ? ». La réponse était oui, et le standard le prévoit dans son arborescence sans jamais l'énoncer.

### Pourquoi cela touche ce que le standard revendique

Maedow Arch met la testabilité au premier rang de ses arguments, et sa pyramide de tests promet des tests unitaires « ultra rapides » sur `core/`.

Ils le sont : nos 97 tests couvrent `core/`. **Aucun ne couvre un écran**, parce qu'un composant de 332 lignes portant douze états ne se teste pas sans monter un arbre React. Une logique de vue extraite dans un hook `.ts`, si.

Autrement dit, la testabilité s'arrête à la frontière de `features/`, et le corpus ne dit pas comment la faire entrer.

### Correctif proposé

Un paragraphe, à l'endroit où l'arborescence est présentée, disant ce que `hooks/` reçoit et pourquoi : la logique de vue d'un écran, son état et ses appels, de sorte que le composant se réduise au rendu et que cette logique devienne testable sans DOM.

Et, si le standard veut le rendre observable, un seuil indicatif dans le corpus. Nous avons retenu « plus de trois états, ou un appel réseau » et cela nous convient, mais un chiffre venu du standard vaudrait mieux qu'un chiffre inventé par chaque équipe.

---

## Ce qui a bien fonctionné

Un relevé qui ne listerait que des défauts donnerait une image fausse, et ne dirait pas à l'équipe ce qu'il ne faut pas casser.

- **Le typage strict est complet dès la génération.** `strict`, `noUncheckedIndexedAccess` et `exactOptionalPropertyTypes` sont présents, plus `noImplicitOverride` et `noFallthroughCasesInSwitch` qui ne sont pas exigés. Le `tsconfig.json` généré n'a demandé aucune retouche.
- **Les règles de frontière fonctionnent réellement.** Vérifiées par contrôle positif, avec des sondes délibérément fautives : un `core/` important une feature et une feature important une autre feature. ESLint et l'audit ont tous deux levé MA-001 et MA-002, avec les bons codes et des messages exploitables.
- **Le rapport d'audit dit ce qu'il n'a pas examiné.** La phrase « leur silence ne dit pas qu'elles sont respectées, mais qu'il n'y avait rien à examiner » a directement évité une conclusion fausse sur un dépôt sans features. C'est rare et c'est précieux.
- **L'ordre de migration est lisible et justifié.** Ordonner par ce qui débloque le reste plutôt que par gravité est le bon choix, et l'explication accompagne chaque rang.
- **La correction `0.1.1` vers `0.1.2` était juste**, et la documentation a été mise à jour dans la même journée. Le commentaire laissé dans `audit.mjs` dit précisément la bonne chose : ne pas rendre un verdict sur ce qu'on n'a pas regardé.
- **Les commentaires du code expliquent le pourquoi, pas le quoi.** C'est ce qui a permis de diagnostiquer R-001 en lisant les sources plutôt qu'en tâtonnant. Le paquet documente ses propres pièges, ce qui est exactement ce qui a permis d'en trouver un.

---

## Ce qui n'est pas imputable à Maedow Arch

Consigné pour éviter que ces points remontent par erreur.

- **La CLI shadcn a changé.** `--base-color` n'existe plus, l'initialisation pose deux questions supplémentaires, et Base UI a remplacé Radix comme défaut en juillet 2026. Sans rapport avec le standard.
- **Les vulnérabilités transitives de `next`.** Une copie de `postcss` embarquée, indépendante du scaffold.
- **Les fins de ligne CRLF sous Windows.** Question de configuration Git du poste, réglée par un `.gitattributes`.
