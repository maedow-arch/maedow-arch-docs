"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { LogoMark } from "@/components/Logo";

/**
 * Une commande shell avec bouton copier.
 *
 * `navigator.clipboard` n'existe pas partout (contexte non sécurisé, permission
 * refusée) : en cas d'échec on ne change pas l'état, le lecteur voit que rien
 * ne s'est passé et peut sélectionner le texte à la main.
 *
 * Deux tons. `surface` suit le thème et s'intègre au corps de page. `terminal`
 * reste sombre dans les deux thèmes, parce qu'un terminal est sombre : c'est le
 * seul élément de la page qui montre l'outil plutôt que la documentation, et il
 * doit se lire comme tel dès le premier coup d'œil.
 */
export function CopyCommand({
  command,
  compact = false,
  tone = "surface",
}: {
  command: string;
  compact?: boolean;
  tone?: "surface" | "terminal";
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Presse-papiers indisponible : on laisse l'utilisateur sélectionner.
    }
  }

  const terminal = tone === "terminal";

  return (
    <div
      className={
        terminal
          ? "flex items-center gap-3 rounded-xl border border-maedow-trait bg-maedow-espace px-5 py-4 font-snippet text-sm shadow-lg shadow-black/20"
          : `flex items-center justify-between gap-3 rounded-lg border border-fd-border bg-fd-muted/40 font-mono ${
              compact ? "px-3 py-2 text-xs" : "px-5 py-4 text-sm"
            }`
      }
    >
      {terminal ? (
        <>
          <LogoMark className="size-4 text-maedow-magenta" />
          {/* `min-w-0` laisse le code rétrécir sous sa largeur intrinsèque :
              sans lui, un élément de flex refuse de passer en dessous et le
              défilement horizontal déclaré ici ne s'active jamais. */}
          <code className="min-w-0 overflow-x-auto whitespace-nowrap text-maedow-givre">
            <span className="select-none text-maedow-brume">~ </span>
            {command}
          </code>
        </>
      ) : (
        <code className="min-w-0 overflow-x-auto whitespace-nowrap text-fd-foreground">
          <span className="select-none text-fd-muted-foreground">$ </span>
          {command}
        </code>
      )}
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Commande copiée" : `Copier : ${command}`}
        className={
          terminal
            ? "ms-auto shrink-0 rounded-md p-1.5 text-maedow-brume transition-colors hover:bg-white/10 hover:text-maedow-givre"
            : "shrink-0 rounded-md p-1.5 text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-foreground"
        }
      >
        {copied ? (
          <Check className={`size-4 ${terminal ? "text-maedow-magenta" : "text-fd-primary"}`} />
        ) : (
          <Copy className="size-4" />
        )}
      </button>
    </div>
  );
}
