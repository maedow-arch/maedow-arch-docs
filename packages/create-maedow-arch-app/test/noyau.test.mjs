import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { ErreurUsage, buildPackageJson, deepMerge, layersFor, parseArgs } from "../bin/noyau.mjs";
import { versPascal } from "../templates/base/scripts/nom.mjs";
import { CONTENU_RESULT } from "../templates/base/scripts/bascule-full.mjs";

/**
 * Ce que la matrice d'intégration ne voit pas.
 *
 * Vingt jobs génèrent un projet complet, l'installent, le lintent et le
 * construisent. Ils n'exerçaient pourtant qu'un profil pour le générateur de
 * domaine et que des noms d'un seul mot : deux défauts produisant du TypeScript
 * invalide ont vécu là sans être vus.
 *
 * Ces assertions couvrent l'angle mort en deux secondes, sans dépendance
 * ajoutée. Le lanceur de test de Node suffit.
 */

const ici = dirname(fileURLToPath(import.meta.url));
const templatesDir = join(ici, "..", "templates");

/* ------------------------------------------------------------------ *
 * La pascalisation, à l'origine des deux défauts corrigés
 * ------------------------------------------------------------------ */

test("versPascal assemble les mots composés", () => {
  assert.equal(versPascal("user-profile"), "UserProfile");
  assert.equal(versPascal("order_item"), "OrderItem");
  assert.equal(versPascal("a.b.c"), "ABC");
});

test("versPascal laisse un mot simple intact", () => {
  assert.equal(versPascal("billing"), "Billing");
});

test("versPascal ignore les séparateurs en trop", () => {
  assert.equal(versPascal("user--profile"), "UserProfile");
  assert.equal(versPascal("-user-"), "User");
});

/* ------------------------------------------------------------------ *
 * L'analyse des arguments
 * ------------------------------------------------------------------ */

test("parseArgs lit les formes longue, courte et accolée", () => {
  assert.equal(parseArgs(["--mode", "light"]).mode, "light");
  assert.equal(parseArgs(["-m", "light"]).mode, "light");
  assert.equal(parseArgs(["--mode=light"]).mode, "light");
});

test("parseArgs comprend les raccourcis d'axe", () => {
  const args = parseArgs(["mon-projet", "--vite", "--tailwind", "--light", "--blank"]);
  assert.equal(args.projectName, "mon-projet");
  assert.equal(args.framework, "vite");
  assert.equal(args.style, "tailwind");
  assert.equal(args.mode, "light");
  assert.equal(args.template, "blank");
});

test("parseArgs laisse les axes non précisés à null, pour que la question soit posée", () => {
  const args = parseArgs(["mon-projet"]);
  assert.equal(args.mode, null);
  assert.equal(args.template, null);
  assert.equal(args.style, null);
  assert.equal(args.framework, null);
});

test("--yes remplit les axes restants sans écraser les choix explicites", () => {
  const args = parseArgs(["mon-projet", "--light", "--yes"]);
  assert.equal(args.mode, "light", "le choix explicite l'emporte sur le défaut");
  assert.equal(args.framework, "next");
  assert.equal(args.template, "demo");
  assert.equal(args.style, "vanilla");
});

test("parseArgs refuse une option inconnue et une valeur manquante", () => {
  assert.throws(() => parseArgs(["--inconnue"]), ErreurUsage);
  assert.throws(() => parseArgs(["--mode"]), ErreurUsage);
});

/* ------------------------------------------------------------------ *
 * L'empilement des couches
 * ------------------------------------------------------------------ */

test("layersFor pose la coquille, le profil et le style dans cet ordre", () => {
  const couches = layersFor(
    { framework: "next", mode: "full", template: "blank", style: "vanilla" },
    templatesDir
  );
  assert.deepEqual(couches.slice(0, 2), ["base", "framework-next"]);
  assert.ok(couches.includes("mode-full"));
  assert.ok(!couches.some((c) => c.startsWith("demo-")), "blank n'empile aucune démonstration");
});

test("layersFor ajoute les couches de démonstration en mode demo", () => {
  const couches = layersFor(
    { framework: "next", mode: "full", template: "demo", style: "tailwind" },
    templatesDir
  );
  assert.ok(couches.includes("demo-app-next"));
  assert.ok(couches.includes("demo-tailwind"));
});

test("layersFor écarte les couches absentes du disque", () => {
  const couches = layersFor(
    { framework: "next", mode: "full", template: "demo", style: "vanilla" },
    templatesDir
  );
  assert.ok(!couches.includes("css-inexistant"));
  assert.equal(new Set(couches).size, couches.length, "aucune couche en double");
});

/* ------------------------------------------------------------------ *
 * La fusion et l'assemblage du package.json
 * ------------------------------------------------------------------ */

test("deepMerge descend dans les objets et remplace les tableaux", () => {
  const cible = { a: { b: 1, c: 2 }, liste: [1, 2] };
  const fusion = deepMerge(cible, { a: { c: 3, d: 4 }, liste: [9] });
  assert.deepEqual(fusion.a, { b: 1, c: 3, d: 4 });
  assert.deepEqual(fusion.liste, [9], "un tableau est remplacé, jamais concaténé");
});

test("buildPackageJson trie les dépendances comme npm le ferait", () => {
  const couches = layersFor(
    { framework: "next", mode: "full", template: "demo", style: "tailwind" },
    templatesDir
  );
  const paquet = buildPackageJson(couches, templatesDir);

  for (const champ of ["dependencies", "devDependencies"]) {
    const noms = Object.keys(paquet[champ] ?? {});
    assert.deepEqual(
      noms,
      [...noms].sort((a, b) => a.localeCompare(b)),
      `${champ} est trié`
    );
  }
  assert.ok(paquet.scripts?.["generate:domain"], "les scripts de génération sont livrés");
});

/* ------------------------------------------------------------------ *
 * La bascule du profil Light vers Full
 * ------------------------------------------------------------------ */

test("le Result Pattern de la bascule est celui du template Full", () => {
  const duTemplate = readFileSync(
    join(templatesDir, "mode-full", "src", "core", "common", "result.ts"),
    "utf-8"
  );
  assert.equal(
    CONTENU_RESULT,
    duTemplate,
    "un projet basculé et un projet créé en Full ne peuvent pas avoir deux Result différents"
  );
});
