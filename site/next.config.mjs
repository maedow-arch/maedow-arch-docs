import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  // Le dépôt est un monorepo : sans ça, Next remonte au lockfile de la racine
  // et se trompe de répertoire de travail pour le traçage des fichiers.
  outputFileTracingRoot: import.meta.dirname,
};

export default withMDX(config);
