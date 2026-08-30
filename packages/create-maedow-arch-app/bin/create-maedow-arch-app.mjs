#!/usr/bin/env node
import {
  cpSync,
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
} from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";

const DOCS_URL = "https://github.com/maedow-arch/maedow-arch-docs";
const TEMPLATES = ["demo", "blank"];
const DEFAULT_TEMPLATE = "demo";

const __dirname = dirname(fileURLToPath(import.meta.url));
const templatesDir = join(__dirname, "..", "templates");

/* ------------------------------------------------------------------ *
 * Gestionnaire de paquets
 * ------------------------------------------------------------------ */

/**
 * npm, pnpm, yarn et bun installent tous depuis le même registre : la CLI
 * fonctionne à l'identique sous `npx`, `pnpm dlx`, `yarn dlx` et `bunx`.
 * Seules les commandes à afficher ensuite diffèrent, d'où cette détection.
 */
function detectPackageManager() {
  const agent = process.env.npm_config_user_agent ?? "";
  if (agent.startsWith("pnpm")) return "pnpm";
  if (agent.startsWith("yarn")) return "yarn";
  if (agent.startsWith("bun")) return "bun";
  return "npm";
}

const COMMANDS = {
  npm: { install: "npm install", run: (script) => `npm run ${script}` },
  pnpm: { install: "pnpm install", run: (script) => `pnpm ${script}` },
  yarn: { install: "yarn", run: (script) => `yarn ${script}` },
  bun: { install: "bun install", run: (script) => `bun run ${script}` },
};

/* ------------------------------------------------------------------ *
 * Arguments
 * ------------------------------------------------------------------ */

function parseArgs(argv) {
  const positional = [];
  let template = DEFAULT_TEMPLATE;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--template" || arg === "-t") {
      template = argv[i + 1] ?? "";
      i += 1;
    } else if (arg.startsWith("--template=")) {
      template = arg.slice("--template=".length);
    } else if (arg === "--blank") {
      template = "blank";
    } else if (arg === "--demo") {
      template = "demo";
    } else if (arg.startsWith("-")) {
      fail(`Option inconnue : ${arg}`, usage());
    } else {
      positional.push(arg);
    }
  }

  return { projectName: positional[0], template };
}

function usage() {
  return [
    "Usage : create-maedow-arch-app <nom-du-projet> [options]",
    "",
    "Options :",
    "  -t, --template <demo|blank>   Contenu de départ. Par défaut : demo.",
    "      --blank                   Raccourci pour --template blank.",
    "      --demo                    Raccourci pour --template demo.",
    "",
    "  demo   Un compteur borné qui traverse les quatre couches, avec ses tests.",
    "  blank  L'arborescence et la configuration, sans code d'exemple.",
  ].join("\n");
}

function fail(message, extra) {
  console.error(`❌ ${message}`);
  if (extra) console.error(`\n${extra}`);
  process.exit(1);
}

/* ------------------------------------------------------------------ *
 * Génération
 * ------------------------------------------------------------------ */

const TEXT_EXTENSIONS = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json", ".md", ".css", ".template",
]);

function isTextFile(path) {
  const dot = path.lastIndexOf(".");
  return dot !== -1 && TEXT_EXTENSIONS.has(path.slice(dot));
}

/** Remplace le nom du projet partout, plutôt que dans une liste de fichiers à tenir à jour. */
function substituteProjectName(dir, projectName) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      substituteProjectName(full, projectName);
    } else if (isTextFile(full)) {
      const original = readFileSync(full, "utf-8");
      if (original.includes("__PROJECT_NAME__")) {
        writeFileSync(full, original.replaceAll("__PROJECT_NAME__", projectName));
      }
    }
  }
}

/** Un `.gitkeep` n'a de sens que dans un dossier resté vide. */
function pruneGitkeeps(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) pruneGitkeeps(join(dir, entry.name));
  }
  const entries = readdirSync(dir);
  if (entries.includes(".gitkeep") && entries.length > 1) {
    rmSync(join(dir, ".gitkeep"));
  }
}

function countFiles(dir) {
  let total = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules") continue;
    total += entry.isDirectory() ? countFiles(join(dir, entry.name)) : 1;
  }
  return total;
}

/* ------------------------------------------------------------------ *
 * Programme
 * ------------------------------------------------------------------ */

const { projectName, template } = parseArgs(process.argv.slice(2));

if (!projectName) {
  fail("Il manque le nom du projet.", usage());
}

if (!TEMPLATES.includes(template)) {
  fail(`Template inconnu : « ${template} ». Choix possibles : ${TEMPLATES.join(", ")}.`, usage());
}

// Le nom finit dans un package.json : on refuse ce que npm refuserait.
if (!/^[a-z0-9][a-z0-9._-]*$/.test(projectName)) {
  fail(
    `« ${projectName} » n'est pas un nom de package valide.\n` +
      "   Minuscules, chiffres, tirets, points et underscores, en commençant par une lettre ou un chiffre."
  );
}

const targetDir = join(process.cwd(), projectName);
if (existsSync(targetDir)) {
  fail(`Le dossier « ${projectName} » existe déjà.`);
}

const pm = detectPackageManager();
const cmd = COMMANDS[pm];

console.log(`\n📦 Création de « ${projectName} », template ${template}.`);

mkdirSync(targetDir, { recursive: true });

// `base` porte la configuration et l'arborescence. `demo` se superpose ensuite.
cpSync(join(templatesDir, "base"), targetDir, { recursive: true });
if (template === "demo") {
  cpSync(join(templatesDir, "demo"), targetDir, { recursive: true, force: true });
}

// package.json.template devient package.json.
const pkgTemplatePath = join(targetDir, "package.json.template");
writeFileSync(join(targetDir, "package.json"), readFileSync(pkgTemplatePath, "utf-8"));
rmSync(pkgTemplatePath);

// npm exclut les fichiers nommés `.gitignore` des paquets publiés : le
// template le transporte sous le nom `_gitignore`.
const gitignoreSource = join(targetDir, "_gitignore");
if (existsSync(gitignoreSource)) {
  renameSync(gitignoreSource, join(targetDir, ".gitignore"));
}

substituteProjectName(targetDir, projectName);
pruneGitkeeps(targetDir);

/* ------------------------------------------------------------------ *
 * Ce qu'on dit à l'utilisateur
 * ------------------------------------------------------------------ */

const fileCount = countFiles(targetDir);
console.log(`✅ ${fileCount} fichiers écrits dans ./${projectName}\n`);

console.log("Démarrer :");
console.log(`  cd ${projectName}`);
console.log(`  ${cmd.install}`);
console.log(`  ${cmd.run("dev")}\n`);

if (template === "demo") {
  console.log("La démonstration :");
  console.log("  Un compteur borné, dont les règles vivent dans src/core/counter/");
  console.log("  et se testent sans monter le moindre composant.");
  console.log(`  ${cmd.run("test")}   lance ces tests\n`);
}

console.log("Générateurs :");
console.log(`  ${cmd.run("generate:domain")} <nom>    une entité métier dans src/core/`);
console.log(`  ${cmd.run("generate:feature")} <nom>   un écran dans src/features/\n`);

console.log("Frontières :");
console.log(`  ${cmd.run("lint")}   vérifie le flux app → features → core → lib\n`);

console.log(`📖 ${DOCS_URL}\n`);
