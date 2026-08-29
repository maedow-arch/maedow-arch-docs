import maedowArchConfig from "eslint-config-maedow-arch";
import tseslint from "typescript-eslint";

export default [
  { ignores: [".next/**", "node_modules/**"] },
  { files: ["**/*.{ts,tsx}"], languageOptions: { parser: tseslint.parser } },
  ...maedowArchConfig,
];
