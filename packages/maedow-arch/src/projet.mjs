import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, relative, dirname, resolve } from "node:path";

/**
 * La lecture du projet audité : quels fichiers, et ce qu'ils importent.
 *
 * Tout se fait sans installer ni compiler la cible. Un audit qu'il faudrait
 * préparer ne serait jamais lancé, et surtout pas par l'équipe qui hésite
 * encore à adopter le standard.
 */

const EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".mts", ".cts", ".mjs", ".cjs"];

/** Ce qu'on ne lit jamais : ni les dépendances, ni les produits de build. */
const IGNORES = new Set([
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  "out",
  "coverage",
  ".turbo",
  ".vercel",
  ".cache",
]);

export function listerFichiers(racine) {
  const trouves = [];

  const parcourir = (dossier) => {
    let entrees;
    try {
      entrees = readdirSync(dossier, { withFileTypes: true });
    } catch {
      // Un dossier illisible ne doit pas interrompre l'audit : on le passe.
      return;
    }

    for (const entree of entrees) {
      if (entree.name.startsWith(".") && entree.name !== ".") continue;
      const complet = join(dossier, entree.name);

      if (entree.isDirectory()) {
        if (!IGNORES.has(entree.name)) parcourir(complet);
      } else if (EXTENSIONS.some((ext) => entree.name.endsWith(ext))) {
        trouves.push(relative(racine, complet).replaceAll("\\", "/"));
      }
    }
  };

  parcourir(racine);
  return trouves.sort();
}

/*
 * Les trois formes d'import qui nous intéressent, dans l'ordre où elles
 * apparaissent en pratique. On ne parse pas : une expression régulière suffit
 * pour un dénombrement, et elle a l'avantage de fonctionner sur du code qui ne
 * compile pas encore, ce qui est le cas d'un projet en cours de migration.
 *
 * La limite est assumée et dite dans le rapport : un import écrit dans un
 * commentaire serait compté. C'est un faux positif rare, et l'inverse, un
 * import manqué, serait bien plus grave pour un outil qui sert à décider.
 */
const IMPORTS = [
  /^\s*import\s+(?:type\s+)?[^;'"]*from\s*["']([^"']+)["']/gm,
  /^\s*export\s+(?:type\s+)?[^;'"]*from\s*["']([^"']+)["']/gm,
  /\brequire\s*\(\s*["']([^"']+)["']\s*\)/gm,
];

export function extraireImports(contenu) {
  const specificateurs = [];

  for (const motif of IMPORTS) {
    motif.lastIndex = 0;
    let trouve;
    while ((trouve = motif.exec(contenu)) !== null) {
      specificateurs.push(trouve[1]);
    }
  }

  return specificateurs;
}

/**
 * Résout un specificateur d'import en chemin du projet.
 *
 * @returns le chemin relatif à la racine, ou `null` si l'import sort du projet
 * (une dépendance npm, par exemple), auquel cas il ne concerne aucune règle de
 * frontière.
 */
export function resoudre(specificateur, fichier, racine, alias) {
  let cible;

  if (specificateur.startsWith(".")) {
    cible = resolve(dirname(join(racine, fichier)), specificateur);
  } else {
    const correspondance = alias.find(({ prefixe }) => specificateur.startsWith(prefixe));
    if (!correspondance) return null;
    cible = resolve(
      racine,
      correspondance.vers + specificateur.slice(correspondance.prefixe.length)
    );
  }

  return relative(racine, cible).replaceAll("\\", "/");
}

/**
 * Les alias de chemin déclarés dans le `tsconfig.json`.
 *
 * Sans eux, un projet qui écrit `@/features/...` verrait tous ses imports
 * classés comme externes, et l'audit rendrait zéro violation sur un projet qui
 * en compte des dizaines. C'est le mode de défaillance à éviter absolument :
 * un rapport vide est lu comme une bonne nouvelle.
 */
export function lireAlias(racine) {
  const config = lireTsconfig(racine);
  const chemins = config?.compilerOptions?.paths;
  if (!chemins) return [];

  const base = config.compilerOptions.baseUrl ?? ".";

  return Object.entries(chemins)
    .map(([motif, cibles]) => {
      const premiere = Array.isArray(cibles) ? cibles[0] : null;
      if (typeof premiere !== "string") return null;
      return {
        prefixe: motif.replace(/\*$/, ""),
        vers: join(base, premiere.replace(/\*$/, "")).replaceAll("\\", "/"),
      };
    })
    .filter((alias) => alias !== null)
    .sort((a, b) => b.prefixe.length - a.prefixe.length);
}

/**
 * Lit le `tsconfig.json`, en tolérant les commentaires et les virgules
 * traînantes que TypeScript accepte et que `JSON.parse` refuse.
 */
export function lireTsconfig(racine) {
  const chemin = join(racine, "tsconfig.json");
  if (!existsSync(chemin)) return null;

  try {
    return JSON.parse(sansCommentaires(readFileSync(chemin, "utf-8")));
  } catch {
    return null;
  }
}

/**
 * Retire les commentaires et les virgules traînantes que TypeScript accepte
 * dans un tsconfig et que `JSON.parse` refuse.
 *
 * Écrit caractère par caractère, et non par expression régulière. Une regex ne
 * sait pas qu'elle se trouve dans une chaîne : sur un vrai tsconfig, l'alias de
 * chemin `"@` suivi d'une barre et d'une étoile ouvre un faux commentaire de
 * bloc, refermé par le motif d'un autre alias, et tout ce qui se trouve entre
 * les deux disparaît silencieusement.
 *
 * Le défaut s'est produit au premier essai réel de cette commande, sur un
 * projet dont le `tsconfig.json` était pourtant conforme : l'audit annonçait
 * `strict` absent alors qu'il était présent. Un audit qui se trompe sur le
 * fichier le plus simple à lire ne mérite aucune confiance sur le reste.
 */
function sansCommentaires(source) {
  let sortie = "";
  let i = 0;

  while (i < source.length) {
    const c = source[i];

    if (c === '"') {
      // Une chaîne se recopie telle quelle, échappements compris.
      sortie += c;
      i += 1;
      while (i < source.length) {
        sortie += source[i];
        if (source[i] === "\\") {
          sortie += source[i + 1] ?? "";
          i += 2;
          continue;
        }
        if (source[i] === '"') {
          i += 1;
          break;
        }
        i += 1;
      }
      continue;
    }

    if (c === "/" && source[i + 1] === "/") {
      while (i < source.length && source[i] !== "\n") i += 1;
      continue;
    }

    if (c === "/" && source[i + 1] === "*") {
      i += 2;
      while (i < source.length && !(source[i] === "*" && source[i + 1] === "/")) i += 1;
      i += 2;
      continue;
    }

    sortie += c;
    i += 1;
  }

  return sortie.replace(/,(\s*[}\]])/g, "$1");
}

export function lireFichier(racine, fichier) {
  try {
    return readFileSync(join(racine, fichier), "utf-8");
  } catch {
    return "";
  }
}
