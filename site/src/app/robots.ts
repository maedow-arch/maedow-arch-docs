import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/links";

/**
 * Les règles d'indexation.
 *
 * Tout est indexable : ce site n'a ni espace privé ni page technique à cacher.
 * Le fichier existe pour déclarer le plan du site, que les moteurs cherchent
 * ici en premier, et pour que l'absence de règles soit un choix écrit plutôt
 * qu'un oubli.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
