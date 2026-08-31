import { BrowserRouter } from "react-router";
import { AppRoutes } from "./routes";

/**
 * Coquille de l'application et injection de dépendances.
 *
 * C'est ici que se placent les fournisseurs : routeur, thème, client de
 * données, session. Aucune logique métier, conformément à la matrice des rôles par couche d'architecture.md.
 */
export function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
