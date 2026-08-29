#!/usr/bin/env node
import { cpSync, readFileSync, writeFileSync, existsSync, mkdirSync, renameSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const DOCS_URL = "https://github.com/maedow-arch/maedow-arch-docs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const templateDir = join(__dirname, "..", "templates", "base");

const projectName = process.argv[2];
if (!projectName) {
  console.error("Usage: npx create-maedow-arch-app <nom-du-projet>");
  process.exit(1);
}

// Le nom finit dans un package.json : on refuse ce que npm refuserait.
if (!/^[a-z0-9][a-z0-9._-]*$/.test(projectName)) {
  console.error(
    `❌ "${projectName}" n'est pas un nom de package valide.\n` +
      "   Minuscules, chiffres, tirets, points et underscores ; commence par une lettre ou un chiffre."
  );
  process.exit(1);
}

const targetDir = join(process.cwd(), projectName);

if (existsSync(targetDir)) {
  console.error(`❌ Le dossier "${projectName}" existe déjà.`);
  process.exit(1);
}

console.log(`📦 Création du projet Maedow Arch "${projectName}"...`);

mkdirSync(targetDir, { recursive: true });
cpSync(templateDir, targetDir, { recursive: true });

// package.json.template -> package.json, avec le vrai nom du projet.
const pkgTemplatePath = join(targetDir, "package.json.template");
writeFileSync(
  join(targetDir, "package.json"),
  readFileSync(pkgTemplatePath, "utf-8").replaceAll("__PROJECT_NAME__", projectName)
);
rmSync(pkgTemplatePath);

// npm exclut les fichiers nommés `.gitignore` des packages publiés :
// le template le transporte sous le nom `_gitignore`.
const gitignoreSource = join(targetDir, "_gitignore");
if (existsSync(gitignoreSource)) {
  renameSync(gitignoreSource, join(targetDir, ".gitignore"));
}

// Le nom du projet apparaît aussi dans les fichiers de l'app.
for (const relativePath of ["src/app/layout.tsx", "src/app/page.tsx"]) {
  const filePath = join(targetDir, relativePath);
  if (existsSync(filePath)) {
    writeFileSync(
      filePath,
      readFileSync(filePath, "utf-8").replaceAll("__PROJECT_NAME__", projectName)
    );
  }
}

console.log(`✅ Projet créé dans ./${projectName}`);
console.log("");
console.log("Prochaines étapes :");
console.log(`  cd ${projectName}`);
console.log("  npm install");
console.log("  npm run dev");
console.log("");
console.log("Générateurs :");
console.log("  npm run generate:domain <mon-premier-domaine>   # une entité métier dans src/core/");
console.log("  npm run generate:feature <ma-premiere-feature>  # un écran dans src/features/");
console.log("");
console.log("  npm run lint   # vérifie les frontières architecturales");
console.log("");
console.log(`📖 Doc complète : ${DOCS_URL}`);
