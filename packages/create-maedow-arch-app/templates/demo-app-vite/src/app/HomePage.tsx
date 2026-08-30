import { DemoPage } from "./DemoPage";

/**
 * Câblage Vite de la démonstration.
 *
 * `routes.tsx` associe le chemin `/` à ce composant. C'est le pendant exact du
 * `page.tsx` de Next : même rôle, mécanisme différent. Voir architecture.md §10.
 */
export function HomePage() {
  return <DemoPage />;
}
