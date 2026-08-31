"use client";

import { useRef, type ReactNode } from "react";
import {
  COURBE,
  DECALAGE,
  DUREE,
  SEUIL,
  ScrollTrigger,
  SplitText,
  enregistrerAnimation,
  gsap,
  useGSAP,
} from "@/lib/animation";

enregistrerAnimation();

/**
 * Le moteur d'animation de la page d'accueil.
 *
 * Il n'y en a qu'un. Les sections ne déclarent pas comment elles s'animent,
 * elles déclarent ce que sont leurs éléments : un titre, une couche du flux,
 * un chiffre à compter. Le comportement associé à chaque rôle vit ici, et
 * l'inventaire complet des animations du site tient donc dans un fichier.
 *
 * C'est ce qui distingue une mise en mouvement d'un empilement d'effets. Ajouter
 * un `data-anime="carte"` à un bloc lui donne le rythme des autres cartes, sans
 * qu'on ait à retrouver quelle durée avait été choisie ailleurs.
 *
 * Les animations d'entrée sont toutes des `from` : l'état de repos du document
 * est déjà l'état final. Sans JavaScript, la page est entière.
 */
export function Scene({ children, className }: { children: ReactNode; className?: string }) {
  const racine = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        const scope = racine.current;
        if (!scope) return;

        /* ------------------------------------------------------------------
         * Les titres s'écrivent, ligne par ligne, derrière un masque.
         *
         * `autoSplit` est indispensable ici : les polices viennent de
         * `next/font` et arrivent après le premier rendu. Sans lui, les lignes
         * seraient découpées d'après la police de repli, et le découpage
         * deviendrait faux dès la substitution.
         * ---------------------------------------------------------------- */
        for (const titre of scope.querySelectorAll<HTMLElement>('[data-anime="titre"]')) {
          SplitText.create(titre, {
            type: "lines",
            mask: "lines",
            autoSplit: true,
            onSplit(decoupe) {
              return gsap.from(decoupe.lines, {
                yPercent: 110,
                duration: DUREE.bloc,
                ease: COURBE.sortie,
                stagger: DECALAGE.ligne,
                scrollTrigger: { trigger: titre, start: SEUIL, once: true },
              });
            },
          });
        }

        /* Les textes d'accompagnement suivent leur titre, sans le devancer. */
        for (const intro of scope.querySelectorAll<HTMLElement>('[data-anime="intro"]')) {
          gsap.from(intro, {
            y: 18,
            autoAlpha: 0,
            duration: DUREE.bloc,
            ease: COURBE.sortie,
            scrollTrigger: { trigger: intro, start: SEUIL, once: true },
          });
        }

        /* ------------------------------------------------------------------
         * Les couches du flux de dépendance se révèlent dans le sens du flux.
         *
         * C'est l'animation qui porte le plus de sens du site : la règle dit
         * que la dépendance descend et ne remonte jamais, et l'œil la voit
         * descendre avant de lire la phrase qui l'énonce. Les flèches
         * n'apparaissent qu'ensuite, une fois qu'il y a quelque chose à relier.
         * ---------------------------------------------------------------- */
        const flux = scope.querySelector<HTMLElement>('[data-anime="flux"]');
        if (flux) {
          const couches = flux.querySelectorAll('[data-anime="couche"]');
          const fleches = flux.querySelectorAll('[data-anime="fleche"]');

          const suite = gsap.timeline({
            scrollTrigger: { trigger: flux, start: SEUIL, once: true },
          });

          suite
            .from(couches, {
              y: 24,
              autoAlpha: 0,
              duration: DUREE.fragment,
              ease: COURBE.sortie,
              stagger: DECALAGE.couche,
            })
            .from(
              fleches,
              {
                autoAlpha: 0,
                x: -6,
                duration: DUREE.fragment,
                ease: COURBE.franc,
                stagger: DECALAGE.couche,
              },
              /* Elles rattrapent la première couche, pas la dernière : le trait
                 se tend derrière le mouvement au lieu de le suivre. */
              `-=${DUREE.fragment + DECALAGE.couche}`
            );
        }

        /* ------------------------------------------------------------------
         * Les chiffres se comptent.
         *
         * Ils viennent de la matrice du workflow, ce ne sont pas des arguments
         * décoratifs. Les voir défiler jusqu'à leur valeur dit qu'ils ont été
         * dénombrés.
         * ---------------------------------------------------------------- */
        for (const compteur of scope.querySelectorAll<HTMLElement>('[data-anime="compte"]')) {
          const arrivee = Number(compteur.dataset.valeur ?? compteur.textContent ?? 0);
          if (!Number.isFinite(arrivee) || arrivee === 0) continue;

          const etat = { valeur: 0 };
          gsap.to(etat, {
            valeur: arrivee,
            duration: DUREE.compte,
            ease: COURBE.sortie,
            scrollTrigger: { trigger: compteur, start: SEUIL, once: true },
            onUpdate: () => {
              compteur.textContent = String(Math.round(etat.valeur));
            },
          });
        }

        /* ------------------------------------------------------------------
         * Les deux volets de la comparaison arrivent dans l'ordre du propos.
         *
         * Le volet « sans la règle » d'abord, puis celui qui le corrige. Les
         * animer ensemble présenterait deux options équivalentes, alors que la
         * section raconte un avant et un après.
         * ---------------------------------------------------------------- */
        const volets = scope.querySelectorAll<HTMLElement>('[data-anime="volet"]');
        if (volets.length > 0) {
          gsap.from(volets, {
            y: 28,
            autoAlpha: 0,
            duration: DUREE.bloc,
            ease: COURBE.sortie,
            stagger: 0.18,
            scrollTrigger: { trigger: volets[0]!, start: SEUIL, once: true },
          });
        }

        /* ------------------------------------------------------------------
         * Les colonnes du pied de page arrivent de la gauche vers la droite.
         *
         * Sobrement, et c'est le point : elles suivent immédiatement le seul
         * aplat plein de la page. Une entrée appuyée ici entrerait en
         * concurrence avec l'appel qu'elle vient de laisser derrière elle.
         * ---------------------------------------------------------------- */
        const colonnes = scope.querySelectorAll<HTMLElement>('[data-anime="colonne"]');
        if (colonnes.length > 0) {
          gsap.from(colonnes, {
            y: 14,
            autoAlpha: 0,
            duration: DUREE.fragment,
            ease: COURBE.sortie,
            stagger: 0.07,
            scrollTrigger: { trigger: colonnes[0]!, start: SEUIL, once: true },
          });
        }

        /* ------------------------------------------------------------------
         * Les cartes de la grille entrent par lots.
         *
         * `batch` regroupe celles qui franchissent le seuil ensemble et leur
         * donne un décalage commun. Une carte isolée, rencontrée seule au
         * défilement, n'attend pas les autres pour apparaître.
         * ---------------------------------------------------------------- */
        const cartes = scope.querySelectorAll<HTMLElement>('[data-anime="carte"]');
        if (cartes.length > 0) {
          gsap.set(cartes, { y: 26, autoAlpha: 0 });
          ScrollTrigger.batch(Array.from(cartes), {
            start: SEUIL,
            once: true,
            onEnter: (lot) =>
              gsap.to(lot, {
                y: 0,
                autoAlpha: 1,
                duration: DUREE.bloc,
                ease: COURBE.sortie,
                stagger: DECALAGE.carte,
                overwrite: true,
              }),
          });
        }
      });

      return () => media.revert();
    },
    { scope: racine }
  );

  return (
    <div ref={racine} className={className}>
      {children}
    </div>
  );
}
