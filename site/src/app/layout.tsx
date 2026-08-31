import "./globals.css";
import { RootProvider } from "fumadocs-ui/provider/next";
import { Space_Grotesk, Google_Sans_Flex, Google_Sans_Code, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { TRANSLATIONS } from "@/lib/translations";
import { MODE_BOOTSTRAP_SCRIPT } from "@/lib/mode";

/*
 * Space Grotesk porte les titres : son dessin géométrique et ses détails
 * légèrement mécaniques donnent le ton technique du propos.
 * Google Sans Flex tient le texte courant, où seule compte la lisibilité sur de
 * longs paragraphes.
 * Google Sans Code porte le code de la documentation. L'axe MONO est forcé à 1
 * dans la feuille de style : la fonte sait aussi se rendre en proportionnel, ce
 * qui n'a aucun sens pour du code qu'on aligne et qu'on recopie.
 * Geist Mono est réservée au bloc terminal de la page d'accueil. Lui donner une
 * fonte à elle est délibéré : c'est le seul endroit du site qui montre l'outil
 * plutôt que la documentation, et il doit se lire comme un terminal.
 *
 * `next/font/google` auto-héberge les fichiers au build : aucune requête vers
 * un domaine tiers, et aucun décalage de mise en page au chargement.
 */
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const googleSansFlex = Google_Sans_Flex({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const googleSansCode = Google_Sans_Code({
  subsets: ["latin"],
  variable: "--font-mono-code",
  display: "swap",
  axes: ["MONO"],
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-snippet-face",
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
      className={`${spaceGrotesk.variable} ${googleSansFlex.variable} ${googleSansCode.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Pose le profil de lecture avant la première peinture. Sans lui, une
            page ouverte en Light afficherait un instant les sections Full. */}
        <script dangerouslySetInnerHTML={{ __html: MODE_BOOTSTRAP_SCRIPT }} />
      </head>
      <body className="flex flex-col min-h-screen">
        <RootProvider i18n={{ locale: "fr", translations: TRANSLATIONS }}>{children}</RootProvider>
      </body>
    </html>
  );
}
