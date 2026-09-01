import { readFileSync } from "node:fs";
import { join } from "node:path";
import { SITE_URL } from "@/lib/links";

/**
 * Le corpus entier, en texte brut, à une seule adresse.
 *
 * Un agent qui veut connaître ce standard n'a pas à parcourir six pages de
 * HTML : il lit ce fichier. C'est un canal d'adoption réel pour un standard
 * destiné à être appliqué par des développeurs qui travaillent avec des
 * assistants.
 *
 * La source est celle du site, `content/docs`, elle-même dérivée des `.md` de
 * la racine. Rien n'est recopié : ce fichier ne peut pas se périmer sans que la
 * documentation se périme avec lui.
 *
 * Les balises de composants sont retirées. `<ModeFull>` et `<ModeLight>`
 * marquent les profils de lecture et n'ont pas de sens hors du site ; laisser
 * les deux profils côte à côte est ici la bonne réponse, un lecteur qui
 * découvre le standard ayant besoin de voir ce que chacun contient.
 */
export const dynamic = "force-static";

const DOCUMENTS = [
  { fichier: "adoption.mdx", titre: "Adopter le standard sur un projet existant" },
  { fichier: "architecture.mdx", titre: "Architecture, les quatre couches et le flux" },
  { fichier: "models.mdx", titre: "Modélisation, zéro modèle dans le JSX" },
  { fichier: "conventions.mdx", titre: "Conventions, typage strict et Result Pattern" },
  { fichier: "rules.mdx", titre: "Registre des règles, MA-001 à MA-009" },
];

/** Retire le frontmatter et les balises de composants propres au site. */
function enTexte(brut: string): string {
  return brut
    .replace(/^---\n[\s\S]*?\n---\n/, "")
    .replace(/<\/?(ModeFull|ModeLight|Tabs|Tab|Steps|Step|Cards|Card)\b[^>]*>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function GET() {
  const racine = join(process.cwd(), "content", "docs");

  const entete = [
    "# Maedow Arch",
    "",
    "Standard d'architecture logicielle pour TypeScript, React et Next.js.",
    "Le domaine métier reste séparé de l'interface, l'infrastructure est",
    "interchangeable, et les frontières sont vérifiées par un linter plutôt que",
    "tenues par la mémoire de l'équipe.",
    "",
    `Documentation : ${SITE_URL}`,
    "Dépôt : https://github.com/maedow-arch/maedow-arch-docs",
    "",
    "Outillage :",
    "  npx create-maedow-arch-app mon-projet   génère un projet conforme",
    "  npx maedow-arch check                   audite un projet existant",
    "  eslint-config-maedow-arch               applique les frontières",
    "",
    "Ce fichier rassemble le corpus entier. Il est dérivé de la documentation,",
    "jamais recopié : il ne peut pas se périmer sans qu'elle se périme aussi.",
    "",
  ].join("\n");

  const corps = DOCUMENTS.map(({ fichier, titre }) => {
    let contenu: string;
    try {
      contenu = enTexte(readFileSync(join(racine, fichier), "utf-8"));
    } catch {
      // Un document manquant ne doit pas rendre la route indisponible : le
      // reste du corpus vaut mieux qu'une erreur.
      return `\n\n${"=".repeat(70)}\n# ${titre}\n${"=".repeat(70)}\n\n(document indisponible)`;
    }
    return `\n\n${"=".repeat(70)}\n# ${titre}\n${"=".repeat(70)}\n\n${contenu}`;
  }).join("");

  return new Response(entete + corps, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=0, must-revalidate",
    },
  });
}
