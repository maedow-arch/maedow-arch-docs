import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { ErreurUsage, buildPackageJson, deepMerge, layersFor, parseArgs } from "../bin/noyau.mjs";
import { versPascal } from "../templates/base/scripts/nom.mjs";

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

test("le script de bascule ne porte aucune copie du Result", () => {
  const script = readFileSync(join(templatesDir, "base", "scripts", "bascule-full.mjs"), "utf-8");

  assert.match(
    script,
    /const RESULT = __RESULT_TS__;/,
    "le contenu doit être injecté au scaffolding, pas écrit dans le script"
  );
  assert.ok(
    !script.includes("export type Result<"),
    "une copie écrite à la main finirait par diverger de sa source, en silence"
  );
});

test("la source injectée existe, et porte les helpers documentés", () => {
  const source = readFileSync(
    join(templatesDir, "mode-full", "src", "core", "common", "result.ts"),
    "utf-8"
  );

  for (const helper of ["unwrapOr", "mapResult", "match", "andThen", "all"]) {
    assert.ok(
      source.includes(`export function ${helper}`) ||
        source.includes(`export async function ${helper}`),
      `${helper} manque au Result livré`
    );
  }
});

/* ------------------------------------------------------------------ *
 * Les écarts de matrice, la classe entière plutôt qu'un cas
 * ------------------------------------------------------------------ */

/*
 * Deux défauts remontés par le projet ABBA, R-005 et R-010, avaient la même
 * forme : plusieurs chemins mènent à un projet, et ils divergent sur un
 * fichier que personne ne pense à vérifier. Trois cases sur quatre étaient
 * correctes, et la quatrième livrait Tailwind sans jamais l'appliquer.
 *
 * Vérifier chaque chemin isolément ne les aurait pas attrapés. Les comparer
 * entre eux, si : c'est ce que font les deux tests ci-dessous.
 */

test("tout point d'entrée de framework importe la feuille de style", () => {
  const entrees = [
    ["framework-next", join("src", "app", "layout.tsx")],
    ["framework-vite", join("src", "app", "main.tsx")],
    ["demo-app-next", join("src", "app", "layout.tsx")],
  ];

  for (const [couche, fichier] of entrees) {
    const chemin = join(templatesDir, couche, fichier);
    if (!existsSync(chemin)) continue;
    const source = readFileSync(chemin, "utf-8");
    assert.ok(
      source.includes("globals.css"),
      `${couche} n'importe pas globals.css : Tailwind serait installé, configuré, ` +
        `et sans effet, sans que lint, typecheck, build ni audit ne le signalent`
    );
  }
});

test("les deux chemins vers Full livrent les mêmes fichiers de domaine", () => {
  const commun = join(templatesDir, "mode-full", "src", "core", "common");
  const attendus = ["result.ts", "result.test.ts"];

  for (const fichier of attendus) {
    assert.ok(existsSync(join(commun, fichier)), `${fichier} manque au template mode-full`);
  }

  // La bascule vit dans le projet généré et ne peut pas lire le paquet qui l'a
  // produit : elle reçoit chaque fichier par un jeton substitué au scaffolding.
  // Un fichier sans jeton est un fichier que ce chemin ne livrera jamais.
  const script = readFileSync(join(templatesDir, "base", "scripts", "bascule-full.mjs"), "utf-8");
  const jetons = {
    "result.ts": "__RESULT_TS__",
    "result.test.ts": "__RESULT_TEST_TS__",
  };

  for (const fichier of attendus) {
    assert.ok(
      script.includes(jetons[fichier]),
      `la bascule ne livre pas ${fichier} : un projet arrivé en Full par ce chemin ` +
        `n'aurait pas ce qu'un projet généré directement en Full obtient`
    );
    assert.ok(script.includes(fichier), `la bascule n'écrit pas ${fichier} sur le disque`);
  }
});

/* ------------------------------------------------------------------ *
 * Ce que le scaffold épingle, face à ce que le registre publie
 * ------------------------------------------------------------------ */

test("le fragment épingle une plage qui couvre la config publiée", () => {
  /*
   * Le défaut que ce test ferme : la configuration est passée en 0.4.0 en
   * remplaçant `eslint-plugin-import` par `import-x`, et le fragment est resté
   * en `^0.3.0`. Or `^0.3.0` exclut la 0.4.0 : un projet généré recevait la
   * 0.3.1, qui importe l'ancien plugin, pendant que le fragment installait le
   * nouveau. L'entrée stricte ne se chargeait plus, donc MA-005, MA-006 et
   * MA-007 disparaissaient, et rien ne le signalait puisque la configuration
   * générée ne charge que l'entrée par défaut.
   *
   * La matrice d'intégration ne pouvait pas l'attraper : elle substitue un
   * tarball local par un chemin `file:`, donc elle éprouve toujours la version
   * du dépôt et jamais celle que npm résoudrait.
   *
   * Ce test compare les deux sources de vérité du dépôt, sans réseau.
   */
  const fragment = JSON.parse(
    readFileSync(join(templatesDir, "base", "package.fragment.json"), "utf-8")
  );
  const plage = fragment.devDependencies["eslint-config-maedow-arch"];
  const version = JSON.parse(
    readFileSync(
      join(templatesDir, "..", "..", "eslint-config-maedow-arch", "package.json"),
      "utf-8"
    )
  ).version;

  // En 0.x, `^` ne franchit pas la mineure : `^0.3.0` couvre 0.3.x, pas 0.4.0.
  const [majeurePlage, mineurePlage] = plage.replace(/^[^\d]*/, "").split(".");
  const [majeureVersion, mineureVersion] = version.split(".");

  assert.equal(
    `${majeurePlage}.${mineurePlage}`,
    `${majeureVersion}.${mineureVersion}`,
    `le fragment épingle ${plage}, or la configuration du dépôt est en ${version} : ` +
      `un projet généré recevrait une version antérieure, avec les dépendances de la nouvelle`
  );
});

test("la configuration générée en Full charge les deux entrées", () => {
  /*
   * Le troisième défaut de la même famille, remonté par un projet réel.
   *
   * R-003 portait sur la version épinglée, F-022 sur une plage qui ne franchit
   * pas la mineure en 0.x, celui-ci sur le fragment de configuration. Trois
   * causes, un seul symptôme : un projet généré selon la documentation obtient
   * un socle sans MA-005, MA-006 ni MA-007, et le lint reste vert.
   *
   * La distinction que le projet ABBA a mesurée vaut d'être retenue : une
   * entrée importée dont le plugin manque lève et arrête tout le lint, ce qui
   * est bruyant donc sans danger. Une entrée jamais importée ne lève rien.
   * C'est le second cas que produisait le fragment, et c'est le mauvais.
   */
  const full = readFileSync(join(templatesDir, "mode-full", "eslint.config.mjs"), "utf-8");

  assert.match(
    full,
    /from "eslint-config-maedow-arch\/strict"/,
    "le mode Full doit charger l'entrée stricte : sans elle, trois des neuf " +
      "règles disparaissent sans que rien ne le signale"
  );
  assert.match(
    full,
    /\.\.\.maedowArchConfig,[\s\S]*\.\.\.maedowArchStrict,/,
    "l'entrée stricte vient après la défaut : c'est la composition que le " +
      "corpus prescrit et la seule que le banc du paquet éprouve"
  );
});

test("le profil Light dit pourquoi il n'a pas l'entrée stricte", () => {
  // Une absence expliquée est un choix ; une absence muette est un oubli, et
  // rien ne les distingue dans un fichier généré.
  const base = readFileSync(join(templatesDir, "base", "eslint.config.mjs"), "utf-8");

  assert.ok(
    base.includes("strict"),
    "le fichier de Light doit nommer l'entrée stricte et dire pourquoi elle " +
      "n'est pas chargée, plutôt que de la passer sous silence"
  );
});
