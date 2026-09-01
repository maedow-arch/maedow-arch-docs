import "./globals.css";
import { RootProvider } from "fumadocs-ui/provider/next";
import { Space_Grotesk, Google_Sans_Flex, Google_Sans_Code, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/links";
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
 *
 * Les deux Google Sans sont trop récentes pour la table de métriques dont Next
 * se sert afin de fabriquer une police de repli calibrée. Il avertissait à
 * chaque compilation qu'il renonçait à la produire. On le lui dit explicitement,
 * en nommant nous-mêmes le repli : le message disparaît, et le comportement
 * réel ne change pas, puisqu'il y renonçait déjà.
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
  adjustFontFallback: false,
  fallback: ["system-ui", "Segoe UI", "Helvetica Neue", "Arial", "sans-serif"],
});

const googleSansCode = Google_Sans_Code({
  subsets: ["latin"],
  variable: "--font-mono-code",
  display: "swap",
  axes: ["MONO"],
  adjustFontFallback: false,
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-snippet-face",
  display: "swap",
});

export const metadata: Metadata = {
  /*
   * Sans `metadataBase`, Next construit des URL relatives dans les balises
   * Open Graph. Un partage sur un réseau social ne trouve alors pas l'image, et
   * l'aperçu se réduit au titre : le site paraît inachevé là où il est le plus
   * vu.
   */
  metadataBase: new URL(SITE_URL),
  title: {
    template: "%s | Maedow Arch",
    default: "Maedow Arch, standard modulaire et découplé",
  },
  description:
    "Standard d’architecture logicielle universel, modulaire et agnostique pour applications web et fullstack modernes.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: SITE_URL,
    siteName: "Maedow Arch",
    title: "Maedow Arch, standard modulaire et découplé",
    description:
      "Le domaine métier reste séparé de l’interface et l’infrastructure interchangeable. Les frontières ne dépendent pas de la mémoire de l’équipe : le linter les vérifie.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Maedow Arch, standard modulaire et découplé",
    description:
      "Un standard d’architecture dont les frontières sont vérifiées par la machine, pas tenues par la discipline.",
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="fr"
      className={`${spaceGrotesk.variable} ${googleSansFlex.variable} ${googleSansCode.variable} ${geistMono.variable}`}
      /*
       * Le défilement doux de la feuille de style est déclaré ici pour que Next
       * le connaisse. Sans cette mention, un changement de page ferait remonter
       * la fenêtre en défilant sur toute la hauteur du document quitté : le
       * lecteur verrait passer une page qu'il vient de quitter avant d'arriver
       * sur celle qu'il a demandée. Next coupe l'effet le temps de la
       * transition, et le garde pour les ancres, qui sont le seul endroit où on
       * le veut.
       */
      data-scroll-behavior="smooth"
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
