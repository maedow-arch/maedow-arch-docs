# Changelog

Toutes les évolutions notables de Maedow Arch : le corpus documentaire, le site et l'outillage.

Le format suit [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/), et le versionnage suit [SemVer](https://semver.org/lang/fr/).

Les frictions à l'origine des corrections sont détaillées dans [FRICTIONS.md](./FRICTIONS.md).

## [Non publié]

### Corrigé

- **`AGENTS.md` décrivait un état antérieur du projet.** Écrit avant la page d'adoption, il ignorait `npx maedow-arch check` et ne renvoyait qu'à cinq documents sur six. Le fichier destiné aux assistants était le seul à ne pas connaître le dernier outil livré.
- **`AGENTS.md` n'était référencé nulle part.** Ni le README ni le guide de contribution ne le mentionnaient : on ne le trouvait qu'en explorant la racine. Les deux y renvoient désormais, avec l'adresse du corpus en texte brut.


### Ajouté

- **Une page « Adopter sur un projet existant » dans la documentation.** La commande d'audit existait, la page d'accueil l'annonçait, mais rien n'expliquait comment lire son rapport ni conduire la migration. La page donne l'ordre des corrections et sa raison, ce que `--fix` ne touche pas, et le passage de l'audit à la configuration ESLint une fois la migration faite, en précisant que charger l'entrée par défaut et l'entrée stricte d'un coup sur une base existante est le meilleur moyen de tout désactiver la semaine suivante.
- **La documentation propose deux chemins d'entrée**, selon que le projet existe déjà ou non. Le second était le seul documenté, alors que le premier est le plus fréquent.

- **Le corpus entier est lisible à une seule adresse, sur `/llms.txt`.** Un agent qui veut connaître ce standard n'a plus à parcourir six pages de HTML. Le fichier est dérivé de la documentation et jamais recopié : il ne peut pas se périmer sans qu'elle se périme aussi. C'est un canal d'adoption réel pour un standard destiné à être appliqué par des développeurs qui travaillent avec des assistants.
- **Un `AGENTS.md` à la racine**, qui dit ce qu'il faut savoir avant de modifier le dépôt : que le corpus est la source et les pages du site des fichiers générés, que chaque règle a besoin de sa fixture, et où chercher une réponse. `FRICTIONS.md` y est signalé comme le document le plus utile pour comprendre les décisions qui paraissent arbitraires.
- **La commande d'audit est annoncée là où on la cherche.** `maedow-arch` était publié sur npm sans apparaître ni dans le tableau d'outillage du README, ni sur le site, ni dans le guide de contribution. Le démarrage rapide commence désormais par le projet qui existe déjà, qui est le cas le plus fréquent.

- **Un garde de version en intégration continue.** Une pull request qui modifie le code d'un paquet sans faire bouger sa version échoue désormais. C'est le défaut qui a fait perdre deux tentatives de publication : `npm publish` refuse une version déjà en ligne, et il le refuse après la construction et après l'authentification. Le garde n'exige rien quand seuls le README, la licence ou les tests changent.
- **Le site déclare son domaine, son plan et ses règles d'indexation.** `metadataBase` manquait, si bien que les balises Open Graph portaient des adresses relatives et qu'un partage sur un réseau social ne trouvait pas l'image. Le plan du site est dérivé des pages réelles, comme la navigation : une liste écrite à la main se périmerait au premier document ajouté.

### Corrigé

- **Le tableau des rôles ne contient plus de notation mathématique.** La ligne de `features/_shared` employait une notation LaTeX qui ne rend ni sur GitHub ni sur le site et s'affichait telle quelle. Elle dit maintenant « au moins deux features ».
- **La fixture d'audit n'emploie plus `baseUrl`.** L'option est dépréciée depuis TypeScript 7 et faisait apparaître un avertissement dans l'éditeur de quiconque ouvre ce dépôt. Le support de `baseUrl` reste vérifié par un test, les projets audités en ayant encore.

## [0.8.0] : 2026-09-01

### Ajouté

- **`npx maedow-arch check`, pour auditer un projet qui existe déjà.** L'outillage ne s'adressait qu'aux projets à créer, alors qu'aucune équipe ne repart de zéro pour adopter une architecture. La commande lit un projet quelconque sans rien installer ni modifier, et rend un rapport ordonné par ce qui débloque le reste plutôt que par gravité, chaque section disant ce que la correction rend possible. Sortie lisible par défaut, `--json` pour l'intégration continue, `--seuil` pour mesurer une progression sans rougir un pipeline au premier jour, et `--fix` limité aux options du `tsconfig.json` : les déplacements de fichiers sont proposés, jamais appliqués.
- **Une clause de conformité dans le registre.** Ce qu'un projet doit satisfaire pour se dire conforme à Maedow Arch 1.0, et ce qui constitue une rupture du standard, notion distincte du versionnage des paquets. Un standard qui change sans le dire ne vaut pas mieux qu'une convention d'équipe.
- **Le chargement de données côté serveur hors Next.js, et la condition qui rend le portage possible.** La section traitait le point d'entrée, la coquille et les routes, mais restait muette sur les Server Components, qui sont précisément ce qui n'a pas d'équivalent ailleurs. Elle distingue désormais deux chemins au destin opposé : une route API se porte presque telle quelle, un Server Component doit être remplacé par un effet client, avec ses trois états, sa route intermédiaire et son annulation. Le tableau des six différences et le chiffre de 27 lignes contre 41 viennent d'un portage réellement effectué, pas d'une estimation.
- **Un mode d'emploi pour `exactOptionalPropertyTypes`.** L'option est activée dans les deux `tsconfig` générés, et c'est celle qui saute en premier dans un vrai projet, en emportant le reste du strict avec elle. La section part des messages d'erreur, distingue `TS2375` d'une affectation de `TS2379` d'un argument, et donne quatre remèdes selon que le type vous appartient ou non. Elle dit aussi que le conseil de TypeScript, ajouter `undefined` au type cible, n'est le bon qu'un cas sur deux. Et elle fixe la limite : devant un client d'API à six champs facultatifs, une assertion confinée et commentée vaut mieux qu'une option retirée du `tsconfig.json`, la première se retirant le jour où le SDK corrige ses types là où la seconde emporte tout le projet.
- **Le DTO de sortie, symétrique du DTO d'entrée.** Le corpus décrivait ce qu'un client a le droit d'envoyer, jamais ce qu'il a le droit de recevoir. La fuite la plus courante n'est pas un secret dans un journal mais un `return user` qui emporte `passwordHash` : rien n'échoue, les tests passent, et le champ interne ajouté le matin part vers le client le jour même. La règle est de décrire la sortie par un schéma, avec une liste d'inclusions et non d'exclusions, un `Omit` étant en retard d'un champ en permanence.
- **La Pyramide de Tests, que le README promettait sans que le corpus la contienne.** Elle dit où vivent les tests, ce que chaque couche appelle un test, et pourquoi elle ne fixe aucun taux de couverture : une exigence chiffrée sur `core/` produit des tests écrits pour la métrique, alors que l'exigence utile, un domaine testable sans DOM ni mock, se vérifie directement.
- **`generate:domain` amorce désormais un test, colocalisé.** La couche que le standard présente comme la plus testable était la seule dont le générateur n'écrivait aucun test.
- **La table de nommage a enfin une ligne pour les tests.** Un test porte le nom de ce qu'il teste, et vit à côté de lui.
- **Le Result Pattern se compose enfin.** `andThen` enchaîne une opération faillible sur le succès de la précédente, `all` agrège une liste de résultats en s'arrêtant à la première erreur. Sans eux, un service qui enchaînait trois appels pouvant échouer retombait sur l'imbrication de `if (!result.ok)` que le pattern était censé supprimer : `mapResult` transforme une donnée, mais son résultat n'est pas faillible. Les deux helpers sont livrés dans le template avec leurs tests, et le corpus montre l'enchaînement de trois services, l'absence d'exemple étant ce qui pousse les équipes à réinventer mal.
- **Une entrée stricte, `eslint-config-maedow-arch/strict`.** Elle porte MA-005 `any` interdit, MA-006 la double assertion, et MA-007 les cycles d'import. L'entrée par défaut ne change pas d'une ligne : un projet installé lint exactement comme avant, et l'adoption des règles de typage devient un choix explicite plutôt qu'une rupture subie à la mise à jour. Le partage entre les deux entrées est structurel, les frontières d'un côté, la discipline de typage de l'autre, et non fondé sur ce que casserait le parc installé à un instant donné. `eslint-config-maedow-arch` passe en 0.3.0.
- **Sept règles sur neuf sont désormais vérifiées par la machine**, contre trois avant ce lot. Les deux qui restent, MA-008 et MA-009, le sont par décision : le registre explique pour chacune en quoi l'outiller coûterait plus qu'elle ne rapporte.
- **MA-004 est désormais vérifiée par la machine.** Un fichier contenant du JSX dans `core/`, ou important React, fait échouer le lint. Deux règles la portent, et il en faut bien deux : le runtime JSX automatique ne demande aucun import, si bien qu'un composant vivait jusqu'ici dans `core/` sans qu'aucune règle ne se déclenche. C'était constaté avant d'écrire la règle, et le test le confirme en la retirant. `eslint-config-maedow-arch` passe en 0.2.0.
- **Trois façons de contourner un chemin relatif sont désormais couvertes par les fixtures.** L'alias `@/`, l'import de type seul et le passage par un barrel étaient bien interceptés par les frontières, mais rien ne le garantissait dans le temps : les fixtures n'employaient que des imports relatifs.
- **Un registre des règles, avec un code stable par règle.** [`rules.md`](./rules.md) recense les neuf règles normatives du standard et dit pour chacune si elle est vérifiée par la machine ou tenue par l'équipe. Un standard qui laisse croire que tout est appliqué est moins crédible qu'un standard qui distingue les deux. Le registre rejoint le corpus comme quatrième document du site.
- **MA-007, aucun cycle d'import entre modules.** Le corpus ne l'énonçait pas, alors qu'elle conditionne la testabilité qu'il revendique : deux modules qui s'importent mutuellement ne peuvent plus être lus, testés ni déplacés séparément. Un cycle ne viole aucune frontière de couche, ce qui le rend invisible à MA-001, MA-002 et MA-003 puisqu'il se forme à l'intérieur d'une même couche.
- **Le corpus décrit le passage de Light à Full.** La bascule n'est pas une migration mais une addition, et elle se produit au moment où un domaine devient nécessaire. La section explique aussi pourquoi `core/` reste vide en Light plutôt que d'être livré avec un Result Pattern inutilisé, et pourquoi le mouvement inverse n'est volontairement pas outillé.
- **Le noyau de la CLI est testé unitairement.** Quatorze assertions couvrent l'analyse des arguments, l'empilement des couches, la fusion des fragments de `package.json` et la nouvelle pascalisation, avec le lanceur de test de Node et sans dépendance ajoutée. Elles attrapent en deux secondes ce que vingt jobs d'intégration ne voyaient pas.
- **Profil de lecture Light ou Full sur le site.** Un sélecteur en tête de la barre latérale masque les sections qui n'appartiennent pas au profil choisi. Le masquage se fait en CSS et le profil est posé avant la première peinture : la bascule ne reconstruit pas la page et aucune section n'apparaît pour disparaître ensuite. Les entrées de sommaire correspondantes sont retirées avec elles.
- **Balises `<ModeFull>` et `<ModeLight>` dans le corpus.** Elles restent invisibles sur GitHub, qui rend normalement le markdown qu'elles entourent.

### Modifié

- **L'exemple de modèle de persistance ne contredit plus la Règle du Pragmatisme Typé.** Il montrait `Product` et `ProductRow` en 1:1, c'est-à-dire précisément le cas où le corpus demande de ne pas dupliquer. Il montre désormais un agrégat `Order` reconstruit depuis trois tables, avec son mapper : la séparation se justifie quand l'entité n'a pas la forme d'une table, et le corpus dit maintenant quand s'en abstenir.
- **Les tests sont colocalisés, et le template ne livre plus de dossiers `tests/` vides.** Il créait `src/tests/unit`, `integration` et `e2e`, trois dossiers vides qui promettaient une organisation par nature de test que les générateurs contredisaient en écrivant à côté du code. Un test séparé de son sujet se met à mentir au premier déplacement de fichier, ou survit en orphelin à une suppression.
- **Les messages de lint citent un code, plus un titre de section.** Un titre se réécrit et le renvoi casse en silence, ce qui est arrivé quand la numérotation des titres a été retirée du corpus. `MA-002 : une feature ne peut pas en importer une autre` reste juste quelle que soit la façon dont le corpus évolue ensuite, et relie le message, la section, la fixture et l'entrée de ce journal.
- **« Trois couches sur quatre ne bougent pas » devient une condition, et non plus une promesse.** Elles ne bougent pas *si les écrans reçoivent leurs données au lieu d'aller les chercher*. Ce n'est pas le framework qui rend le portage possible, c'est la règle « zéro modèle dans le JSX » appliquée avant lui : un projet dont les écrans appellent eux-mêmes leurs sources verra le coût se répandre dans `features/`, et l'affirmation sera fausse pour lui. Le corpus donne le test à faire sur son propre code avant de se lancer.
- **Les schémas d'architecture sont dessinés, plus dessinés en caractères.** Les trois diagrammes du corpus, les quatre couches et la typologie des modèles dans ses deux profils, passent en blocs `mermaid`. GitHub les rend nativement dans les `.md`, le site les rend aux couleurs du thème courant : la source reste un texte que l'on corrige en une ligne, là où une image se serait figée hors du thème, hors du lecteur d'écran et hors du dépôt.
- **Les titres du corpus ne sont plus numérotés.** Ils portaient une numérotation manuelle qu'il fallait reprendre à chaque insertion, et qui interdisait surtout de masquer une section sans laisser un trou visible dans le sommaire. Les renvois `§N` deviennent des liens d'ancre à l'intérieur d'un document, et le nom de la section ailleurs, y compris dans les messages de lint et les commentaires des templates.
- **La typologie des modèles s'adapte au profil de lecture.** En Mode Light, où la couche `core/` n'existe pas, les trois catégories qui y vivent laissent place à un schéma à deux formes et à la marche à suivre pour basculer vers Full.
- **Le corpus marque la section Agnosticisme technique comme propre au Mode Full.** Le §9 le déclarait déjà : en Light, ni contracts ni adapters. Un lecteur en Light ne la voit plus.
- **Refonte visuelle du site.** Palette issue du Maedow Design System, avec trois valeurs dérivées pour le thème clair, chacune mesurée au premier seuil AA. Quatre fontes et quatre rôles : Space Grotesk aux titres, Google Sans Flex au texte courant, Google Sans Code au code de la documentation, Geist Mono au seul bloc terminal de la page d'accueil.

### Corrigé

- **Le Result Pattern n'est plus écrit à deux endroits.** Le script de bascule vers Full en portait une copie, nécessaire puisqu'il vit dans le projet généré, mais écrite à la main. Les deux versions ont divergé deux fois en une journée, dont une par le seul passage du formateur. La copie est désormais injectée au moment du scaffolding depuis le fichier source.
- **Les générateurs produisaient du TypeScript invalide sur un nom composé.** `generate:feature user-profile` écrivait `User-profileScreen`, qui n'est pas un identifiant : une majuscule posée sur la seule première lettre laisse le tiret au milieu. Les noms sont désormais découpés sur les tirets, points et underscores, et un nom qui ne donnerait pas d'identifiant exploitable est refusé avant que le moindre fichier ne soit écrit.
- **`generate:domain` était inutilisable en profil Light.** Le service généré importait `../common/result`, absent d'un projet Light puisque la couche domaine n'y existe pas. La commande fait maintenant naître cette couche et annonce la bascule vers Full, ce que le corpus décrit désormais à la section « Passer de Light à Full ».

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
