import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * La version du standard, lue dans le CHANGELOG plutôt que recopiée.
 *
 * Un numéro écrit à la main dans un composant se périme au premier oubli, et
 * personne ne s'en aperçoit : rien ne casse, la page affiche simplement un
 * chiffre faux. La source est donc le premier titre de version du journal, qui
 * est déjà le document que toute modification du corpus doit traverser.
 *
 * Les entrées non publiées sont ignorées : le lecteur veut savoir quelle
 * version il lit, pas ce qui attend la prochaine.
 */
export function versionDuStandard(): string | null {
  try {
    const changelog = readFileSync(join(process.cwd(), "..", "CHANGELOG.md"), "utf-8");
    const trouve = changelog.match(/^## \[(\d+\.\d+\.\d+)\]/m);
    return trouve?.[1] ?? null;
  } catch {
    // Le site doit pouvoir se construire sans le dépôt complet autour de lui.
    return null;
  }
}
