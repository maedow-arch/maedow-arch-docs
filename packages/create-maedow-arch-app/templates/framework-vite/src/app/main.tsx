import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./globals.css";

/**
 * Point d'entrée de l'application.
 *
 * Couche `app/`, responsabilité « point d'entrée ». Sous Next.js, ce rôle est
 * tenu par `app/layout.tsx`. Voir « Maedow Arch hors Next.js » dans architecture.md.
 */
const container = document.getElementById("root");
if (!container) throw new Error("Élément #root introuvable dans index.html");

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>
);
