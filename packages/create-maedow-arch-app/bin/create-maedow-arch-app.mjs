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
import { intro, outro, select, isCancel, cancel, log } from "@clack/prompts";
import { stdin, stdout } from "node:process";
import {
  MODES,
  TEMPLATES,
  STYLES,
  FRAMEWORKS,
  DEFAULT_MODE,
  DEFAULT_TEMPLATE,
  DEFAULT_STYLE,
  DEFAULT_FRAMEWORK,
  NOM_DE_PACKAGE,
  ErreurUsage,
  parseArgs,
  layersFor,
  buildPackageJson,
} from "./noyau.mjs";

const DOCS_URL = "https://github.com/maedow-arch/maedow-arch-docs";

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
    "Profils, voir « Mode Light vs Mode Full » dans architecture.md :",
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
    "Frameworks, voir « Maedow Arch hors Next.js » dans architecture.md :",
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

/** Une annulation par Ctrl+C doit s'arrêter proprement, sans dossier à moitié créé. */
function ensureNotCancelled(value) {
  if (isCancel(value)) {
    cancel("Création annulée.");
    process.exit(0);
  }
  return value;
}

async function ask(message, options, initialValue) {
  return ensureNotCancelled(await select({ message, options, initialValue }));
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

/**
 * Le package.json est assemblé depuis les fragments de chaque couche, plutôt
 * qu'écrit en autant d'exemplaires qu'il existe de combinaisons. Les
 * dépendances sont triées, comme le ferait npm.
 */

/* ------------------------------------------------------------------ *
 * Génération
 * ------------------------------------------------------------------ */

const TEXT_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json",
  ".md",
  ".css",
  ".html",
]);

function isTextFile(path) {
  const dot = path.lastIndexOf(".");
  return dot !== -1 && TEXT_EXTENSIONS.has(path.slice(dot));
}

/** Remplace le nom du projet partout, plutôt que dans une liste à tenir à jour. */
/**
 * Remplace les jetons du template par leur valeur, dans tout l'arbre généré.
 *
 * `__RESULT_TS__` mérite son explication : le script de bascule vit dans le
 * projet généré et ne peut donc pas lire un fichier du paquet qui l'a produit.
 * Il lui faut une copie du Result Pattern. Elle a d'abord été écrite à la main,
 * et les deux versions ont divergé deux fois en une seule journée, dont une par
 * le seul passage du formateur. La valeur est passée par `JSON.stringify`, ce
 * qui produit une chaîne JavaScript correctement échappée quel que soit le
 * contenu du fichier source.
 */
function substituteTokens(dir, tokens) {
  const noms = Object.keys(tokens);

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      substituteTokens(full, tokens);
    } else if (isTextFile(full)) {
      const original = readFileSync(full, "utf-8");
      if (noms.some((nom) => original.includes(nom))) {
        let substitue = original;
        for (const [nom, valeur] of Object.entries(tokens)) {
          substitue = substitue.replaceAll(nom, valeur);
        }
        writeFileSync(full, substitue);
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

let args;
try {
  args = parseArgs(process.argv.slice(2));
} catch (erreur) {
  if (!(erreur instanceof ErreurUsage)) throw erreur;
  fail(erreur.message, usage());
}

if (args.aide) {
  console.log(usage());
  process.exit(0);
}
let { projectName, mode, template, style, framework } = args;

if (!projectName) {
  fail("Il manque le nom du projet.", usage());
}

// Le nom finit dans un package.json : on refuse ce que npm refuserait.
if (!NOM_DE_PACKAGE.test(projectName)) {
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
  intro("Maedow Arch");

  if (framework === null) {
    framework = await ask(
      "Quel framework hôte ?",
      [
        { value: "next", label: "Next.js", hint: "App Router, routing par l'arborescence de app/" },
        { value: "vite", label: "React sur Vite", hint: "routes déclarées dans app/routes.tsx" },
      ],
      DEFAULT_FRAMEWORK
    );
  }

  if (mode === null) {
    mode = await ask(
      "Quel profil d'architecture ?",
      [
        { value: "full", label: "Full", hint: "les quatre couches, pour un produit qui dure" },
        {
          value: "light",
          label: "Light",
          hint: "sans couche core, pour un site vitrine ou un MVP",
        },
      ],
      DEFAULT_MODE
    );
  }

  if (template === null) {
    template = await ask(
      "Quel contenu de départ ?",
      [
        {
          value: "demo",
          label: "Démonstration",
          hint: "un compteur borné, décliné selon le profil",
        },
        { value: "blank", label: "Vierge", hint: "l'arborescence seule, sans exemple" },
      ],
      DEFAULT_TEMPLATE
    );
  }

  if (style === null) {
    style = await ask(
      "Quel style ?",
      [
        { value: "vanilla", label: "CSS natif", hint: "aucune dépendance de style" },
        { value: "tailwind", label: "Tailwind CSS 4", hint: "configuré et prêt à l'emploi" },
      ],
      DEFAULT_STYLE
    );
  }
}

mode = mode ?? DEFAULT_MODE;
template = template ?? DEFAULT_TEMPLATE;
style = style ?? DEFAULT_STYLE;
framework = framework ?? DEFAULT_FRAMEWORK;

const pm = detectPackageManager();
const cmd = COMMANDS[pm];

// En non interactif, aucune question n'a été posée : la session clack n'est
// pas ouverte, et la sortie flotterait hors du rail.
if (!isInteractive) intro("Maedow Arch");

log.info(`${projectName} : ${framework}, profil ${mode}, contenu ${template}, style ${style}`);

const layers = layersFor({ framework, mode, template, style }, templatesDir);

mkdirSync(targetDir, { recursive: true });
for (const layer of layers) {
  cpSync(join(templatesDir, layer), targetDir, { recursive: true, force: true });
}

// Le package.json est assemblé depuis les fragments des couches appliquées,
// plutôt qu'écrit en autant d'exemplaires qu'il existe de combinaisons.
writeFileSync(
  join(targetDir, "package.json"),
  `${JSON.stringify(buildPackageJson(layers, templatesDir), null, 2)}\n`
);
rmSync(join(targetDir, "package.fragment.json"), { force: true });

// npm exclut les fichiers nommés `.gitignore` des paquets publiés : le
// template le transporte sous le nom `_gitignore`.
const gitignoreSource = join(targetDir, "_gitignore");
if (existsSync(gitignoreSource)) {
  renameSync(gitignoreSource, join(targetDir, ".gitignore"));
}

substituteTokens(targetDir, {
  __PROJECT_NAME__: projectName,
  // Le contenu vient du template, jamais du projet généré : en profil Light,
  // le projet n'a pas encore de couche domaine à lire.
  __RESULT_TS__: JSON.stringify(
    readFileSync(join(templatesDir, "mode-full", "src", "core", "common", "result.ts"), "utf-8")
  ),
});
pruneGitkeeps(targetDir);

/* ------------------------------------------------------------------ *
 * Ce qu'on dit à l'utilisateur
 * ------------------------------------------------------------------ */

const steps = [`cd ${projectName}`, cmd.install, cmd.run("dev")];

log.success(`${countFiles(targetDir)} fichiers écrits dans ./${projectName}`);
log.step(["Démarrer :", ...steps.map((s) => `  ${s}`)].join("\n"));

if (template === "demo") {
  const where = mode === "full" ? "src/core/counter/" : "la feature";
  const suite =
    mode === "full"
      ? `  ${cmd.run("test")} lance les neuf tests du domaine, sans React ni DOM.`
      : "  Le README explique quand basculer vers le profil full.";
  log.step(
    [
      "La démonstration :",
      `  Un compteur borné, dont les règles vivent dans ${where}.`,
      suite,
    ].join("\n")
  );
}

log.step(
  [
    "Générateurs :",
    `  ${cmd.run("generate:feature")} <nom>   un écran dans src/features/`,
    `  ${cmd.run("generate:domain")} <nom>    ` +
      (mode === "full"
        ? "une entité métier dans src/core/"
        : "un domaine, début de bascule vers full"),
  ].join("\n")
);

log.step(
  [
    "Frontières :",
    `  ${cmd.run("lint")} vérifie que les features restent étanches.`,
    "  Pour vous assurer qu'elles sont actives, ajoutez un import interdit :",
    "  le lint doit échouer.",
  ].join("\n")
);

outro(DOCS_URL);
