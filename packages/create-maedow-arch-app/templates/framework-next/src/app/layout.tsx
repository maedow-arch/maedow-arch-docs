import type { ReactNode } from "react";

export const metadata = {
  title: "__PROJECT_NAME__",
  description: "Application suivant Maedow Arch",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
