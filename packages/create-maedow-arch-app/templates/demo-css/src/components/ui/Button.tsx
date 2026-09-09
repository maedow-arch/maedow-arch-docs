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

export function Button({ variant = "primary", children, ...props }: ButtonProps) {
  return (
    <button className={`btn btn--${variant}`} {...props}>
      {children}
    </button>
  );
}
