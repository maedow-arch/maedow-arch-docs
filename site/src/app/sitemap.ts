import type { MetadataRoute } from "next";
import { source } from "@/lib/source";
import { SITE_URL } from "@/lib/links";

/**
 * Le plan du site, dérivé des pages réelles.
 *
 * Il est construit depuis `source`, la même origine que la navigation : une
 * liste écrite à la main se périmerait au premier document ajouté, et un plan
 * qui annonce une page absente vaut moins que pas de plan du tout.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = source.getPages().map((page) => ({
    url: `${SITE_URL}${page.url}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1,
    },
    ...pages,
  ];
}
