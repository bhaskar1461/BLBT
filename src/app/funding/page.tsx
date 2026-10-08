// src/app/funding/page.tsx
import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Heart,
  ShieldCheck,
  DollarSign,
  AlertTriangle,
  Server,
  Code2,
  Trophy,
  Scale,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';
import { fundingService } from '@/lib/fundingService';
import { FundingClientView } from '@/components/funding/FundingClientView';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const summary = fundingService.getFundingSummary();
  const cost = (summary.monthlyOperatingCostCents / 100).toFixed(0);
  const donations = (summary.monthlyDonationsCents / 100).toFixed(0);
  const ogUrl = `/api/og/funding?cost=${cost}&donations=${donations}&runway=${summary.runwayMonths}`;

  return {
    title: 'Radical Financial Transparency — How Celsius is Funded | Celsius Network',
    description:
      'We show you our money so you know who we work for: you. Zero ads, zero exchange affiliate links, zero sponsored signals. 100% funded by community truth.',
    openGraph: {
      title: 'Radical Financial Transparency | Celsius Network',
      description: '“We show you our money so you know who we work for: you.” Zero ads. Zero affiliates.',
      images: [
        {
          url: ogUrl,
          width: 1200,
          height: 630,
          alt: 'Celsius Funding Transparency',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Radical Financial Transparency | Celsius Network',
      description: 'Zero ads. Zero affiliates. We show you our money so you know who we work for.',
      images: [ogUrl],
    },
  };
}

export default function FundingPage() {
  const summary = fundingService.getFundingSummary();

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
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold">
              <Heart size={12} />
              <span>TRANSPARENT FUNDING</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <Link
              href="/developers"
              className="text-faint hover:text-white transition-colors hidden md:inline"
            >
              Developer API
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
              href="/transparency"
              className="text-faint hover:text-white transition-colors hidden md:inline"
            >
              Transparency
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
            <Heart size={13} className="text-bull" />
            <span>Radical Financial Transparency • Prompt 9.1</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              “We show you our money so you know who we work for: you.”
            </h1>
            <p className="text-muted text-sm sm:text-base max-w-3xl leading-relaxed">
              Every traditional trading platform profits from your turnover or sells you out to brokers for affiliate kickbacks.
              Celsius is built on a permanent invariant: <strong className="text-white">no ads</strong>, <strong className="text-white">no broker affiliate links</strong>, and <strong className="text-white">no sponsored signals</strong>. Ever.
            </p>
          </div>

          {/* Hard Invariant Rules Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-panel border border-subtle space-y-1">
              <span className="text-[10px] font-mono text-faint uppercase block">Ad Policy</span>
              <span className="text-base font-extrabold text-bull font-mono">0 Ads. Ever.</span>
              <p className="text-[11px] text-muted">No banner ads, popups, or tracking pixels</p>
            </div>

            <div className="p-3.5 rounded-xl bg-panel border border-subtle space-y-1">
              <span className="text-[10px] font-mono text-faint uppercase block">Affiliate Kickbacks</span>
              <span className="text-base font-extrabold text-emerald-400 font-mono">$0 Kickbacks</span>
              <p className="text-[11px] text-muted">Never profit from broker liquidation fees</p>
            </div>

            <div className="p-3.5 rounded-xl bg-panel border border-subtle space-y-1">
              <span className="text-[10px] font-mono text-faint uppercase block">Sponsored Content</span>
              <span className="text-base font-extrabold text-amber-400 font-mono">0 Paid Signals</span>
              <p className="text-[11px] text-muted">Signal sellers cannot buy reviews or slots</p>
            </div>

            <div className="p-3.5 rounded-xl bg-panel border border-subtle space-y-1">
              <span className="text-[10px] font-mono text-faint uppercase block">Revenue Model</span>
              <span className="text-base font-extrabold text-primary font-mono">Truth Funded</span>
              <p className="text-[11px] text-muted">Community donations & Sentiment API</p>
            </div>
          </div>
        </div>

        {/* Client Interactive View with Cost Breakdown and Contribution Dock */}
        <FundingClientView initialSummary={summary} />

        {/* Ethical Anti-Corruption Invariant Statement */}
        <div className="bg-panel border border-subtle rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-bull" size={20} />
            <h2 className="text-lg font-bold text-white tracking-tight">
              The Permanent Ethical Contract
            </h2>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            In trading, whoever pays the bills dictates the truth. Broker-funded platforms push reckless 100x leverage so exchanges harvest taker fees. Influencer-backed tools peddle false win rates to sell Discord subscriptions. Celsius is intentionally lean: our entire monthly infrastructure costs less than what a casino broker makes from a single retail trader liquidation.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-mono text-zinc-400">
            <span>• Sub-1s page delivery budget</span>
            <span>• Append-only cryptographic ledger</span>
            <span>• Structural aggregate-only privacy</span>
            <span>• Verified by daily root hashes</span>
          </div>
        </div>
      </main>
    </div>
  );
}
