import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AppShell } from '../components/layout/app-shell';
import { FamilyProvider } from '../components/layout/family-context';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: {
    default: 'Family Hierarchy | Preserve Your Legacy',
    template: '%s | Family Hierarchy',
  },
  description:
    'Organize family members, relationships, generations, events, and important dates in one elegant genealogy dashboard.',
  keywords: [
    'family hierarchy',
    'genealogy dashboard',
    'family tree',
    'family relationships',
    'family records',
    'ancestry management',
  ],
  applicationName: 'Family Hierarchy',
  authors: [{ name: 'Family Hierarchy' }],
  openGraph: {
    title: 'Family Hierarchy',
    description:
      'Explore your family structure, preserve memories, and keep your family legacy connected in one place.',
    url: 'http://localhost:3000',
    siteName: 'Family Hierarchy',
    type: 'website',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Family Hierarchy preview image',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Family Hierarchy',
    description:
      'Keep your family story, relationships, and important milestones organized in one elegant dashboard.',
    images: ['/og-image.svg'],
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-slate-100 font-sans text-slate-900`}>
        <FamilyProvider>
          <AppShell>{children}</AppShell>
        </FamilyProvider>
      </body>
    </html>
  );
}
