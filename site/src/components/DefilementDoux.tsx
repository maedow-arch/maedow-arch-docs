"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { ScrollTrigger, enregistrerAnimation, gsap } from "@/lib/animation";

enregistrerAnimation();

/**
 * Le défilement lissé, sur la page d'accueil et nulle part ailleurs.
 *
 * Le choix est délibérément local. Une page d'accueil est une démonstration :
 * l'inertie y accompagne la lecture et sert le propos. Une documentation est un
 * outil, où le défilement sert à chercher : lui donner de l'inertie, c'est en
 * donner aussi à la molette réglée au cran, aux touches de pagination, au
 * glisser de la barre et au saut du navigateur vers un résultat de recherche.
 *
 * Ce composant n'est donc monté que par `/`. En quittant la page, Lenis est
 * détruit et le défilement natif revient pour tout le reste du site.
 *
 * Trois branchements sont nécessaires pour que les deux bibliothèques
 * s'entendent, et l'oubli d'un seul suffit à faire dériver les déclencheurs :
 * ScrollTrigger doit être informé à chaque défilement, Lenis doit avancer au
 * rythme de l'horloge de GSAP plutôt qu'à la sienne, et le rattrapage de retard
 * de GSAP doit être coupé, faute de quoi il saute des images que Lenis, lui,
 * continue d'interpoler.
 *
 * `prefers-reduced-motion` n'a rien demandé de spécial : Lenis l'observe de
 * lui-même et se met en retrait.
 *
 * La feuille de style de Lenis est importée pour une raison précise : elle
 * neutralise le `scroll-behavior: smooth` du document tant que le lissage est
 * actif. Sans elle, le navigateur interpolerait à son tour ce que Lenis
 * interpole déjà, et les sauts d'ancre deviendraient élastiques.
 */
export function DefilementDoux() {
  useEffect(() => {
    const lenis = new Lenis();

    const avancer = (temps: number) => lenis.raf(temps * 1000);

    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(avancer);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(avancer);
      // Le rattrapage de retard est rendu à son réglage d'origine : les autres
      // pages n'ont aucune raison de s'en passer.
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
    };
  }, []);

  return null;
}
