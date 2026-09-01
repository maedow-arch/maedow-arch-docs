import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";

import { auditer } from "../src/audit.mjs";
import { classer, importAutorise, codePour } from "../src/couches.mjs";
import { lireAlias, lireTsconfig } from "../src/projet.mjs";
import { compter, enJson, enTexte } from "../src/rapport.mjs";

/**
 * Le test négatif de l'audit.
 *
 * Il suit le même principe que celui des frontières : une fixture volontairement
 * non conforme, et un compte de violations attendu par code. Sans lui, l'audit
 * pourrait cesser de détecter quoi que ce soit et rendre un rapport vide, qui
 * serait lu comme une bonne nouvelle. C'est le pire mode de défaillance possible
 * pour un outil de migration, et ce dépôt l'a rencontré quatre fois sous
 * d'autres formes.
 */

const ici = dirname(fileURLToPath(import.meta.url));
const nonConforme = join(ici, "fixtures", "projet-non-conforme");

/** Ce que la fixture contient, un cas par code du registre. */
const ATTENDU = {
  "TS-STRICT": 3,
  "MA-001": 2,
  "MA-002": 1,
  "MA-003": 1,
  "MA-004": 1,
  "MA-005": 1,
  "MA-006": 1,
  "MA-007": 1,
};

test("l'audit détecte exactement les violations de la fixture", () => {
  const resultat = auditer(nonConforme);

  for (const [code, attendu] of Object.entries(ATTENDU)) {
    const trouvees = resultat.violations[code] ?? [];
    assert.equal(
      trouvees.length,
      attendu,
      `${code} : ${trouvees.length} au lieu de ${attendu}. ` +
        trouvees.map((v) => `${v.fichier} ${v.detail ?? ""}`).join(" | ")
    );
  }
});

test("chaque violation désigne le bon fichier", () => {
  const { violations } = auditer(nonConforme);
  const fichierDe = (code) => violations[code].map((v) => v.fichier);

  assert.ok(fichierDe("MA-002").includes("src/features/panier/Ecran.tsx"));
  assert.ok(fichierDe("MA-003").includes("src/features/_shared/Bandeau.tsx"));
  assert.ok(fichierDe("MA-004").includes("src/core/facturation/Vue.tsx"));
  assert.deepEqual(fichierDe("MA-001").sort(), [
    "src/core/facturation/service.ts",
    "src/lib/format.ts",
  ]);
});

test("un fichier hors des couches est dénombré, jamais compté comme violation", () => {
  /*
   * La fixture porte `public/analytics.js` et `scripts/build.mjs`. Tous deux
   * ont un import qui remonte le flux et un `any`.
   *
   * Le second est celui qui fuyait. Les règles de frontière étaient déjà
   * conditionnées à la couche du fichier, mais MA-005, MA-006 et le graphe des
   * cycles s'appliquaient à tout ce que la liste d'exclusions n'avait pas
   * pensé à exclure : retirer la garde de `audit.mjs` fait remonter MA-005 de
   * un à trois et vide `horsCouche`, et ce test échoue alors deux fois.
   */
  const resultat = auditer(nonConforme);

  assert.deepEqual(
    resultat.horsCouche.sort(),
    ["public/analytics.js", "scripts/build.mjs"],
    "les deux fichiers doivent être vus, et rangés hors périmètre"
  );

  const parFichier = Object.values(resultat.violations)
    .flat()
    .map((v) => v.fichier);

  for (const hors of resultat.horsCouche) {
    assert.ok(
      !parFichier.includes(hors),
      `${hors} est hors couche et ne peut pas être une violation`
    );
  }
});

test("app/ peut tout importer, et n'est jamais en violation", () => {
  const { violations } = auditer(nonConforme);
  const tous = Object.values(violations).flat();

  assert.equal(
    tous.filter((v) => v.fichier.startsWith("src/app/")).length,
    0,
    "app/ importe une feature et lib/ dans la fixture : c'est autorisé"
  );
});

test("un cycle n'est signalé qu'une fois, et non depuis chacun de ses membres", () => {
  const { violations } = auditer(nonConforme);
  assert.equal(violations["MA-007"].length, 1);
  assert.match(violations["MA-007"][0].detail, /aller\.ts → .*retour\.ts/);
});

/* ------------------------------------------------------------------ *
 * La lecture du projet, là où un audit se trompe en silence
 * ------------------------------------------------------------------ */

test("le tsconfig se lit malgré les commentaires et un alias en @ étoile", () => {
  const config = lireTsconfig(nonConforme);

  assert.notEqual(config, null, "un tsconfig illisible ferait croire à un projet sans typage");
  assert.deepEqual(lireAlias(nonConforme), [{ prefixe: "@/", vers: "src/" }]);
});

test("un baseUrl est encore lu, même si TypeScript le déprécie", () => {
  // La fixture n'en porte plus : l'option est dépréciée depuis TypeScript 7 et
  // faisait apparaître un avertissement dans l'éditeur. Les projets audités en
  // ont pourtant encore, et un alias mal résolu vide le rapport de ses
  // violations, ce qui se lit comme une bonne nouvelle. Le support est donc
  // vérifié ici, sur un dossier temporaire.
  const dossier = mkdtempSync(join(tmpdir(), "maedow-baseurl-"));
  writeFileSync(
    join(dossier, "tsconfig.json"),
    JSON.stringify({ compilerOptions: { baseUrl: "./app", paths: { "~/*": ["./modules/*"] } } })
  );

  assert.deepEqual(lireAlias(dossier), [{ prefixe: "~/", vers: "app/modules/" }]);
  rmSync(dossier, { recursive: true, force: true });
});

test("sans les alias, l'audit ne verrait presque aucune violation", () => {
  // La fixture écrit ses imports en @/ : si les alias n'étaient pas résolus,
  // ils seraient pris pour des dépendances externes et ignorés. Le rapport
  // serait vide, et un rapport vide se lit comme une bonne nouvelle.
  const { violations } = auditer(nonConforme);
  const parAlias = violations["MA-001"].filter((v) => v.detail.includes("@/"));

  assert.ok(parAlias.length > 0, "au moins une violation doit passer par un alias");
});

/* ------------------------------------------------------------------ *
 * Le classement, qui commande tout le reste
 * ------------------------------------------------------------------ */

test("classer reconnaît les couches, et le partagé avant les features", () => {
  assert.deepEqual(classer("src/features/_shared/Carte.tsx"), {
    couche: "shared-feature",
    feature: null,
  });
  assert.deepEqual(classer("src/features/panier/Ecran.tsx"), {
    couche: "feature",
    feature: "panier",
  });
  assert.equal(classer("src/core/x/y.ts").couche, "core");
  assert.equal(classer("src/lib/x.ts").couche, "lib");
  assert.equal(classer("vite.config.ts"), null, "un fichier hors couche n'est pas une violation");
});

test("une feature s'importe elle-même, mais pas sa voisine", () => {
  const panier = { couche: "feature", feature: "panier" };
  const profil = { couche: "feature", feature: "profil" };

  assert.equal(importAutorise(panier, panier), true);
  assert.equal(importAutorise(panier, profil), false);
  assert.equal(codePour(panier, profil), "MA-002");
});

test("le flux descend et ne remonte jamais", () => {
  const core = { couche: "core", feature: null };
  const lib = { couche: "lib", feature: null };
  const feature = { couche: "feature", feature: "panier" };

  assert.equal(importAutorise(core, lib), true);
  assert.equal(importAutorise(lib, core), false);
  assert.equal(importAutorise(feature, core), true);
  assert.equal(importAutorise(core, feature), false);
});

/* ------------------------------------------------------------------ *
 * La sortie
 * ------------------------------------------------------------------ */

test("la sortie JSON porte l'ordre de migration et le détail par code", () => {
  const resultat = auditer(nonConforme);
  const json = JSON.parse(enJson(resultat));

  assert.equal(json.total, compter(resultat.violations));
  assert.equal(json.tsconfigTrouve, true);
  assert.equal(json.ordreDeMigration[0], "TS-STRICT", "le typage vient en premier");
  assert.ok(json.ordreDeMigration.indexOf("MA-001") < json.ordreDeMigration.indexOf("MA-002"));
  assert.ok(json.parCode["MA-002"].fichiers.length > 0);
  assert.equal(json.fichiersHorsCouches, 2, "le hors-périmètre se lit aussi en JSON");
});

/* ------------------------------------------------------------------ *
 * Ce que le rapport dit de ce qu'il n'a pas trouvé
 * ------------------------------------------------------------------ */

/** Un projet jetable, décrit par la liste de ses fichiers. */
function projetTemporaire(fichiers) {
  const dossier = mkdtempSync(join(tmpdir(), "maedow-rapport-"));
  for (const [chemin, contenu] of Object.entries(fichiers)) {
    const complet = join(dossier, chemin);
    mkdirSync(dirname(complet), { recursive: true });
    writeFileSync(complet, contenu);
  }
  return dossier;
}

test("sans tsconfig.json, TS-STRICT ne compte rien et le rapport le dit", () => {
  /*
   * Un fichier absent devenait un fichier vide, donc trois options
   * manquantes, donc trois violations en tête du plan de migration, sur un
   * chemin qui n'existe pas. Le défaut se voyait sur la racine de ce dépôt,
   * qui n'a ni tsconfig.json ni TypeScript.
   */
  const dossier = projetTemporaire({ "src/lib/util.js": "export const a = 1;" });
  const resultat = auditer(dossier);

  assert.equal(resultat.violations["TS-STRICT"].length, 0, "aucun fichier à juger");
  assert.equal(resultat.tsconfig, false);
  assert.equal(resultat.typescript, false);

  const texte = enTexte(resultat, { seuil: null });
  assert.match(texte, /aucun fichier TypeScript/);
  rmSync(dossier, { recursive: true, force: true });
});

test("du TypeScript sans tsconfig.json est signalé comme un problème en soi", () => {
  // L'autre moitié du cas : ici le silence de TS-STRICT n'est pas un
  // non-sujet, et le rapport ne doit pas le laisser passer pour tel.
  const dossier = projetTemporaire({
    "src/core/taux.ts": "export const taux = 0.2;",
  });
  const resultat = auditer(dossier);

  assert.equal(resultat.violations["TS-STRICT"].length, 0);
  assert.equal(resultat.typescript, true);

  const texte = enTexte(resultat, { seuil: null });
  assert.match(texte, /alors que ce projet contient du/);
  assert.equal(JSON.parse(enJson(resultat)).typescriptPresent, true);
  rmSync(dossier, { recursive: true, force: true });
});

test("un projet qui a des features ne s'entend pas dire qu'il n'en a pas", () => {
  /*
   * `classer` rend la couche `feature` au singulier, le rapport cherchait le
   * dossier `features` au pluriel, et la chaîne ne correspondait jamais.
   * L'avertissement s'affichait donc sur tous les projets, y compris juste
   * sous les violations MA-002 et MA-003 que ces règles venaient de trouver.
   */
  const texte = enTexte(auditer(nonConforme), { seuil: null });

  assert.ok(!texte.includes("n'a pas de features"), texte.slice(-400));
  assert.match(texte, /MA-002/, "et pourtant les frontières ont bien trouvé quelque chose");
});
