import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Le même alias que dans tsconfig.json : `@/` pointe vers `src/`.
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
