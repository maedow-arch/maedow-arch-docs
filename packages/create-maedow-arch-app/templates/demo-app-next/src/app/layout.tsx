import type { ReactNode } from "react";
import { Space_Grotesk, Manrope } from "next/font/google";
import "./globals.css";

/*
 * Space Grotesk pour les titres, Manrope pour le texte courant.
 * `next/font/google` auto-héberge les fichiers au build : aucune requête vers
 * un domaine tiers, et aucun décalage de mise en page au chargement.
 *
 * Ce choix typographique appartient au produit, pas à l'architecture.
 * Remplacez-le sans scrupule.
 */
const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const body = Manrope({ subsets: ["latin"], variable: "--font-body", display: "swap" });

export const metadata = {
  title: "__PROJECT_NAME__",
  description: "Application suivant Maedow Arch",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
