import maedowArchConfig from "eslint-config-maedow-arch";
import maedowArchStrict from "eslint-config-maedow-arch/strict";
import tseslint from "typescript-eslint";

/*
 * Les deux entrées, et l'ordre compte.
 *
 * L'entrée par défaut porte les frontières, MA-001 à MA-004. L'entrée stricte
 * ajoute la discipline de typage, MA-005 à MA-007, et doit venir après : c'est
 * la composition que le corpus prescrit et la seule que le banc du paquet
 * éprouve.
 *
 * Ne retirez pas la seconde ligne sans savoir ce qu'elle emporte. Un projet qui
 * ne charge que l'entrée par défaut perd trois des neuf règles du standard, et
 * rien ne le signale : le lint reste vert, puisqu'il ne manque aucun fichier,
 * aucun plugin, aucune configuration. C'est le défaut que ce fichier existe
 * pour empêcher, remonté par un projet réel qui a sondé le générateur au lieu
 * de le croire.
 */
export default [
  { ignores: [".next/**", "node_modules/**"] },
  { files: ["**/*.{ts,tsx}"], languageOptions: { parser: tseslint.parser } },
  ...maedowArchConfig,
  ...maedowArchStrict,
];
