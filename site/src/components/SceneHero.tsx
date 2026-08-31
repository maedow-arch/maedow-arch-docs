"use client";

import { useRef, type ReactNode } from "react";
import {
  COURBE,
  DECALAGE,
  DUREE,
  SplitText,
  enregistrerAnimation,
  gsap,
  useGSAP,
} from "@/lib/animation";

enregistrerAnimation();

/**
 * L'ouverture de la page.
 *
 * Elle a son propre composant parce qu'elle obéit à une autre contrainte que le
 * reste : elle est déjà visible quand la page s'affiche. Rien ne s'y déclenche
 * au défilement, tout s'y enchaîne dans un ordre choisi, et cet ordre est
 * l'argument. Le nom se déplie, la promesse le suit, et la commande arrive en
 * dernier parce qu'elle ne veut rien dire tant que les deux premières n'ont pas
 * été lues.
 *
 * Le fond pointillé, lui, dérive au défilement. C'est le seul mouvement
 * continu de la page, et il sert à établir la profondeur avant que le lecteur
 * n'entre dans le contenu.
 */
export function SceneHero({ children }: { children: ReactNode }) {
  const racine = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        const scope = racine.current;
        if (!scope) return;

        const titre = scope.querySelector<HTMLElement>('[data-hero="titre"]');
        const suite = gsap.timeline({ defaults: { ease: COURBE.sortie } });

        /*
         * Le titre se découpe en caractères. C'est le seul endroit du site qui
         * le mérite : deux mots, très grands, qui portent le nom. Partout
         * ailleurs on découpe en lignes, parce qu'un paragraphe animé lettre à
         * lettre se lit moins vite qu'il ne s'affiche.
         *
         * `autoSplit` redécoupe quand les polices de `next/font` remplacent la
         * police de repli, sans quoi le découpage serait fait sur les mauvaises
         * mesures.
         */
        if (titre) {
          SplitText.create(titre, {
            type: "chars, lines",
            mask: "lines",
            autoSplit: true,
            onSplit(decoupe) {
              return gsap.from(decoupe.chars, {
                yPercent: 120,
                autoAlpha: 0,
                duration: DUREE.bloc,
                ease: COURBE.sortie,
                stagger: DECALAGE.caractere,
              });
            },
          });
        }

        /*
         * Le reste suit, dans l'ordre de lecture. Les décalages négatifs font
         * se chevaucher les entrées : une cascade dont chaque élément attend la
         * fin du précédent paraît laborieuse.
         */
        suite
          .from(
            '[data-hero="promesse"]',
            { y: 16, autoAlpha: 0, duration: DUREE.bloc },
            titre ? 0.45 : 0.1
          )
          .from(
            '[data-hero="commande"]',
            { y: 16, autoAlpha: 0, scale: 0.985, duration: DUREE.bloc },
            "-=0.4"
          )
          .from(
            '[data-hero="recherche"]',
            { y: 12, autoAlpha: 0, duration: DUREE.fragment },
            "-=0.5"
          )
          .from(
            '[data-hero="raccourci"]',
            { y: 10, autoAlpha: 0, duration: DUREE.fragment, stagger: 0.05 },
            "-=0.35"
          );

        /*
         * La dérive du fond. `scrub` l'attache à la position de défilement
         * plutôt qu'au temps : le mouvement appartient au lecteur, il s'arrête
         * quand il s'arrête et repart en arrière quand il remonte.
         */
        const fond = scope.querySelector<HTMLElement>('[data-hero="fond"]');
        if (fond) {
          gsap.to(fond, {
            yPercent: 14,
            ease: COURBE.continu,
            scrollTrigger: {
              trigger: scope,
              start: "top top",
              end: "bottom top",
              scrub: 0.6,
            },
          });
        }
      });

      return () => media.revert();
    },
    { scope: racine }
  );

  return <div ref={racine}>{children}</div>;
}
