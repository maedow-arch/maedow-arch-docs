"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronsUpDown, Feather, Layers } from "lucide-react";
import { DEFAULT_MODE, readMode, writeMode, type Mode } from "@/lib/mode";

const PROFILS: { mode: Mode; icon: typeof Layers; title: string; description: string }[] = [
  {
    mode: "full",
    icon: Layers,
    title: "Mode Full",
    description: "Les quatre couches, domaine séparé",
  },
  {
    mode: "light",
    icon: Feather,
    title: "Mode Light",
    description: "Sans couche core, pour un projet court",
  },
];

/**
 * Le sélecteur de profil de lecture, en tête de la barre latérale.
 *
 * Il ne filtre rien lui-même : il pose l'attribut sur `<html>` et la feuille de
 * style fait le reste. Le premier rendu affiche le profil par défaut, puis
 * `useEffect` rétablit le choix mémorisé. Seul le libellé du bouton peut donc
 * changer après hydratation, jamais le contenu de la page, que le script
 * d'amorçage a déjà réglé.
 */
export function ModeSwitcher() {
  const [mode, setMode] = useState<Mode>(DEFAULT_MODE);
  const [ouvert, setOuvert] = useState(false);
  const conteneur = useRef<HTMLDivElement>(null);

  useEffect(() => setMode(readMode()), []);

  useEffect(() => {
    if (!ouvert) return;
    function auClic(event: MouseEvent) {
      if (!conteneur.current?.contains(event.target as Node)) setOuvert(false);
    }
    function auClavier(event: KeyboardEvent) {
      if (event.key === "Escape") setOuvert(false);
    }
    document.addEventListener("mousedown", auClic);
    document.addEventListener("keydown", auClavier);
    return () => {
      document.removeEventListener("mousedown", auClic);
      document.removeEventListener("keydown", auClavier);
    };
  }, [ouvert]);

  function choisir(suivant: Mode) {
    setMode(suivant);
    writeMode(suivant);
    setOuvert(false);
  }

  const actuel = PROFILS.find((profil) => profil.mode === mode) ?? PROFILS[0];
  const Icone = actuel.icon;

  return (
    <div ref={conteneur} className="relative">
      <button
        type="button"
        onClick={() => setOuvert((valeur) => !valeur)}
        aria-haspopup="listbox"
        aria-expanded={ouvert}
        className="flex w-full items-center gap-3 rounded-xl border border-fd-border bg-fd-card px-3 py-2.5 text-left transition-colors hover:border-fd-primary/40"
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-fd-primary/10 text-fd-primary">
          <Icone className="size-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-fd-foreground">
            {actuel.title}
          </span>
          <span className="block truncate text-xs text-fd-muted-foreground">
            {actuel.description}
          </span>
        </span>
        <ChevronsUpDown className="size-4 shrink-0 text-fd-muted-foreground" />
      </button>

      {ouvert && (
        <ul
          role="listbox"
          className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-fd-border bg-fd-popover p-1 shadow-lg"
        >
          {PROFILS.map((profil) => {
            const IconeOption = profil.icon;
            const selectionne = profil.mode === mode;
            return (
              <li key={profil.mode}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selectionne}
                  onClick={() => choisir(profil.mode)}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-fd-accent"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-fd-primary/10 text-fd-primary">
                    <IconeOption className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-fd-foreground">
                      {profil.title}
                    </span>
                    <span className="block truncate text-xs text-fd-muted-foreground">
                      {profil.description}
                    </span>
                  </span>
                  {selectionne && <Check className="size-4 shrink-0 text-fd-primary" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
