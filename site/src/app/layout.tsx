import "./globals.css";
import { RootProvider } from "fumadocs-ui/provider/next";
import { Space_Grotesk, Manrope } from "next/font/google";
import type { ReactNode } from "react";
import type { Metadata } from "next";

/*
 * Space Grotesk porte les titres : son dessin géométrique et ses détails
 * légèrement mécaniques donnent le ton technique du propos.
 * Manrope tient le texte courant, où seule compte la lisibilité sur de longs
 * paragraphes.
 *
 * `next/font/google` auto-héberge les fichiers au build : aucune requête vers
 * un domaine tiers, et aucun décalage de mise en page au chargement.
 */
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Maedow Arch",
    default: "Maedow Arch, standard modulaire et découplé",
  },
  description:
    "Standard d’architecture logicielle universel, modulaire et agnostique pour applications web et fullstack modernes.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="fr"
      className={`${spaceGrotesk.variable} ${manrope.variable}`}
      suppressHydrationWarning
    >
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
