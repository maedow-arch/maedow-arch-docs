import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * La règle « zéro modèle dans le JSX », montrée sur un cas.
 *
 * C'est la règle du corpus qui change le plus de choses au quotidien, et la
 * plus facile à mal comprendre tant qu'on ne l'a pas vue appliquée. Un exemple
 * court en dit plus que le principe : à gauche une règle de gestion écrite dans
 * un composant, à droite la même règle là où elle se teste et se réutilise.
 *
 * L'exemple est volontairement banal. Une remise par palier n'impressionne
 * personne, et c'est le but : le lecteur doit reconnaître son propre code.
 */
function Volet({
  titre,
  legende,
  ton,
  fichier,
  children,
}: {
  titre: string;
  legende: string;
  ton: "refus" | "tenue";
  fichier: string;
  children: React.ReactNode;
}) {
  const refus = ton === "refus";

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-2xl border bg-fd-card ${
        refus ? "border-fd-border" : "border-fd-primary/40"
      }`}
    >
      <div className="border-b border-fd-border px-6 py-4">
        <p
          className={`font-heading text-base font-bold ${
            refus ? "text-fd-muted-foreground" : "text-fd-primary"
          }`}
        >
          {titre}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-fd-muted-foreground">{legende}</p>
      </div>

      <div className="flex-1 overflow-x-auto px-6 py-5">
        <p className="mb-3 text-xs text-fd-muted-foreground">{fichier}</p>
        <pre className="text-xs leading-relaxed">
          <code className="text-fd-foreground">{children}</code>
        </pre>
      </div>
    </div>
  );
}

export function AvantApres() {
  return (
    <section className="mx-auto max-w-6xl border-t border-fd-border px-6 py-20">
      <h2 className="font-heading mb-3 text-3xl font-bold tracking-tight text-balance text-fd-foreground sm:text-4xl">
        Une règle de gestion n’a rien à faire dans un composant
      </h2>
      <p className="mb-12 max-w-2xl text-lg text-pretty text-fd-muted-foreground">
        Le seuil de remise ci-dessous est une décision de l’entreprise. À gauche, il faut monter un
        arbre React pour la tester. À droite, c’est une fonction.
      </p>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Volet
          titre="Sans la règle"
          legende="Le métier est pris dans le rendu. Pour le vérifier, il faut simuler une interface."
          ton="refus"
          fichier="Facture.tsx"
        >
          {`export function Facture({ lignes }) {
  const total = lignes.reduce(
    (s, l) => s + l.prix * l.qte,
    0,
  );
  const remise = total > 500 ? total * 0.1 : 0;

  return <p>{total - remise} €</p>;
}`}
        </Volet>

        <Volet
          titre="Avec la règle"
          legende="Le métier vit en TypeScript pur. Il se teste sans navigateur et se réutilise côté serveur."
          ton="tenue"
          fichier="core/facturation/service.ts, puis features/facturation/Facture.tsx"
        >
          {`export function montantARegler(lignes: Ligne[]) {
  const total = lignes.reduce(
    (s, l) => s + l.prix * l.qte,
    0,
  );
  return total - remiseDePalier(total);
}

// Le composant ne fait plus que montrer.
<p>{montantARegler(lignes)} €</p>`}
        </Volet>
      </div>

      <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-fd-border bg-fd-muted/30 p-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-relaxed text-fd-muted-foreground">
          Le jour où le seuil passe à 800, une seule ligne change, et un test le prouve en
          millisecondes.
        </p>
        <Link
          href="/docs/models"
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-fd-primary hover:underline"
        >
          Les cinq formes de données
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </section>
  );
}
