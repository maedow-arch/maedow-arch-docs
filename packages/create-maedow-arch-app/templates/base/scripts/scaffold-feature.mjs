#!/usr/bin/env node
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const name = process.argv[2];
if (!name) {
  console.error("Usage: npm run generate:feature <nom>");
  process.exit(1);
}

const pascal = name.charAt(0).toUpperCase() + name.slice(1);
const dir = join("src", "features", name);

if (existsSync(dir)) {
  console.error(`La feature "${name}" existe déjà dans ${dir}`);
  process.exit(1);
}

mkdirSync(join(dir, "hooks"), { recursive: true });
mkdirSync(join(dir, "components"), { recursive: true });

writeFileSync(
  join(dir, "types.ts"),
  `// Types d'affichage locaux à la feature "${name}"\n\nexport interface ${pascal}View {\n  // TODO\n}\n`
);

writeFileSync(
  join(dir, "hooks", `use${pascal}.ts`),
  `import { useState } from "react";\nimport type { ${pascal}View } from "../types";\n\nexport function use${pascal}() {\n  const [state, setState] = useState<${pascal}View | null>(null);\n  return { state, isLoading: false };\n}\n`
);

writeFileSync(
  join(dir, "Screen.tsx"),
  `import { use${pascal} } from "./hooks/use${pascal}";\n\nexport function ${pascal}Screen() {\n  const { state, isLoading } = use${pascal}();\n\n  if (isLoading) return <p>Chargement...</p>;\n\n  return <div>{/* TODO: rendu de ${pascal} */}</div>;\n}\n`
);

writeFileSync(
  join(dir, `${pascal}.test.tsx`),
  `import { describe, it, expect } from "vitest";\n\ndescribe("${pascal}Screen", () => {\n  it.todo("affiche l'écran ${name}");\n});\n`
);

console.log(`✅ Feature "${name}" générée dans ${dir}/`);
console.log(`   - types.ts`);
console.log(`   - hooks/use${pascal}.ts`);
console.log(`   - Screen.tsx`);
console.log(`   - ${pascal}.test.tsx`);
