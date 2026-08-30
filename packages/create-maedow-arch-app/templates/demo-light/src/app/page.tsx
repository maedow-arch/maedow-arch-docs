import { CounterScreen } from "@/features/counter/Screen";
import { Panel } from "@/features/_shared/Panel";

/**
 * Mode Light. La couche `app/` assemble, comme en Mode Full : c'est le reste
 * qui change, pas ce fichier.
 */
const LAYERS = [
  {
    dir: "app/",
    role: "Point d'entrée et assemblage",
    detail: "Cette page. Identique en Light et en Full.",
  },
  {
    dir: "features/counter/",
    role: "Écran, hook et règles",
    detail: "En Light, rules.ts vit ici. C'est la seule différence de structure.",
  },
  {
    dir: "features/_shared/",
    role: "Composite transverse",
    detail: "Panel, réutilisable par plusieurs features, sans en connaître aucune.",
  },
  {
    dir: "components/ui/",
    role: "Présentationnel pur",
    detail: "Button, Gauge. Une apparence et un clic, rien de métier.",
  },
  {
    dir: "lib/",
    role: "Utilitaires",
    detail: "Formatage. Aucune dépendance, dans aucun sens.",
  },
];

export default function HomePage() {
  return (
    <main className="page">
      <header className="page__head">
        <p className="page__eyebrow">Maedow Arch Light</p>
        <h1 className="page__title">__PROJECT_NAME__</h1>
        <p className="page__lead">
          Ce projet suit le profil Light : pas de couche <code>core/</code> séparée, la
          logique reste dans la feature. C&apos;est ce que recommande le corpus pour un
          site vitrine, un prototype ou un MVP, quand la logique métier est faible.
        </p>
      </header>

      <CounterScreen />

      <Panel title="Où vit quoi">
        <ul className="layers">
          {LAYERS.map((layer) => (
            <li key={layer.dir} className="layers__item">
              <code className="layers__dir">{layer.dir}</code>
              <span className="layers__role">{layer.role}</span>
              <span className="layers__detail">{layer.detail}</span>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel
        title="Quand basculer en Mode Full"
        hint="La bascule se fait domaine par domaine, jamais en un refactor global."
      >
        <p className="prose">Trois signaux, et un seul suffit :</p>
        <ul className="prose">
          <li>Une deuxième feature a besoin des mêmes règles.</li>
          <li>Il devient utile de distinguer les motifs de refus les uns des autres.</li>
          <li>On veut tester le métier sans monter l&apos;écran.</li>
        </ul>
        <p className="prose">
          Alors <code>features/counter/rules.ts</code> part dans{" "}
          <code>src/core/counter/</code>, les transitions retournent un{" "}
          <code>Result</code>, et la feature ne garde que la traduction pour
          l&apos;affichage.
        </p>
        <p className="prose">Pour voir à quoi ressemble l&apos;étape suivante :</p>
        <pre className="code">
          <code>npx create-maedow-arch-app comparaison --mode full</code>
        </pre>
        <p className="prose prose--muted">
          Le même compteur, avec un domaine isolé et neuf tests qui tournent sans React.
        </p>
      </Panel>

      <Panel title="Les frontières tiennent, même en Light">
        <p className="prose">
          Une feature n&apos;importe jamais une autre feature, et{" "}
          <code>components/</code> reste présentationnel. Ces règles valent dans les deux
          profils. Pour le vérifier, tentez un import interdit puis lancez le lint.
        </p>
        <pre className="code code--error">
          <code>Maedow Arch : feature ne peut pas importer feature.</code>
        </pre>
      </Panel>

      <footer className="page__foot">
        <a href="https://maedow-arch-docs.vercel.app" target="_blank" rel="noreferrer">
          Documentation de Maedow Arch
        </a>
      </footer>
    </main>
  );
}
