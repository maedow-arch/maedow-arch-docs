#!/usr/bin/env node
/**
 * Intègre @clack/prompts au fichier publié.
 *
 * Le paquet garde ainsi zéro dépendance runtime : un `npx` télécharge un seul
 * artefact autonome, sans arbre à résoudre. C'est la démarche de create-vite,
 * qui déclare lui aussi `dependencies: {}` tout en utilisant clack.
 *
 * Sans ce bundle, les mêmes prompts coûteraient cinq paquets et 199 Ko
 * supplémentaires à chaque invocation.
 */
import { build } from "esbuild";
import { chmodSync } from "node:fs";

const outfile = "dist/create-maedow-arch-app.mjs";

await build({
  entryPoints: ["bin/create-maedow-arch-app.mjs"],
  outfile,
  bundle: true,
  platform: "node",
  target: "node18",
  format: "esm",
  // Pas de banner : esbuild conserve déjà le shebang du fichier d'entrée, et
  // en ajouter un second produit un fichier que Node refuse de charger.
  legalComments: "none",
});

// Le shebang ne suffit pas sous Unix : le fichier doit être exécutable.
chmodSync(outfile, 0o755);

console.log(`Bundle écrit dans ${outfile}`);
