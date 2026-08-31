"use client";

import { COURBE, DUREE, ScrollTrigger, enregistrerAnimation, gsap, useGSAP } from "@/lib/animation";

enregistrerAnimation();

/**
 * La barre de navigation : son entrée, puis sa réaction au défilement.
 *
 * **L'entrée.** La barre descend et ses éléments se posent, avant le titre.
 * L'ordre compte : le lecteur situe d'abord où il est, ensuite ce qu'on lui
 * dit. Une barre qui apparaîtrait après le titre donnerait l'impression que le
 * site s'est chargé en deux fois.
 *
 * **Le défilement.** En haut de page, la barre laisse voir le motif de
 * l'ouverture plutôt que de poser un fond opaque par-dessus. Dès que le contenu
 * passe dessous, elle reprend son fond, parce qu'il faut alors qu'un texte qui
 * défile ne traverse pas la barre en restant lisible. Son trait du bas, lui, ne
 * bouge jamais : il ne marque pas cette séparation, il délimite la barre.
 *
 * Le déclencheur couvre tout le document (`end: 99999`). Un `ScrollTrigger`
 * n'appelle ses rappels que pendant qu'il est actif : sans fin explicite,
 * l'intervalle se referme aussitôt et la bascule n'a jamais lieu.
 *
 * Le composant ne rend aucune balise, volontairement. La barre est `sticky`, et
 * l'envelopper dans un conteneur la rendrait collante à l'intérieur de ce
 * conteneur, c'est-à-dire nulle part.
 *
 * L'habillage reste au CSS : le script décide du moment, la feuille de style de
 * l'apparence, si bien que les couleurs suivent le thème sans être écrites deux
 * fois.
 */
export function NavbarCondensee() {
  useGSAP(() => {
    const media = gsap.matchMedia();

    media.add("(prefers-reduced-motion: no-preference)", () => {
      const barre = document.querySelector<HTMLElement>("[data-navbar]");
      if (!barre) return;

      /*
       * C'est le contenu de la barre qui descend, pas la barre elle-même.
       * Animer le `header` y poserait une transformation, et une
       * transformation sur un élément `sticky` crée un contexte qui l'empêche
       * de coller.
       */
      const rangee = barre.firstElementChild;
      const anime = [rangee, "[data-navbar-marque]", "[data-navbar-action]"];

      const entree = gsap.timeline({
        defaults: { ease: COURBE.sortie },
        /*
         * Les styles posés par l'animation sont retirés à l'arrivée. Sans ce
         * nettoyage, la barre garde une opacité et une transformation en ligne
         * qui ne servent plus, et le moindre recalcul ultérieur peut la
         * réappliquer à contretemps.
         */
        onComplete: () => gsap.set(anime, { clearProps: "all" }),
      });

      entree
        .from(rangee, { y: -28, autoAlpha: 0, duration: DUREE.bloc })
        .from("[data-navbar-marque]", { x: -12, autoAlpha: 0, duration: DUREE.fragment }, "-=0.35")
        .from(
          "[data-navbar-action]",
          { y: -8, autoAlpha: 0, duration: DUREE.fragment, stagger: 0.07 },
          "-=0.3"
        );

      /*
       * `start: "top -8"` place la bascule huit pixels sous le haut du
       * document, et `end: 99999` la maintient jusqu'en bas : le déclencheur
       * reste actif tant qu'on n'est pas revenu tout en haut.
       */
      barre.dataset.pose = "true";

      const bascule = ScrollTrigger.create({
        start: "top -8",
        end: 99999,
        onToggle: (self) => {
          barre.dataset.pose = self.isActive ? "false" : "true";
        },
      });

      return () => {
        bascule.kill();
        entree.kill();
        gsap.set(anime, { clearProps: "all" });
        // Sans script, la barre garde son fond : on la rend telle qu'on l'a
        // trouvée plutôt que de la laisser transparente.
        delete barre.dataset.pose;
      };
    });

    return () => media.revert();
  });

  return null;
}
