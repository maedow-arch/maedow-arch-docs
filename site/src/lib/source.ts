import { docs, meta } from '@/.source';
import { createMDXSource } from 'fumadocs-mdx';
import { loader, type VirtualFile } from 'fumadocs-core/source';

/**
 * Raccord entre fumadocs-mdx et fumadocs-core.
 *
 * `createMDXSource` (fumadocs-mdx 11.10) renvoie `{ files: () => [...] }` —
 * une fonction — tandis que le `loader()` de fumadocs-core 15.8 fait
 * `files.map(...)` et attend donc un tableau. Les deux paquets ont dérivé sous
 * leurs plages `^` : c'est ce décalage qui empêchait le site de builder.
 *
 * On résout la fonction sur place plutôt que de reconstruire un objet, pour ne
 * pas perdre le typage générique de la collection (sans quoi `page.data` se
 * dégrade en `PageData` et `page.data.body` n'existe plus).
 *
 * À retirer lors du passage à fumadocs-core / fumadocs-ui 16.x + fumadocs-mdx
 * 15.x, où `loader()` accepte nativement la forme fonction.
 */
const mdxSource = createMDXSource(docs, meta);

const rawFiles: unknown = mdxSource.files;
if (typeof rawFiles === 'function') {
  (mdxSource as { files: VirtualFile[] }).files = (rawFiles as () => VirtualFile[])();
}

export const source = loader({
  baseUrl: '/docs',
  source: mdxSource,
});
