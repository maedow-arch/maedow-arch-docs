/*
 * Le script de build du projet, hors couche au même titre que e2e/,
 * .storybook/ ou un fichier de configuration.
 *
 * Aucune liste d'exclusions ne peut prévoir tous ces dossiers. La liste
 * blanche, elle, n'a pas à les connaître.
 */
import { formater } from "@/lib/format";
import { total } from "@/core/facturation/service";

/** @returns {Promise<any>} le manifeste écrit sur le disque */
export async function construire() {
  return { resume: formater(total()) };
}
