#!/usr/bin/env node
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { verifierNom } from "./nom.mjs";
import { assurerLaCoucheDomaine } from "./bascule-full.mjs";

const name = process.argv[2];
if (!name) {
  console.error("Usage: npm run generate:domain <nom>");
  process.exit(1);
}

// Refuse avant d'écrire : un générateur qui s'arrête à mi-parcours laisse un
// dossier à moitié rempli.
const pascal = verifierNom(name, "generate:domain");
const dir = join("src", "core", name);

if (existsSync(dir)) {
  console.error(`Le domaine "${name}" existe déjà dans ${dir}`);
  process.exit(1);
}

// Sur un projet en profil Light, la couche domaine n'existe pas encore.
// Générer un domaine, c'est précisément la faire naître.
const bascule = assurerLaCoucheDomaine();

mkdirSync(dir, { recursive: true });

writeFileSync(
  join(dir, "types.ts"),
  `// Entité métier du domaine "${name}"\n\nexport interface ${pascal} {\n  id: string;\n  // TODO: champs métier\n}\n`
);

writeFileSync(
  join(dir, "validation.ts"),
  `import { z } from "zod";\n\nexport const Create${pascal}Schema = z.object({\n  // TODO: champs à valider\n});\n\nexport type Create${pascal}DTO = z.infer<typeof Create${pascal}Schema>;\n`
);

writeFileSync(
  join(dir, "service.ts"),
  `import type { Result } from "../common/result";\nimport type { ${pascal} } from "./types";\nimport type { Create${pascal}DTO } from "./validation";\n\n// ⚠️ Règle de Lazy Abstraction : n'introduis un contract.ts + adapters\n// que lorsqu'une deuxième implémentation réelle est nécessaire.\n// Tant qu'un seul fournisseur de données existe, accède-y directement ici.\n\nexport async function create${pascal}(input: Create${pascal}DTO): Promise<Result<${pascal}>> {\n  // TODO: logique métier\n  return { ok: false, error: "not_implemented" };\n}\n`
);

if (bascule) {
  console.log("");
  console.log("🔀 Ce projet passe du profil Light au profil Full.");
  console.log("   La couche domaine vient d'être créée avec son Result Pattern :");
  console.log("   - src/core/common/result.ts");
  console.log("   Le corpus décrit ce passage à la section Mode Light ou Full.");
  console.log("");
}

// Le test naît avec le domaine, colocalisé comme celui des features. C'est la
// couche que le standard présente comme la plus testable, elle n'a aucune
// raison d'être la seule dont le générateur n'amorce pas de test.
writeFileSync(
  join(dir, `${name}.test.ts`),
  `import { describe, it, expect } from "vitest";
import { create${pascal} } from "./service";

// Ce test s'exécute sans DOM, sans mock et sans arbre React : c'est la
// propriété que la couche core/ doit conserver.
describe("create${pascal}", () => {
  it("refuse tant que la logique métier n'est pas écrite", async () => {
    const resultat = await create${pascal}({} as never);
    expect(resultat.ok).toBe(false);
  });
});
`
);

console.log(`✅ Domaine "${name}" généré dans ${dir}/`);
console.log(`   - types.ts`);
console.log(`   - validation.ts`);
console.log(`   - service.ts (accès direct, voir la Règle de Lazy Abstraction)`);
console.log(`   - ${name}.test.ts`);
console.log(
  `   Rappel : n'ajoute contract.ts + repository.ts que si un 2ème fournisseur devient réel.`
);
