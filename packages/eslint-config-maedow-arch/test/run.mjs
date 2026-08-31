#!/usr/bin/env node
/**
 * Test de non-régression des frontières Maedow Arch.
 *
 * Deux assertions, et la seconde est la seule qui prouve quelque chose :
 *   1. La fixture `valid/` ne lève AUCUNE erreur.
 *   2. La fixture `invalid/` lève EXACTEMENT les violations attendues.
 *
 * Sans le test négatif, une config qui ne matche aucun élément passe au vert
 * et donne l'illusion que l'architecture est protégée. C'est précisément le
 * défaut qu'avait la première version de cette config.
 *
 * Usage : npm run test:boundaries
 */
import { ESLint } from "eslint";
import tseslint from "typescript-eslint";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import maedowArchConfig from "../index.js";

const here = dirname(fileURLToPath(import.meta.url));
const fixtures = join(here, "fixtures");

/**
 * Violations attendues dans la fixture `invalid/`, une par fichier.
 *
 * On vérifie le code du registre, pas le libellé. Un libellé se réécrit sans
 * que la règle change ; un code ne bouge pas, et c'est précisément ce qu'il
 * garantit. Un test qui attendrait la phrase exacte casserait à la première
 * reformulation, et on prendrait l'habitude de le corriger sans le lire.
 */
const EXPECTED_VIOLATIONS = [
  { file: "core/billing/render.ts", code: "MA-001", cas: "core ⇸ components" },
  { file: "core/billing/service.ts", code: "MA-001", cas: "core ⇸ feature" },
  { file: "features/_shared/Card.tsx", code: "MA-003", cas: "shared-feature ⇸ feature" },
  { file: "features/checkout/Screen.tsx", code: "MA-002", cas: "feature ⇸ feature" },
  { file: "lib/bad.ts", code: "MA-001", cas: "lib ⇸ core" },

  // MA-004. Le premier cas est celui qui justifie la règle de syntaxe : aucun
  // import de React n'y figure, le runtime JSX automatique s'en passe.
  { file: "core/audit/Widget.tsx", code: "MA-004", cas: "du JSX dans core/, sans import" },
  { file: "core/audit/useTheme.ts", code: "MA-004", cas: "une dépendance UI dans core/" },

  // Les trois façons de contourner un chemin relatif. Les fixtures n'en
  // employaient aucune : rien ne garantissait qu'elles soient interceptées.
  { file: "core/pricing/viaAlias.ts", code: "MA-001", cas: "par l'alias @/" },
  { file: "features/checkout/viaTypeOnly.ts", code: "MA-002", cas: "par un import de type" },
  { file: "features/checkout/viaBarrel.ts", code: "MA-002", cas: "au travers d'un barrel" },
];

/** La config du package, plus le parser TypeScript que l'utilisateur apporte. */
function configFor(cwd) {
  return [
    { files: ["**/*.{ts,tsx}"], languageOptions: { parser: tseslint.parser } },
    ...maedowArchConfig,
    { settings: { "import/resolver": { typescript: { project: join(cwd, "tsconfig.json") } } } },
  ];
}

async function lint(fixtureName) {
  const cwd = join(fixtures, fixtureName);
  const eslint = new ESLint({
    cwd,
    overrideConfigFile: true,
    overrideConfig: configFor(cwd),
  });
  const results = await eslint.lintFiles(["src"]);
  return results.flatMap((result) =>
    result.messages.map((message) => ({
      file: result.filePath
        .slice(cwd.length + 1)
        .replaceAll("\\", "/")
        .replace(/^src\//, ""),
      ruleId: message.ruleId,
      message: message.message,
    }))
  );
}

let failed = false;
const fail = (line) => {
  failed = true;
  console.error(`  ✗ ${line}`);
};

// --- 1. La fixture valide doit être silencieuse -------------------------------
console.log("\n▸ Fixture valid/ : le flux app → features → core → lib est respecté");
const validProblems = await lint("valid");
if (validProblems.length === 0) {
  console.log("  ✓ aucune erreur, comme attendu");
} else {
  for (const problem of validProblems) {
    fail(`faux positif dans ${problem.file} : ${problem.message}`);
  }
}

// --- 2. La fixture invalide doit lever exactement les violations attendues -----
console.log(
  `
▸ Fixture invalid/ : ${EXPECTED_VIOLATIONS.length} violations attendues, avec leur code`
);
const invalidProblems = await lint("invalid");

for (const expected of EXPECTED_VIOLATIONS) {
  // Le code est cherché dans le message, sans contrainte sur la règle qui l'a
  // produit : MA-004 passe par deux règles ESLint distinctes, et `boundaries`
  // n'est plus le seul chemin par lequel une violation remonte.
  const found = invalidProblems.find(
    (problem) => problem.file === expected.file && problem.message.includes(expected.code)
  );
  if (found) {
    console.log(`  ✓ ${expected.file} : ${expected.code}, ${expected.cas}`);
  } else {
    fail(
      `violation NON détectée dans ${expected.file} (${expected.code}, ${expected.cas}). ` +
        `Remontées pour ce fichier : ${
          invalidProblems
            .filter((p) => p.file === expected.file)
            .map((p) => p.message)
            .join(" | ") || "aucune"
        }`
    );
  }
}

/*
 * Une remontée non déclarée est signalée avec son contenu. Un compte seul
 * oblige à rejouer le lint à la main pour savoir ce qui a changé, et c'est
 * exactement le moment où l'on est tenté d'ajuster le compte sans regarder.
 */
const declared = new Set(EXPECTED_VIOLATIONS.map((v) => `${v.file}|${v.code}`));
const unexpected = invalidProblems.filter(
  (problem) => ![...declared].some((key) => key.startsWith(`${problem.file}|`))
);
for (const problem of unexpected) {
  fail(`remontée non déclarée dans ${problem.file} : ${problem.message}`);
}

console.log(
  failed
    ? "\n✗ Les frontières Maedow Arch ne sont PAS correctement appliquées.\n"
    : "\n✓ Les frontières Maedow Arch sont appliquées.\n"
);
process.exit(failed ? 1 : 0);
