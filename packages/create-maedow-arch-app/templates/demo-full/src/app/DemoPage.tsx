import { CounterScreen } from "@/features/counter/Screen";
import { Panel } from "@/features/_shared/Panel";

/**
 * La couche `app/` assemble, et c'est tout.
 *
 * Elle a le droit de tout importer, mais ne contient aucune logique : ni règle
 * métier, ni calcul d'affichage. Son rôle est de câbler les features à une
 * route.
 */
const LAYERS = [
  {
    dir: "app/",
    role: "Point d'entrée et assemblage",
    detail: "Cette page. Elle importe une feature et la place dans une route.",
  },
  {
    dir: "features/counter/",
    role: "Écran, hook et ViewModel",
    detail: "Traduit le domaine en quelque chose d'affichable. Ne décide d'aucune règle.",
  },
  {
    dir: "features/_shared/",
    role: "Composite transverse",
    detail: "Panel, réutilisable par plusieurs features, sans en connaître aucune.",
  },
  {
    dir: "core/counter/",
    role: "Domaine métier",
    detail: "Les bornes, le pas, les refus typés. Zéro dépendance à React.",
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

export function DemoPage() {
  return (
    <main className="page">
      <header className="page__head">
        <p className="page__eyebrow">Maedow Arch</p>
        <h1 className="page__title">__PROJECT_NAME__</h1>
        <p className="page__lead">
          Une démonstration volontairement minuscule. Le compteur ci-dessous a des bornes, et ces
          bornes sont une règle métier : elle vit dans <code>core/</code>, elle retourne un refus
          typé, et elle se teste sans monter le moindre composant.
        </p>
      </header>

      <CounterScreen />

      <Panel
        title="Où vit quoi"
        hint="Chaque fichier de cette démonstration occupe une couche, et une seule."
      >
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

      <Panel title="Vérifier que les frontières tiennent">
        <p className="prose">
          Le flux de dépendance ne descend que dans un sens. Pour le prouver, tentez l&apos;inverse
          : ajoutez dans <code>src/core/counter/rules.ts</code> un import venu d&apos;une feature,
          puis lancez le lint.
        </p>
        <pre className="code">
          <code>{`import { CounterScreen } from "@/features/counter/Screen";`}</code>
        </pre>
        <p className="prose">Le lint doit échouer, avec le motif exact :</p>
        <pre className="code code--error">
          <code>Maedow Arch : core ne peut pas importer feature.</code>
        </pre>
        <p className="prose prose--muted">
          Un lint qui reste vert sur cet essai signale une configuration inactive, pas une
          architecture saine.
        </p>
      </Panel>

      <footer className="page__foot">
        <a href="https://maedow-arch-docs.vercel.app" target="_blank" rel="noreferrer">
          Documentation de Maedow Arch
        </a>
      </footer>
    </main>
  );
}
