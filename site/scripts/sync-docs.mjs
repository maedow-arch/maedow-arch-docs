#!/usr/bin/env node
/**
 * Dérive les pages du site depuis les documents de référence à la racine du dépôt.
 *
 * Les `.md` de la racine sont la SEULE source de vérité. Ce script les convertit
 * en `.mdx` pour Fumadocs : il retire le H1 de tête (Fumadocs affiche déjà le
 * titre du frontmatter) et injecte `title` / `description`.
 *
 * Il tourne en `predev` et `prebuild`, donc jamais de copie manuelle, et donc
 * plus de risque qu'une page du site soit tronquée ou reste sur une marque
 * périmée pendant que la source, elle, a évolué.
 *
 * `index.mdx` n'est pas généré : c'est la page d'accueil de la documentation,
 * pas le miroir d'un document. Elle est écrite à la main.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..", "..");
const outDir = join(here, "..", "content", "docs");

/** Un document de référence de la racine → une page du site. */
const PAGES = [
  {
    source: "architecture.md",
    out: "architecture.mdx",
    title: "Blueprint & 4 Couches",
    description:
      "Les 4 couches, le flux de dépendance, l'agnosticisme technique et les modes Light / Full de Maedow Arch.",
  },
  {
    source: "models.md",
    out: "models.mdx",
    title: "Modélisation & Séparation du JSX",
    description:
      "La règle « Zéro Modèle dans le JSX » et la typologie des 5 catégories de modèles de Maedow Arch.",
  },
  {
    source: "rules.md",
    out: "rules.mdx",
    title: "Registre des règles",
    description:
      "Les neuf règles normatives de Maedow Arch, leur code stable, et pour chacune si elle est vérifiée par la machine ou tenue par l'équipe.",
  },
  {
    source: "conventions.md",
    out: "conventions.mdx",
    title: "Conventions & Standards",
    description:
      "TypeScript strict, Result Pattern et ses helpers, sécurité et scaffolding dans Maedow Arch.",
  },
];

/** Échappe pour une valeur YAML entre guillemets doubles. */
const yamlString = (value) => `"${value.replaceAll('"', '\\"')}"`;

/** Retire le titre de niveau 1 en tête de document, et les lignes vides qui suivent. */
function stripLeadingH1(markdown) {
  const lines = markdown.split("\n");
  const firstContent = lines.findIndex((line) => line.trim() !== "");
  if (firstContent === -1 || !lines[firstContent].startsWith("# ")) return markdown;
  let cursor = firstContent + 1;
  while (cursor < lines.length && lines[cursor].trim() === "") cursor += 1;
  return lines.slice(cursor).join("\n");
}

mkdirSync(outDir, { recursive: true });

for (const page of PAGES) {
  const raw = readFileSync(join(repoRoot, page.source), "utf-8");
  const frontmatter = [
    "---",
    `title: ${yamlString(page.title)}`,
    `description: ${yamlString(page.description)}`,
    "---",
    "",
  ].join("\n");

  writeFileSync(join(outDir, page.out), `${frontmatter}${stripLeadingH1(raw)}`);
  console.log(`  ✓ ${page.source} → content/docs/${page.out}`);
}

console.log(`\n${PAGES.length} pages synchronisées depuis les documents de référence.`);
