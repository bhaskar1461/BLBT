// src/app/terms/page.tsx
import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Scale, FileText, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Terms of Truth & Plain-Language Agreement | Celsius Network',
  description:
    'Our terms written in brutally plain English. No dense legalese, no hidden arbitration traps, and no selling your data to offshore brokers.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-canvas text-main font-sans selection:bg-bull/20">
      {/* Header Navigation */}
      <header className="border-b border-subtle bg-panel/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-bull to-primary flex items-center justify-center font-bold text-black text-sm shadow-md shadow-bull/20">
                °C
              </div>
              <span className="font-bold text-sm tracking-tight text-white hidden sm:inline">
                Celsius Network
              </span>
            </Link>
            <span className="text-faint text-xs font-mono">•</span>
            <span className="text-xs font-mono font-bold text-bull">PLAIN-LANGUAGE TERMS</span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <Link href="/about" className="text-faint hover:text-white transition-colors hidden md:inline">
              About Us
            </Link>
            <Link href="/funding" className="text-faint hover:text-white transition-colors hidden md:inline">
              Funding
            </Link>
            <Link href="/transparency" className="text-faint hover:text-white transition-colors hidden md:inline">
              Transparency
            </Link>
            <Link href="/" className="btn btn-primary py-1.5 px-3 rounded-lg text-xs font-bold">
              Launch Terminal →
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-4 py-12 space-y-10">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-subtle text-xs text-muted font-mono">
            <FileText size={13} className="text-bull" />
            <span>CONTRACT OF TRANSPARENCY • LAST UPDATED OCTOBER 2026</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Terms of Truth (Written in Plain English)
          </h1>
          <p className="text-sm text-muted leading-relaxed">
            Most terms of service are 40 pages of dense legal armor designed to hide what a broker does with your data.
            Here is our entire contract with you in plain words.
          </p>
        </div>

        {/* Term 1 */}
        <section className="space-y-2.5">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-bull/20 text-bull flex items-center justify-center text-xs font-mono">1</span>
            <span>Paper Trading Only — Zero Custody of Funds</span>
          </h2>
          <p className="text-xs text-muted leading-relaxed pl-8">
            Celsius Network is a market simulation, charting terminal, and public analytics research engine.
            We are not a brokerage, custodian, or exchange. You cannot deposit real fiat or crypto here, and we never hold your funds.
            All portfolio balances are simulated paper trading allocations ($10,000 USDT default).
          </p>
        </section>

        {/* Term 2 */}
        <section className="space-y-2.5">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-bull/20 text-bull flex items-center justify-center text-xs font-mono">2</span>
            <span>Public Figures & The Scoreboard (Objective Math, Not Defamation)</span>
          </h2>
          <p className="text-xs text-muted leading-relaxed pl-8">
            The Scoreboard exists to bring mathematical accountability to trading calls made publicly by influencers, analysts, and channels.
            We score calls strictly against Binance Spot market execution upon expiration. We score the mathematics of the call—never the person.
            Anyone who has made a public call has an absolute Right of Reply to submit context or clarifications, which will be displayed alongside their score.
          </p>
        </section>

        {/* Term 3 */}
        <section className="space-y-2.5">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-bull/20 text-bull flex items-center justify-center text-xs font-mono">3</span>
            <span>Structural Privacy Barrier (Non-Promissory)</span>
          </h2>
          <p className="text-xs text-muted leading-relaxed pl-8">
            Our privacy is structural, not a promise on a PDF. No sentiment stat or positioning metric is ever calculated unless at least 25 active traders are in the cohort.
            Zero individual user IDs, wallet addresses, or personal trade orders ever leave our aggregation boundary or get exposed in the API.
          </p>
        </section>

        {/* Term 4 */}
        <section className="space-y-2.5">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-bull/20 text-bull flex items-center justify-center text-xs font-mono">4</span>
            <span>Zero Ads & Zero Broker Affiliate Kickbacks</span>
          </h2>
          <p className="text-xs text-muted leading-relaxed pl-8">
            We will never display third-party advertisements, tracking pixels, or sponsored trading signals.
            We will never include affiliate links that earn commissions when you lose money on an exchange.
            If a feature would make an offshore casino broker rich, we will not build it.
          </p>
        </section>

        {/* Term 5 */}
        <section className="space-y-2.5">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-bull/20 text-bull flex items-center justify-center text-xs font-mono">5</span>
            <span>No Financial Advice</span>
          </h2>
          <p className="text-xs text-muted leading-relaxed pl-8">
            Nothing displayed on Celsius Network constitutes financial, investment, or legal advice.
            Simulated paper trading performance does not represent live market liquidity or slippage.
            Never trade money you cannot afford to lose.
          </p>
        </section>
      </main>
    </div>
  );
}
