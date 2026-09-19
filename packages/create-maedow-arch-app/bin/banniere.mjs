/**
 * La bannière d'ouverture, et le récapitulatif coché de fin.
 *
 * Tout ce qui décide de l'affichage est ici en fonctions pures : elles
 * reçoivent l'environnement au lieu de le lire, ce qui permet de tester chaque
 * cas de dégradation sans terminal.
 */

/*
 * Le mot en police « ANSI Shadow » : des blocs pleins, et une ombre en traits
 * doubles. Écrit en dur plutôt que produit par figlet, qui ajouterait une
 * dépendance pour six lignes qui ne changeront pas.
 */
const LOGO = [
  "███╗   ███╗ █████╗ ███████╗██████╗  ██████╗ ██╗    ██╗",
  "████╗ ████║██╔══██╗██╔════╝██╔══██╗██╔═══██╗██║    ██║",
  "██╔████╔██║███████║█████╗  ██║  ██║██║   ██║██║ █╗ ██║",
  "██║╚██╔╝██║██╔══██║██╔══╝  ██║  ██║██║   ██║██║███╗██║",
  "██║ ╚═╝ ██║██║  ██║███████╗██████╔╝╚██████╔╝╚███╔███╔╝",
  "╚═╝     ╚═╝╚═╝  ╚═╝╚══════╝╚═════╝  ╚═════╝  ╚══╝╚══╝ ",
];

export const LARGEUR_LOGO = 54;

/* Les couleurs du Maedow Design System, et leur approximation en 256 teintes
   pour les terminaux qui n'ont pas les couleurs vraies. */
const TEINTES = {
  givre: { vraie: [0xf5, 0xf5, 0xfa], palette: 255 },
  magenta: { vraie: [0xff, 0x00, 0xe6], palette: 201 },
  brume: { vraie: [0xa8, 0xa0, 0xb8], palette: 146 },
  cyan: { vraie: [0x00, 0xff, 0xff], palette: 51 },
};

/**
 * Ce que le terminal sait afficher.
 *
 * Le logo s'efface quand il gênerait : dans une intégration continue, où il
 * remplirait les journaux de codes illisibles ; hors d'un terminal interactif,
 * par exemple quand la sortie est redirigée vers un fichier ; dans une fenêtre
 * trop étroite, où il se couperait en deux ; et là où l'Unicode n'est pas
 * affiché correctement, où ses blocs deviendraient des points d'interrogation.
 *
 * `NO_COLOR` retire les couleurs sans retirer le logo : sa forme se lit encore
 * sans elles.
 */
export function capacites({
  env = process.env,
  flux = process.stdout,
  plateforme = process.platform,
} = {}) {
  const interactif = Boolean(flux?.isTTY);
  const sansCouleur = "NO_COLOR" in env || env.TERM === "dumb";
  const largeur = flux?.columns ?? 80;

  return {
    couleur: interactif && !sansCouleur ? (vraiesCouleurs(env) ? "vraie" : "palette") : null,
    logo: interactif && !env.CI && unicodeAffiche(env, plateforme) && largeur >= LARGEUR_LOGO + 4,
  };
}

function vraiesCouleurs(env) {
  return (
    env.COLORTERM === "truecolor" ||
    env.COLORTERM === "24bit" ||
    Boolean(env.WT_SESSION) ||
    ["iTerm.app", "vscode", "WezTerm", "ghostty", "Hyper"].includes(env.TERM_PROGRAM)
  );
}

/*
 * La même heuristique que `is-unicode-supported`, dont dépend déjà clack pour
 * ses propres symboles : le logo s'affiche là où les questions s'affichent.
 */
function unicodeAffiche(env, plateforme) {
  if (plateforme !== "win32") return env.TERM !== "linux";
  return (
    Boolean(env.WT_SESSION) ||
    Boolean(env.TERMINUS_SUBLIME) ||
    env.ConEmuTask === "{cmd::Cmder}" ||
    ["Terminus-Sublime", "vscode"].includes(env.TERM_PROGRAM) ||
    ["xterm-256color", "alacritty", "rxvt-unicode", "rxvt-unicode-256color"].includes(env.TERM) ||
    env.TERMINAL_EMULATOR === "JetBrains-JediTerm"
  );
}

/** Colore un texte, ou le rend tel quel si le terminal ne le permet pas. */
export function peindre(texte, teinte, mode) {
  if (mode === null) return texte;
  const t = TEINTES[teinte];
  const code = mode === "vraie" ? `38;2;${t.vraie.join(";")}` : `38;5;${t.palette}`;
  return `\x1b[${code}m${texte}\x1b[0m`;
}

/**
 * Les lignes de la bannière d'ouverture.
 *
 * Blocs en givre, ombre en magenta : les blocs portent la lecture, l'ombre
 * porte la couleur de la marque.
 */
export function banniere({ version, url }, cap) {
  const lignes = [""];

  if (cap.logo) {
    for (const ligne of LOGO) {
      const peinte = [...ligne]
        .map((c) => (c === " " ? c : peindre(c, c === "█" ? "givre" : "magenta", cap.couleur)))
        .join("");
      lignes.push(`  ${peinte}`);
    }
    lignes.push("");
  }

  lignes.push(
    `  ${peindre("Maedow Arch", "magenta", cap.couleur)}  ${peindre(`v${version}`, "givre", cap.couleur)}`
  );
  lignes.push(`  ${peindre(url, "brume", cap.couleur)}`);
  lignes.push("");
  lignes.push(
    `  ${peindre("Une architecture qui tient quand le projet grandit.", "givre", cap.couleur)}`
  );
  lignes.push("");

  return lignes;
}

/**
 * Ce que la génération a réellement produit, une coche par fait.
 *
 * Rien n'est annoncé qui n'ait eu lieu. Un projet Light n'a ni couche domaine
 * ni entrée stricte : il ne reçoit donc ni l'une ni l'autre dans ce
 * récapitulatif. Un écran de fin qui promettrait sept règles à un projet qui
 * n'en charge que quatre serait le défaut que le journal des frictions
 * documente depuis le début, dans l'outil même qui devait l'éviter.
 */
export function recapitulatif({ mode, framework, style }) {
  const nomsFramework = { next: "Next.js", vite: "React sur Vite" };
  const nomsStyle = { css: "CSS natif", tailwind: "Tailwind" };
  const full = mode === "full";

  return [
    {
      titre: `Profil ${mode} · ${nomsFramework[framework] ?? framework} · ${nomsStyle[style] ?? style}`,
    },
    full
      ? { titre: "Les quatre couches", detail: "app/ · features/ · core/ · lib/" }
      : { titre: "Trois couches, sans domaine séparé", detail: "app/ · features/ · lib/" },
    full
      ? {
          titre: "Frontières et typage vérifiés au lint",
          detail: "7 règles sur 9, entrée stricte comprise",
        }
      : {
          titre: "Frontières vérifiées au lint",
          detail: "4 règles sur 9, l'entrée stricte vient avec le profil full",
        },
  ];
}
