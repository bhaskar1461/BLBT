// src/components/funding/FundingClientView.tsx
'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Check,
  AlertCircle,
  HelpCircle,
  DollarSign,
  Heart,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import type { FundingSummary, CostItem, DonationRecord } from '@/lib/fundingService';

interface FundingClientViewProps {
  initialSummary: FundingSummary;
}

export const FundingClientView: React.FC<FundingClientViewProps> = ({ initialSummary }) => {
  const [summary, setSummary] = useState<FundingSummary>(initialSummary);
  const [selectedAmount, setSelectedAmount] = useState<number>(5); // $5 default
  const [isCustom, setIsCustom] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [isMonthly, setIsMonthly] = useState(true);
  const [donorName, setDonorName] = useState('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const finalAmount = isCustom ? parseFloat(customAmount) || 0 : selectedAmount;

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (finalAmount <= 0) {
      setErrorMsg('Please specify a positive contribution amount.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/funding/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountCents: Math.round(finalAmount * 100),
          isMonthly,
          donorName: isAnonymous ? 'Anonymous' : donorName.trim() || undefined,
          isAnonymous,
          message: message.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit ledger allocation');
      }

      setSuccessMsg(
        `Allocation recorded: Thank you for contributing $${finalAmount.toFixed(2)} to protect independent trading transparency.`
      );

      // Refresh live summary
      const refreshRes = await fetch('/api/funding');
      const refreshData = await refreshRes.json();
      if (refreshData.summary) {
        setSummary(refreshData.summary);
      }

      // Reset fields
      setMessage('');
      if (!isAnonymous) setDonorName('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error communicating with funding ledger');
    } finally {
      setLoading(false);
    }
  };

  const monthlyCostUsd = (summary.monthlyOperatingCostCents / 100).toFixed(2);
  const monthlyDonationsUsd = (summary.monthlyDonationsCents / 100).toFixed(2);
  const reserveUsd = (summary.currentReserveCents / 100).toFixed(2);

  // Micro-allocation explanation for selected amount
  const getImpactText = (amt: number) => {
    if (amt <= 3) return 'Covers 17% of our DNSSEC, SSL and DDoS mitigation infrastructure.';
    if (amt <= 5) return 'Underwrites 20% of our daily Supabase append-only database operations.';
    if (amt <= 10) return 'Powers our authoritative Binance WebSocket proxy feed for 5 full trading days.';
    if (amt <= 25) return 'Underwrites 100% of our daily database persistence and cryptographic root hashing.';
    return `Provides direct treasury reserves to extend our sovereign operating runway.`;
  };

  return (
    <div className="space-y-8">
      {/* 1. Treasury Balance Sheet Summary Grid */}
      <div className="border border-[#2a2e39] bg-[#171b26] rounded-md overflow-hidden">
        <div className="px-5 py-3 border-b border-[#2a2e39] flex items-center justify-between text-xs font-mono">
          <span className="text-[#787b86] uppercase tracking-wider font-semibold">
            01 // TREASURY OPERATING STATUS & COVERAGE RATIO
          </span>
          <span className="text-[#50535e]">
            RUNWAY = (RESERVE + MONTHLY_INFLOW) / MONTHLY_BURN
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#2a2e39]">
          {/* Metric 1: Monthly Burn */}
          <div className="p-5 space-y-2">
            <div className="text-[11px] font-mono uppercase text-[#787b86]">
              Net Monthly Operating Burn
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-white">
                ${monthlyCostUsd}
              </span>
              <span className="text-xs text-[#787b86] font-mono">/ month</span>
            </div>
            <p className="text-[11px] text-[#787b86] leading-relaxed">
              Audited infrastructure commitments. Zero corporate salaries, offices, or marketing fluff.
            </p>
          </div>

          {/* Metric 2: Monthly Inflow */}
          <div className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase text-[#787b86]">
                Community Coverage (Current Period)
              </span>
              <span className="text-[10px] font-mono text-[#089981] font-semibold">
                {summary.currentMonthCoveredPct}% COVERED
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-[#089981]">
                ${monthlyDonationsUsd}
              </span>
              <span className="text-xs text-[#787b86] font-mono">
                of ${monthlyCostUsd} target
              </span>
            </div>

            {/* Coverage Progress Bar */}
            <div className="w-full bg-[#1e222d] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#089981] h-full transition-all duration-500"
                style={{ width: `${Math.min(100, summary.currentMonthCoveredPct)}%` }}
              />
            </div>
            <p className="text-[11px] text-[#787b86] leading-relaxed">
              Micro-underwriting from disciplined traders who value unvarnished numbers.
            </p>
          </div>

          {/* Metric 3: Sovereign Runway */}
          <div className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase text-[#787b86]">
                Verified Treasury Runway
              </span>
              <span className="text-[10px] font-mono text-white bg-[#1e222d] px-1.5 py-0.5 rounded border border-[#2a2e39]">
                ${reserveUsd} RESERVE
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-white">
                {summary.runwayMonths}
              </span>
              <span className="text-xs text-[#787b86] font-mono">Months</span>
            </div>
            <p className="text-[11px] text-[#787b86] leading-relaxed">
              Autonomous operating buffer to resist VC, token sponsor, or casino broker leverage.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Audited Itemized Operating Schedule */}
      <div className="border border-[#2a2e39] bg-[#171b26] rounded-md overflow-hidden space-y-0">
        <div className="px-5 py-3 border-b border-[#2a2e39] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white tracking-tight">
              Schedule of Itemized Operating Expenses
            </span>
            <span className="text-[10px] font-mono text-[#787b86] bg-[#1e222d] px-1.5 py-0.5 rounded border border-[#2a2e39]">
              FIXED INFRASTRUCTURE
            </span>
          </div>
          <span className="font-mono text-[11px] text-[#787b86]">
            AUDITED TO THE CENT
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#2a2e39] bg-[#131722] text-[#787b86] font-mono text-[11px]">
                <th className="py-2.5 px-4 font-medium w-24">Item Ref</th>
                <th className="py-2.5 px-4 font-medium w-64">Service Component</th>
                <th className="py-2.5 px-4 font-medium w-48">Vendor / Provider</th>
                <th className="py-2.5 px-4 font-medium">Technical Purpose & Specification</th>
                <th className="py-2.5 px-4 font-medium text-right w-36">Monthly Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2e39]/60 font-sans">
              {summary.costBreakdown.map((item, idx) => {
                const itemPct = ((item.amountCents / summary.monthlyOperatingCostCents) * 100).toFixed(1);
                const refCode = `EXP-0${idx + 1}`;

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-[#1e222d]/50 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono text-[11px] text-[#787b86]">
                      {refCode}
                    </td>
                    <td className="py-3 px-4 font-medium text-white">
                      {item.name}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[#d1d4dc]">
                      {item.provider}
                    </td>
                    <td className="py-3 px-4 text-[#787b86] text-[11px] leading-relaxed">
                      {item.description}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-white">
                      ${(item.amountCents / 100).toFixed(2)}
                      <span className="text-[10px] text-[#50535e] font-normal ml-1">
                        ({itemPct}%)
                      </span>
                    </td>
                  </tr>
                );
              })}

              {/* Total Accounting Row */}
              <tr className="bg-[#131722] border-t-2 border-[#2a2e39] font-mono">
                <td colSpan={4} className="py-3 px-4 text-white font-bold uppercase text-[11px] tracking-wider">
                  Total Monthly Operating Commitment
                </td>
                <td className="py-3 px-4 text-right font-bold text-[#089981] text-sm">
                  ${monthlyCostUsd} / mo
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Independent Treasury Underwriting Portal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 border border-[#2a2e39] bg-[#171b26] rounded-md overflow-hidden">
        {/* Left Column: Mission Alignment Context */}
        <div className="lg:col-span-5 p-6 border-b lg:border-b-0 lg:border-r border-[#2a2e39] space-y-4 bg-[#131722]/50">
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase text-[#089981] font-bold tracking-wider">
              INDEPENDENT PATRONAGE
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight leading-snug">
              Underwrite Independent Market Telemetry
            </h2>
            <p className="text-xs text-[#787b86] leading-relaxed">
              Celsius is intentionally architected to operate with minimal overhead. When you underwrite our operating costs, you ensure that unbiased trade journaling, verified track records, and honest sentiment data remain free from broker liquidation kickbacks.
            </p>
          </div>

          <div className="p-3.5 rounded bg-[#1e222d] border border-[#2a2e39] space-y-2">
            <div className="text-[10px] font-mono text-[#787b86] uppercase tracking-wider">
              Selected Allocation Impact
            </div>
            <p className="text-xs text-white leading-relaxed font-sans">
              {getImpactText(finalAmount)}
            </p>
          </div>

          <div className="space-y-2 text-[11px] text-[#787b86]">
            <div className="flex items-center gap-2">
              <span className="text-[#089981]">✓</span>
              <span>100% itemized public accounting</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#089981]">✓</span>
              <span>Optional anonymous ledger recording</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#089981]">✓</span>
              <span>Zero third-party tracking pixels or telemetry cookies</span>
            </div>
          </div>
        </div>

        {/* Right Column: Underwriting Form */}
        <div className="lg:col-span-7 p-6 space-y-5">
          <form onSubmit={handleDonate} className="space-y-5">
            {/* Cadence Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase text-[#787b86] block">
                Cadence Selection
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setIsMonthly(true)}
                  className={`py-2 px-3 rounded border text-center transition-colors font-medium ${
                    isMonthly
                      ? 'bg-[#2962ff] text-white border-[#2962ff]'
                      : 'bg-[#1e222d] text-[#787b86] border-[#2a2e39] hover:text-white'
                  }`}
                >
                  Monthly Underwriter (Recommended)
                </button>
                <button
                  type="button"
                  onClick={() => setIsMonthly(false)}
                  className={`py-2 px-3 rounded border text-center transition-colors font-medium ${
                    !isMonthly
                      ? 'bg-[#2962ff] text-white border-[#2962ff]'
                      : 'bg-[#1e222d] text-[#787b86] border-[#2a2e39] hover:text-white'
                  }`}
                >
                  Single Allocation
                </button>
              </div>
            </div>

            {/* Amount Selection Matrix */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase text-[#787b86] block">
                Contribution Amount (USD)
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[3, 5, 10, 25].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setSelectedAmount(amt);
                      setIsCustom(false);
                    }}
                    className={`py-2 rounded border text-xs font-mono font-bold transition-colors ${
                      !isCustom && selectedAmount === amt
                        ? 'bg-[#1e222d] text-white border-[#2962ff]'
                        : 'bg-[#131722] text-[#787b86] border-[#2a2e39] hover:text-white hover:border-[#363a45]'
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setIsCustom(true)}
                  className={`py-2 rounded border text-xs font-mono font-bold transition-colors ${
                    isCustom
                      ? 'bg-[#1e222d] text-white border-[#2962ff]'
                      : 'bg-[#131722] text-[#787b86] border-[#2a2e39] hover:text-white hover:border-[#363a45]'
                  }`}
                >
                  Custom
                </button>
              </div>

              {isCustom && (
                <div className="relative mt-2">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#787b86] font-mono text-xs">
                    $
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Enter custom USD allocation"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full bg-[#131722] border border-[#2a2e39] rounded pl-7 pr-3 py-2 text-xs text-white placeholder-[#50535e] focus:outline-none focus:border-[#2962ff] font-mono"
                    required
                  />
                </div>
              )}
            </div>

            {/* Contributor Metadata */}
            <div className="space-y-3 pt-1 border-t border-[#2a2e39]/60">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="anon"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded border-[#2a2e39] bg-[#131722] text-[#2962ff] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <label
                  htmlFor="anon"
                  className="text-xs text-[#787b86] cursor-pointer select-none"
                >
                  Record anonymously on the public support journal
                </label>
              </div>

              {!isAnonymous && (
                <div>
                  <input
                    type="text"
                    placeholder="Contributor Name or Trading Handle (optional)"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    className="w-full bg-[#131722] border border-[#2a2e39] rounded px-3 py-2 text-xs text-white placeholder-[#50535e] focus:outline-none focus:border-[#2962ff] font-sans"
                  />
                </div>
              )}

              <div>
                <input
                  type="text"
                  placeholder="Statement or Note for Public Ledger (optional)"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-[#131722] border border-[#2a2e39] rounded px-3 py-2 text-xs text-white placeholder-[#50535e] focus:outline-none focus:border-[#2962ff] font-sans"
                />
              </div>
            </div>

            {/* Notification Callouts */}
            {errorMsg && (
              <div className="p-3 rounded bg-[#f23645]/10 border border-[#f23645]/30 text-[#f23645] text-xs flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded bg-[#089981]/10 border border-[#089981]/30 text-[#089981] text-xs flex items-center gap-2">
                <Check size={14} className="shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Submission Action */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2962ff] hover:bg-[#1e53e5] text-white py-2.5 rounded font-mono font-bold text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {loading ? (
                <span>Recording in Ledger...</span>
              ) : (
                <span>
                  Confirm Contribution (${finalAmount.toFixed(2)}{' '}
                  {isMonthly ? '/ month' : ''})
                </span>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* 4. Public Support Ledger */}
      <div className="border border-[#2a2e39] bg-[#171b26] rounded-md overflow-hidden space-y-0">
        <div className="px-5 py-3 border-b border-[#2a2e39] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white tracking-tight">
              Public Underwriting Journal
            </span>
            <span className="text-[10px] font-mono text-[#787b86] bg-[#1e222d] px-1.5 py-0.5 rounded border border-[#2a2e39]">
              {summary.recentDonations.length} RECORDS
            </span>
          </div>
          <span className="font-mono text-[11px] text-[#787b86]">
            APPEND-ONLY FINANCIAL JOURNAL
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-[#2a2e39] bg-[#131722] text-[#787b86] font-mono text-[11px]">
                <th className="py-2.5 px-4 font-medium w-48">Timestamp</th>
                <th className="py-2.5 px-4 font-medium w-56">Underwriter</th>
                <th className="py-2.5 px-4 font-medium w-28">Cadence</th>
                <th className="py-2.5 px-4 font-medium">Public Note / Statement</th>
                <th className="py-2.5 px-4 font-medium text-right w-32">Allocation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2e39]/60">
              {summary.recentDonations.map((don) => (
                <tr key={don.id} className="hover:bg-[#1e222d]/40 transition-colors">
                  <td className="py-3 px-4 font-mono text-[11px] text-[#787b86]">
                    {new Date(don.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="py-3 px-4 font-medium text-white">
                    {don.donorName}
                  </td>
                  <td className="py-3 px-4 font-mono text-[10px]">
                    {don.isMonthly ? (
                      <span className="text-[#089981] bg-[#089981]/10 px-1.5 py-0.5 rounded border border-[#089981]/20">
                        MONTHLY
                      </span>
                    ) : (
                      <span className="text-[#787b86] bg-[#1e222d] px-1.5 py-0.5 rounded border border-[#2a2e39]">
                        ONE-TIME
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-[#787b86] text-[11px] italic">
                    {don.message ? `“${don.message}”` : '—'}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-[#089981]">
                    +${(don.amountCents / 100).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
