import { Route, Routes } from "react-router";
import { HomePage } from "./HomePage";

/**
 * Déclaration des routes.
 *
 * Sous Next.js, ce rôle est tenu par l'arborescence de `app/`. Ici il est
 * explicite, et c'est la seule différence de fond entre les deux frameworks.
 * Voir « Maedow Arch hors Next.js » dans architecture.md.
 *
 * Une route associe un chemin à un écran de feature, et rien de plus : la
 * couche `app/` assemble, elle ne décide pas.
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
    </Routes>
  );
}
