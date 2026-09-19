import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { LARGEUR_LOGO, banniere, capacites, peindre, recapitulatif } from "../bin/banniere.mjs";

const ici = dirname(fileURLToPath(import.meta.url));
const templatesDir = join(ici, "..", "templates");

/** Un terminal qui sait tout afficher, pour partir d'un cas favorable. */
const TERMINAL = { isTTY: true, columns: 120 };
const ENV_MODERNE = { COLORTERM: "truecolor", TERM: "xterm-256color" };

const CODE_COULEUR = /\x1b\[/;

/* ------------------------------------------------------------------ *
 * Quand le logo s'efface
 * ------------------------------------------------------------------ */

test("un terminal moderne reçoit le logo et les couleurs vraies", () => {
  const cap = capacites({ env: ENV_MODERNE, flux: TERMINAL, plateforme: "linux" });
  assert.equal(cap.logo, true);
  assert.equal(cap.couleur, "vraie");
});

test("hors d'un terminal interactif, ni logo ni couleur", () => {
  // Une sortie redirigée vers un fichier garderait sinon des codes illisibles.
  const cap = capacites({
    env: ENV_MODERNE,
    flux: { isTTY: false, columns: 120 },
    plateforme: "linux",
  });
  assert.equal(cap.logo, false);
  assert.equal(cap.couleur, null);
});

test("en intégration continue, le logo s'efface", () => {
  const cap = capacites({
    env: { ...ENV_MODERNE, CI: "true" },
    flux: TERMINAL,
    plateforme: "linux",
  });
  assert.equal(cap.logo, false, "six lignes de blocs dans chaque journal de CI, pour rien");
});

test("NO_COLOR retire les couleurs sans retirer le logo", () => {
  const cap = capacites({
    env: { ...ENV_MODERNE, NO_COLOR: "1" },
    flux: TERMINAL,
    plateforme: "linux",
  });
  assert.equal(cap.couleur, null);
  assert.equal(cap.logo, true, "sa forme se lit encore sans couleur");
});

test("une fenêtre trop étroite ne reçoit pas un logo coupé en deux", () => {
  const etroit = { isTTY: true, columns: LARGEUR_LOGO };
  assert.equal(capacites({ env: ENV_MODERNE, flux: etroit, plateforme: "linux" }).logo, false);
});

test("l'ancienne console Windows ne reçoit pas des blocs qu'elle affiche mal", () => {
  // Sans Windows Terminal ni émulateur reconnu, les blocs deviendraient des
  // points d'interrogation : la même règle que clack pour ses symboles.
  const cap = capacites({ env: {}, flux: TERMINAL, plateforme: "win32" });
  assert.equal(cap.logo, false);
  assert.equal(
    capacites({ env: { WT_SESSION: "1" }, flux: TERMINAL, plateforme: "win32" }).logo,
    true
  );
});

test("sans les couleurs vraies, la palette de 256 teintes prend le relais", () => {
  const cap = capacites({ env: { TERM: "xterm-256color" }, flux: TERMINAL, plateforme: "linux" });
  assert.equal(cap.couleur, "palette");
  assert.match(peindre("x", "magenta", "palette"), /\x1b\[38;5;201m/);
});

/* ------------------------------------------------------------------ *
 * Ce que la bannière rend
 * ------------------------------------------------------------------ */

test("le logo tient dans la largeur annoncée", () => {
  const lignes = banniere({ version: "1.0.0", url: "u" }, { logo: true, couleur: null });
  const logo = lignes.filter((l) => l.includes("█") || l.includes("╚"));
  assert.equal(logo.length, 6);
  for (const ligne of logo) assert.ok(ligne.trimEnd().length <= LARGEUR_LOGO + 2);
});

test("sans couleur, la bannière ne contient aucun code de terminal", () => {
  const texte = banniere({ version: "1.0.0", url: "u" }, { logo: true, couleur: null }).join("\n");
  assert.doesNotMatch(texte, CODE_COULEUR);
});

test("sans logo, le nom et la version restent", () => {
  const texte = banniere({ version: "0.12.0", url: "u" }, { logo: false, couleur: null }).join(
    "\n"
  );
  assert.ok(!texte.includes("█"));
  assert.match(texte, /Maedow Arch {2}v0\.12\.0/);
});

/* ------------------------------------------------------------------ *
 * Le récapitulatif ne promet que ce qui a eu lieu
 * ------------------------------------------------------------------ */

test("le récapitulatif annonce ce que chaque profil charge réellement", () => {
  /*
   * Le test croise l'annonce et la livraison. Le récapitulatif dit « entrée
   * stricte comprise » en Full : le fichier livré en Full doit l'importer. Il
   * ne l'annonce pas en Light : le fichier de Light ne doit pas l'importer.
   *
   * Un écran de fin qui promettrait sept règles à un projet qui n'en charge que
   * quatre serait le défaut que ce dépôt a corrigé trois fois en une semaine,
   * reproduit dans l'outil même qui devait l'éviter.
   */
  const full = recapitulatif({ mode: "full", framework: "next", style: "css" });
  const light = recapitulatif({ mode: "light", framework: "next", style: "css" });
  const texte = (r) => r.map((e) => `${e.titre} ${e.detail ?? ""}`).join(" ");

  const configFull = readFileSync(join(templatesDir, "mode-full", "eslint.config.mjs"), "utf-8");
  const configLight = readFileSync(join(templatesDir, "base", "eslint.config.mjs"), "utf-8");
  const importeStrict = (source) =>
    source
      .split("\n")
      .some((l) => l.trim().startsWith("import") && l.includes("eslint-config-maedow-arch/strict"));

  assert.match(texte(full), /7 règles sur 9/);
  assert.ok(importeStrict(configFull), "le Full annonce l'entrée stricte, il doit la charger");

  assert.match(texte(light), /4 règles sur 9/);
  assert.doesNotMatch(texte(light), /7 règles/);
  assert.ok(!importeStrict(configLight), "le Light ne l'annonce pas, il ne doit pas la charger");
});

test("le récapitulatif ne promet une couche domaine qu'au profil qui la crée", () => {
  const full = recapitulatif({ mode: "full", framework: "vite", style: "tailwind" });
  const light = recapitulatif({ mode: "light", framework: "vite", style: "tailwind" });
  const couches = (r) => r.map((e) => e.detail ?? "").join(" ");

  assert.match(couches(full), /core\//);
  assert.doesNotMatch(couches(light), /core\//);
});
