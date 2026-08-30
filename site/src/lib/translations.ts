/**
 * Traduction française de l'interface Fumadocs.
 *
 * Le corpus est en français, l'interface l'était restée en anglais : « Search »
 * dans la barre de recherche, « On this page » au-dessus du sommaire. Les clés
 * portent leur contexte entre parenthèses, c'est la convention de Fumadocs, il
 * faut les reprendre telles quelles.
 *
 * Le registre suit celui du corpus : on nomme les choses par ce que le lecteur
 * manipule, à l'infinitif pour les actions.
 */
export const TRANSLATIONS: Partial<Record<string, string>> = {
  displayName: "Français",

  // Recherche
  "Search(search trigger)": "Rechercher",
  "Search(search dialog)": "Rechercher dans la documentation",
  "Open Search(search trigger)(aria-label)": "Ouvrir la recherche",
  "Close Search(search dialog)(aria-label)": "Fermer la recherche",
  "No results found(search dialog)": "Aucun résultat",

  // Sommaire et navigation
  "On this page(table of contents)": "Sur cette page",
  "Table of Contents(inline table of contents)": "Sommaire",
  "No Headings(table of contents)": "Aucun titre",
  "Next Page(pagination)": "Page suivante",
  "Previous Page(pagination)": "Page précédente",
  "Layout Tab(layout tab trigger)": "Section",

  // Barre latérale
  "Show Sidebar(sidebar)": "Afficher la barre latérale",
  "Hide Sidebar(sidebar)": "Masquer la barre latérale",
  "Open Sidebar(sidebar)(aria-label)": "Ouvrir la barre latérale",
  "Close Sidebar(sidebar)(aria-label)": "Fermer la barre latérale",
  "Close Sidebar(aria-label)": "Fermer la barre latérale",
  "Collapse Sidebar(sidebar)(aria-label)": "Replier la barre latérale",
  "Toggle Menu(mobile menu)(aria-label)": "Ouvrir ou fermer le menu",

  // Thème
  "Toggle Theme(theme switcher)(aria-label)": "Changer de thème",
  "Light(theme switcher)(aria-label)": "Clair",
  "Dark(theme switcher)(aria-label)": "Sombre",
  "System(theme switcher)(aria-label)": "Système",

  // Blocs de code et ancres
  "Copy Text(code block)(aria-label)": "Copier",
  "Copied Text(code block)(aria-label)": "Copié",
  "Copy Anchor Link(heading anchor)(aria-label)": "Copier le lien de cette section",
  "Copy Link(accordion)(aria-label)": "Copier le lien",

  // Actions de page
  "Copy Markdown(page actions)": "Copier en Markdown",
  "View as Markdown(page actions)": "Voir en Markdown",
  "Open(page actions)": "Ouvrir",
  "Open in GitHub(page actions)": "Ouvrir dans GitHub",
  "Open in ChatGPT(page actions)": "Ouvrir dans ChatGPT",
  "Open in Claude(page actions)": "Ouvrir dans Claude",
  "Open in Cursor(page actions)": "Ouvrir dans Cursor",
  "Open in Scira AI(page actions)": "Ouvrir dans Scira AI",
  "Read {url}, I want to ask questions about it.(page actions)":
    "Lis {url}, j’ai des questions à son sujet.",
  "Ask AI(AI chat button)": "Demander à l’IA",
  "Edit on GitHub(edit page)": "Modifier sur GitHub",
  "Last updated on(page footer)": "Dernière mise à jour le",

  // Tableaux de types
  "Prop(type table)": "Propriété",
  "Type(type table)": "Type",
  "Default(type table)": "Par défaut",
  "Parameters(type table)": "Paramètres",
  "Returns(type table)": "Retourne",

  // Page introuvable
  "Page Not Found(404 page)": "Page introuvable",
  "Back to Home(404 page)": "Retour à l’accueil",
  "The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.(404 page)":
    "La page que vous cherchez a peut-être été retirée, renommée, ou reste momentanément indisponible.",

  // Bannière et langues
  "Close Banner(banner)(aria-label)": "Fermer la bannière",
  "Choose a language(language switcher)": "Choisir une langue",
  "Choose a language(language switcher)(aria-label)": "Choisir une langue",
};
