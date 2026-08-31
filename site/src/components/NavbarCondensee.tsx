"use client";

import { ScrollTrigger, enregistrerAnimation, gsap, useGSAP } from "@/lib/animation";

enregistrerAnimation();

/**
 * La barre de navigation s'efface tant qu'on est en haut de la page.
 *
 * En haut, elle n'a rien à séparer : la hero commence juste dessous, et sa
 * bordure comme son fond coupent une composition qui gagne à respirer. Dès que
 * le contenu passe dessous, elle reprend son fond et son trait, parce qu'il
 * faut alors distinguer ce qui reste de ce qui défile.
 *
 * Ce n'est donc pas un effet ajouté à une barre qui fonctionnait : c'est la
 * barre qui cesse d'annoncer une séparation qui n'existe pas encore.
 *
 * Le composant ne rend aucune balise, volontairement. La barre est `sticky`, et
 * l'envelopper dans un conteneur la rendrait collante à l'intérieur de ce
 * conteneur, c'est-à-dire nulle part.
 *
 * L'habillage est laissé au CSS. GSAP décide du moment, la feuille de style
 * décide de l'apparence : les couleurs suivent ainsi le thème clair ou sombre
 * sans qu'aucune valeur ne soit écrite deux fois.
 */
export function NavbarCondensee() {
  useGSAP(() => {
    const media = gsap.matchMedia();

    media.add("(prefers-reduced-motion: no-preference)", () => {
      const barre = document.querySelector<HTMLElement>("[data-navbar]");
      if (!barre) return;

      barre.dataset.pose = "true";

      const declencheur = ScrollTrigger.create({
        start: 8,
        onUpdate: (self) => {
          barre.dataset.pose = self.scroll() > 8 ? "false" : "true";
        },
      });

      return () => {
        declencheur.kill();
        // Sans script, la barre garde son fond : on la rend telle qu'on l'a
        // trouvée plutôt que de la laisser transparente.
        delete barre.dataset.pose;
      };
    });

    return () => media.revert();
  });

  return null;
}
