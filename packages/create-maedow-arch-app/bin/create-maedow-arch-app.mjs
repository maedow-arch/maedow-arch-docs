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
} from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

const DOCS_URL = "https://github.com/maedow-arch/maedow-arch-docs";

const MODES = ["full", "light"];
const TEMPLATES = ["demo", "blank"];
const STYLES = ["vanilla", "tailwind"];
const FRAMEWORKS = ["next", "vite"];
const DEFAULT_MODE = "full";
const DEFAULT_TEMPLATE = "demo";
const DEFAULT_STYLE = "vanilla";
const DEFAULT_FRAMEWORK = "next";

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
  npm: { install: "npm install", run: (s) => `npm run ${s}` },
  pnpm: { install: "pnpm install", run: (s) => `pnpm ${s}` },
  yarn: { install: "yarn", run: (s) => `yarn ${s}` },
  bun: { install: "bun install", run: (s) => `bun run ${s}` },
};

/* ------------------------------------------------------------------ *
 * Arguments
 * ------------------------------------------------------------------ */

function parseArgs(argv) {
  const positional = [];
  let mode = null;
  let template = null;
  let style = null;
  let framework = null;

  const take = (value, name) => {
    if (value === undefined) fail(`L'option ${name} attend une valeur.`, usage());
    return value;
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--mode" || arg === "-m") {
      mode = take(argv[++i], "--mode");
    } else if (arg.startsWith("--mode=")) {
      mode = arg.slice("--mode=".length);
    } else if (arg === "--template" || arg === "-t") {
      template = take(argv[++i], "--template");
    } else if (arg.startsWith("--template=")) {
      template = arg.slice("--template=".length);
    } else if (arg === "--css" || arg === "-c") {
      style = take(argv[++i], "--css");
    } else if (arg.startsWith("--css=")) {
      style = arg.slice("--css=".length);
    } else if (arg === "--framework" || arg === "-f") {
      framework = take(argv[++i], "--framework");
    } else if (arg.startsWith("--framework=")) {
      framework = arg.slice("--framework=".length);
    } else if (arg === "--next") {
      framework = "next";
    } else if (arg === "--vite") {
      framework = "vite";
    } else if (arg === "--tailwind") {
      style = "tailwind";
    } else if (arg === "--vanilla") {
      style = "vanilla";
    } else if (arg === "--light") {
      mode = "light";
    } else if (arg === "--full") {
      mode = "full";
    } else if (arg === "--blank") {
      template = "blank";
    } else if (arg === "--demo") {
      template = "demo";
    } else if (arg === "--yes" || arg === "-y") {
      mode = mode ?? DEFAULT_MODE;
      template = template ?? DEFAULT_TEMPLATE;
      style = style ?? DEFAULT_STYLE;
      framework = framework ?? DEFAULT_FRAMEWORK;
    } else if (arg === "--help" || arg === "-h") {
      console.log(usage());
      process.exit(0);
    } else if (arg.startsWith("-")) {
      fail(`Option inconnue : ${arg}`, usage());
    } else {
      positional.push(arg);
    }
  }

  return { projectName: positional[0], mode, template, style, framework };
}

function usage() {
  return [
    "Usage : create-maedow-arch-app <nom-du-projet> [options]",
    "",
    "Options :",
    "  -m, --mode <full|light>       Profil d'architecture. Par défaut : full.",
    "  -t, --template <demo|blank>   Contenu de départ. Par défaut : demo.",
    "  -c, --css <vanilla|tailwind>  Style. Par défaut : vanilla.",
    "  -f, --framework <next|vite>   Framework hôte. Par défaut : next.",
    "  -y, --yes                     Accepte les valeurs par défaut, sans question.",
    "  -h, --help                    Affiche cette aide.",
    "",
    "Profils, voir architecture.md §9 :",
    "  full    Les quatre couches, app → features → core → lib.",
    "          Pour un produit qui dure : SaaS, application métier, cycle de vie long.",
    "  light   app et features, sans couche core séparée.",
    "          Pour un site vitrine, un prototype ou un MVP, quand la logique est faible.",
    "",
    "Contenus :",
    "  demo    Un compteur borné, décliné selon le profil choisi.",
    "  blank   L'arborescence et la configuration, sans code d'exemple.",
    "",
    "Styles :",
    "  vanilla   CSS natif, aucune dépendance de style.",
    "  tailwind  Tailwind CSS 4, configuré et prêt à l'emploi.",
    "",
    "Frameworks, voir architecture.md §10 :",
    "  next   Next.js App Router. Le routing suit l'arborescence de app/.",
    "  vite   React sur Vite, avec react-router. Les routes sont déclarées",
    "         dans app/routes.tsx. Seule la couche app/ diffère.",
  ].join("\n");
}

function fail(message, extra) {
  console.error(`\n❌ ${message}`);
  if (extra) console.error(`\n${extra}`);
  process.exit(1);
}

/* ------------------------------------------------------------------ *
 * Questions, uniquement quand un humain est là pour répondre
 * ------------------------------------------------------------------ */

/**
 * Sans cette vérification, la CLI resterait bloquée sur sa question dans une
 * intégration continue ou un script. Hors terminal, on prend les valeurs par
 * défaut sans rien demander.
 */
const isInteractive = stdin.isTTY && stdout.isTTY && !process.env.CI;

async function askChoice(rl, question, choices, fallback) {
  const lines = [`\n${question}`];
  choices.forEach((choice, index) => {
    const mark = choice.value === fallback ? " (défaut)" : "";
    lines.push(`  ${index + 1}. ${choice.label}${mark}`);
    lines.push(`     ${choice.hint}`);
  });
  console.log(lines.join("\n"));

  const answer = (await rl.question("> ")).trim().toLowerCase();
  if (answer === "") return fallback;

  const byIndex = choices[Number(answer) - 1];
  if (byIndex) return byIndex.value;

  const byName = choices.find((choice) => choice.value === answer);
  if (byName) return byName.value;

  console.log(`  Réponse non reconnue, on garde « ${fallback} ».`);
  return fallback;
}

/* ------------------------------------------------------------------ *
 * Composition des couches
 * ------------------------------------------------------------------ */

/**
 * Le projet se compose par couches successives, chacune écrasant la
 * précédente. Cela évite de dupliquer la configuration entre les variantes,
 * dont le nombre croît avec chaque axe.
 *
 * L'ordre compte : le framework pose la coquille, le mode ajoute ou retire la
 * couche domaine, le style habille, et la démonstration se pose par-dessus.
 */
function layersFor({ framework, mode, template, style }) {
  const layers = ["base", `framework-${framework}`, `mode-${mode}`, `css-${style}`];
  if (template === "demo") {
    layers.push("demo-shared", `demo-${style}`, `demo-${mode}`, `demo-app-${framework}`);
  }
  return layers.filter((layer) => existsSync(join(templatesDir, layer)));
}

/** Fusion en profondeur, la valeur de droite l'emportant sur celle de gauche. */
function deepMerge(target, source) {
  for (const [key, value] of Object.entries(source)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      target[key] = deepMerge(target[key] ?? {}, value);
    } else {
      target[key] = value;
    }
  }
  return target;
}

/**
 * Le package.json est assemblé depuis les fragments de chaque couche, plutôt
 * qu'écrit en autant d'exemplaires qu'il existe de combinaisons. Les
 * dépendances sont triées, comme le ferait npm.
 */
function buildPackageJson(layers) {
  let merged = {};
  for (const layer of layers) {
    const fragmentPath = join(templatesDir, layer, "package.fragment.json");
    if (existsSync(fragmentPath)) {
      merged = deepMerge(merged, JSON.parse(readFileSync(fragmentPath, "utf-8")));
    }
  }
  for (const field of ["dependencies", "devDependencies"]) {
    if (merged[field]) {
      merged[field] = Object.fromEntries(
        Object.entries(merged[field]).sort(([a], [b]) => a.localeCompare(b))
      );
    }
  }
  return merged;
}

/* ------------------------------------------------------------------ *
 * Génération
 * ------------------------------------------------------------------ */

const TEXT_EXTENSIONS = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json", ".md", ".css", ".html",
]);

function isTextFile(path) {
  const dot = path.lastIndexOf(".");
  return dot !== -1 && TEXT_EXTENSIONS.has(path.slice(dot));
}

/** Remplace le nom du projet partout, plutôt que dans une liste à tenir à jour. */
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

const args = parseArgs(process.argv.slice(2));
let { projectName, mode, template, style, framework } = args;

if (!projectName) {
  fail("Il manque le nom du projet.", usage());
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

if (mode !== null && !MODES.includes(mode)) {
  fail(`Profil inconnu : « ${mode} ». Choix possibles : ${MODES.join(", ")}.`, usage());
}
if (template !== null && !TEMPLATES.includes(template)) {
  fail(`Contenu inconnu : « ${template} ». Choix possibles : ${TEMPLATES.join(", ")}.`, usage());
}
if (style !== null && !STYLES.includes(style)) {
  fail(`Style inconnu : « ${style} ». Choix possibles : ${STYLES.join(", ")}.`, usage());
}
if (framework !== null && !FRAMEWORKS.includes(framework)) {
  fail(
    `Framework inconnu : « ${framework} ». Choix possibles : ${FRAMEWORKS.join(", ")}.`,
    usage()
  );
}

if ((mode === null || template === null || style === null || framework === null) && isInteractive) {
  const rl = createInterface({ input: stdin, output: stdout });
  try {
    if (mode === null) {
      mode = await askChoice(
        rl,
        "Quel profil d'architecture ?",
        [
          { value: "full", label: "Full", hint: "Les quatre couches. Pour un produit qui dure." },
          {
            value: "light",
            label: "Light",
            hint: "Sans couche core. Pour un site vitrine, un prototype, un MVP.",
          },
        ],
        DEFAULT_MODE
      );
    }
    if (template === null) {
      template = await askChoice(
        rl,
        "Quel contenu de départ ?",
        [
          {
            value: "demo",
            label: "Démonstration",
            hint: "Un compteur borné, décliné selon le profil choisi.",
          },
          { value: "blank", label: "Vierge", hint: "L'arborescence seule, sans exemple." },
        ],
        DEFAULT_TEMPLATE
      );
    }
    if (style === null) {
      style = await askChoice(
        rl,
        "Quel style ?",
        [
          { value: "vanilla", label: "CSS natif", hint: "Aucune dépendance de style." },
          { value: "tailwind", label: "Tailwind CSS 4", hint: "Configuré et prêt à l'emploi." },
        ],
        DEFAULT_STYLE
      );
    }
    if (framework === null) {
      framework = await askChoice(
        rl,
        "Quel framework hôte ?",
        [
          {
            value: "next",
            label: "Next.js App Router",
            hint: "Le routing suit l'arborescence de app/.",
          },
          {
            value: "vite",
            label: "React sur Vite",
            hint: "Les routes sont déclarées dans app/routes.tsx.",
          },
        ],
        DEFAULT_FRAMEWORK
      );
    }
  } finally {
    rl.close();
  }
}

mode = mode ?? DEFAULT_MODE;
template = template ?? DEFAULT_TEMPLATE;
style = style ?? DEFAULT_STYLE;
framework = framework ?? DEFAULT_FRAMEWORK;

const pm = detectPackageManager();
const cmd = COMMANDS[pm];

console.log(
  `\n📦 Création de « ${projectName} » : ${framework}, profil ${mode}, contenu ${template}, style ${style}.`
);

const layers = layersFor({ framework, mode, template, style });

mkdirSync(targetDir, { recursive: true });
for (const layer of layers) {
  cpSync(join(templatesDir, layer), targetDir, { recursive: true, force: true });
}

// Le package.json est assemblé depuis les fragments des couches appliquées,
// plutôt qu'écrit en autant d'exemplaires qu'il existe de combinaisons.
writeFileSync(
  join(targetDir, "package.json"),
  `${JSON.stringify(buildPackageJson(layers), null, 2)}\n`
);
rmSync(join(targetDir, "package.fragment.json"), { force: true });

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

console.log(`✅ ${countFiles(targetDir)} fichiers écrits dans ./${projectName}\n`);

console.log("Démarrer :");
console.log(`  cd ${projectName}`);
console.log(`  ${cmd.install}`);
console.log(`  ${cmd.run("dev")}\n`);

if (template === "demo" && mode === "full") {
  console.log("La démonstration :");
  console.log("  Un compteur borné, dont les règles vivent dans src/core/counter/");
  console.log("  et se testent sans monter le moindre composant.");
  console.log(`  ${cmd.run("test")}   lance ces tests\n`);
} else if (template === "demo") {
  console.log("La démonstration :");
  console.log("  Un compteur borné, dont les règles vivent dans la feature.");
  console.log("  Le README explique quand basculer vers le profil full.\n");
}

console.log("Générateurs :");
console.log(`  ${cmd.run("generate:feature")} <nom>   un écran dans src/features/`);
if (mode === "full") {
  console.log(`  ${cmd.run("generate:domain")} <nom>    une entité métier dans src/core/`);
} else {
  console.log(`  ${cmd.run("generate:domain")} <nom>    un domaine, début de bascule vers full`);
}
console.log("");

console.log("Frontières :");
console.log(`  ${cmd.run("lint")}   vérifie que les features restent étanches\n`);

console.log(`📖 ${DOCS_URL}\n`);
