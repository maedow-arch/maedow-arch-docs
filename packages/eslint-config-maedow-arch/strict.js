import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";

/**
 * Entrée stricte de Maedow Arch : les règles de discipline de typage.
 *
 * Usage dans eslint.config.mjs :
 *   import maedowArch from "eslint-config-maedow-arch";
 *   import maedowArchStrict from "eslint-config-maedow-arch/strict";
 *   export default [...maedowArch, ...maedowArchStrict];
 *
 * ## Ce que vous acceptez en chargeant cette entrée
 *
 * Trois interdictions supplémentaires, et elles ne sont pas cosmétiques :
 *
 * **MA-005** interdit `any`. Sur une base existante, c'est la règle qui remonte
 * le plus de violations d'un coup, et chacune demande une décision : un
 * `unknown` avec garde de type, une validation à la frontière, ou une
 * modélisation qui manquait. Aucune ne se règle par un remplacement mécanique.
 *
 * **MA-006** interdit la double assertion `as unknown as`. Elle est souvent le
 * symptôme de MA-005 traité à la va-vite, et la corriger revient au même
 * travail.
 *
 * **MA-007** interdit les cycles d'import. Ils se défont en extrayant ce que
 * deux modules partagent, ce qui est un vrai remaniement, pas une retouche.
 *
 * Comptez ces règles en jours de migration sur un projet en cours, et non en
 * minutes. C'est pourquoi elles vivent ici et non dans l'entrée par défaut.
 *
 * ## Pourquoi ce partage, et pas un autre
 *
 * L'entrée par défaut porte les règles de **frontière** : où vit le code, et
 * qui a le droit d'importer qui. Cette entrée porte les règles de **discipline
 * de typage** : comment on écrit à l'intérieur d'une frontière.
 *
 * Le critère n'est pas « est-ce que ça casse des projets », qui dépend du parc
 * installé à un instant donné et ne tiendrait pas six mois. Il est structurel,
 * donc il tient.
 *
 * ## Ce qu'il faut avoir installé
 *
 * `typescript-eslint` et `eslint-plugin-import` sont des dépendances de pair :
 * elles doivent être résolues depuis votre projet, jamais depuis le
 * node_modules de cette configuration. C'est la friction F-011, où un plugin
 * introuvable faisait échouer huit combinaisons de la matrice sur douze.
 *
 * Si l'une manque, le chargement de ce fichier échoue avec un message clair de
 * Node. C'est délibéré : une configuration qui se chargerait à moitié rendrait
 * un lint vert sans rien vérifier, ce qui est le défaut que ce dépôt documente
 * sous F-001.
 */
export default [
  {
    files: ["**/*.{ts,tsx,mts,cts}"],
    plugins: { "@typescript-eslint": tseslint.plugin },
    rules: {
      // MA-005. La règle canonique est préférée à un sélecteur maison : elle
      // connaît les positions où `any` ne se remplace pas, et son nom est
      // reconnu par tout développeur TypeScript. Le code du registre ne peut
      // pas être injecté dans son message, c'est le prix de ce choix.
      "@typescript-eslint/no-explicit-any": "error",

      // MA-006. Aucune règle publiée ne vise la double assertion, d'où le
      // sélecteur. Il cible l'assertion vers `unknown` dont le parent est une
      // autre assertion, ce qui est exactement la forme `x as unknown as T` et
      // laisse tranquille un `x as unknown` isolé, qui est légitime.
      "no-restricted-syntax": [
        "error",
        {
          selector: 'TSAsExpression > TSAsExpression[typeAnnotation.type="TSUnknownKeyword"]',
          message:
            "MA-006 : la double assertion force un type au lieu de le valider. Validez à la frontière, avec une garde de type ou un schéma. Voir rules.md.",
        },
      ],
    },
  },

  {
    files: ["**/*.{js,jsx,ts,tsx,mjs,cjs}"],
    plugins: { import: importPlugin },
    settings: {
      /*
       * `import/parsers` n'est pas facultatif ici, et son absence ne se voit
       * pas : pour suivre une chaîne d'imports, la règle ouvre elle-même les
       * fichiers importés et doit savoir les analyser. Sans cette ligne elle
       * n'y comprend rien, ne trouve aucun cycle, et rend un lint vert.
       *
       * Constaté en écrivant la règle : le cycle était détecté entre deux
       * fichiers JavaScript et invisible entre deux fichiers TypeScript, sans
       * qu'aucune erreur ne le signale. C'est le défaut que ce dépôt documente
       * sous F-001, une configuration qui passe au vert sans rien vérifier.
       */
      "import/parsers": {
        "@typescript-eslint/parser": [".ts", ".tsx", ".mts", ".cts"],
      },
      "import/resolver": {
        typescript: { alwaysTryTypes: true },
        node: { extensions: [".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"] },
      },
    },
    rules: {
      // MA-007. `maxDepth: Infinity` est indispensable : un cycle passant par
      // trois modules est aussi bloquant qu'un cycle direct, et c'est même le
      // plus fréquent puisqu'il se voit moins.
      "import/no-cycle": ["error", { maxDepth: Infinity }],
    },
  },

  /*
   * Le rattrapage de MA-004 sous core, et il n'est pas facultatif.
   *
   * En configuration plate, deux objets qui ciblent le même fichier et
   * déclarent la même règle ne fusionnent pas leurs options : la dernière
   * déclaration remplace la précédente en entier. Le bloc de typage ci-dessus
   * vise tous les fichiers TypeScript et redéclare `no-restricted-syntax` ;
   * pour un fichier `.tsx` de core, il arrivait donc après l'entrée par défaut
   * et effaçait ses sélecteurs JSX.
   *
   * Autrement dit, la composition que le corpus prescrit, l'entrée par défaut
   * puis l'entrée stricte, éteignait la moitié de MA-004. `no-restricted-imports`
   * restait actif, mais l'entrée par défaut explique elle-même pourquoi il ne
   * suffit pas : le runtime JSX automatique n'exige aucun import de React.
   *
   * Ce bloc arrive en dernier et redéclare les trois sélecteurs ensemble, la
   * seule composition qui préserve les deux intentions. Remonté par le projet
   * ABBA, entrée R-001 de son relevé de terrain, et reproduit ici avant
   * correction : sans ce bloc, la fixture `invalid` du Widget de core passait
   * au vert sous la composition prescrite.
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
        {
          selector: 'TSAsExpression > TSAsExpression[typeAnnotation.type="TSUnknownKeyword"]',
          message:
            "MA-006 : la double assertion force un type au lieu de le valider. Validez à la frontière, avec une garde de type ou un schéma. Voir rules.md.",
        },
      ],
    },
  },
];
