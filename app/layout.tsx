import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://ixux.com'),
  title: 'I × UX — Experience Multiplies',
  description: 'An open idea for curious humans who believe thoughtful design multiplies human potential.',
  applicationName: 'I × UX',
  openGraph: {
    title: 'I × UX — Experience Multiplies',
    description: 'An open idea for curious humans who believe thoughtful design multiplies human potential.',
    siteName: 'I × UX',
    type: 'website',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'I × UX — Experience Multiplies' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'I × UX — Experience Multiplies',
    description: 'A shared symbol for curious humans.',
    images: ['/og.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/favicon.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#0a0a0c',
  colorScheme: 'dark',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
