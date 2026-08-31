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

/*
 * La liste est répétée six fois, et la piste glisse exactement de sa moitié.
 * Les deux nombres sont liés : à mi-course, la quatrième copie occupe la place
 * qu'occupait la première, et la boucle se referme sans que rien ne saute.
 *
 * Six plutôt que deux, parce que deux copies ne couvrent pas un écran large.
 * C'est ce qui laissait un vide derrière la liste : elle sortait par la gauche
 * avant que la suivante n'ait de quoi prendre le relais à droite.
 *
 * L'espacement est porté par chaque copie, jamais entre elles. Un intervalle
 * posé sur la piste ne serait pas compris dans la moitié parcourue, et le
 * raccord se décalerait d'un demi-espace à chaque tour.
 */
const COPIES = 6;

function Rangee({ items, sens }: { items: string[]; sens: "gauche" | "droite" }) {
  return (
    <div className="maedow-marquee">
      <div
        className={`flex w-max ${
          sens === "gauche" ? "maedow-marquee-gauche" : "maedow-marquee-droite"
        }`}
      >
        {Array.from({ length: COPIES }, (_, copie) => (
          <div
            key={copie}
            // Une seule copie est lue à voix haute, les autres sont un décor.
            aria-hidden={copie > 0}
            className="flex shrink-0 gap-3 pe-3"
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
