import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Database,
  Calendar,
  Layers,
} from 'lucide-react';
import { transparencyService } from '@/lib/transparencyService';
import { formatPrice } from '@/lib/utils';
import { CopyHashButton } from '@/components/transparency/CopyHashButton';

export const dynamic = 'force-dynamic';

export default function TransparencyPage() {
  const latestSnapshot = transparencyService.getLatestSnapshot();
  const snapshots = transparencyService.getAllSnapshots();
  const audit = transparencyService.verifyLedgerIntegrity();

  return (
    <main className="min-h-screen bg-canvas text-main flex flex-col items-center justify-between p-4 sm:p-8 font-sans selection:bg-bull/30">
      {/* Top Navbar */}
      <header className="w-full max-w-5xl flex items-center justify-between py-4 border-b border-subtle">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-bull to-primary flex items-center justify-center font-extrabold text-sm text-canvas shadow-lg shadow-bull/20">
            °C
          </div>
          <span className="font-bold text-lg tracking-tight text-white">
            CELSIUS <span className="text-primary text-xs font-mono font-medium ml-1">TRANSPARENCY</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/backtest"
            className="text-xs font-semibold text-faint hover:text-white transition-colors hidden md:flex items-center gap-1.5"
          >
            <span>🔄 Backtester</span>
          </Link>
          <Link
            href="/scoreboard"
            className="text-xs font-semibold text-faint hover:text-white transition-colors hidden md:flex items-center gap-1.5"
          >
            <span>⚖️ Scoreboard</span>
          </Link>
          <Link
            href="/reality"
            className="text-xs font-semibold text-faint hover:text-white transition-colors flex items-center gap-1.5"
          >
            <span>📊 Reality Check</span>
          </Link>
          <Link
            href="/leaderboard"
            className="text-xs font-semibold text-faint hover:text-white transition-colors hidden sm:flex items-center gap-1.5"
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

      {/* Main Content */}
      <section className="w-full max-w-5xl my-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-bull/10 border border-bull/20 text-bull text-xs font-mono font-bold tracking-tight">
            <ShieldCheck size={14} />
            <span>CRYPTOGRAPHICALLY TAMPER-EVIDENT</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Every day we publish a cryptographic fingerprint of all trading activity.
          </h1>
          <p className="text-base text-bull/90 font-medium leading-relaxed">
            History cannot be silently edited.
          </p>
          <p className="text-xs text-muted max-w-xl mx-auto leading-relaxed">
            Every paper trade, fill, and liquidation is chained using SHA-256 cryptographic hashes. If a single number changes anywhere in history, the fingerprint breaks immediately.
          </p>
        </div>

        {/* Latest Snapshot Fingerprint Card */}
        {latestSnapshot && (
          <div className="p-6 sm:p-8 rounded-2xl bg-panel border border-primary/30 shadow-2xl shadow-primary/10 relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold uppercase text-primary tracking-wider">
                    LATEST DAILY ROOT HASH ({latestSnapshot.date})
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-bull/15 text-bull font-bold">
                    VERIFIED IN CHAIN
                  </span>
                </div>

                <div className="font-mono text-xs sm:text-sm text-white break-all p-3 rounded-xl bg-canvas border border-subtle">
                  {latestSnapshot.root_hash}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-muted pt-1">
                  <span>📅 Date: <strong className="text-white">{latestSnapshot.date}</strong></span>
                  <span>⚡ Trades Sealed: <strong className="text-white">{latestSnapshot.trade_count}</strong></span>
                  <span>👥 Active Traders: <strong className="text-white">{latestSnapshot.user_count}</strong></span>
                  <span>💵 Total Volume: <strong className="text-white">${formatPrice(latestSnapshot.total_volume_usdt, 0)} USDT</strong></span>
                </div>
              </div>

              <CopyHashButton hash={latestSnapshot.root_hash} label="Copy Fingerprint" />
            </div>
          </div>
        )}

        {/* How The Honest Terminal Proof Works */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-panel border border-subtle space-y-2">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Database size={18} />
            </div>
            <h3 className="text-sm font-bold text-white">1. Append-Only Execution</h3>
            <p className="text-xs text-muted leading-relaxed">
              Orders and position exits write directly into an immutable database ledger. Update and Delete operations are blocked at the database engine level.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-panel border border-subtle space-y-2">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Layers size={18} />
            </div>
            <h3 className="text-sm font-bold text-white">2. SHA-256 Hash Chaining</h3>
            <p className="text-xs text-muted leading-relaxed">
              Each trade hashes the previous trade&apos;s cryptographic fingerprint. This creates an unalterable sequential chain identical to a blockchain block.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-panel border border-subtle space-y-2">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <ShieldCheck size={18} />
            </div>
            <h3 className="text-sm font-bold text-white">3. Public Sealing</h3>
            <p className="text-xs text-muted leading-relaxed">
              Every midnight UTC, a root hash is generated and published on this page. No influencer or broker can fake historical gains or hide blown accounts.
            </p>
          </div>
        </div>

        {/* Verified Record Concept Explanation (Prompt 5.1 verbatim) */}
        <div className="p-6 sm:p-8 rounded-2xl bg-panel border border-primary/20 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-bull/15 text-bull flex items-center justify-center font-bold">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                What is a &quot;Verified Record&quot;?
              </h2>
              <p className="text-xs text-muted">
                Why screenshots are meaningless and how Celsius cryptographic proof replaces them.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed text-muted pt-1">
            <div className="p-4 rounded-xl bg-canvas border border-subtle space-y-2">
              <span className="font-bold text-bear text-xs uppercase tracking-wider block">
                The Screenshot Problem
              </span>
              <p>
                Trading influencers and signal sellers routinely photoshop brokerage PnL screenshots,
                inspect-element browser DOMs, or trade on five accounts and post only the one that won.
                Screenshots prove nothing except that someone knows how to crop an image.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-canvas border border-subtle space-y-2">
              <span className="font-bold text-bull text-xs uppercase tracking-wider block">
                The Verified Record Standard
              </span>
              <p>
                When a Celsius trader toggles <strong className="text-white">&quot;Make my track record public&quot;</strong>,
                their complete history is published at <code className="text-primary font-mono text-[11px]">/u/[username]</code>.
                Every win, loss, fee, and liquidation is server-computed and permanently stamped with our daily ledger snapshot hash.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/5 border border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <span className="text-white font-medium">
              &quot;A public profile is a resume, not a highlight reel.&quot;
            </span>
            <span className="text-faint text-[11px] font-mono">
              All-or-Nothing • Zero Cherry-Picking • Immutable Proof
            </span>
          </div>
        </div>

        {/* Historical Fingerprints Table */}
        <div className="p-6 rounded-2xl bg-panel border border-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-primary" />
              <h3 className="text-sm font-bold text-white">Daily Ledger Snapshots History</h3>
            </div>
            <span className="text-xs font-mono text-bull font-bold">
              Chain Status: {audit.brokenLinksCount} Broken Links Detected
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-subtle bg-canvas">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-subtle/40 border-b border-subtle text-faint uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Root Fingerprint (SHA-256)</th>
                  <th className="py-2.5 px-3">Trades</th>
                  <th className="py-2.5 px-3">Active Traders</th>
                  <th className="py-2.5 px-3 text-right">Volume</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-subtle/30">
                {snapshots.map((snap) => (
                  <tr key={snap.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 font-bold text-white">{snap.date}</td>
                    <td className="py-3 px-3 text-muted truncate max-w-xs" title={snap.root_hash}>
                      {snap.root_hash.slice(0, 16)}...{snap.root_hash.slice(-12)}
                    </td>
                    <td className="py-3 px-3 text-faint">{snap.trade_count}</td>
                    <td className="py-3 px-3 text-faint">{snap.user_count}</td>
                    <td className="py-3 px-3 text-right text-white font-bold">
                      ${formatPrice(snap.total_volume_usdt, 0)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <CopyHashButton
                        hash={snap.root_hash}
                        label="Copy"
                        className="px-2 py-1 rounded bg-panel hover:bg-white/10 text-muted hover:text-white text-[11px] font-mono cursor-pointer transition-colors"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full max-w-5xl text-center py-6 border-t border-subtle text-xs text-faint">
        Celsius Network • &quot;The only trading platform that profits from you not losing money.&quot; • Immutable Ledger Verification
      </footer>
    </main>
  );
}
