/*
 * Un fichier déposé dans public/ par un outil, et versionné tel quel.
 *
 * Il porte de quoi déclencher deux règles : un import qui remonte le flux, et
 * un any. Hors couche, l'audit ne signale ni l'un ni l'autre. C'est exactement
 * ce que la liste d'exclusions ratait, faute de connaître public/.
 */
import { total } from "@/core/facturation/service";

/** @returns {Promise<any>} la réponse du collecteur */
export function pister(evenement) {
  return fetch("/collect", { method: "POST", body: JSON.stringify({ evenement, total }) });
}
