/**
 * À quelle couche appartient un fichier, et quelle couche a le droit d'importer
 * quelle autre.
 *
 * C'est la seule connaissance que l'audit a du standard, et elle vient du
 * registre : `rules.md`, codes MA-001 à MA-003. Rien n'est inventé ici, les
 * autorisations reproduisent celles de `eslint-config-maedow-arch`.
 *
 * Le classement se fait sur le chemin, jamais sur le contenu. Un audit doit
 * pouvoir tourner sur un projet qu'on n'a pas installé et qui ne compile pas :
 * c'est ce qui le rend utilisable avant d'avoir décidé d'adopter le standard.
 */

/** Les segments reconnus, du plus spécifique au plus général. L'ordre compte. */
const SEGMENTS = [
  { couche: "shared-feature", motif: /(^|\/)features\/_shared(\/|$)/ },
  { couche: "feature", motif: /(^|\/)features\/([^/]+)(\/|$)/, capture: 2 },
  { couche: "app", motif: /(^|\/)app(\/|$)/ },
  { couche: "core", motif: /(^|\/)core(\/|$)/ },
  { couche: "components", motif: /(^|\/)components(\/|$)/ },
  { couche: "lib", motif: /(^|\/)lib(\/|$)/ },
];

/**
 * Ce que chaque couche a le droit d'importer.
 *
 * Reproduit à l'identique les politiques de la configuration ESLint. Une
 * divergence entre les deux ferait dire à l'audit autre chose que ce que dira
 * le lint une fois le standard adopté, ce qui est le pire défaut possible pour
 * un outil de migration.
 */
const AUTORISE = {
  app: ["app", "feature", "shared-feature", "core", "components", "lib"],
  feature: ["shared-feature", "core", "components", "lib"],
  "shared-feature": ["shared-feature", "core", "components", "lib"],
  core: ["core", "lib"],
  components: ["components", "lib"],
  lib: ["lib"],
};

/**
 * Classe un chemin dans sa couche.
 *
 * @returns `{ couche, feature }` ou `null` si le fichier n'appartient à aucune
 * couche connue, ce qui est le cas le plus fréquent sur un projet qui n'a pas
 * encore adopté le standard. Un fichier non classé n'est pas une violation :
 * il est hors périmètre, et le rapport le dit.
 */
export function classer(chemin) {
  const normalise = chemin.replaceAll("\\", "/");

  for (const { couche, motif, capture } of SEGMENTS) {
    const trouve = normalise.match(motif);
    if (trouve) {
      return { couche, feature: capture ? trouve[capture] : null };
    }
  }

  return null;
}

/** Un import de `depuis` vers `vers` respecte-t-il le flux de dépendance ? */
export function importAutorise(depuis, vers) {
  if (depuis === null || vers === null) return true;

  // Une feature s'importe elle-même librement : ses fichiers internes ne sont
  // pas des dépendances entre features.
  if (depuis.couche === "feature" && vers.couche === "feature") {
    return depuis.feature === vers.feature;
  }

  return (AUTORISE[depuis.couche] ?? []).includes(vers.couche);
}

/**
 * Le code du registre que viole cet import.
 *
 * Les trois codes se distinguent par ce qu'ils protègent, et non par leur
 * gravité : MA-002 et MA-003 sont des cas particuliers du flux que MA-001
 * décrit, et ils portent un code à eux parce que leur correction n'est pas la
 * même.
 */
export function codePour(depuis, vers) {
  if (depuis.couche === "feature" && vers.couche === "feature") return "MA-002";
  if (depuis.couche === "shared-feature" && vers.couche === "feature") return "MA-003";
  return "MA-001";
}
