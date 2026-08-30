import { DemoPage } from "./DemoPage";

/**
 * Câblage Next.js de la démonstration.
 *
 * La couche `app/` assemble : elle monte un composant et le place dans une
 * route. Le contenu de la démonstration, lui, ne connaît aucun framework.
 */
export default function Page() {
  return <DemoPage />;
}
