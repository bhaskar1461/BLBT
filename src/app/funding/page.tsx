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
import { BloombergUniversalHeader } from '@/components/bloomberg/BloombergUniversalHeader';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const summary = fundingService.getFundingSummary();
  const cost = (summary.monthlyOperatingCostCents / 100).toFixed(0);
  const donations = (summary.monthlyDonationsCents / 100).toFixed(0);
  const ogUrl = `/api/og/funding?cost=${cost}&donations=${donations}&runway=${summary.runwayMonths}`;

  return {
    title: 'Radical Financial Transparency — How Celsius is Funded | Bloomberg Terminal',
    description:
      'We show you our money so you know who we work for: you. Zero ads, zero exchange affiliate links, zero sponsored signals. 100% funded by community truth.',
    openGraph: {
      title: 'Radical Financial Transparency | Bloomberg Professional',
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
      title: 'Radical Financial Transparency | Bloomberg Professional',
      description: 'Zero ads. Zero affiliates. We show you our money so you know who we work for.',
      images: [ogUrl],
    },
  };
}

export default function FundingPage() {
  const summary = fundingService.getFundingSummary();

  return (
    <div className="min-h-screen bg-[#000000] text-[#d1d4dc] font-mono selection:bg-[#ff8800]/30">
      {/* Bloomberg Universal Header */}
      <BloombergUniversalHeader
        activeMnemonic="FUND"
        subtitle="AUDITED TELEMETRY // SCHEDULE 9.1"
      />

      {/* Main Disclosure Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-6">
        {/* Document Classification Header */}
        <div className="border border-[#1a2333] bg-[#05070a] rounded-sm p-5 sm:p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#141a26] pb-3 text-[11px] text-[#8e95a5]">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.2 bg-[#ff8800] text-black font-black text-[10px]">
                &lt;FORM 9.1&gt;
              </span>
              <span className="text-[#ff8800] font-bold">
                BLBT-TF // AUDITED OPERATING DISCLOSURE
              </span>
            </div>
            <div className="flex items-center gap-2 text-[#00c176] font-bold text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00c176] animate-pulse"></span>
              <span>PUBLIC VERIFIED TELEMETRY</span>
            </div>
          </div>

          <div className="space-y-2 max-w-4xl">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
              “We show you our money so you know who we work for: you.”
            </h1>
            <p className="text-xs text-[#8e95a5] leading-relaxed max-w-3xl">
              Every traditional trading platform profits from your turnover or sells you out to brokers for affiliate kickbacks.
              Bloomberg Professional &amp; Celsius operates on a permanent invariant: <strong className="text-[#ff8800] font-bold">no ads</strong>, <strong className="text-[#ff8800] font-bold">no broker affiliate links</strong>, and <strong className="text-[#ff8800] font-bold">no sponsored signals</strong>. Ever.
            </p>
          </div>

          {/* Hard Invariant Matrix (Bloomberg Terminal Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-[#1a2333] divide-y sm:divide-y-0 sm:divide-x divide-[#1a2333] bg-[#000000] rounded-sm text-xs">
            <div className="p-3.5 space-y-1.5 bg-[#05070a]">
              <div className="flex items-center justify-between text-[10px] uppercase text-[#64748b]">
                <span>Invariant 01</span>
                <span className="text-[#00c176] font-bold text-[9px] px-1 bg-[#00c176]/10 border border-[#00c176]/30">
                  ENFORCED
                </span>
              </div>
              <div className="text-sm font-bold text-[#ff8800]">0 Ads. Ever.</div>
              <p className="text-[10px] text-[#8e95a5] leading-normal">
                Zero banner advertisements, tracking scripts, or ad-network SDKs.
              </p>
            </div>

            <div className="p-3.5 space-y-1.5 bg-[#05070a]">
              <div className="flex items-center justify-between text-[10px] uppercase text-[#64748b]">
                <span>Invariant 02</span>
                <span className="text-[#00c176] font-bold text-[9px] px-1 bg-[#00c176]/10 border border-[#00c176]/30">
                  ENFORCED
                </span>
              </div>
              <div className="text-sm font-bold text-[#00c176]">$0 Kickbacks</div>
              <p className="text-[10px] text-[#8e95a5] leading-normal">
                Zero exchange kickbacks or commissions on retail liquidation volume.
              </p>
            </div>

            <div className="p-3.5 space-y-1.5 bg-[#05070a]">
              <div className="flex items-center justify-between text-[10px] uppercase text-[#64748b]">
                <span>Invariant 03</span>
                <span className="text-[#00c176] font-bold text-[9px] px-1 bg-[#00c176]/10 border border-[#00c176]/30">
                  ENFORCED
                </span>
              </div>
              <div className="text-sm font-bold text-[#00d8d6]">0 Paid Signals</div>
              <p className="text-[10px] text-[#8e95a5] leading-normal">
                Signal sellers cannot buy placement, token listings, or ratings.
              </p>
            </div>

            <div className="p-3.5 space-y-1.5 bg-[#05070a]">
              <div className="flex items-center justify-between text-[10px] uppercase text-[#64748b]">
                <span>Invariant 04</span>
                <span className="text-[#ff8800] font-bold text-[9px] px-1 bg-[#ff8800]/10 border border-[#ff8800]/30">
                  SOLVENT
                </span>
              </div>
              <div className="text-sm font-bold text-white">Truth Funded</div>
              <p className="text-[10px] text-[#8e95a5] leading-normal">
                Sustained strictly by micro-patrons and professional Sentiment API tiers.
              </p>
            </div>
          </div>
        </div>

        {/* Client Interactive View with Audited Ledger and Underwriting Portal */}
        <FundingClientView initialSummary={summary} />

        {/* The Institutional Independence Covenant */}
        <div className="border border-[#1a2333] bg-[#05070a] rounded-sm p-5 space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-[#141a26] pb-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <ShieldCheck size={16} className="text-[#00c176]" />
              <span className="text-[#ff8800]">&lt;COVENANT&gt;</span>
              <span>THE INDEPENDENT CAPITAL COVENANT</span>
            </div>
            <span className="text-[10px] text-[#8e95a5]">
              CRYPTOGRAPHIC PROOF REQ #9.1
            </span>
          </div>

          <p className="text-[#8e95a5] leading-relaxed max-w-4xl text-xs">
            In retail trading, whoever pays the platform&apos;s bills dictates the truth. Casino broker-funded apps push reckless 100x leverage so exchanges harvest taker liquidation fees. Influencer-backed tools peddle false win rates to sell Discord subscriptions. Celsius is intentionally lean: our entire monthly infrastructure costs less than what a casino broker makes from a single retail trader liquidation.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-[11px] text-[#8e95a5]">
            <div className="p-3 rounded-sm bg-[#000000] border border-[#1a2333]">
              <span className="text-[#ff8800] block font-bold">Sub-1s Delivery</span>
              <span className="text-[10px] text-[#64748b]">Zero bloated tracker payloads</span>
            </div>
            <div className="p-3 rounded-sm bg-[#000000] border border-[#1a2333]">
              <span className="text-[#00c176] block font-bold">Append-Only Ledger</span>
              <span className="text-[10px] text-[#64748b]">Historical entries immutable</span>
            </div>
            <div className="p-3 rounded-sm bg-[#000000] border border-[#1a2333]">
              <span className="text-[#00d8d6] block font-bold">Aggregate Privacy</span>
              <span className="text-[10px] text-[#64748b]">≥25 cohort privacy barrier</span>
            </div>
            <div className="p-3 rounded-sm bg-[#000000] border border-[#1a2333]">
              <span className="text-white block font-bold">Daily Sealed Hashes</span>
              <span className="text-[10px] text-[#64748b]">SHA-256 root published daily</span>
            </div>
          </div>
        </div>
      </main>

      {/* Bloomberg Professional Terminal Document Footer */}
      <footer className="border-t border-[#1a2333] bg-[#000000] py-4 text-center text-[10px] text-[#64748b]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-[#ff8800]">BLOOMBERG PROFESSIONAL // SCHEDULE 9.1 AUDITED TELEMETRY</span>
          <span>100% COMMUNITY AUDITED • ZERO BROKER KICKBACKS • ALL CALCULATIONS INTEGER SATOSHI SCALE</span>
        </div>
      </footer>
    </div>
  );
}
