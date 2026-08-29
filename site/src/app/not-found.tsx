import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="flex-1 flex flex-col justify-center items-center px-6 py-24 text-center">
      <p className="text-sm font-mono text-fd-muted-foreground mb-4">404</p>
      <h1 className="text-2xl sm:text-3xl font-bold text-fd-foreground mb-3">
        Cette page n’existe pas
      </h1>
      <p className="text-fd-muted-foreground max-w-md mb-8">
        Le lien est peut-être périmé, ou la section a été renommée depuis.
      </p>
      <Link
        href="/docs"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-fd-primary text-fd-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour à la documentation
      </Link>
    </main>
  );
}
