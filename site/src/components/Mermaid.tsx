"use client";

import { useEffect, useId, useRef, useState } from "react";

/**
 * Rend un schéma Mermaid, accordé au thème courant.
 *
 * Le choix de Mermaid plutôt qu'une image tient à la source : le corpus vit
 * dans les `.md` de la racine, que GitHub affiche tel quel et qui restent la
 * référence. GitHub sait rendre ces blocs nativement, le site aussi : un seul
 * contenu, deux rendus, et le schéma demeure du texte que l'on corrige en une
 * ligne. Une image se serait figée hors du thème, hors du lecteur d'écran et
 * hors du dépôt.
 *
 * La bibliothèque n'est chargée qu'au montage, et seulement sur les pages qui
 * en contiennent : elle pèse plus que le reste du site réuni.
 */
export function Mermaid({ chart }: { chart: string }) {
  const conteneur = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string | null>(null);
  const [echec, setEchec] = useState(false);
  const identifiant = useId().replace(/[^a-zA-Z0-9]/g, "");

  useEffect(() => {
    let annule = false;

    async function dessiner() {
      const styles = getComputedStyle(document.documentElement);
      const couleur = (nom: string, secours: string) =>
        styles.getPropertyValue(nom).trim() || secours;

      const encre = couleur("--color-fd-foreground", "#100a1f");
      const fond = couleur("--color-fd-card", "#ffffff");
      const accent = couleur("--color-fd-primary", "#cc00b8");
      const trait = couleur("--color-fd-border", "#d8d4e4");
      const attenue = couleur("--color-fd-muted-foreground", "#766a8e");

      const { default: mermaid } = await import("mermaid");

      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "strict",
        fontFamily: "var(--font-sans), system-ui, sans-serif",
        theme: "base",
        themeVariables: {
          background: "transparent",
          primaryColor: fond,
          primaryTextColor: encre,
          primaryBorderColor: trait,
          secondaryColor: fond,
          tertiaryColor: fond,
          lineColor: attenue,
          textColor: encre,
          mainBkg: fond,
          nodeBorder: trait,
          clusterBkg: "transparent",
          clusterBorder: trait,
          edgeLabelBackground: fond,
          fontSize: "14px",
        },
        flowchart: { curve: "basis", padding: 16, useMaxWidth: true },
      });

      try {
        const { svg: rendu } = await mermaid.render(`maedow-${identifiant}`, chart);
        if (!annule) {
          // L'accent ne sert qu'aux flèches : dans un schéma de couches, ce
          // qu'il faut suivre du regard est le sens du flux, pas les boîtes.
          setSvg(rendu.replaceAll("#333", accent));
          setEchec(false);
        }
      } catch {
        // Un schéma mal formé ne doit pas emporter la page avec lui : on laisse
        // alors voir sa source, qui reste lisible.
        if (!annule) setEchec(true);
      }
    }

    void dessiner();

    // Le schéma est redessiné à chaque changement de thème, ses couleurs étant
    // figées dans le SVG au moment du rendu.
    const observateur = new MutationObserver(() => void dessiner());
    observateur.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    return () => {
      annule = true;
      observateur.disconnect();
    };
  }, [chart, identifiant]);

  if (echec) {
    return (
      <pre className="overflow-x-auto rounded-lg border border-fd-border bg-fd-muted/40 p-4 text-sm">
        <code>{chart}</code>
      </pre>
    );
  }

  return (
    <div
      ref={conteneur}
      role="img"
      aria-label="Schéma d'architecture"
      className="my-6 flex justify-center overflow-x-auto rounded-xl border border-fd-border bg-fd-card p-6 [&_svg]:h-auto [&_svg]:max-w-full"
      // Le SVG vient de Mermaid, qui l'a produit en mode strict à partir d'un
      // texte du dépôt : aucune donnée extérieure n'entre ici.
      dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
    >
      {svg ? undefined : (
        <span className="py-8 text-sm text-fd-muted-foreground">Schéma en cours de rendu…</span>
      )}
    </div>
  );
}
