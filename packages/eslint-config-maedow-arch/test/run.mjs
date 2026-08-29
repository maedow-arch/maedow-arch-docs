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

/** Violations attendues dans la fixture `invalid/`, une par fichier. */
const EXPECTED_VIOLATIONS = [
  { file: "core/billing/render.ts", from: "core", to: "components" },
  { file: "core/billing/service.ts", from: "core", to: "feature" },
  { file: "features/_shared/Card.tsx", from: "shared-feature", to: "feature" },
  { file: "features/checkout/Screen.tsx", from: "feature", to: "feature" },
  { file: "lib/bad.ts", from: "lib", to: "core" },
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
      file: result.filePath.slice(cwd.length + 1).replaceAll("\\", "/").replace(/^src\//, ""),
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
console.log("\n▸ Fixture valid/ — le flux app → features → core → lib est respecté");
const validProblems = await lint("valid");
if (validProblems.length === 0) {
  console.log("  ✓ aucune erreur, comme attendu");
} else {
  for (const problem of validProblems) {
    fail(`faux positif dans ${problem.file} : ${problem.message}`);
  }
}

// --- 2. La fixture invalide doit lever exactement les violations attendues -----
console.log("\n▸ Fixture invalid/ — 5 imports interdits, un par fichier");
const invalidProblems = await lint("invalid");

for (const expected of EXPECTED_VIOLATIONS) {
  const found = invalidProblems.find(
    (problem) =>
      problem.file === expected.file &&
      problem.ruleId === "boundaries/dependencies" &&
      problem.message.includes(`${expected.from} ne peut pas importer ${expected.to}`)
  );
  if (found) {
    console.log(`  ✓ ${expected.file} — ${expected.from} ⇸ ${expected.to}`);
  } else {
    fail(
      `violation NON détectée dans ${expected.file} (${expected.from} → ${expected.to}). ` +
        `Remontées pour ce fichier : ${
          invalidProblems
            .filter((p) => p.file === expected.file)
            .map((p) => p.message)
            .join(" | ") || "aucune"
        }`
    );
  }
}

const unexpected = invalidProblems.length - EXPECTED_VIOLATIONS.length;
if (unexpected > 0) {
  fail(`${unexpected} remontée(s) inattendue(s) dans invalid/`);
}

console.log(
  failed
    ? "\n✗ Les frontières Maedow Arch ne sont PAS correctement appliquées.\n"
    : "\n✓ Les frontières Maedow Arch sont appliquées.\n"
);
process.exit(failed ? 1 : 0);
