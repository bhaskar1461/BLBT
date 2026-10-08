// src/app/funding/page.tsx
import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  ExternalLink,
  Terminal,
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
    <div className="min-h-screen bg-[#131722] text-[#d1d4dc] font-sans selection:bg-[#2962ff]/30">
      {/* Institutional Terminal Header */}
      <header className="border-b border-[#2a2e39] bg-[#171b26]/90 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-12 flex items-center justify-between text-xs">
          {/* Left: Terminal Identity */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 group transition-opacity"
            >
              <div className="w-6 h-6 rounded bg-[#1e222d] border border-[#363a45] flex items-center justify-center font-mono font-bold text-white text-[11px] group-hover:border-[#2962ff] transition-colors">
                °C
              </div>
              <span className="font-bold text-sm tracking-tight text-white">
                CELSIUS
              </span>
            </Link>

            <span className="text-[#363a45]">/</span>

            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#1e222d] border border-[#2a2e39] text-[#787b86] font-mono text-[10px] uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#089981]"></span>
              <span>Treasury Ledger</span>
            </div>
          </div>

          {/* Center/Right Navigation Tabs */}
          <div className="flex items-center gap-1">
            <Link
              href="/transparency"
              className="px-2.5 py-1 rounded text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#1e222d] transition-colors hidden md:inline"
            >
              Ledger Proofs
            </Link>
            <Link
              href="/reality"
              className="px-2.5 py-1 rounded text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#1e222d] transition-colors hidden md:inline"
            >
              Reality Check
            </Link>
            <Link
              href="/scoreboard"
              className="px-2.5 py-1 rounded text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#1e222d] transition-colors hidden lg:inline"
            >
              Scoreboard
            </Link>
            <Link
              href="/backtest"
              className="px-2.5 py-1 rounded text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#1e222d] transition-colors hidden lg:inline"
            >
              Backtester
            </Link>
            <Link
              href="/tournaments"
              className="px-2.5 py-1 rounded text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#1e222d] transition-colors hidden md:inline"
            >
              Tournaments
            </Link>
            <Link
              href="/developers"
              className="px-2.5 py-1 rounded text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#1e222d] transition-colors hidden sm:inline"
            >
              API Docs
            </Link>

            <div className="w-[1px] h-4 bg-[#2a2e39] mx-2 hidden sm:block" />

            <Link
              href="/"
              className="flex items-center gap-1.5 bg-[#2962ff] hover:bg-[#1e53e5] text-white px-3 py-1 rounded font-medium text-xs transition-colors shadow-sm"
            >
              <Terminal size={12} />
              <span>Open Terminal</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Disclosure Container */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Document Classification Header */}
        <div className="border border-[#2a2e39] bg-[#171b26] rounded-md p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2a2e39] pb-4 text-[11px] font-mono text-[#787b86]">
            <div className="flex items-center gap-3">
              <span className="text-white font-semibold">FORM CN-TF // SCHEDULE 9.1</span>
              <span>•</span>
              <span>AUDITED OPERATING DISCLOSURE</span>
            </div>
            <div className="flex items-center gap-2 text-[#089981]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#089981] animate-pulse"></span>
              <span>PUBLIC VERIFIED TELEMETRY</span>
            </div>
          </div>

          <div className="space-y-3 max-w-4xl">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug">
              “We show you our money so you know who we work for: you.”
            </h1>
            <p className="text-sm text-[#787b86] leading-relaxed max-w-3xl">
              Every traditional trading platform profits from your turnover or sells you out to brokers for affiliate kickbacks.
              Celsius is built on a permanent invariant: <strong className="text-white font-semibold">no ads</strong>, <strong className="text-white font-semibold">no broker affiliate links</strong>, and <strong className="text-white font-semibold">no sponsored signals</strong>. Ever.
            </p>
          </div>

          {/* Hard Invariant Matrix (Institutional Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-[#2a2e39] divide-y sm:divide-y-0 sm:divide-x divide-[#2a2e39] bg-[#131722] rounded text-xs">
            <div className="p-4 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono uppercase text-[#787b86]">
                <span>Invariant 01</span>
                <span className="text-[#089981]">ENFORCED</span>
              </div>
              <div className="text-sm font-mono font-bold text-white">0 Ads. Ever.</div>
              <p className="text-[11px] text-[#787b86] leading-normal">
                Zero banner advertisements, tracking scripts, or ad-network SDKs.
              </p>
            </div>

            <div className="p-4 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono uppercase text-[#787b86]">
                <span>Invariant 02</span>
                <span className="text-[#089981]">ENFORCED</span>
              </div>
              <div className="text-sm font-mono font-bold text-white">$0 Kickbacks</div>
              <p className="text-[11px] text-[#787b86] leading-normal">
                Zero exchange kickbacks or commissions on retail liquidation volume.
              </p>
            </div>

            <div className="p-4 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono uppercase text-[#787b86]">
                <span>Invariant 03</span>
                <span className="text-[#089981]">ENFORCED</span>
              </div>
              <div className="text-sm font-mono font-bold text-white">0 Paid Signals</div>
              <p className="text-[11px] text-[#787b86] leading-normal">
                Signal sellers cannot buy placement, token listings, or ratings.
              </p>
            </div>

            <div className="p-4 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono uppercase text-[#787b86]">
                <span>Invariant 04</span>
                <span className="text-[#2962ff]">SOLVENT</span>
              </div>
              <div className="text-sm font-mono font-bold text-white">Truth Funded</div>
              <p className="text-[11px] text-[#787b86] leading-normal">
                Sustained strictly by micro-patrons and professional Sentiment API tiers.
              </p>
            </div>
          </div>
        </div>

        {/* Client Interactive View with Audited Ledger and Underwriting Portal */}
        <FundingClientView initialSummary={summary} />

        {/* The Institutional Independence Covenant */}
        <div className="border border-[#2a2e39] bg-[#171b26] rounded-md p-6 space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-[#2a2e39] pb-3">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <ShieldCheck size={16} className="text-[#089981]" />
              <span>The Independent Capital Covenant</span>
            </div>
            <span className="font-mono text-[10px] text-[#787b86]">
              CRYPTOGRAPHIC PROOF REQ #9.1
            </span>
          </div>

          <p className="text-[#787b86] leading-relaxed max-w-4xl text-[12px]">
            In retail trading, whoever pays the platform&apos;s bills dictates the truth. Casino broker-funded apps push reckless 100x leverage so exchanges harvest taker liquidation fees. Influencer-backed tools peddle false win rates to sell Discord subscriptions. Celsius is intentionally lean: our entire monthly infrastructure costs less than what a casino broker makes from a single retail trader liquidation.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-[11px] font-mono text-[#787b86]">
            <div className="p-2.5 rounded bg-[#131722] border border-[#2a2e39]">
              <span className="text-white block font-bold">Sub-1s Delivery</span>
              <span className="text-[10px]">Zero bloated tracker payloads</span>
            </div>
            <div className="p-2.5 rounded bg-[#131722] border border-[#2a2e39]">
              <span className="text-white block font-bold">Append-Only Ledger</span>
              <span className="text-[10px]">Historical entries immutable</span>
            </div>
            <div className="p-2.5 rounded bg-[#131722] border border-[#2a2e39]">
              <span className="text-white block font-bold">Aggregate Privacy</span>
              <span className="text-[10px]">≥25 cohort privacy barrier</span>
            </div>
            <div className="p-2.5 rounded bg-[#131722] border border-[#2a2e39]">
              <span className="text-white block font-bold">Daily Sealed Hashes</span>
              <span className="text-[10px]">SHA-256 root published daily</span>
            </div>
          </div>
        </div>
      </main>

      {/* Institutional Document Footer */}
      <footer className="border-t border-[#2a2e39] bg-[#131722] py-6 text-center text-[11px] font-mono text-[#50535e]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>CELSIUS NETWORK • RADICAL FINANCIAL TRANSPARENCY</span>
          <span>100% COMMUNITY AUDITED • ZERO BROKER KICKBACKS</span>
        </div>
      </footer>
    </div>
  );
}
