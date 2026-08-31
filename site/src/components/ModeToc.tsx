"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as Primitive from "fumadocs-core/toc";
import { useActiveAnchors, type TOCItemType } from "fumadocs-core/toc";
import { MODE_ATTRIBUTE, type Mode } from "@/lib/mode";

/**
 * Le sommaire de la page, avec son trait, filtré par profil de lecture.
 *
 * Fumadocs en fournit un dont le tracé ne survit pas au retrait d'une entrée.
 * Il empile les positions mesurées avec `push`, mais relit celle du voisin par
 * l'indice de boucle : dès qu'une entrée est sautée, l'indice décroche et la
 * lecture tombe à côté. Masquer une entrée en CSS ne vaut pas mieux, un élément
 * hors du flux se mesurant à zéro et ramenant le trait en haut du bloc.
 *
 * Le tracé est donc refait ici, sur la liste déjà filtrée. Le décrochement
 * d'un niveau à l'autre est conservé, parce que c'est lui qui donne au sommaire
 * sa lisibilité : la profondeur se voit avant de se lire. La différence tient
 * en une ligne, mais c'est celle qui compte : chaque entrée mesurée est empilée,
 * donc l'indice ne peut pas décrocher.
 */

/** Décalage horizontal du trait, par niveau de titre. */
function decalage(profondeur: number): number {
  if (profondeur <= 2) return 14;
  if (profondeur === 3) return 20;
  return 32;
}

type Trace = {
  largeur: number;
  hauteur: number;
  chemin: string;
  /** Longueur totale du tracé, et portion à colorer, en unités de tracé. */
  total: number;
  actif: { debut: number; longueur: number } | null;
};

export function ModeToc({ items }: { items: TOCItemType[] }) {
  const conteneur = useRef<HTMLDivElement>(null);
  const [trace, setTrace] = useState<Trace | null>(null);

  /*
   * La transition ne vaut que pour un déplacement d'une section à l'autre.
   * Quand la liste elle-même change, à la bascule de profil ou à un
   * redimensionnement, toute la géométrie est recalculée : animer ce
   * changement-là ferait remonter le segment ailleurs avant de revenir. On
   * pose donc la nouvelle forme sans transition, puis on la réarme une fois
   * peinte.
   */
  const cheminPrecedent = useRef<string | null>(null);
  const [animer, setAnimer] = useState(false);

  /*
   * Le corpus marque les sections d'un seul profil, pas les titres. On relève
   * donc les identifiants concernés dans le document rendu, une fois monté.
   * Avant ce relevé tout est affiché, ce qui est aussi ce que voit un visiteur
   * sans JavaScript.
   */
  const [profilParId, setProfilParId] = useState<ReadonlyMap<string, Mode>>(new Map());
  const [mode, setMode] = useState<string | null>(null);

  useEffect(() => {
    const article = document.querySelector("article") ?? document.body;
    const releve = new Map<string, Mode>();

    for (const bloc of article.querySelectorAll<HTMLElement>("[data-mode-only]")) {
      const profil = bloc.dataset.modeOnly as Mode | undefined;
      if (profil !== "light" && profil !== "full") continue;
      for (const titre of bloc.querySelectorAll<HTMLElement>("h1,h2,h3,h4,h5,h6")) {
        if (titre.id) releve.set(titre.id, profil);
      }
    }
    setProfilParId(releve);

    const lireLeMode = () => setMode(document.documentElement.getAttribute(MODE_ATTRIBUTE));
    lireLeMode();
    window.addEventListener("maedow-mode-change", lireLeMode);
    return () => window.removeEventListener("maedow-mode-change", lireLeMode);
  }, []);

  const visibles = items.filter((item) => {
    const profil = profilParId.get(item.url.replace(/^#/, ""));
    return profil === undefined || profil === mode;
  });

  const actifs = useActiveAnchors();

  const tracer = useCallback(() => {
    const racine = conteneur.current;
    if (!racine) return;

    const liens = Array.from(racine.querySelectorAll<HTMLAnchorElement>("a[data-toc-entree]"));
    if (liens.length === 0) return setTrace(null);

    let largeur = 0;
    let hauteur = 0;
    let chemin = "";
    let parcouru = 0;
    let premierActif: number | null = null;
    let dernierActif: number | null = null;
    const positions: [number, number, number][] = [];

    liens.forEach((lien, i) => {
      const styles = getComputedStyle(lien);
      const x = decalage(Number(lien.dataset.tocProfondeur ?? 2)) + 0.5;
      const haut = lien.offsetTop + parseFloat(styles.paddingTop);
      const bas = lien.offsetTop + lien.clientHeight - parseFloat(styles.paddingBottom);

      largeur = Math.max(x + 8, largeur);
      hauteur = Math.max(hauteur, bas);

      if (i === 0) {
        chemin += `M${x} ${haut} L${x} ${bas}`;
      } else {
        const [, basPrecedent, xPrecedent] = positions[i - 1]!;
        chemin += ` L ${xPrecedent} ${basPrecedent} ${x} ${haut} L${x} ${bas}`;
        // La diagonale qui rejoint l'entrée depuis la précédente compte dans la
        // longueur parcourue : sans elle, le pointillé se décalerait à chaque
        // changement de niveau.
        parcouru += Math.hypot(x - xPrecedent, haut - basPrecedent);
      }

      const debutDuSegment = parcouru;
      parcouru += bas - haut;

      if (lien.dataset.tocActif === "true") {
        if (premierActif === null) premierActif = debutDuSegment;
        dernierActif = parcouru;
      }

      positions.push([haut, bas, x]);
    });

    const memeStructure = cheminPrecedent.current === chemin;
    cheminPrecedent.current = chemin;
    setAnimer(memeStructure);
    if (!memeStructure) {
      // Deux trames : la première peint la nouvelle forme, la seconde réarme
      // la transition sans qu'il reste rien à interpoler.
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimer(true)));
    }

    setTrace({
      largeur,
      hauteur,
      chemin,
      total: parcouru,
      actif:
        premierActif === null || dernierActif === null
          ? null
          : { debut: premierActif, longueur: dernierActif - premierActif },
    });
  }, []);

  useEffect(() => {
    const racine = conteneur.current;
    if (!racine) return;
    const observateur = new ResizeObserver(tracer);
    observateur.observe(racine);
    tracer();
    return () => observateur.disconnect();
  }, [tracer, visibles.length, actifs]);

  if (visibles.length === 0) return null;

  return (
    <div
      ref={conteneur}
      className="relative mt-2 flex min-h-0 flex-1 flex-col overflow-y-auto"
      aria-label="Sommaire de la page"
    >
      {trace ? (
        <svg
          width={trace.largeur}
          height={trace.hauteur}
          className="pointer-events-none absolute start-0 top-0"
          aria-hidden
        >
          <path
            d={trace.chemin}
            className="stroke-fd-border"
            strokeWidth="1"
            fill="none"
            strokeLinecap="round"
          />
          {/* Le même tracé, révélé en partie. On anime le pointillé plutôt que
              la forme : l'attribut `d` ne s'interpole pas, la longueur du
              pointillé si. Le segment coloré glisse donc d'une section à
              l'autre au lieu de sauter. */}
          <path
            d={trace.chemin}
            className={
              animer
                ? "stroke-fd-primary transition-[stroke-dasharray,stroke-dashoffset,opacity] duration-300 ease-out"
                : "stroke-fd-primary"
            }
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            opacity={trace.actif ? 1 : 0}
            strokeDasharray={`${trace.actif?.longueur ?? 0} ${trace.total}`}
            strokeDashoffset={-(trace.actif?.debut ?? 0)}
          />
        </svg>
      ) : null}

      {visibles.map((item) => {
        const estActif = actifs.includes(item.url.replace(/^#/, ""));
        return (
          <Primitive.TOCItem
            key={item.url}
            href={item.url}
            data-toc-entree=""
            data-toc-profondeur={item.depth}
            data-toc-actif={estActif}
            style={{ paddingInlineStart: decalage(item.depth) + 12 }}
            className="py-1.5 text-sm text-fd-muted-foreground transition-colors hover:text-fd-foreground data-[active=true]:text-fd-primary"
          >
            {item.title}
          </Primitive.TOCItem>
        );
      })}
    </div>
  );
}
