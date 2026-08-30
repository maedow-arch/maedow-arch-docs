import { docs, meta } from "@/.source/server";
import { toFumadocsSource } from "fumadocs-mdx/runtime/server";
import { loader } from "fumadocs-core/source";

/**
 * Les collections sont importées depuis l'entrée serveur générée par
 * fumadocs-mdx, puis converties en source pour le loader.
 *
 * Ce fichier portait auparavant un raccord manuel : `createMDXSource` renvoyait
 * une fonction là où le `loader()` de fumadocs-core attendait un tableau, les
 * deux paquets ayant dérivé sous leurs plages de versions. Voir F-006.
 *
 * Les versions restent épinglées exactement, pour que cette dérive ne se
 * reproduise pas.
 */
export const source = loader({
  baseUrl: "/docs",
  source: toFumadocsSource(docs, meta),
});
