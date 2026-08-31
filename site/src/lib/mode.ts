/**
 * Le profil de lecture : Maedow Arch Light ou Full.
 *
 * Le choix ne vit pas dans un état React mais dans un attribut posé sur
 * `<html>`, et le masquage se fait en CSS. Trois raisons à ce choix :
 *
 * 1. aucun scintillement au chargement, l'attribut est posé par un script
 *    d'amorçage avant le premier rendu ;
 * 2. aucune re-génération d'arbre React quand le lecteur bascule, donc aucune
 *    perte de la position de lecture ;
 * 3. le contenu des deux profils reste dans le HTML, donc indexable par le
 *    moteur de recherche du site, qui n'a pas à connaître le mode.
 */
export type Mode = "light" | "full";

export const MODE_ATTRIBUTE = "data-maedow-mode";
export const MODE_STORAGE_KEY = "maedow-mode";
export const DEFAULT_MODE: Mode = "full";

/**
 * Script d'amorçage, injecté tel quel dans le document. Il tourne avant la
 * peinture : sans lui, une page ouverte en Light afficherait brièvement les
 * sections Full avant de les retirer.
 *
 * `localStorage` lève en navigation privée sur certains navigateurs, et quand
 * les données de site sont bloquées. On retombe alors sur le profil complet,
 * qui est le standard entier : montrer trop vaut mieux que cacher à tort.
 */
export const MODE_BOOTSTRAP_SCRIPT = `try{var m=localStorage.getItem(${JSON.stringify(
  MODE_STORAGE_KEY
)});document.documentElement.setAttribute(${JSON.stringify(
  MODE_ATTRIBUTE
)},m==="light"?"light":"full")}catch(e){document.documentElement.setAttribute(${JSON.stringify(
  MODE_ATTRIBUTE
)},"full")}`;

export function readMode(): Mode {
  try {
    return localStorage.getItem(MODE_STORAGE_KEY) === "light" ? "light" : "full";
  } catch {
    return DEFAULT_MODE;
  }
}

export function writeMode(mode: Mode) {
  document.documentElement.setAttribute(MODE_ATTRIBUTE, mode);
  try {
    localStorage.setItem(MODE_STORAGE_KEY, mode);
  } catch {
    // Stockage indisponible : le choix vaut pour la session, pas au-delà.
  }
  window.dispatchEvent(new CustomEvent("maedow-mode-change", { detail: mode }));
}
