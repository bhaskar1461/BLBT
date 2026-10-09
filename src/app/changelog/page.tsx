// src/app/changelog/page.tsx
import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  GitCommit,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  Sparkles,
  Lock,
  Heart,
  Trophy,
} from 'lucide-react';
import { BloombergUniversalHeader } from '@/components/bloomberg/BloombergUniversalHeader';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Changelog & Architectural Evolution | Bloomberg Professional',
  description:
    'Complete transparent timeline of Celsius Network’s engineering evolution. From hash-chained ledgers to the Sentiment API and radical financial transparency.',
};

interface ChangelogEntry {
  version: string;
  phase: string;
  date: string;
  title: string;
  tagline: string;
  highlights: string[];
}

const CHANGELOG_ENTRIES: ChangelogEntry[] = [
  {
    version: 'v1.0.0',
    phase: 'Phase 10',
    date: 'October 2026',
    title: 'Launch the Story & Founding Manifesto',
    tagline: '“The only trading platform that profits from you not losing money.”',
    highlights: [
      'Rewrote public surfaces around the honest positioning and mission manifesto.',
      'Published plain-language /about and /terms with Right of Reply guarantees.',
      'Launched public /changelog documenting the complete architectural history.',
      'Permanent performance budget enforced: sub-1s delivery, <150KB JS bundle.',
    ],
  },
  {
    version: 'v0.9.0',
    phase: 'Phase 9',
    date: 'October 2026',
    title: 'Transparent Funding & The Sentiment API',
    tagline: 'Radical financial transparency and sustainable institutional revenue.',
    highlights: [
      'Launched /funding: itemized $150/mo server costs, live donations, and runway calculations.',
      'Permanent anti-corruption rule: zero ads, zero broker affiliate kickbacks, zero sponsored signals.',
      'Shipped the Sentiment API (/api/v1/sentiment): Free tier with 24h delay & attribution; Pro tier ($49/mo) with sub-100ms real-time feeds.',
      'Enforced structural 25-user cohort privacy barrier across all API endpoints.',
    ],
  },
  {
    version: 'v0.8.0',
    phase: 'Phase 8',
    date: 'October 2026',
    title: 'Community without Casino Vibes & Honest Share Cards',
    tagline: 'Rewarding disciplined risk management over 100x YOLO gambles.',
    highlights: [
      'Built free risk-adjusted tournaments with SQL CHECK (entry_fee = 0) constraint.',
      'Leaderboards rank strictly by Risk-Adjusted Score: Return % ÷ (Max Drawdown % + 1.0).',
      'Auto-flags statistically improbable win rates (>95% or 100%) for admin review.',
      'Reworked share cards: losing trades receive equal dignity (“Took a -4% loss. Full record, verified.”).',
    ],
  },
  {
    version: 'v0.7.0',
    phase: 'Phase 7',
    date: 'October 2026',
    title: 'The Honest Backtester (Zero Curve-Fitting)',
    tagline: 'Testing trading strategies against unvarnished reality.',
    highlights: [
      'Preset strategy library (MA Crossover, RSI Thresholds, Breakouts, Systematic DCA).',
      'Simulations include realistic 0.10% transaction fee drag on every entry and exit.',
      'Permanently visible, non-collapsible BTC Buy-and-Hold benchmark on every result.',
      'Data-bound summary lines: “This strategy underperformed holding BTC in X% of periods.”',
    ],
  },
  {
    version: 'v0.6.0',
    phase: 'Phase 6',
    date: 'October 2026',
    title: 'The Scoreboard (The Controversy Engine)',
    tagline: 'Holding public trading influencers accountable against real market execution.',
    highlights: [
      'Public call submissions scored strictly against Binance Spot at exact minute of expiration.',
      'Neutral, factual, undeniable tone—scoring the call, never the character.',
      'Leaderboard computes accuracy percentages with mandatory sample size display.',
      'Integrated formal Right of Reply field for scored analysts to submit context.',
    ],
  },
  {
    version: 'v0.5.0',
    phase: 'Phase 5',
    date: 'October 2026',
    title: 'Verified Public Records & Cryptographic Seals',
    tagline: 'Unforgeable track records—what screenshots can never be.',
    highlights: [
      'All-or-nothing public profiles (/u/[username]): every win and loss, zero cherry-picking.',
      'Public records stamped with daily cryptographic ledger root hashes.',
      'Verified Record Badge linking to /transparency explaining cryptographic immutability.',
    ],
  },
  {
    version: 'v0.4.0',
    phase: 'Phase 4',
    date: 'October 2026',
    title: 'The Sentiment Index & Structural Privacy',
    tagline: 'See what the herd is doing. Then consider not being the herd.',
    highlights: [
      'Hourly aggregation pipeline tracking retail long/short positioning per asset.',
      'Structural privacy barrier: minimum active cohort of 25 traders; zero user IDs exposed.',
      'Public /sentiment page with Crowd vs Price contrarian accuracy statistics.',
      'Single-line lean sentiment context strip inside the terminal charting workspace.',
    ],
  },
  {
    version: 'v0.3.0',
    phase: 'Phase 3',
    date: 'October 2026',
    title: 'Truth in Every Screen & Loss Protection',
    tagline: 'Protecting traders from gambling habits and overtrading traps.',
    highlights: [
      'Mandatory BTC Buy-and-Hold benchmark visible across all P&L screens.',
      'Sub-60s honest onboarding flow introducing reality statistics and 1.0% risk cap.',
      'Hard daily loss limit: trading locks when hit; cannot be disabled on a losing day.',
      'Revenge-trade detector warns against rapid turnover after a loss.',
    ],
  },
  {
    version: 'v0.2.0',
    phase: 'Phase 2',
    date: 'October 2026',
    title: 'The Reality Page (/reality)',
    tagline: '“Everyone shows you their wins. We show you everything.”',
    highlights: [
      'Public server-rendered stats on paper trader profitability over 30 and 90 days.',
      'Computed dynamically from the database at render time with zero hardcoding.',
      'Median duration tracking, P&L distribution curves, and dynamic OpenGraph cards.',
    ],
  },
  {
    version: 'v0.1.0',
    phase: 'Phase 1',
    date: 'October 2026',
    title: 'The Verifiable Ledger & Performance Discipline',
    tagline: 'Tamper-evident trading history and permanent leanness.',
    highlights: [
      'Hash-chained paper trades (ledger_hash) using SHA-256 cryptographic chaining.',
      'Daily automated midnight cron sealing immutable snapshots in ledger_snapshots.',
      'Public /transparency page explaining cryptographic proof with copyable root hashes.',
      'System fonts, zero third-party tracking scripts, and sub-150KB JS bundle budget.',
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-[#000000] text-[#d1d4dc] font-mono selection:bg-[#ff8800]/30">
      {/* Bloomberg Universal Header */}
      <BloombergUniversalHeader
        activeMnemonic="CHG"
        subtitle="ARCHITECTURAL EVOLUTION // 10-PHASE CHANGELOG"
      />

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 py-12 space-y-10">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-subtle text-xs text-muted font-mono">
            <GitCommit size={13} className="text-bull" />
            <span>TRANSPARENT PLATFORM EVOLUTION • PROMPT 10.1</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            The Platform Changelog
          </h1>
          <p className="text-sm text-muted leading-relaxed">
            Every step in our engineering journey is documented and stamped.
            We don’t quietly pivot or hide changes: the platform’s own evolution is as transparent as our trading ledger.
          </p>
        </div>

        {/* Timeline Entries */}
        <div className="space-y-6 relative border-l border-subtle ml-3 pl-6">
          {CHANGELOG_ENTRIES.map((entry) => (
            <div key={entry.version} className="relative group space-y-3">
              {/* Dot on Timeline */}
              <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-surface border-2 border-bull group-hover:bg-bull transition-colors" />

              <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                <span className="font-bold px-2 py-0.5 rounded bg-bull/15 text-bull border border-bull/30">
                  {entry.version}
                </span>
                <span className="text-faint">•</span>
                <span className="text-zinc-400 font-semibold">{entry.phase}</span>
                <span className="text-faint">•</span>
                <span className="text-muted">{entry.date}</span>
              </div>

              <div>
                <h2 className="text-lg font-bold text-white tracking-tight group-hover:text-bull transition-colors">
                  {entry.title}
                </h2>
                <p className="text-xs text-muted italic mt-0.5 font-sans">
                  {entry.tagline}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-panel border border-subtle">
                <ul className="space-y-2 text-xs text-zinc-300">
                  {entry.highlights.map((h, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 size={13} className="text-bull shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
