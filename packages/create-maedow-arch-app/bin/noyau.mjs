import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Le noyau de la CLI : ce qui décide, sans rien afficher ni quitter.
 *
 * La séparation vient du corpus qu'outille ce paquet. Une fonction qui appelle
 * `process.exit` ne se teste pas : elle emporte le processus de test avec elle.
 * Le noyau lève donc une erreur nommée, et la couche d'entrée la traduit en
 * message et en code de sortie. C'est le même partage que celui demandé aux
 * projets générés, entre `core/` qui calcule et `app/` qui présente.
 *
 * Vingt jobs d'intégration ne voyaient pas ce que douze assertions attrapent en
 * deux secondes : la matrice n'exerçait que des noms d'un seul mot et un seul
 * profil pour le générateur de domaine.
 */

export const MODES = ["full", "light"];
export const TEMPLATES = ["demo", "blank"];
export const STYLES = ["vanilla", "tailwind"];
export const FRAMEWORKS = ["next", "vite"];
export const DEFAULT_MODE = "full";
export const DEFAULT_TEMPLATE = "demo";
export const DEFAULT_STYLE = "vanilla";
export const DEFAULT_FRAMEWORK = "next";

/** Ce que npm accepte dans un nom de package, et donc ce que la CLI accepte. */
export const NOM_DE_PACKAGE = /^[a-z0-9][a-z0-9._-]*$/;

/** Une erreur d'usage, à présenter avec l'aide plutôt qu'à faire remonter brute. */
export class ErreurUsage extends Error {
  constructor(message) {
    super(message);
    this.name = "ErreurUsage";
  }
}

export function parseArgs(argv) {
  const positional = [];
  let mode = null;
  let template = null;
  let style = null;
  let framework = null;
  let aide = false;

  const take = (value, name) => {
    if (value === undefined) throw new ErreurUsage(`L'option ${name} attend une valeur.`);
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
      aide = true;
    } else if (arg.startsWith("-")) {
      throw new ErreurUsage(`Option inconnue : ${arg}`);
    } else {
      positional.push(arg);
    }
  }

  return { projectName: positional[0], mode, template, style, framework, aide };
}

/**
 * Les couches à empiler, dans l'ordre.
 *
 * L'ordre compte : le framework pose la coquille, le mode ajoute ou retire la
 * couche domaine, le style habille, et la démonstration se pose par-dessus.
 * Les couches absentes du disque sont écartées, ce qui évite d'entretenir des
 * dossiers vides pour des combinaisons dont le nombre croît avec chaque axe.
 */
export function layersFor({ framework, mode, template, style }, templatesDir) {
  const layers = ["base", `framework-${framework}`, `mode-${mode}`, `css-${style}`];
  if (template === "demo") {
    layers.push("demo-shared", `demo-${style}`, `demo-${mode}`, `demo-app-${framework}`);
  }
  return layers.filter((layer) => existsSync(join(templatesDir, layer)));
}

/** Fusion en profondeur, la valeur de droite l'emportant sur celle de gauche. */
export function deepMerge(target, source) {
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
export function buildPackageJson(layers, templatesDir) {
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
