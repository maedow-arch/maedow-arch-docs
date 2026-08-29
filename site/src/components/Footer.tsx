import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { REPO_URL, NPM_CLI_URL, NPM_ESLINT_URL } from '@/lib/links';

const COLUMNS = [
  {
    heading: 'Documentation',
    links: [
      { label: 'Introduction', href: '/docs' },
      { label: 'Blueprint & 4 Couches', href: '/docs/architecture' },
      { label: 'Modélisation', href: '/docs/models' },
      { label: 'Conventions', href: '/docs/conventions' },
    ],
  },
  {
    heading: 'Outillage',
    links: [
      { label: 'create-maedow-arch-app', href: NPM_CLI_URL },
      { label: 'eslint-config-maedow-arch', href: NPM_ESLINT_URL },
    ],
  },
  {
    heading: 'Projet',
    links: [
      { label: 'Dépôt GitHub', href: REPO_URL },
      { label: 'Changelog', href: `${REPO_URL}/blob/main/CHANGELOG.md` },
      { label: 'Signaler une friction', href: `${REPO_URL}/issues` },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative border-t border-fd-border mt-auto">
      <div className="absolute inset-0 maedow-dots opacity-40 pointer-events-none" aria-hidden />
      <div className="relative max-w-6xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2 md:col-span-1">
          <Link href="/" className="text-fd-foreground hover:opacity-80 transition-opacity">
            <Logo />
          </Link>
          <p className="mt-4 text-sm text-fd-muted-foreground leading-relaxed max-w-xs">
            Un standard d’architecture logicielle modulaire, découplé et agnostique de
            l’infrastructure.
          </p>
          <p className="mt-6 text-xs text-fd-muted-foreground">
            © {new Date().getFullYear()} Maedow Arch — Licence MIT
          </p>
        </div>

        {COLUMNS.map((column) => (
          <div key={column.heading}>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-fd-foreground mb-4">
              {column.heading}
            </h2>
            <ul className="space-y-2.5">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-fd-muted-foreground hover:text-fd-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}
