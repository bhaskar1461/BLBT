// src/app/developers/page.tsx
import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Code2,
  Key,
  ShieldCheck,
  Zap,
  Lock,
  ArrowRight,
  Heart,
  Trophy,
  Scale,
  RotateCcw,
  CheckCircle,
} from 'lucide-react';
import { developerApiService } from '@/lib/developerApiService';
import { DeveloperClientView } from '@/components/developers/DeveloperClientView';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Sentiment API Documentation & Keys — The Honest Terminal | Celsius Network',
  description:
    'Public developer API for Celsius retail positioning and sentiment data. Free tier (24h delayed) and Pro tier ($49/mo, real-time feeds). Sub-second response times.',
  openGraph: {
    title: 'Celsius Sentiment API — Public Developer Data',
    description: 'Real-time and 24h-delayed aggregate retail positioning feeds with structural privacy guarantees.',
  },
};

export default function DevelopersPage() {
  const demoUserId = 'usr_celsius_demo';
  const initialKeys = developerApiService.listUserKeys(demoUserId);
  const initialUsage = developerApiService.getUsageStats(demoUserId);

  return (
    <div className="min-h-screen bg-canvas text-main font-sans selection:bg-bull/20">
      {/* Top Header Navigation */}
      <header className="border-b border-subtle bg-panel/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-bull to-primary flex items-center justify-center font-bold text-black text-sm shadow-md shadow-bull/20">
                °C
              </div>
              <span className="font-bold text-sm tracking-tight text-white hidden sm:inline">
                Celsius Network
              </span>
            </Link>
            <span className="text-faint text-xs font-mono">•</span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 text-xs font-mono font-bold">
              <Code2 size={12} />
              <span>DEVELOPER API</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <Link
              href="/funding"
              className="text-faint hover:text-white transition-colors hidden md:inline"
            >
              Transparent Funding
            </Link>
            <Link
              href="/tournaments"
              className="text-faint hover:text-white transition-colors hidden md:inline"
            >
              Tournaments
            </Link>
            <Link
              href="/scoreboard"
              className="text-faint hover:text-white transition-colors hidden md:inline"
            >
              Scoreboard
            </Link>
            <Link
              href="/backtest"
              className="text-faint hover:text-white transition-colors hidden md:inline"
            >
              Backtester
            </Link>
            <Link
              href="/reality"
              className="text-faint hover:text-white transition-colors hidden md:inline"
            >
              Reality Check
            </Link>
            <Link
              href="/"
              className="btn btn-primary py-1.5 px-3 rounded-lg text-xs font-bold"
            >
              Launch Terminal →
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-10">
        {/* Hero Section */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-subtle text-xs text-muted font-mono">
            <Code2 size={13} className="text-primary" />
            <span>COMMERCIAL ARCHITECTURE // DEVELOPER PORTAL</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              The Sentiment API: Unbiased Retail Positioning Feeds
            </h1>
            <p className="text-muted text-sm sm:text-base max-w-3xl leading-relaxed">
              Programmatic access to the only platform-verified paper trader sentiment index on the web.
              Free for researchers with 24h delay; sub-100ms real-time streams for quant desks and funds.
            </p>
          </div>
        </div>

        {/* Tier Comparison Matrix */}
        <div className="border border-subtle rounded-2xl overflow-hidden bg-panel shadow-sm">
          <div className="p-5 border-b border-subtle bg-surface/40 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">API Tier Comparison</h2>
              <p className="text-xs text-muted">Fair access for individuals; sustainable revenue from professionals.</p>
            </div>
            <span className="text-xs font-mono text-faint">VERIFIED SPECIFICATION</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-subtle">
            {/* Free Tier */}
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Free Community Tier</h3>
                  <p className="text-xs text-muted">For students, researchers, and hobbyists</p>
                </div>
                <span className="text-xl font-extrabold text-white font-mono">$0</span>
              </div>

              <ul className="space-y-2.5 text-xs text-zinc-300">
                <li className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-bull" />
                  <span>24-Hour Delayed Aggregate Sentiment</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-bull" />
                  <span>1,000 Requests / Month (60 req/min)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-bull" />
                  <span>All Major Spot Pairs (BTC, ETH, SOL, BNB, AVAX)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-amber-400" />
                  <span>Attribution Required on Public Surfaces</span>
                </li>
              </ul>
            </div>

            {/* Pro Tier */}
            <div className="p-6 space-y-4 bg-primary/5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="inline-flex items-center gap-1 px-2 py-0.2 rounded text-[10px] font-mono font-bold bg-primary/20 text-primary uppercase mb-1">
                    Institutional & Quants
                  </div>
                  <h3 className="text-lg font-bold text-white">Pro Real-Time Tier</h3>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-bull font-mono">$49</span>
                  <span className="text-xs text-muted"> / mo</span>
                </div>
              </div>

              <ul className="space-y-2.5 text-xs text-zinc-300">
                <li className="flex items-center gap-2">
                  <Zap size={14} className="text-bull" />
                  <span><strong>Zero Delay:</strong> Real-time live streaming feeds</span>
                </li>
                <li className="flex items-center gap-2">
                  <Zap size={14} className="text-bull" />
                  <span><strong>100,000 Requests / Month</strong> (1,000 req/min)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Zap size={14} className="text-bull" />
                  <span>Full Historical Series & Liquidity Flow Indicators</span>
                </li>
                <li className="flex items-center gap-2">
                  <Zap size={14} className="text-bull" />
                  <span>Webhooks on Significant Sentiment Flips</span>
                </li>
                <li className="flex items-center gap-2">
                  <Zap size={14} className="text-bull" />
                  <span>Commercial & Proprietary Strategy Rights (No Attribution)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Interactive Keys Management & Live Query Tester */}
        <DeveloperClientView initialKeys={initialKeys} initialUsage={initialUsage} />

        {/* Code Integration Examples */}
        <div className="bg-panel border border-subtle rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Code2 size={16} className="text-primary" />
              <span>Quickstart Integration</span>
            </h3>
            <span className="text-xs font-mono text-faint">cURL & Python</span>
          </div>

          <div className="space-y-3">
            <span className="text-xs font-mono text-faint block uppercase">1. cURL Example</span>
            <pre className="p-3.5 rounded-xl bg-surface border border-subtle font-mono text-xs text-white overflow-x-auto">
{`curl -X GET "https://celsius.network/api/v1/sentiment?symbol=BTCUSDT" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
            </pre>

            <span className="text-xs font-mono text-faint block uppercase pt-2">2. Python Example</span>
            <pre className="p-3.5 rounded-xl bg-surface border border-subtle font-mono text-xs text-white overflow-x-auto">
{`import requests

url = "https://celsius.network/api/v1/sentiment"
headers = {"Authorization": "Bearer YOUR_API_KEY"}
params = {"symbol": "BTCUSDT"}

response = requests.get(url, headers=headers, params=params)
data = response.json()

print(f"Retail Long: {data['data']['snapshot']['longPct']}%")
print(f"Contrarian Signal: {data['data']['liquidityFlow']['contrarianSignal']}")`}
            </pre>
          </div>
        </div>

        {/* Structural Privacy Guarantee */}
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 space-y-2">
          <div className="font-bold flex items-center gap-2 text-sm">
            <Lock size={16} />
            <span>Structural Privacy Barrier Invariant (Phase 4 & Phase 9)</span>
          </div>
          <p className="leading-relaxed text-[11px] text-amber-300/80">
            All data delivered by the Sentiment API is aggregate-only. Under our PostgreSQL RLS architecture, no stat is ever computed or returned if the asset's active cohort size is less than 25 traders. Zero user IDs or personal wallet allocations exist in the API layer. This is a mathematical barrier, not a promissory privacy policy.
          </p>
        </div>
      </main>
    </div>
  );
}
