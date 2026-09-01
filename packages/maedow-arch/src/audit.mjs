import { classer, codePour, importAutorise } from "./couches.mjs";
import {
  extraireImports,
  lireAlias,
  lireFichier,
  lireTsconfig,
  listerFichiers,
  resoudre,
} from "./projet.mjs";

/**
 * L'audit : applique le registre des règles à un projet existant.
 *
 * Aucune détection n'est inventée ici. Chaque contrôle porte un code de
 * `rules.md`, et si une règle manque, elle passe par le registre avant de
 * passer par cet outil.
 *
 * Trois règles du registre sont hors de portée d'une analyse sans compilation,
 * et l'audit le dit plutôt que de faire semblant : MA-008 et MA-009 sont tenues
 * par l'équipe, et le repérage d'un secret ou d'un adaptateur mal nommé
 * produirait surtout du bruit.
 */

/** L'ordre de migration. Il n'est pas décoratif : voir `ORDRE` plus bas. */
export const CODES = [
  "MA-001",
  "MA-002",
  "MA-003",
  "MA-004",
  "MA-005",
  "MA-006",
  "MA-007",
  "TS-STRICT",
];

/**
 * Ce que corriger chaque code débloque.
 *
 * L'ordre place en tête ce qui rend le reste possible. Une équipe qui découvre
 * deux cents violations a besoin de savoir par quoi commencer, pas d'un compte.
 */
export const ORDRE = [
  {
    code: "TS-STRICT",
    titre: "Activer le typage strict",
    debloque:
      "Sans strict, les couches basses ne peuvent pas garantir ce qu'elles annoncent, et les corrections suivantes reposeraient sur des types qui mentent.",
  },
  {
    code: "MA-004",
    titre: "Sortir l'interface de core/",
    debloque:
      "Un domaine sans JSX devient testable sans DOM, ce qui rend vérifiables toutes les règles métier que vous corrigerez ensuite.",
  },
  {
    code: "MA-001",
    titre: "Rétablir le sens du flux",
    debloque:
      "C'est la règle dont dépendent les deux suivantes : tant que le flux remonte, séparer les features n'a pas d'effet durable.",
  },
  {
    code: "MA-002",
    titre: "Découpler les features entre elles",
    debloque:
      "Chaque feature devient supprimable et déplaçable seule, ce qui est la condition pour travailler à plusieurs sans se marcher dessus.",
  },
  {
    code: "MA-003",
    titre: "Rendre le partagé réellement transverse",
    debloque:
      "features/_shared cesse d'être un fourre-tout, et les composants qu'il contient deviennent réutilisables ailleurs.",
  },
  {
    code: "MA-007",
    titre: "Défaire les cycles d'import",
    debloque:
      "Deux modules qui s'importent mutuellement ne peuvent être ni testés ni déplacés séparément : c'est ce qui bloque le découpage.",
  },
  {
    code: "MA-005",
    titre: "Remplacer les any",
    debloque: "Chaque any retiré rend réelle une garantie que le typage promettait déjà.",
  },
  {
    code: "MA-006",
    titre: "Retirer les doubles assertions",
    debloque:
      "Elles masquent des frontières où une validation manque : les corriger fait apparaître les entrées non validées.",
  },
];

/** Les options de tsconfig que le standard exige, et pourquoi. */
const OPTIONS_STRICT = [
  { nom: "strict", raison: "le socle : sans lui, les autres options ne servent à rien" },
  { nom: "noUncheckedIndexedAccess", raison: "un accès par index peut ne rien rendre" },
  { nom: "exactOptionalPropertyTypes", raison: "une clé absente n'est pas une clé indéfinie" },
];

function detecterJsx(contenu) {
  // Une balise ouvrante suivie d'un nom, ou un fragment. On écarte les
  // génériques TypeScript, qui commencent par une majuscule suivie de `>`.
  return /<[A-Za-z][\w.]*(\s[^<>]*)?\/?>/.test(contenu) || /<>\s*$/m.test(contenu);
}

export function auditer(racine) {
  const fichiers = listerFichiers(racine);
  const alias = lireAlias(racine);
  const tsconfig = lireTsconfig(racine);

  const violations = Object.fromEntries(CODES.map((code) => [code, []]));
  const graphe = new Map();
  let classes = 0;

  for (const fichier of fichiers) {
    const contenu = lireFichier(racine, fichier);
    const source = classer(fichier);
    if (source !== null) classes += 1;

    /* --- MA-004 : ni JSX ni dépendance d'interface dans core/ ------------- */
    if (source?.couche === "core" && detecterJsx(contenu)) {
      violations["MA-004"].push({ fichier, detail: "contient du JSX" });
    }

    /* --- MA-005 et MA-006 : la discipline de typage ----------------------- */
    const lignes = contenu.split("\n");
    lignes.forEach((ligne, index) => {
      if (/\bas\s+unknown\s+as\b/.test(ligne)) {
        violations["MA-006"].push({ fichier, ligne: index + 1, detail: ligne.trim().slice(0, 70) });
      } else if (/(:\s*any\b|\bas\s+any\b|<any>)/.test(ligne)) {
        violations["MA-005"].push({ fichier, ligne: index + 1, detail: ligne.trim().slice(0, 70) });
      }
    });

    /* --- MA-001 à MA-003 : le flux de dépendance -------------------------- */
    const cibles = [];
    for (const specificateur of extraireImports(contenu)) {
      const cible = resoudre(specificateur, fichier, racine, alias);
      if (cible === null || cible.startsWith("..")) continue;
      cibles.push(cible);

      const destination = classer(cible);
      if (source === null || destination === null) continue;
      if (importAutorise(source, destination)) continue;

      violations[codePour(source, destination)].push({
        fichier,
        detail: `importe ${specificateur} (${source.couche} vers ${destination.couche})`,
      });
    }
    graphe.set(fichier, cibles);
  }

  /* --- MA-007 : les cycles d'import --------------------------------------- */
  for (const cycle of trouverCycles(graphe)) {
    violations["MA-007"].push({ fichier: cycle[0], detail: `cycle : ${cycle.join(" → ")}` });
  }

  /* --- TS-STRICT : ce que le tsconfig promet ------------------------------ */
  const options = tsconfig?.compilerOptions ?? {};
  for (const { nom, raison } of OPTIONS_STRICT) {
    if (options[nom] !== true) {
      violations["TS-STRICT"].push({
        fichier: "tsconfig.json",
        detail: `${nom} absent ou faux, ${raison}`,
      });
    }
  }

  /*
   * Quelles couches le projet possède réellement.
   *
   * Sans cette information, un projet qui n'a ni features/ ni core/ reçoit un
   * rapport sans aucune violation de frontière, et le lit comme une bonne
   * nouvelle. Or les règles n'ont rien vérifié : il n'y avait rien à vérifier.
   * Constaté au premier essai sur un projet réel, qui rangeait tout dans app/.
   */
  const couches = new Set();
  for (const fichier of fichiers) {
    const place = classer(fichier);
    if (place !== null) couches.add(place.couche);
  }

  return {
    racine,
    fichiers: fichiers.length,
    classes,
    couches: [...couches].sort(),
    violations,
    tsconfig: tsconfig !== null,
  };
}

/**
 * Les cycles du graphe d'imports.
 *
 * Un parcours en profondeur avec une pile. On ne rend qu'un représentant par
 * cycle : les signaler tous depuis chacun de leurs membres produirait un
 * rapport où le même problème apparaît quatre fois.
 */
function trouverCycles(graphe) {
  const etat = new Map();
  const cycles = [];
  const vus = new Set();

  const normaliser = (chemin) => chemin.replace(/\.(ts|tsx|js|jsx|mts|cts|mjs|cjs)$/, "");
  const index = new Map();
  for (const fichier of graphe.keys()) index.set(normaliser(fichier), fichier);

  const visiter = (noeud, pile) => {
    etat.set(noeud, "en cours");
    pile.push(noeud);

    for (const brut of graphe.get(noeud) ?? []) {
      const voisin = index.get(normaliser(brut)) ?? index.get(normaliser(brut + "/index"));
      if (voisin === undefined) continue;

      if (etat.get(voisin) === "en cours") {
        const depart = pile.indexOf(voisin);
        const cycle = pile.slice(depart);
        const signature = [...cycle].sort().join("|");
        if (!vus.has(signature)) {
          vus.add(signature);
          cycles.push(cycle);
        }
      } else if (!etat.has(voisin)) {
        visiter(voisin, pile);
      }
    }

    pile.pop();
    etat.set(noeud, "fini");
  };

  for (const fichier of graphe.keys()) {
    if (!etat.has(fichier)) visiter(fichier, []);
  }

  return cycles;
}
