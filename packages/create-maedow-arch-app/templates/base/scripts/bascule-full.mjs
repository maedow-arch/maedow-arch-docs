import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

/**
 * Le passage du profil Light au profil Full.
 *
 * En Light, la couche domaine n'existe pas : le corpus dit que Light ne peuple
 * pas `core/`, il ne l'autorise pas différemment. Générer un domaine sur un tel
 * projet n'est donc pas une erreur à refuser, c'est le geste qui fait naître la
 * couche. La commande porte la bascule au lieu de buter dessus.
 *
 * Embarquer `result.ts` d'avance dans le template Light aurait contredit le
 * corpus, en peuplant `core/` sur un profil qui le laisse vide. Le créer au
 * moment où un domaine apparaît respecte les deux : Light reste sans domaine
 * tant qu'il n'en a pas, et le premier domaine amène ce dont il dépend.
 */

/*
 * Le Result Pattern, injecté au moment du scaffolding depuis
 * `templates/mode-full/src/core/common/result.ts`.
 *
 * Ce script vit dans le projet généré : il ne peut pas lire un fichier du
 * paquet qui l'a produit, d'où une copie. Mais elle n'est pas écrite à la
 * main. Elle l'a été, et les deux versions ont divergé deux fois en une seule
 * journée, dont une par le seul passage du formateur. Un doublon entretenu à
 * la main finit toujours par se désaccorder, et celui-ci se serait désaccordé
 * en silence : un projet basculé aurait reçu un Result d'une version
 * antérieure sans que rien ne le signale.
 */
const RESULT = __RESULT_TS__;

/**
 * Crée la couche domaine si elle manque.
 *
 * @returns `true` si le projet vient de basculer, `false` s'il était déjà en Full.
 */
export function assurerLaCoucheDomaine() {
  const commun = join("src", "core", "common");
  const result = join(commun, "result.ts");

  if (existsSync(result)) return false;

  mkdirSync(commun, { recursive: true });
  writeFileSync(result, RESULT);
  return true;
}
