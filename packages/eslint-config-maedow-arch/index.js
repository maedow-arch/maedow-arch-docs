import boundaries from "eslint-plugin-boundaries";

/**
 * Configuration ESLint officielle de Maedow Arch.
 * Enforce le flux de dépendance unidirectionnel :
 *
 *   app → features → core → lib
 *
 * Usage dans eslint.config.mjs :
 *   import maedowArchConfig from "eslint-config-maedow-arch";
 *   export default [...maedowArchConfig];
 *
 * ⚠️ Deux points qui font échouer silencieusement une config boundaries :
 *
 * 1. L'ORDRE des éléments compte : le premier pattern qui matche l'emporte.
 *    `shared-feature` doit précéder `feature`, sinon `features/_shared/`
 *    serait classé comme une feature ordinaire et sa règle serait morte.
 *
 * 2. La RÉSOLUTION des imports doit connaître TypeScript. Sans résolveur TS,
 *    les imports `.ts`/`.tsx` sont classés « unknown » et AUCUNE règle ne se
 *    déclenche, et le lint passe au vert sans rien vérifier. D'où la
 *    peerDependency `eslint-import-resolver-typescript`.
 *
 * Les patterns ne sont pas ancrés à la racine : ils matchent le segment
 * correspondant où qu'il soit. `core` couvre donc aussi bien `core/` que
 * `src/core/`.
 */
export default [
  {
    files: ["**/*.{js,jsx,ts,tsx,mjs,cjs}"],
    plugins: { boundaries },
    settings: {
      "import/resolver": {
        typescript: { alwaysTryTypes: true },
        node: { extensions: [".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"] },
      },
      "boundaries/elements": [
        { type: "shared-feature", pattern: "features/_shared" },
        { type: "feature", pattern: "features/*", capture: ["feature"] },
        { type: "app", pattern: "app" },
        { type: "core", pattern: "core" },
        { type: "components", pattern: "components" },
        { type: "lib", pattern: "lib" },
      ],
    },
    rules: {
      "boundaries/dependencies": [
        "error",
        {
          default: "disallow",
          // Le message par défaut porte MA-001, le flux général. Les deux cas qui
          // ont leur propre code reçoivent leur propre message plus bas : le
          // plugin préfère le message d'une politique à celui de la règle.
          //
          // Un code est cité plutôt qu'un titre de section. Un titre se
          // réécrit, et le renvoi casse en silence ; c'est arrivé au commit
          // 71c0a3f, quand la numérotation des titres a été retirée.
          message:
            "MA-001 : le flux de dépendance est unidirectionnel. {{from.type}} ne peut pas importer {{to.type}}. Voir rules.md.",
          policies: [
            // app/ orchestre : il peut tout importer.
            {
              from: { element: { type: "app" } },
              allow: {
                to: {
                  element: {
                    types: {
                      anyOf: ["app", "feature", "shared-feature", "core", "components", "lib"],
                    },
                  },
                },
              },
            },
            // Une feature descend la pile, mais n'atteint jamais une autre feature.
            {
              from: { element: { type: "feature" } },
              allow: {
                to: {
                  element: { types: { anyOf: ["shared-feature", "core", "components", "lib"] } },
                },
              },
            },
            // ...sauf elle-même : les imports internes à la feature sont libres.
            {
              from: { element: { type: "feature" } },
              allow: {
                to: { element: { type: "feature", captured: { feature: "{{from.feature}}" } } },
              },
            },
            // features/_shared/ est transverse : il ne connaît aucune feature.
            {
              from: { element: { type: "shared-feature" } },
              allow: {
                to: {
                  element: { types: { anyOf: ["shared-feature", "core", "components", "lib"] } },
                },
              },
            },
            // core/ est le domaine métier : zéro dépendance UI, zéro feature.
            {
              from: { element: { type: "core" } },
              allow: { to: { element: { types: { anyOf: ["core", "lib"] } } } },
            },
            // components/ est présentationnel pur.
            {
              from: { element: { type: "components" } },
              allow: { to: { element: { types: { anyOf: ["components", "lib"] } } } },
            },
            // lib/ est la feuille de l'arbre : il ne dépend que de lui-même.
            {
              from: { element: { type: "lib" } },
              allow: { to: { element: { type: "lib" } } },
            },
            // Les deux interdictions qui portent un code à elles seules. Elles
            // viennent après les autorisations, y compris celle des imports
            // internes à une feature, qui reste donc permise.
            {
              from: { element: { type: "feature" } },
              disallow: { to: { element: { type: "feature" } } },
              message:
                "MA-002 : une feature ne peut pas en importer une autre. Passez par features/_shared/, core/ ou components/. Voir rules.md.",
            },
            {
              from: { element: { type: "shared-feature" } },
              disallow: { to: { element: { type: "feature" } } },
              message:
                "MA-003 : features/_shared ne connaît aucune feature. Ce qui dépend d'une feature n'est pas transverse. Voir rules.md.",
            },
          ],
        },
      ],
    },
  },

  /*
   * MA-004 : zéro JSX et zéro dépendance UI dans core/.
   *
   * Le point qui rend la règle de syntaxe indispensable : le runtime JSX
   * automatique n'exige aucun import de React. Un composant peut donc vivre
   * dans core/ sans qu'aucune règle d'import ne se déclenche, et c'est vérifié
   * plutôt que supposé, la fixture valide restant silencieuse avant l'ajout de
   * cette règle.
   *
   * `no-restricted-imports` seul aurait donné l'illusion d'une protection : il
   * n'attrape que le cas où quelqu'un écrit encore `import React from "react"`,
   * qui est justement le cas devenu rare.
   *
   * La règle vise le contenu, pas l'extension. Un fichier `.tsx` sans JSX dans
   * core/ ne casse rien, tandis qu'un `.ts` ne peut pas en contenir : le parser
   * le refuserait avant nous.
   */
  {
    files: ["**/core/**/*.{js,jsx,ts,tsx,mjs,cjs}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "JSXElement",
          message:
            "MA-004 : core/ est le domaine pur, il ne contient pas de JSX. Un écran appartient à features/, une primitive à components/. Voir rules.md.",
        },
        {
          selector: "JSXFragment",
          message:
            "MA-004 : core/ est le domaine pur, il ne contient pas de JSX. Un écran appartient à features/, une primitive à components/. Voir rules.md.",
        },
      ],
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "react",
              message:
                "MA-004 : core/ ne dépend d'aucune bibliothèque d'interface. Le domaine doit se tester sans monter d'arbre React. Voir rules.md.",
            },
            {
              name: "react-dom",
              message:
                "MA-004 : core/ ne dépend d'aucune bibliothèque d'interface. Le domaine doit se tester sans monter d'arbre React. Voir rules.md.",
            },
          ],
          patterns: [
            {
              group: ["react/*", "react-dom/*"],
              message:
                "MA-004 : core/ ne dépend d'aucune bibliothèque d'interface. Le domaine doit se tester sans monter d'arbre React. Voir rules.md.",
            },
          ],
        },
      ],
    },
  },
];
