#!/usr/bin/env node
import { resolve } from "node:path";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { auditer } from "../src/audit.mjs";
import { compter, enJson, enTexte } from "../src/rapport.mjs";
import { lireTsconfig } from "../src/projet.mjs";

/**
 * `maedow-arch check` : auditer un projet existant, sans rien installer.
 *
 * L'autonomie n'est pas un confort, c'est la condition d'existence de cet
 * outil. Une commande qui exigerait d'installer la configuration ESLint, de
 * déclarer un résolveur et d'écrire un `eslint.config.mjs` ne serait jamais
 * lancée par l'équipe qui hésite encore à adopter le standard, c'est-à-dire par
 * la seule à qui elle s'adresse.
 *
 * Ce paquet n'a donc aucune dépendance, et l'audit lit les chemins d'import
 * sans compiler la cible. La limite est réelle et le rapport la dit : il
 * dénombre pour décider, il ne garantit pas. C'est `eslint-config-maedow-arch`
 * qui garantit, une fois la migration faite.
 */

const AIDE = `
Usage : maedow-arch check [chemin] [options]

  Audite un projet au regard du standard Maedow Arch. Ne modifie rien,
  n'installe rien, et n'a besoin ni des node_modules ni d'un projet qui compile.

Options
  --json              Sortie machine, pour l'intégration continue.
  --seuil <n>         Échoue au-delà de n violations. Sans seuil, la commande
                      réussit toujours : une équipe en migration a besoin de
                      mesurer sa progression, pas d'un pipeline rouge au premier
                      jour.
  --fix               Applique les corrections sûres, aujourd'hui les options
                      manquantes du tsconfig. Les déplacements de fichiers sont
                      proposés, jamais appliqués.
  -h, --help          Affiche cette aide.

Exemples
  npx maedow-arch check
  npx maedow-arch check ./apps/web --seuil 50
  npx maedow-arch check --json > audit.json

Le registre des règles : https://github.com/maedow-arch/maedow-arch-docs/blob/main/rules.md
`;

function echouer(message) {
  console.error(`\n❌ ${message}\n`);
  process.exit(1);
}

const argv = process.argv.slice(2);

if (argv.length === 0 || argv.includes("-h") || argv.includes("--help")) {
  console.log(AIDE);
  process.exit(0);
}

const commande = argv[0];
if (commande !== "check") {
  echouer(`Commande inconnue : « ${commande} ». Seule « check » existe aujourd'hui.`);
}

let chemin = ".";
let json = false;
let seuil = null;
let corriger = false;

for (let i = 1; i < argv.length; i += 1) {
  const arg = argv[i];
  if (arg === "--json") json = true;
  else if (arg === "--fix") corriger = true;
  else if (arg === "--seuil") {
    const valeur = Number(argv[++i]);
    if (!Number.isInteger(valeur) || valeur < 0) echouer("--seuil attend un entier positif.");
    seuil = valeur;
  } else if (arg.startsWith("--seuil=")) {
    const valeur = Number(arg.slice("--seuil=".length));
    if (!Number.isInteger(valeur) || valeur < 0) echouer("--seuil attend un entier positif.");
    seuil = valeur;
  } else if (arg.startsWith("-")) {
    echouer(`Option inconnue : ${arg}`);
  } else {
    chemin = arg;
  }
}

const racine = resolve(process.cwd(), chemin);
if (!existsSync(racine)) echouer(`Le dossier « ${chemin} » n'existe pas.`);

const resultat = auditer(racine);

/*
 * `--fix` ne touche qu'au tsconfig, et seulement pour y ajouter des options
 * manquantes. Rien n'est déplacé ni réécrit : un outil qui déplace du code sans
 * qu'on le lui demande ne se fait pardonner qu'une fois.
 */
if (corriger) {
  const applique = corrigerTsconfig(racine);
  if (!json) {
    console.log("");
    console.log(
      applique.length > 0
        ? `  ✅ tsconfig.json : ${applique.join(", ")} activé(s).`
        : "  Rien à corriger automatiquement. Les autres violations demandent une décision."
    );
  }
}

console.log(json ? enJson(resultat) : enTexte(resultat, { seuil }));

const total = compter(resultat.violations);
process.exit(seuil !== null && total > seuil ? 1 : 0);

/** Ajoute les options manquantes, en préservant le reste du fichier. */
function corrigerTsconfig(racineProjet) {
  const config = lireTsconfig(racineProjet);
  if (config === null) return [];

  const manquantes = ["strict", "noUncheckedIndexedAccess", "exactOptionalPropertyTypes"].filter(
    (nom) => config.compilerOptions?.[nom] !== true
  );
  if (manquantes.length === 0) return [];

  const chemin = resolve(racineProjet, "tsconfig.json");
  const brut = readFileSync(chemin, "utf-8");

  // On insère dans le bloc existant plutôt que de réécrire le fichier : les
  // commentaires d'un tsconfig portent souvent les raisons d'un réglage, et un
  // outil n'a pas à les effacer pour ajouter trois lignes.
  const ouverture = brut.indexOf('"compilerOptions"');
  const accolade = brut.indexOf("{", ouverture);
  if (ouverture === -1 || accolade === -1) return [];

  const ajout = manquantes.map((nom) => `\n    "${nom}": true,`).join("");
  writeFileSync(chemin, brut.slice(0, accolade + 1) + ajout + brut.slice(accolade + 1));

  return manquantes;
}
