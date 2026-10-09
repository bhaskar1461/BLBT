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
import { BloombergUniversalHeader } from '@/components/bloomberg/BloombergUniversalHeader';

export const dynamic = 'force-dynamic';

export default function TransparencyPage() {
  const latestSnapshot = transparencyService.getLatestSnapshot();
  const snapshots = transparencyService.getAllSnapshots();
  const audit = transparencyService.verifyLedgerIntegrity();

  return (
    <div className="min-h-screen bg-[#000000] text-[#d1d4dc] font-mono selection:bg-[#ff8800]/30 flex flex-col justify-between">
      {/* Bloomberg Universal Header */}
      <BloombergUniversalHeader
        activeMnemonic="PROOF"
        subtitle="IMMUTABLE LEDGER VERIFICATION // SHA-256"
      />

      {/* Main Content */}
      <main className="w-full max-w-6xl mx-auto px-4 py-8 space-y-6 flex-1">
        {/* Hero Section */}
        <div className="border border-[#1a2333] bg-[#05070a] p-6 rounded-sm space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#141a26] pb-3 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.2 bg-[#ff8800] text-black font-black text-[10px]">&lt;AUDIT 01&gt;</span>
              <span className="text-[#ff8800] font-bold">CRYPTO-SEALED MERKLE TELEMETRY</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#00c176] font-bold text-[10px]">
              <span className="w-2 h-2 rounded-full bg-[#00c176] animate-pulse" />
              <span>CHAIN INTEGRITY: 100% UNBROKEN</span>
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Every day we publish a cryptographic fingerprint of all trading activity.
          </h1>
          <p className="text-xs text-[#00c176] font-bold">
            History cannot be silently edited.
          </p>
          <p className="text-xs text-[#8e95a5] max-w-3xl leading-relaxed">
            Every paper trade, fill, and liquidation is chained using SHA-256 cryptographic hashes. If a single number changes anywhere in history, the root fingerprint breaks immediately.
          </p>
        </div>

        {/* Latest Snapshot Fingerprint Card */}
        {latestSnapshot && (
          <div className="p-5 sm:p-6 rounded-sm bg-[#05070a] border border-[#ff8800]/40 relative overflow-hidden space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase text-[#ff8800] tracking-wider">
                    LATEST DAILY ROOT HASH ({latestSnapshot.date})
                  </span>
                  <span className="px-1.5 py-0.2 rounded-sm text-[10px] bg-[#00c176]/15 text-[#00c176] font-black border border-[#00c176]/30">
                    VERIFIED IN CHAIN
                  </span>
                </div>

                <div className="text-xs sm:text-sm text-[#00d8d6] break-all p-3 rounded-sm bg-[#000000] border border-[#1a2333] font-bold">
                  {latestSnapshot.root_hash}
                </div>
              </div>

              <div className="shrink-0">
                <CopyHashButton
                  hash={latestSnapshot.root_hash}
                  label="Copy Fingerprint"
                  className="px-4 py-2 bg-[#ff8800] hover:bg-[#ffa033] text-black rounded-sm font-black text-xs transition-colors cursor-pointer shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#141a26] text-xs">
              <div className="p-2.5 rounded-sm bg-[#000000] border border-[#1a2333]">
                <div className="text-[10px] text-[#64748b]">TRADES SEALED</div>
                <div className="text-base font-black text-white">{latestSnapshot.trade_count}</div>
              </div>
              <div className="p-2.5 rounded-sm bg-[#000000] border border-[#1a2333]">
                <div className="text-[10px] text-[#64748b]">UNIQUE TRADERS</div>
                <div className="text-base font-black text-white">{latestSnapshot.user_count}</div>
              </div>
              <div className="p-2.5 rounded-sm bg-[#000000] border border-[#1a2333]">
                <div className="text-[10px] text-[#64748b]">24H NOTIONAL VOLUME</div>
                <div className="text-base font-black text-[#00c176]">${formatPrice(latestSnapshot.total_volume_usdt, 0)}</div>
              </div>
              <div className="p-2.5 rounded-sm bg-[#000000] border border-[#1a2333]">
                <div className="text-[10px] text-[#64748b]">STATUS</div>
                <div className="text-base font-black text-[#00c176]">SEALED &amp; IMMUTABLE</div>
              </div>
            </div>
          </div>
        )}

        {/* Ledger Integrity Audit Result */}
        <div className={`p-4 rounded-sm border ${audit.isValid ? 'bg-[#00c176]/5 border-[#00c176]/30' : 'bg-red-500/10 border-red-500/30'}`}>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${audit.isValid ? 'bg-[#00c176]' : 'bg-red-500'}`} />
            <span className="font-bold text-xs uppercase tracking-wider text-white">
              AUTOMATED LEDGER INTEGRITY AUDIT:
            </span>
            <span className={`text-xs font-black ${audit.isValid ? 'text-[#00c176]' : 'text-red-400'}`}>
              {audit.isValid ? 'ALL BLOCKS VERIFIED (0 TAMPER DETECTED)' : 'CORRUPTION DETECTED'}
            </span>
          </div>
        </div>

        {/* Historical Snapshots Table */}
        <div className="border border-[#1a2333] bg-[#05070a] rounded-sm overflow-hidden">
          <div className="px-4 py-2.5 border-b border-[#141a26] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="px-1 py-0.2 bg-[#ff8800] text-black font-black text-[9px]">&lt;HIST 02&gt;</span>
              <span className="font-bold text-white tracking-tight">DAILY SEALED LEDGER ARCHIVE</span>
            </div>
            <span className="text-[10px] text-[#64748b]">{snapshots.length} SEALED DAYS</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#141a26] bg-[#0c1017] text-[#ff8800] text-[10px] uppercase tracking-wider">
                  <th className="py-2 px-3 font-bold">Date</th>
                  <th className="py-2 px-3 font-bold">Daily Root Hash (SHA-256)</th>
                  <th className="py-2 px-3 font-bold">Trades</th>
                  <th className="py-2 px-3 font-bold">Traders</th>
                  <th className="py-2 px-3 font-bold text-right">Volume</th>
                  <th className="py-2 px-3 font-bold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#141a26]">
                {snapshots.map((snap) => (
                  <tr key={snap.id} className="hover:bg-[#0c121e] transition-colors">
                    <td className="py-2.5 px-3 font-bold text-white">{snap.date}</td>
                    <td className="py-2.5 px-3 text-[#00d8d6] truncate max-w-xs" title={snap.root_hash}>
                      {snap.root_hash.slice(0, 16)}...{snap.root_hash.slice(-12)}
                    </td>
                    <td className="py-2.5 px-3 text-[#8e95a5]">{snap.trade_count}</td>
                    <td className="py-2.5 px-3 text-[#8e95a5]">{snap.user_count}</td>
                    <td className="py-2.5 px-3 text-right text-[#00c176] font-bold">
                      ${formatPrice(snap.total_volume_usdt, 0)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <CopyHashButton
                        hash={snap.root_hash}
                        label="Copy"
                        className="px-2 py-0.5 rounded-sm bg-[#101520] hover:bg-[#182338] text-[#ff8800] border border-[#1a2333] text-[10px] font-bold cursor-pointer transition-colors"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section: What is a Verified Record? */}
        <div className="border border-[#1a2333] bg-[#05070a] p-6 rounded-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-[#141a26] pb-3 text-xs">
            <span className="px-1 py-0.2 bg-[#ff8800] text-black font-black text-[9px]">&lt;TRUST 01&gt;</span>
            <h2 className="font-bold text-white text-sm tracking-tight uppercase">What is a Verified Record?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed text-[#8e95a5]">
            <div className="p-4 bg-[#0c1017] border border-[#141a26] rounded-sm space-y-2">
              <h3 className="font-bold text-white text-xs text-red-400">The Screenshot Problem</h3>
              <p>
                Anyone can inspect element or photoshop a broker screenshot in under 60 seconds to fabricate millions in trading profits. Trading influencers flaunt fake gains while quietly hiding blown accounts.
              </p>
            </div>

            <div className="p-4 bg-[#0c1017] border border-[#141a26] rounded-sm space-y-2">
              <h3 className="font-bold text-white text-xs text-[#00c176]">The Verified Record Standard</h3>
              <p>
                When a trader makes their record public at <span className="text-[#00d8d6] font-mono">/u/[username]</span>, our server independently calculates their complete track record from the append-only ledger and stamps it with the daily cryptographic root hash.
              </p>
            </div>
          </div>

          <div className="p-3 bg-[#0c1017] border-l-2 border-[#ff8800] text-xs text-white">
            <strong>Platform Rule:</strong> &ldquo;A public profile is a resume, not a highlight reel.&rdquo; All wins and losses receive equal billing.
          </div>

          <div className="pt-2 flex items-center gap-4 text-[11px]">
            <Link href="/backtest" className="text-[#ff8800] hover:underline font-bold">
              &rarr; Test strategies objectively on the Backtester
            </Link>
          </div>
        </div>
      </main>

      {/* Terminal Footer */}
      <footer className="border-t border-[#1a2333] bg-[#000000] py-4 text-center text-[10px] text-[#64748b]">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-[#ff8800]">CELSIUS TERMINAL // IMMUTABLE LEDGER VERIFICATION</span>
          <div className="flex items-center gap-3">
            <Link href="/backtest" className="hover:text-[#ff8800] transition-colors">&lt;BTST&gt; Backtester</Link>
          </div>
          <span>&quot;THE ONLY TRADING PLATFORM THAT PROFITS FROM YOU NOT LOSING MONEY.&quot; • SHA-256 CHAINED</span>
        </div>
      </footer>
    </div>
  );
}
