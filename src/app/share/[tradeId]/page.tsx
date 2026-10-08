import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { serverPaperTrading } from '@/lib/paperTradingService';
import { ShareCardViewer } from './ShareCardViewer';

interface SharePageProps {
  params: { tradeId: string };
}

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const { tradeId } = params;
  const trade = serverPaperTrading.getClosedTrade(tradeId);

  const symbol = trade?.symbol || 'BTCUSDT';
  const trader = trade?.userDisplayName || 'CryptoDegen99';
  const pnlPct = trade ? `${trade.realizedPnlPct >= 0 ? '+' : ''}${trade.realizedPnlPct}%` : '+16.38%';
  const title = `${trader} closed ${pnlPct} on ${symbol} | Celsius Network`;
  const description = `Verified paper trading execution on Celsius Network. Real-time Binance streams & institutional charting.`;
  const ogImage = `/api/og/trade/${tradeId}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${symbol} Trade Card`,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export default function ShareTradePage({ params }: SharePageProps) {
  const { tradeId } = params;
  const trade = serverPaperTrading.getClosedTrade(tradeId) || {
    id: tradeId,
    userId: 'usr_celsius_demo',
    userDisplayName: 'CryptoDegen99',
    symbol: 'BTCUSDT',
    side: 'long' as const,
    entryPrice: 62450,
    exitPrice: 65120,
    quantity: 0.5,
    margin: 31225,
    realizedPnl: 1335,
    realizedPnlPct: 4.27,
    fee: 32.56,
    durationSeconds: 14400,
    durationFormatted: '4h 00m',
    openedAt: new Date(Date.now() - 14400000).toISOString(),
    closedAt: new Date().toISOString(),
  };

  return (
    <main className="min-h-screen bg-canvas text-main flex flex-col items-center justify-between p-4 sm:p-8 font-sans selection:bg-bull/30">
      {/* Top Navbar */}
      <header className="w-full max-w-4xl flex items-center justify-between py-4 border-b border-subtle">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-bull to-primary flex items-center justify-center font-extrabold text-sm text-canvas shadow-lg shadow-bull/20">
            °C
          </div>
          <span className="font-bold text-lg tracking-tight text-white">
            CELSIUS <span className="text-primary text-xs font-mono font-medium ml-1">TERMINAL</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/leaderboard"
            className="text-xs font-semibold text-faint hover:text-white transition-colors flex items-center gap-1.5"
          >
            <span>🏆 Leaderboard</span>
          </Link>
          <Link
            href="/"
            className="btn btn-primary text-xs px-3.5 py-1.5 rounded-md font-bold"
          >
            Open Terminal
          </Link>
        </div>
      </header>

      {/* Main Trade Showcase */}
      <section className="w-full max-w-4xl flex flex-col items-center my-8">
        <ShareCardViewer trade={trade} tradeId={tradeId} />
      </section>

      {/* Footer */}
      <footer className="w-full max-w-4xl text-center py-6 border-t border-subtle text-xs text-faint">
        Celsius Network • Real-time Binance streams • 10,000 USDT Virtual Paper Trading
      </footer>
    </main>
  );
}
