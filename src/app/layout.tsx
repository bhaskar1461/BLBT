import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://blbt-auhi.vercel.app'),
  title: 'The Honest Terminal — The Only Trading Platform That Profits From You Not Losing Money | Celsius Network',
  description:
    'Free forever. Faster than everything. We show you what the herd is doing — and what happens to herds. Cryptographically verified paper trading, unbiased sentiment, and public figure accountability.',
  openGraph: {
    title: 'The Honest Terminal | Celsius Network',
    description:
      'The only trading platform that profits from you not losing money. Free forever. Faster than everything.',
    images: [
      {
        url: '/api/og/reality?period=30',
        width: 1200,
        height: 630,
        alt: 'The Honest Terminal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Honest Terminal | Celsius Network',
    description:
      'The only trading platform that profits from you not losing money. Free forever. Faster than everything.',
    images: ['/api/og/reality?period=30'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-canvas text-main font-sans antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
