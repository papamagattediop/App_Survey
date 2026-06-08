import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ACCES : Enquete Electrification Rurale',
  description: 'Tableau de bord superviseur, suivi des collectes terrain',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
