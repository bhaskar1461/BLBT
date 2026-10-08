import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { serverPaperTrading } from '@/lib/paperTradingService';
import { ShareStatsViewer } from './ShareStatsViewer';

interface StatsSharePageProps {
  params: { userId: string };
}

export async function generateMetadata({ params }: StatsSharePageProps): Promise<Metadata> {
  const { userId } = params;
  const leaderboard = serverPaperTrading.getLeaderboard('all', userId);
  const entry = leaderboard.currentUserRank;

  const displayName = entry?.displayName || 'CryptoDegen99';
  const pnlPct = entry?.realizedPnlPct ? `+${entry.realizedPnlPct}%` : '+39.4%';
  const title = `${displayName}'s Trader Performance Card (${pnlPct}) | Celsius Network`;
  const description = `View overall trading win rate, realized return, and leaderboard ranking on Celsius Network.`;
  const ogImage = `/api/og/stats/${userId}`;

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
          alt: `${displayName} Trader Performance`,
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

export default function ShareStatsPage({ params }: StatsSharePageProps) {
  const { userId } = params;
  const leaderboard = serverPaperTrading.getLeaderboard('all', userId);
  const entry = leaderboard.currentUserRank || {
    rank: 4,
    userId,
    displayName: 'CryptoDegen99',
    realizedPnlPct: 39.4,
    realizedPnl: 3939,
    winRatePct: 66.7,
    tradesCount: 42,
    profitableTrades: 28,
    streakDays: 5,
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

      {/* Main Stats Showcase */}
      <section className="w-full max-w-4xl flex flex-col items-center my-8">
        <ShareStatsViewer entry={entry} userId={userId} />
      </section>

      {/* Footer */}
      <footer className="w-full max-w-4xl text-center py-6 border-t border-subtle text-xs text-faint">
        Celsius Network • Real-time Binance streams • Institutional Crypto Terminal
      </footer>
    </main>
  );
}
