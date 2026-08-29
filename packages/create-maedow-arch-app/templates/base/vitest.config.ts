import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Le domaine (core/) se teste sans monter d'arbre React : c'est tout
    // l'intérêt de la règle « Zéro Modèle dans le JSX ».
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
