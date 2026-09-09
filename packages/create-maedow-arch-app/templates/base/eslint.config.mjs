/*
 * Profil Light : l'entrée par défaut seule, et c'est un choix.
 *
 * `eslint-config-maedow-arch/strict` existe et porte MA-005, MA-006 et
 * MA-007. Elle n'est pas chargée ici parce que Light vise un projet court,
 * où la discipline de typage coûte plus qu'elle ne rapporte.
 *
 * Un projet Full la charge, et le fichier qu'il reçoit le montre. Si vous
 * basculez en Full ou si vous voulez les trois règles dès maintenant :
 *
 *   import maedowArchStrict from "eslint-config-maedow-arch/strict";
 *   export default [...maedowArchConfig, ...maedowArchStrict];
 *
 * L'absence est écrite plutôt que subie : un import manquant ne se voit pas,
 * et trois règles peuvent disparaître sans que le lint change de couleur.
 */
import maedowArchConfig from "eslint-config-maedow-arch";
import tseslint from "typescript-eslint";

export default [
  { ignores: [".next/**", "node_modules/**"] },
  { files: ["**/*.{ts,tsx}"], languageOptions: { parser: tseslint.parser } },
  ...maedowArchConfig,
];
