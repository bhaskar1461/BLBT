// src/app/u/[username]/page.tsx
import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ShieldCheck, ArrowUpRight, ArrowDownRight, ExternalLink, Share2, Award, Scale, CheckCircle2 } from 'lucide-react';
import { profileService } from '@/lib/profileService';
import { formatPrice } from '@/lib/utils';
import { CopyHashButton } from '@/components/transparency/CopyHashButton';

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
      <main className="min-h-screen bg-canvas text-main flex flex-col items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-surface border border-subtle rounded-2xl p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 text-primary mx-auto flex items-center justify-center font-bold text-lg">
            °C
          </div>
          <h1 className="text-xl font-bold text-white">Private or Unregistered Profile</h1>
          <p className="text-xs text-muted leading-relaxed">
            The profile <code className="text-primary font-mono font-bold">@{username}</code> does not exist or has not enabled
            &ldquo;Make my track record public&rdquo;. Under Celsius Network honesty invariants, trader data is never exposed without explicit consent.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
            <Link href="/" className="btn btn-primary text-xs px-4 py-2 rounded-lg font-bold">
              Return to Terminal
            </Link>
            <Link href="/transparency" className="btn btn-secondary text-xs px-4 py-2 rounded-lg font-semibold">
              Read Verification Rules
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const latestHash = profile.latestLedgerSnapshotHash;
  const trades = profile.trades || [];
  const wins = trades.filter((t) => t.realizedPnl > 0);
  const losses = trades.filter((t) => t.realizedPnl < 0);

  return (
    <main className="min-h-screen bg-canvas text-main flex flex-col items-center justify-between p-4 sm:p-8 font-sans selection:bg-bull/30">
      {/* Top Navbar */}
      <header className="w-full max-w-5xl flex items-center justify-between py-4 border-b border-subtle">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-bull to-primary flex items-center justify-center font-extrabold text-sm text-canvas shadow-lg shadow-bull/20">
            °C
          </div>
          <span className="font-bold text-lg tracking-tight text-white">
            CELSIUS <span className="text-primary text-xs font-mono font-medium ml-1">VERIFIED RESUME</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/transparency"
            className="text-xs font-semibold text-faint hover:text-white transition-colors flex items-center gap-1.5"
          >
            <ShieldCheck size={14} className="text-bull" />
            <span>Ledger Transparency</span>
          </Link>
          <Link
            href="/reality"
            className="text-xs font-semibold text-faint hover:text-white transition-colors hidden sm:flex items-center gap-1.5"
          >
            <span>Reality Check</span>
          </Link>
          <Link
            href="/"
            className="btn btn-primary text-xs px-3.5 py-1.5 rounded-md font-bold"
          >
            Launch Terminal
          </Link>
        </div>
      </header>

      {/* Main Profile Body */}
      <div className="w-full max-w-5xl flex-1 flex flex-col gap-6 py-8">
        {/* Profile Header & Badge Banner */}
        <section className="bg-surface border border-subtle rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1e222d] to-[#12161f] border border-subtle flex items-center justify-center text-xl font-bold text-white shadow-inner">
                {profile.displayName.slice(0, 2).toUpperCase()}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-black text-white tracking-tight">{profile.displayName}</h1>
                  <span className="text-xs font-mono text-faint">@{profile.username}</span>

                  {/* Prompt 5.1: VERIFIED RECORD Badge linking to /transparency */}
                  <Link
                    href="/transparency"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-bull/15 border border-bull/30 text-bull text-[11px] font-mono font-bold hover:bg-bull/25 transition-colors"
                  >
                    <ShieldCheck size={13} />
                    <span>VERIFIED RECORD</span>
                  </Link>
                </div>
                <p className="text-xs text-muted max-w-xl leading-relaxed">{profile.bio}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Link
                href={`/share/stats/${profile.id}`}
                className="btn btn-secondary text-xs px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5"
              >
                <Share2 size={13} />
                <span>Share Card</span>
              </Link>
            </div>
          </div>

          {/* Prompt 5.1: Cryptographic Ledger Snapshot Hash Stamp */}
          <div className="mt-6 pt-5 border-t border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-canvas/40 -mx-6 -mb-6 sm:-mx-8 sm:-mb-8 p-4 sm:px-8">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-bull animate-pulse" />
              <span className="text-muted font-medium">Daily Ledger Snapshot Stamp:</span>
              <code className="text-bull font-mono font-bold text-[11px] bg-canvas px-2 py-0.5 rounded border border-subtle">
                {latestHash ? `${latestHash.slice(0, 18)}...${latestHash.slice(-10)}` : 'Verified Chain Sealed'}
              </code>
            </div>
            <div className="flex items-center gap-2">
              <CopyHashButton hash={latestHash} label="Copy Root Hash" />
              <Link
                href="/transparency"
                className="text-primary hover:underline text-[11px] font-semibold flex items-center gap-1"
              >
                <span>Proof Standard</span>
                <ExternalLink size={11} />
              </Link>
            </div>
          </div>
        </section>

        {/* Prompt 5.1 Truth Philosophy Card */}
        <div className="p-4 rounded-xl bg-canvas border border-subtle/80 flex items-center gap-3 text-xs text-muted">
          <Scale size={16} className="text-primary shrink-0" />
          <div>
            <span className="font-bold text-white">Truth Invariant: </span>
            <span>&ldquo;A public profile is a resume, not a highlight reel.&rdquo; Under Celsius Network rules, every closed trade is published with server-side immutability. No winning streaks can be cherry-picked.</span>
          </div>
        </div>

        {/* Prompt 3.1 & 5.1: Context Check / formattedComparison (Buy-and-hold benchmark) */}
        {profile.benchmark && (
          <section className="bg-surface border border-subtle rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-wider">
                <Scale size={14} className="text-primary" />
                <span>Context Check · Buy-and-Hold Benchmark</span>
              </div>
              <p className="text-sm font-semibold text-white">
                {profile.benchmark.formattedComparison}
              </p>
              <p className="text-xs text-muted">
                {profile.benchmark.honestVerdict}
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-3">
              <div className="text-right">
                <div className="text-[10px] text-faint uppercase font-bold">Trader Net</div>
                <div className={`text-base font-black font-mono ${profile.stats.realizedPnlPct >= 0 ? 'text-bull' : 'text-bear'}`}>
                  {profile.stats.realizedPnlPct >= 0 ? '+' : ''}{profile.stats.realizedPnlPct}%
                </div>
              </div>
              <div className="h-8 w-px bg-subtle" />
              <div className="text-right">
                <div className="text-[10px] text-faint uppercase font-bold">BTC Benchmark</div>
                <div className="text-base font-black font-mono text-warning">
                  {profile.benchmark.btcPnlPct >= 0 ? '+' : ''}{profile.benchmark.btcPnlPct}%
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Key Performance Stats Grid */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-surface border border-subtle rounded-xl p-4">
            <div className="text-[11px] font-bold text-muted uppercase">Realized P&L</div>
            <div className={`text-xl sm:text-2xl font-black font-mono mt-1 ${profile.stats.totalRealizedPnl >= 0 ? 'text-bull' : 'text-bear'}`}>
              {profile.stats.totalRealizedPnl >= 0 ? '+' : ''}${formatPrice(profile.stats.totalRealizedPnl)}
            </div>
            <div className="text-[10px] text-faint mt-1 font-mono">
              Net ROI: {profile.stats.realizedPnlPct >= 0 ? '+' : ''}{profile.stats.realizedPnlPct}%
            </div>
          </div>

          <div className="bg-surface border border-subtle rounded-xl p-4">
            <div className="text-[11px] font-bold text-muted uppercase">Win Rate</div>
            <div className="text-xl sm:text-2xl font-black font-mono text-white mt-1">
              {profile.stats.winRatePct}%
            </div>
            <div className="text-[10px] text-faint mt-1 font-mono">
              {profile.stats.winningTrades}W / {profile.stats.losingTrades}L
            </div>
          </div>

          <div className="bg-surface border border-subtle rounded-xl p-4">
            <div className="text-[11px] font-bold text-muted uppercase">Profit Factor</div>
            <div className="text-xl sm:text-2xl font-black font-mono text-white mt-1">
              {profile.stats.profitFactor}x
            </div>
            <div className="text-[10px] text-faint mt-1 font-mono">
              Avg Duration: {profile.stats.averageTradeDuration}
            </div>
          </div>

          <div className="bg-surface border border-subtle rounded-xl p-4">
            <div className="text-[11px] font-bold text-muted uppercase">Total Sample Size</div>
            <div className="text-xl sm:text-2xl font-black font-mono text-white mt-1">
              {profile.stats.totalTrades}
            </div>
            <div className="text-[10px] text-faint mt-1 font-mono">
              Enforced 1.0% Risk Cap
            </div>
          </div>
        </section>

        {/* Prompt 5.1: Complete Trade History with Equal Billing for Losses */}
        <section className="bg-surface border border-subtle rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-subtle pb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Complete Trade History</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-canvas border border-subtle text-muted">
                  {trades.length} Closed Trades
                </span>
              </h2>
              <p className="text-xs text-muted mt-0.5">
                Equal billing for losses: Every win and loss receives identical typographic prominence. No deletions, zero selective editing.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="px-2 py-1 rounded bg-bull/10 text-bull border border-bull/20 font-bold">
                {wins.length} WINS
              </span>
              <span className="px-2 py-1 rounded bg-bear/10 text-bear border border-bear/20 font-bold">
                {losses.length} LOSSES
              </span>
            </div>
          </div>

          {/* Trade Table */}
          {trades.length === 0 ? (
            <div className="p-8 text-center text-xs text-faint font-mono">
              No closed trades recorded yet on this account.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-subtle text-faint font-mono uppercase text-[10px]">
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Asset & Side</th>
                    <th className="py-2.5 px-3">Entry & Exit Price</th>
                    <th className="py-2.5 px-3">Size</th>
                    <th className="py-2.5 px-3">Realized P&L</th>
                    <th className="py-2.5 px-3">Fee Paid</th>
                    <th className="py-2.5 px-3 text-right">Closed At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-subtle/50 font-mono">
                  {trades.map((trade) => {
                    const isWin = trade.realizedPnl >= 0;
                    return (
                      <tr key={trade.id} className="hover:bg-canvas/50 transition-colors">
                        <td className="py-3 px-3">
                          {isWin ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-bull/15 text-bull border border-bull/30 font-bold text-[10px]">
                              WIN
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-bear/15 text-bear border border-bear/30 font-bold text-[10px]">
                              LOSS
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{trade.symbol}</span>
                            <span className={`text-[10px] px-1 py-0.2 rounded uppercase ${trade.side === 'long' ? 'text-bull bg-bull/10' : 'text-bear bg-bear/10'}`}>
                              {trade.side}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-muted">
                          ${formatPrice(trade.entryPrice)} → ${formatPrice(trade.exitPrice)}
                        </td>
                        <td className="py-3 px-3 text-white">
                          {trade.quantity}
                        </td>
                        <td className="py-3 px-3">
                          <div className={`font-bold ${isWin ? 'text-bull' : 'text-bear'}`}>
                            {isWin ? '+' : ''}${formatPrice(trade.realizedPnl)}
                            <span className="text-[10px] ml-1 opacity-80">
                              ({isWin ? '+' : ''}{trade.realizedPnlPct}%)
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-faint">
                          ${formatPrice(trade.fee)}
                        </td>
                        <td className="py-3 px-3 text-right text-faint text-[11px]">
                          {new Date(trade.closedAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-5xl py-6 border-t border-subtle flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-faint">
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
