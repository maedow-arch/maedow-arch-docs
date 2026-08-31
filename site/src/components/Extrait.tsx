import { codeToHtml } from "shiki";

/**
 * Un extrait de code coloré, hors de la documentation.
 *
 * Les pages du corpus passent par Shiki via Fumadocs. Les extraits écrits à la
 * main dans la page d'accueil n'en bénéficiaient pas : ils s'affichaient d'une
 * seule encre, et le lecteur devait décoder ce qu'il aurait dû reconnaître.
 *
 * Les deux thèmes sont produits en même temps. Shiki dépose alors sur chaque
 * fragment une couleur par thème, sous forme de variable, et la feuille de
 * style choisit laquelle s'applique : la bascule clair/sombre ne demande donc
 * ni second rendu ni JavaScript.
 *
 * Le composant est asynchrone et rendu au build : la coloration ne coûte rien
 * au visiteur.
 */
export async function Extrait({
  code,
  langage = "tsx",
  className = "",
}: {
  code: string;
  langage?: string;
  className?: string;
}) {
  const html = await codeToHtml(code, {
    lang: langage,
    themes: { light: "one-light", dark: "one-dark-pro" },
    defaultColor: false,
  });

  return (
    <div
      className={`maedow-extrait text-xs leading-relaxed ${className}`}
      // Le HTML vient de Shiki, qui l'a produit à partir d'une chaîne écrite
      // dans ce dépôt : aucune donnée extérieure n'entre ici.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
