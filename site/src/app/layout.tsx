import './globals.css';
import { RootProvider } from 'fumadocs-ui/provider';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';
import type { Metadata } from 'next';

const inter = Inter({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    template: '%s | Maedow Arch',
    default: 'Maedow Arch — Standard Modulaire & Découplé',
  },
  description:
    'Standard d’architecture logicielle universel, modulaire et agnostique pour applications web et fullstack modernes.',
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
