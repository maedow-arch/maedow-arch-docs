'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

/**
 * Une commande shell avec bouton copier.
 *
 * `navigator.clipboard` n'existe pas partout (contexte non sécurisé, permission
 * refusée) : en cas d'échec on ne change pas l'état, le lecteur voit que rien
 * ne s'est passé et peut sélectionner le texte à la main.
 */
export function CopyCommand({
  command,
  compact = false,
}: {
  command: string;
  compact?: boolean;
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

  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-lg border border-fd-border bg-fd-muted/40 font-mono ${
        compact ? 'px-3 py-2 text-xs' : 'px-5 py-4 text-sm'
      }`}
    >
      <code className="text-fd-foreground overflow-x-auto whitespace-nowrap">
        <span className="text-fd-muted-foreground select-none">$ </span>
        {command}
      </code>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? 'Commande copiée' : `Copier : ${command}`}
        className="shrink-0 p-1.5 rounded-md text-fd-muted-foreground hover:text-fd-foreground hover:bg-fd-accent transition-colors"
      >
        {copied ? <Check className="w-4 h-4 text-fd-primary" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
}
