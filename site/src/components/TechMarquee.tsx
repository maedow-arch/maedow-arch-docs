/**
 * Le bandeau des technologies prises en charge.
 *
 * Ce n'est pas un ornement. L'agnosticisme d'infrastructure est un pilier du
 * corpus, et il s'énonce mal : « le domaine ne dépend de rien de tout cela »
 * demande un effort d'imagination. Le montrer défiler le rend évident, et
 * l'affirmation reste écrite à côté pour ceux qui la liront.
 *
 * Deux rangées en sens opposés, parce qu'une seule se lit comme une liste et
 * deux se lisent comme un flux. Le survol arrête le mouvement : personne ne
 * devrait courir après un nom qu'il cherche à lire.
 */
const SOCLE = ["TypeScript", "React", "Next.js", "Vite", "Tailwind CSS", "Vitest", "ESLint", "Zod"];

const INFRASTRUCTURE = [
  "PostgreSQL",
  "Drizzle",
  "Prisma",
  "Supabase",
  "Firebase",
  "IndexedDB",
  "BetterAuth",
  "Auth.js",
  "JWT",
  "REST",
];

function Rangee({ items, sens }: { items: string[]; sens: "gauche" | "droite" }) {
  return (
    <div className="maedow-marquee flex gap-3 py-1.5">
      {/* La liste est écrite deux fois : la seconde prend la place de la
          première quand celle-ci sort du cadre, et la boucle ne se voit pas. */}
      {[0, 1].map((copie) => (
        <div
          key={copie}
          aria-hidden={copie === 1}
          className={`flex shrink-0 gap-3 ${
            sens === "gauche" ? "maedow-marquee-gauche" : "maedow-marquee-droite"
          }`}
        >
          {items.map((nom) => (
            <span
              key={nom}
              className="rounded-full border border-fd-border bg-fd-card px-4 py-2 text-sm font-medium whitespace-nowrap text-fd-muted-foreground"
            >
              {nom}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

export function TechMarquee() {
  return (
    <section className="border-y border-fd-border bg-fd-muted/20 py-10">
      <div className="mx-auto max-w-6xl px-6">
        <p className="mb-6 text-center text-sm text-fd-muted-foreground">
          L&rsquo;architecture ne bouge pas quand ceci change.{" "}
          <span className="text-fd-foreground">
            Le domaine ignore la base, l&rsquo;authentification et le framework.
          </span>
        </p>
      </div>

      {/* Le fondu sur les bords évite la coupure nette, qui donne à un
          défilement l'air d'un débordement mal maîtrisé. */}
      <div className="maedow-marquee-fondu flex flex-col gap-3 overflow-hidden">
        <Rangee items={SOCLE} sens="gauche" />
        <Rangee items={INFRASTRUCTURE} sens="droite" />
      </div>
    </section>
  );
}
