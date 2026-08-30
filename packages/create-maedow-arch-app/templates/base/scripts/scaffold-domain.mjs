#!/usr/bin/env node
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const name = process.argv[2];
if (!name) {
  console.error("Usage: npm run generate:domain <nom>");
  process.exit(1);
}

const pascal = name.charAt(0).toUpperCase() + name.slice(1);
const dir = join("src", "core", name);

if (existsSync(dir)) {
  console.error(`Le domaine "${name}" existe déjà dans ${dir}`);
  process.exit(1);
}

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

console.log(`✅ Domaine "${name}" généré dans ${dir}/`);
console.log(`   - types.ts`);
console.log(`   - validation.ts`);
console.log(`   - service.ts (accès direct, voir la Règle de Lazy Abstraction)`);
console.log(
  `   Rappel : n'ajoute contract.ts + repository.ts que si un 2ème fournisseur devient réel.`
);
