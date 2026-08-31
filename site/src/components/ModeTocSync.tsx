"use client";

import { useEffect } from "react";
import { MODE_ATTRIBUTE, type Mode } from "@/lib/mode";

/**
 * Retire du sommaire les titres qui appartiennent à un profil non retenu.
 *
 * Le corps de la page est masqué en CSS, mais le sommaire est construit par
 * Fumadocs à partir des titres du document, sans connaître nos balises. Sans ce
 * raccord, le lecteur en mode Light verrait dans le sommaire des entrées qui ne
 * mènent nulle part.
 *
 * Le seul point d'appui sur le DOM de Fumadocs est l'ancre `href="#id"`, qui
 * est du HTML standard et non un détail d'implémentation : le raccord survit
 * donc aux changements internes de la bibliothèque.
 */
export function ModeTocSync() {
  useEffect(() => {
    const article = document.querySelector("article") ?? document.body;

    /** id du titre → profil auquel il appartient. */
    const profilParId = new Map<string, Mode>();
    for (const bloc of article.querySelectorAll<HTMLElement>("[data-mode-only]")) {
      const profil = bloc.dataset.modeOnly as Mode | undefined;
      if (profil !== "light" && profil !== "full") continue;
      for (const titre of bloc.querySelectorAll<HTMLElement>("h1,h2,h3,h4,h5,h6")) {
        if (titre.id) profilParId.set(titre.id, profil);
      }
    }
    if (profilParId.size === 0) return;

    function appliquer() {
      const mode = document.documentElement.getAttribute(MODE_ATTRIBUTE);
      for (const [id, profil] of profilParId) {
        const masque = mode !== profil;
        for (const lien of document.querySelectorAll<HTMLElement>(`a[href="#${CSS.escape(id)}"]`)) {
          // L'élément de liste porte la puce et l'espacement : c'est lui qu'il
          // faut retirer, pas seulement le texte du lien.
          const cible = lien.closest("li") ?? lien;
          cible.setAttribute("data-mode-hidden-toc", String(masque));
        }
      }
    }

    appliquer();
    window.addEventListener("maedow-mode-change", appliquer);
    return () => window.removeEventListener("maedow-mode-change", appliquer);
  }, []);

  return null;
}
