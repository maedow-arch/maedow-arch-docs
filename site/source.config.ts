import { defineDocs, defineConfig } from "fumadocs-mdx/config";
import type { Root } from "mdast";

/*
 * Les blocs ```mermaid du corpus deviennent un composant plutôt qu'un pavé de
 * texte coloré. Le même bloc reste un schéma sur GitHub, qui les rend
 * nativement : la source de vérité n'a donc pas à connaître ce site.
 *
 * Fumadocs fournit bien un `remarkMdxMermaid`, mais il construit son nœud sans
 * position dans le fichier, et la suite du pipeline s'y casse. On refait donc
 * la substitution en reprenant la position du bloc remplacé.
 */
function remarkMermaid() {
  return (arbre: Root) => {
    const parcourir = (noeud: { children?: unknown[] }) => {
      if (!Array.isArray(noeud.children)) return;

      noeud.children.forEach((enfant, index) => {
        const bloc = enfant as {
          type?: string;
          lang?: string;
          value?: string;
          position?: unknown;
          children?: unknown[];
        };

        if (bloc.type === "code" && bloc.lang === "mermaid" && bloc.value) {
          noeud.children![index] = {
            type: "mdxJsxFlowElement",
            name: "Mermaid",
            attributes: [{ type: "mdxJsxAttribute", name: "chart", value: bloc.value.trim() }],
            children: [],
            position: bloc.position,
          };
          return;
        }

        parcourir(bloc);
      });
    };

    parcourir(arbre);
  };
}

export const { docs, meta } = defineDocs({
  dir: "content/docs",
});

export default defineConfig({
  mdxOptions: {
    remarkPlugins: (plugins) => [...plugins, remarkMermaid],
  },
});
