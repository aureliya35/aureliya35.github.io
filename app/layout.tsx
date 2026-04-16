import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Vercel by Auréliya', description: 'Private AI operating system for Auréliya workflows.' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
