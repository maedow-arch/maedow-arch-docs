import type { ReactNode } from "react";
/*
 * La feuille est déposée par la couche de style, `css-tailwind` comme
 * `css-vanilla`, et l'une des deux est toujours empilée : l'import ne peut
 * donc pas pointer dans le vide.
 *
 * Sans lui, Tailwind était installé, configuré, et ne s'appliquait nulle part.
 * Rien ne le signalait : lint, typecheck, build et audit passaient au vert, et
 * le défaut ne se découvrait qu'au premier composant stylé. Remonté par le
 * projet ABBA, entrée R-005 de son relevé de terrain.
 */
import "./globals.css";

export const metadata = {
  title: "__PROJECT_NAME__",
  description: "Application suivant Maedow Arch",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
