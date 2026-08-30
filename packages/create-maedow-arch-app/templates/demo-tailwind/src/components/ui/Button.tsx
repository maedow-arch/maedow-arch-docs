import type { ButtonHTMLAttributes, ReactNode } from "react";

/**
 * Composant présentationnel pur.
 *
 * Il ne connaît ni compteur, ni règle métier : uniquement une apparence et un
 * clic. C'est ce qui le rend réutilisable dans n'importe quelle feature.
 */
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost";
  children: ReactNode;
}

// La couleur de bordure appartient à la variante, pas à la base : deux
// utilitaires de même spécificité se départagent selon l'ordre du CSS généré,
// et non selon l'ordre des classes. En la posant deux fois, la bordure du
// bouton fantôme disparaissait.
const BASE =
  "font-semibold text-sm px-[1.15rem] py-[0.6rem] rounded-[9px] border cursor-pointer transition-opacity disabled:opacity-40 disabled:cursor-not-allowed";

const VARIANTS = {
  primary: "bg-accent text-white border-transparent not-disabled:hover:opacity-90",
  ghost: "bg-transparent text-ink border-line not-disabled:hover:bg-accent-soft",
} as const;

export function Button({ variant = "primary", children, ...props }: ButtonProps) {
  return (
    <button className={`${BASE} ${VARIANTS[variant]}`} {...props}>
      {children}
    </button>
  );
}
