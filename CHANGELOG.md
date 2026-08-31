# Changelog

Toutes les évolutions notables de Maedow Arch : le corpus documentaire, le site et l'outillage.

Le format suit [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/), et le versionnage suit [SemVer](https://semver.org/lang/fr/).

Les frictions à l'origine des corrections sont détaillées dans [FRICTIONS.md](./FRICTIONS.md).

## [Non publié]

### Modifié

- **Les messages de lint citent un code, plus un titre de section.** Un titre se réécrit et le renvoi casse en silence, ce qui est arrivé quand la numérotation des titres a été retirée du corpus. `MA-002 : une feature ne peut pas en importer une autre` reste juste quelle que soit la façon dont le corpus évolue ensuite, et relie le message, la section, la fixture et l'entrée de ce journal.

### Corrigé

- **Les générateurs produisaient du TypeScript invalide sur un nom composé.** `generate:feature user-profile` écrivait `User-profileScreen`, qui n'est pas un identifiant : une majuscule posée sur la seule première lettre laisse le tiret au milieu. Les noms sont désormais découpés sur les tirets, points et underscores, et un nom qui ne donnerait pas d'identifiant exploitable est refusé avant que le moindre fichier ne soit écrit.
- **`generate:domain` était inutilisable en profil Light.** Le service généré importait `../common/result`, absent d'un projet Light puisque la couche domaine n'y existe pas. La commande fait maintenant naître cette couche et annonce la bascule vers Full, ce que le corpus décrit désormais à la section « Passer de Light à Full ».

### Ajouté

- **MA-004 est désormais vérifiée par la machine.** Un fichier contenant du JSX dans `core/`, ou important React, fait échouer le lint. Deux règles la portent, et il en faut bien deux : le runtime JSX automatique ne demande aucun import, si bien qu'un composant vivait jusqu'ici dans `core/` sans qu'aucune règle ne se déclenche. C'était constaté avant d'écrire la règle, et le test le confirme en la retirant. `eslint-config-maedow-arch` passe en 0.2.0.
- **Trois façons de contourner un chemin relatif sont désormais couvertes par les fixtures.** L'alias `@/`, l'import de type seul et le passage par un barrel étaient bien interceptés par les frontières, mais rien ne le garantissait dans le temps : les fixtures n'employaient que des imports relatifs.
- **Un registre des règles, avec un code stable par règle.** [`rules.md`](./rules.md) recense les neuf règles normatives du standard et dit pour chacune si elle est vérifiée par la machine ou tenue par l'équipe. Un standard qui laisse croire que tout est appliqué est moins crédible qu'un standard qui distingue les deux. Le registre rejoint le corpus comme quatrième document du site.
- **MA-007, aucun cycle d'import entre modules.** Le corpus ne l'énonçait pas, alors qu'elle conditionne la testabilité qu'il revendique : deux modules qui s'importent mutuellement ne peuvent plus être lus, testés ni déplacés séparément. Un cycle ne viole aucune frontière de couche, ce qui le rend invisible à MA-001, MA-002 et MA-003 puisqu'il se forme à l'intérieur d'une même couche.
- **Le corpus décrit le passage de Light à Full.** La bascule n'est pas une migration mais une addition, et elle se produit au moment où un domaine devient nécessaire. La section explique aussi pourquoi `core/` reste vide en Light plutôt que d'être livré avec un Result Pattern inutilisé, et pourquoi le mouvement inverse n'est volontairement pas outillé.
- **Le noyau de la CLI est testé unitairement.** Quatorze assertions couvrent l'analyse des arguments, l'empilement des couches, la fusion des fragments de `package.json` et la nouvelle pascalisation, avec le lanceur de test de Node et sans dépendance ajoutée. Elles attrapent en deux secondes ce que vingt jobs d'intégration ne voyaient pas.
- **Profil de lecture Light ou Full sur le site.** Un sélecteur en tête de la barre latérale masque les sections qui n'appartiennent pas au profil choisi. Le masquage se fait en CSS et le profil est posé avant la première peinture : la bascule ne reconstruit pas la page et aucune section n'apparaît pour disparaître ensuite. Les entrées de sommaire correspondantes sont retirées avec elles.
- **Balises `<ModeFull>` et `<ModeLight>` dans le corpus.** Elles restent invisibles sur GitHub, qui rend normalement le markdown qu'elles entourent.

### Modifié

- **Les schémas d'architecture sont dessinés, plus dessinés en caractères.** Les trois diagrammes du corpus, les quatre couches et la typologie des modèles dans ses deux profils, passent en blocs `mermaid`. GitHub les rend nativement dans les `.md`, le site les rend aux couleurs du thème courant : la source reste un texte que l'on corrige en une ligne, là où une image se serait figée hors du thème, hors du lecteur d'écran et hors du dépôt.
- **Les titres du corpus ne sont plus numérotés.** Ils portaient une numérotation manuelle qu'il fallait reprendre à chaque insertion, et qui interdisait surtout de masquer une section sans laisser un trou visible dans le sommaire. Les renvois `§N` deviennent des liens d'ancre à l'intérieur d'un document, et le nom de la section ailleurs, y compris dans les messages de lint et les commentaires des templates.
- **La typologie des modèles s'adapte au profil de lecture.** En Mode Light, où la couche `core/` n'existe pas, les trois catégories qui y vivent laissent place à un schéma à deux formes et à la marche à suivre pour basculer vers Full.
- **Le corpus marque la section Agnosticisme technique comme propre au Mode Full.** Le §9 le déclarait déjà : en Light, ni contracts ni adapters. Un lecteur en Light ne la voit plus.
- **Refonte visuelle du site.** Palette issue du Maedow Design System, avec trois valeurs dérivées pour le thème clair, chacune mesurée au premier seuil AA. Quatre fontes et quatre rôles : Space Grotesk aux titres, Google Sans Flex au texte courant, Google Sans Code au code de la documentation, Geist Mono au seul bloc terminal de la page d'accueil.

### Décidé

- **Les renvois `§N` des entrées passées de ce journal ne sont pas réécrits.** Un journal décrit l'état du corpus au moment où il a changé. Réécrire ses entrées anciennes pour les aligner sur la structure d'aujourd'hui reviendrait à effacer ce qu'elles documentent.

## [0.7.0] : 2026-08-30

### Ajouté

- **Prettier dans le dépôt**, avec `npm run format` et `npm run format:check`, ce dernier vérifié en intégration continue.
- **Prettier dans les projets générés** : configuration, fichier d'exclusion et les deux scripts. Un projet fraîchement scaffoldé passe `prettier --check` sans rien avoir à reformater.
- **`.gitattributes`** normalisant les fins de ligne en LF. Sans lui, git convertissait en CRLF à chaque checkout sous Windows pendant que Prettier réécrivait en LF : chaque fichier apparaissait modifié à chaque passage.

### Décidé

- **Prettier formate le code, pas la prose.** Les fichiers Markdown sont exclus. Sur le corpus, Prettier réalignait les tableaux en lignes de deux cents caractères et changeait les conventions d'écriture, `*ainsi*` devenant `_ainsi_`. Ces documents sont le produit lui-même, ils restent tels qu'ils sont écrits.

## [0.6.0] : 2026-08-30

### Ajouté

- **Prompts interactifs à la hauteur de ce que font les outils comparables.** Navigation aux flèches, options visibles côte à côte avec leur explication, annulation propre par Ctrl+C. Avec quatre questions à poser, taper un chiffre sans voir les choix ne tenait plus.
- La sortie complète passe par le même rail visuel, en interactif comme en non interactif.

### Modifié

- **Le paquet publié est désormais bundlé par esbuild**, et conserve `dependencies: {}`. C'est la démarche de `create-vite`, qui utilise la même bibliothèque de prompts sans imposer d'arbre de dépendances à ses utilisateurs. Sans bundle, les mêmes prompts coûteraient cinq paquets et 199 Ko à résoudre à chaque `npx`.
- Un hook `prepublishOnly` reconstruit le bundle, pour ne jamais publier une version périmée.
- **La CI construit le bundle et génère avec lui**, plutôt qu'avec la source. C'est l'artefact que reçoit l'utilisateur, et c'est donc lui qu'il faut éprouver. Deuxième application de la leçon de F-004 et F-011.

## [0.5.0] : 2026-08-30

### Ajouté

- **Choix du framework hôte à l'installation.** `--framework next` ou `--framework vite`. Le template Vite embarque `react-router`, sans quoi la couche `app/` n'aurait aucun routing à porter et la doctrine serait creuse.
- La démonstration existe dans les deux frameworks. Son contenu est un composant React ordinaire, et chaque framework fournit son câblage : `page.tsx` sous Next, `HomePage` montée par `routes.tsx` sous Vite.
- Matrice de CI portée à vingt-deux jobs, dont vingt de scaffolding couvrant les seize combinaisons sous npm et quatre entrées pour pnpm et bun.

### Corpus

- **§3 généralisé.** La colonne « ce qu'elle contient » de la couche App nommait des fichiers Next. Elle décrit désormais un rôle, avec Next comme exemple.
- **§10 ajouté, « Maedow Arch hors Next.js ».** Le tableau d'équivalence entre frameworks, la démonstration que les frontières ne changent pas, et une méthode en trois questions pour porter le standard vers un framework non couvert.

### Vérifié

- **Les frontières se déclenchent hors Next.** Mesuré sur un projet Vite généré : un import interdit depuis `core/` fait échouer le lint avec le motif exact. C'était la condition sans laquelle le template n'aurait rien valu.
- Les seize combinaisons se génèrent. Le projet Vite installe, linte, typecheck, passe ses neuf tests de domaine, build et s'affiche à l'identique de la version Next.

## [0.4.0] : 2026-08-30

### Ajouté

- **Choix du style à l'installation.** `--css vanilla` livre du CSS natif sans aucune dépendance, `--css tailwind` livre Tailwind CSS 4 configuré. Le défaut reste `vanilla` : le standard revendique l'agnosticisme, et la démonstration prouve qu'aucun framework de style n'est nécessaire pour livrer quelque chose de soigné.
- Les composants réutilisables de la démonstration existent dans les deux idiomes. La mise en page reste en classes sémantiques, dupliquer deux cent vingt-cinq lignes pour un choix de style aurait créé deux versions à garder synchronisées.
- Matrice de CI étendue à vingt jobs : seize combinaisons sous npm, plus quatre entrées couvrant pnpm et bun.

### Modifié

- **Le `package.json` généré est assemblé depuis des fragments**, un par couche de template, fusionnés en profondeur et triés. Le fichier unique ne pouvait plus suivre trois axes de variation.
- Les templates sont réorganisés : ce qui relève de Next quitte `base/`, ce qui relève du style est isolé dans ses propres couches.

### Corrigé

- **La bordure du bouton fantôme disparaissait en Tailwind** (F-013). Deux utilitaires de couleur de bordure de même spécificité se départagent selon l'ordre du CSS généré, pas selon l'ordre des classes.

### Site

- **Migration vers Fumadocs 16 et Next 16.** Le raccord manuel de `lib/source.ts` disparaît, soldant la dette inscrite en F-006. `fumadocs-ui` 16 exigeant `next@16.x.x`, la migration en entraînait une seconde.
- `next lint` n'existant plus en Next 16, le script correspondant est retiré plutôt que laissé mort.

## [0.3.0] : 2026-08-30

### Ajouté

- **Choix du profil à l'installation.** `--mode full` installe les quatre couches, `--mode light` retire la couche domaine. Le corpus définissait ces deux profils depuis §9, mais l'outillage n'en produisait qu'un : pour un projet que §9 qualifie de Light, la CLI scaffoldait justement la sur-ingénierie que la section met en garde de ne pas faire.
- **Démonstration déclinée selon le profil.** Le même compteur borné, avec les règles dans `core/` en Full, et dans la feature en Light. Générer les deux et comparer rend la règle de bascule tangible, et répond à l'objection « c'est sur-ingénieré » mieux qu'un paragraphe.
- **Questions interactives** lorsque la CLI est lancée depuis un terminal sans drapeau, avec repli silencieux sur les valeurs par défaut hors terminal ou sous `CI`. Aucune dépendance ajoutée : `node:readline/promises` suffit.
- `--help`, `--yes`, et les raccourcis `--light`, `--full`, `--demo`, `--blank`.
- **Matrice de CI portée à douze combinaisons** : deux profils, deux contenus, trois gestionnaires de paquets, chacune menée jusqu'au test négatif.

### Modifié

- **`architecture.md` §9 précisé.** La cellule « structure recommandée » disait à la fois « `app/` + `features/` uniquement » et « sans `core/` séparé », ce qui n'est pas la même chose et laissait indécidé le sort de `components/` et `lib/`. Light conserve désormais explicitement ces deux dossiers.
- **§9.1 et §9.2 ajoutés** : ce que Light conserve, et comment choisir son profil à l'installation. §9 décrivait une structure sans indiquer par quel bout l'atteindre.
- Les templates sont réorganisés en couches composables, ce qui évite de dupliquer la configuration entre quatre variantes.

### Vérifié

- **La même configuration ESLint sert les deux profils.** Mesuré sur un projet sans `core/` : le lint reste vert, et interdit toujours qu'une feature en importe une autre. Les deux profils ne sont pas deux jeux de règles, mais une relation d'inclusion. Cette constatation est désormais inscrite dans le corpus.

## [0.2.0] : 2026-08-30

### Ajouté

- **Deux points de départ au choix.** `--template demo` livre une démonstration complète, `--template blank` l'arborescence seule. La démonstration est le défaut.
- **Un compteur borné comme démonstration.** Ses bornes sont une règle métier : elle vit dans `core/counter/`, retourne un refus typé via le Result Pattern, et se vérifie par neuf tests qui s'exécutent sans React ni DOM. Un compteur nu aurait montré l'architecture au moment où elle est le moins justifiée.
- **Détection du gestionnaire de paquets.** La CLI reconnaît npm, pnpm, yarn et bun, et adapte les commandes qu'elle affiche.
- **Space Grotesk et Manrope** sur le site de documentation et dans le template de démonstration, auto-hébergées par `next/font`. Le squelette vierge reste typographiquement neutre : Maedow Arch est un standard d'architecture, pas un système de design.
- **Matrice de CI à six combinaisons.** Chaque variante de template est vérifiée sous npm, pnpm et bun, jusqu'au test négatif inclus.

### Vérifié

- Les frontières se déclenchent bien sous l'arborescence stricte de pnpm (F-010). Le risque était plausible, il ne se matérialise pas.

## [0.1.2] : 2026-08-29

### Corrigé

- **`baseUrl` déprécié dans le `tsconfig.json` généré** (F-009). L'option est inutile depuis TypeScript 4.1 quand on utilise `paths`, dépréciée en 6.0 et supprimée en 7.0. Elle a été retirée du template et des fixtures de test.
- Conséquence de la correction précédente : sans `baseUrl`, les substitutions de `paths` doivent être relatives. L'alias devient `"@/*": ["./src/*"]`. Vérifié par `tsc --noEmit` sous TypeScript 5.9 et 7.0.2.

## [0.1.1] : 2026-08-29

### Modifié

- Réécriture éditoriale de l'ensemble des textes. Le tiret cadratin servait de raccourci pour accoler une glose à une phrase déjà finie : chaque occurrence a été reprise avec la ponctuation qui convient au sens. Cela concerne les README publiés sur npm, d'où cette version.
- `eslint-config-maedow-arch` : description du package reformulée.

### Corrigé

- La description du frontmatter de la page d'accueil de la documentation contenait un deux-points non échappé, ce qui cassait le parsing YAML et donc le build du site.

## [0.1.0] : 2026-08-29

Première publication. `create-maedow-arch-app` et `eslint-config-maedow-arch` sont disponibles sur npm, et la documentation est en ligne sur https://maedow-arch-docs.vercel.app.

### Ajouté

**Corpus**

- **Règle de Lazy Abstraction** (`architecture.md` §4) : un `contract.ts` et ses adapters ne s'introduisent qu'à la deuxième implémentation réelle.
- **Règle de dégradation de `features/_shared/`** (`architecture.md` §5.1) : un garde-fou contre le fourre-tout.
- **Mode Light ou Mode Full** (`architecture.md` §9) : deux profils explicites, et une règle de bascule progressive.
- **Helpers du Result Pattern** (`conventions.md` §4.1) : `unwrapOr`, `mapResult` et `match`.

**Dépôt**

- Structure monorepo : le corpus à la racine, le site dans `site/`, les deux packages npm dans `packages/`.
- `LICENSE` (MIT), ce `CHANGELOG.md` et `FRICTIONS.md`.
- `npm run test:boundaries`, un test de non-régression des frontières qui repose sur une fixture valide et une fixture invalide de cinq imports interdits.
- Intégration continue en trois jobs : les frontières, le build du site, et un projet réellement scaffoldé mené jusqu'au build puis soumis à un import interdit.
- Gabarits d'issue et de pull request.

**Outillage**

- `create-maedow-arch-app` : le template porte désormais `layout.tsx`, `page.tsx`, `eslint.config.mjs`, `next.config.mjs`, `vitest.config.ts` et un `.gitignore`.
- `create-maedow-arch-app` : validation du nom de projet, et un `README.md` qui manquait alors que c'est la page affichée sur npmjs.com.
- `eslint-config-maedow-arch` : un message d'erreur explicite, `Maedow Arch : core ne peut pas importer components. Voir architecture.md §6.`

**Site**

- `site/scripts/sync-docs.mjs` dérive les pages depuis les `.md` de la racine, en `predev` et `prebuild`.
- Une section d'installation en page d'accueil, avec commandes copiables.
- Recherche, page 404, favicon, image OpenGraph et pied de page.

### Modifié

- Rebranding « Architecture Maedow » vers **Maedow Arch** sur l'ensemble du corpus, du site et de l'outillage.
- `eslint-config-maedow-arch` : `eslint-import-resolver-typescript` devient une peerDependency obligatoire, et `eslint-plugin-boundaries` passe à `>=7`.
- `create-maedow-arch-app` : `zod` passe de `devDependencies` à `dependencies`, puisque le code généré l'importe à l'exécution.
- Les paquets `fumadocs-*` du site sont épinglés à des versions exactes.
- Les `.mdx` générés sortent du versionnement, car ils sont reconstruits à chaque build.

### Corrigé

- **Les frontières ESLint ne se déclenchaient jamais** (F-001). Les patterns ciblaient la racine alors que le template génère dans `src/`, et sans résolveur TypeScript toute dépendance `.ts` ou `.tsx` était classée « unknown ». Le lint passait au vert sans rien vérifier.
- **`features/_shared` était classé comme une feature ordinaire** (F-002) : l'ordre de déclaration des éléments décide, et le premier pattern qui matche l'emporte.
- **Un projet fraîchement scaffoldé ne démarrait pas** (F-003) : `next`, `react` et `eslint` manquaient au template, et `src/app/` était vide.
- **Le `.gitignore` du template aurait disparu du paquet publié** (F-004), npm excluant ce nom de fichier. Il voyage désormais sous `_gitignore`.
- **Le site servait une documentation tronquée** (F-005) : les `.mdx` copiés à la main avaient perdu de 23 % à 45 % de leur contenu et portaient encore l'ancienne marque.
- **Le site ne buildait pas** (F-006) : `fumadocs-mdx` et `fumadocs-core` avaient dérivé sous leurs plages `^` jusqu'à des formes de `source` incompatibles.
- `architecture.md` : une ancre de conversion parasite sous le titre §9, et un renvoi vers `conventions.md` §7 au lieu de §4.1.
- Les quatre références à l'ancien dépôt `Jean-Marc18/maedow-docs` pointent vers `maedow-arch/maedow-arch-docs`.
