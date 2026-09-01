/** Liens externes du projet, définis une seule fois. */

/**
 * L'adresse publique du site.
 *
 * Elle sert de base aux métadonnées, au plan du site et aux règles
 * d'indexation. Sans elle, Next construit des URL relatives dans les balises
 * Open Graph, et un partage sur un réseau social ne trouve pas l'image.
 *
 * La variable d'environnement de Vercel prend le dessus sur les
 * prévisualisations, pour qu'une branche ne s'annonce pas sous le domaine de
 * production.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL
  ? `https://${process.env.NEXT_PUBLIC_SITE_URL}`
  : process.env.VERCEL_ENV === "production"
    ? "https://maedow-arch-docs.vercel.app"
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://maedow-arch-docs.vercel.app";
export const REPO_URL = "https://github.com/maedow-arch/maedow-arch-docs";
export const NPM_CLI_URL = "https://www.npmjs.com/package/create-maedow-arch-app";
export const NPM_ESLINT_URL = "https://www.npmjs.com/package/eslint-config-maedow-arch";
export const NPM_AUDIT_URL = "https://www.npmjs.com/package/maedow-arch";
