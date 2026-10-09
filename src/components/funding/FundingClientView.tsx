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
import { terminalAudio } from '@/lib/terminalAudio';

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
    terminalAudio.playOrderFilled();
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
    <div className="space-y-6 font-mono">
      {/* 1. Treasury Balance Sheet Summary Grid */}
      <div className="border border-[#1a2333] bg-[#05070a] rounded-sm overflow-hidden">
        <div className="px-4 py-2.5 border-b border-[#141a26] flex items-center justify-between text-xs">
          <span className="text-[#ff8800] uppercase tracking-wider font-bold text-[11px] flex items-center gap-1.5">
            <span className="px-1 py-0.2 bg-[#ff8800] text-black font-black text-[9px]">&lt;BAL 01&gt;</span>
            <span>TREASURY OPERATING STATUS &amp; COVERAGE RATIO</span>
          </span>
          <span className="text-[#64748b] text-[10px] hidden sm:inline">
            RUNWAY = (RESERVE + MONTHLY_INFLOW) / MONTHLY_BURN
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#1a2333]">
          {/* Metric 1: Monthly Burn */}
          <div className="p-4 space-y-1.5 bg-[#05070a]">
            <div className="text-[10px] uppercase text-[#64748b]">
              Net Monthly Operating Burn
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">
                ${monthlyCostUsd}
              </span>
              <span className="text-xs text-[#64748b]">/ MONTH</span>
            </div>
            <p className="text-[10px] text-[#8e95a5] leading-relaxed">
              Audited infrastructure commitments. Zero corporate salaries, offices, or marketing fluff.
            </p>
          </div>

          {/* Metric 2: Monthly Inflow */}
          <div className="p-4 space-y-1.5 bg-[#05070a]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase text-[#64748b]">
                Community Coverage (Current Period)
              </span>
              <span className="text-[10px] text-[#00c176] font-bold">
                {summary.currentMonthCoveredPct}% COVERED
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#00c176]">
                ${monthlyDonationsUsd}
              </span>
              <span className="text-xs text-[#64748b]">
                OF ${monthlyCostUsd} TARGET
              </span>
            </div>

            {/* Coverage Progress Bar */}
            <div className="w-full bg-[#101520] h-1.5 rounded-none overflow-hidden border border-[#1a2333]">
              <div
                className="bg-[#00c176] h-full transition-all duration-500 shadow-[0_0_8px_#00c176]"
                style={{ width: `${Math.min(100, summary.currentMonthCoveredPct)}%` }}
              />
            </div>
            <p className="text-[10px] text-[#8e95a5] leading-relaxed">
              Micro-underwriting from disciplined traders who value unvarnished numbers.
            </p>
          </div>

          {/* Metric 3: Sovereign Runway */}
          <div className="p-4 space-y-1.5 bg-[#05070a]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase text-[#64748b]">
                Verified Treasury Runway
              </span>
              <span className="text-[10px] text-[#ff8800] bg-[#101520] px-1.5 py-0.5 rounded-sm border border-[#1a2333] font-bold">
                ${reserveUsd} RESERVE
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">
                {summary.runwayMonths}
              </span>
              <span className="text-xs text-[#64748b]">MONTHS</span>
            </div>
            <p className="text-[10px] text-[#8e95a5] leading-relaxed">
              Autonomous operating buffer to resist VC, token sponsor, or casino broker leverage.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Audited Itemized Operating Schedule */}
      <div className="border border-[#1a2333] bg-[#05070a] rounded-sm overflow-hidden space-y-0">
        <div className="px-4 py-2.5 border-b border-[#141a26] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="px-1 py-0.2 bg-[#ff8800] text-black font-black text-[9px]">&lt;EXP 02&gt;</span>
            <span className="font-bold text-white tracking-tight">
              SCHEDULE OF ITEMIZED OPERATING EXPENSES
            </span>
            <span className="text-[10px] text-[#00c176] bg-[#00c176]/10 px-1.5 py-0.5 rounded-sm border border-[#00c176]/30">
              FIXED INFRASTRUCTURE
            </span>
          </div>
          <span className="text-[10px] text-[#64748b]">
            AUDITED TO THE CENT
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#141a26] bg-[#0c1017] text-[#ff8800] text-[10px] uppercase tracking-wider">
                <th className="py-2 px-3 font-bold w-20">Item Ref</th>
                <th className="py-2 px-3 font-bold w-56">Service Component</th>
                <th className="py-2 px-3 font-bold w-40">Vendor / Provider</th>
                <th className="py-2 px-3 font-bold">Technical Purpose &amp; Specification</th>
                <th className="py-2 px-3 font-bold text-right w-36">Monthly Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#141a26]">
              {summary.costBreakdown.map((item, idx) => {
                const itemPct = ((item.amountCents / summary.monthlyOperatingCostCents) * 100).toFixed(1);
                const refCode = `EXP-0${idx + 1}`;

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-[#0c121e] transition-colors text-xs"
                  >
                    <td className="py-2.5 px-3 text-[11px] text-[#64748b] font-bold">
                      {refCode}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-white">
                      {item.name}
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-[#00d8d6]">
                      {item.provider}
                    </td>
                    <td className="py-2.5 px-3 text-[#8e95a5] text-[11px] leading-relaxed">
                      {item.description}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-white">
                      ${(item.amountCents / 100).toFixed(2)}
                      <span className="text-[10px] text-[#64748b] font-normal ml-1">
                        ({itemPct}%)
                      </span>
                    </td>
                  </tr>
                );
              })}

              {/* Total Accounting Row */}
              <tr className="bg-[#0c1017] border-t-2 border-[#1a2333]">
                <td colSpan={4} className="py-2.5 px-3 text-[#ff8800] font-black uppercase text-[11px] tracking-wider">
                  TOTAL MONTHLY OPERATING COMMITMENT
                </td>
                <td className="py-2.5 px-3 text-right font-black text-[#00c176] text-sm">
                  ${monthlyCostUsd} / MO
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Independent Treasury Underwriting Portal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 border border-[#1a2333] bg-[#05070a] rounded-sm overflow-hidden">
        {/* Left Column: Mission Alignment Context */}
        <div className="lg:col-span-5 p-5 border-b lg:border-b-0 lg:border-r border-[#1a2333] space-y-4 bg-[#080b11]">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <span className="px-1 py-0.2 bg-[#ff8800] text-black font-black text-[9px]">&lt;ALLOC 03&gt;</span>
              <span className="text-[10px] uppercase text-[#00c176] font-bold tracking-wider">
                INDEPENDENT PATRONAGE
              </span>
            </div>
            <h2 className="text-base font-black text-white tracking-tight leading-snug">
              Underwrite Independent Market Telemetry
            </h2>
            <p className="text-xs text-[#8e95a5] leading-relaxed">
              Celsius is intentionally architected to operate with minimal overhead. When you underwrite our operating costs, you ensure that unbiased trade journaling, verified track records, and honest sentiment data remain free from broker liquidation kickbacks.
            </p>
          </div>

          <div className="p-3 rounded-sm bg-[#000000] border border-[#1a2333] space-y-1.5">
            <div className="text-[10px] text-[#ff8800] uppercase font-bold tracking-wider">
              Selected Allocation Impact
            </div>
            <p className="text-xs text-white leading-relaxed">
              {getImpactText(finalAmount)}
            </p>
          </div>

          <div className="space-y-1.5 text-[11px] text-[#8e95a5]">
            <div className="flex items-center gap-2">
              <span className="text-[#00c176] font-bold">✓</span>
              <span>100% itemized public accounting</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#00c176] font-bold">✓</span>
              <span>Optional anonymous ledger recording</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#00c176] font-bold">✓</span>
              <span>Zero third-party tracking pixels or telemetry cookies</span>
            </div>
          </div>
        </div>

        {/* Right Column: Underwriting Form */}
        <div className="lg:col-span-7 p-5 space-y-4 bg-[#05070a]">
          <form onSubmit={handleDonate} className="space-y-4">
            {/* Cadence Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase text-[#64748b] block font-bold">
                CADENCE SELECTION
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    terminalAudio.playTick();
                    setIsMonthly(true);
                  }}
                  className={`py-2 px-3 rounded-sm border text-center transition-colors font-bold ${
                    isMonthly
                      ? 'bg-[#ff8800] text-black border-[#ff8800]'
                      : 'bg-[#0c1017] text-[#8e95a5] border-[#1a2333] hover:text-white hover:border-[#ff8800]/50'
                  }`}
                >
                  &lt;MONTHLY UNDERWRITER&gt;
                </button>
                <button
                  type="button"
                  onClick={() => {
                    terminalAudio.playTick();
                    setIsMonthly(false);
                  }}
                  className={`py-2 px-3 rounded-sm border text-center transition-colors font-bold ${
                    !isMonthly
                      ? 'bg-[#ff8800] text-black border-[#ff8800]'
                      : 'bg-[#0c1017] text-[#8e95a5] border-[#1a2333] hover:text-white hover:border-[#ff8800]/50'
                  }`}
                >
                  &lt;SINGLE ALLOCATION&gt;
                </button>
              </div>
            </div>

            {/* Amount Selection Matrix */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase text-[#64748b] block font-bold">
                CONTRIBUTION AMOUNT (USD)
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[3, 5, 10, 25].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      terminalAudio.playTick();
                      setSelectedAmount(amt);
                      setIsCustom(false);
                    }}
                    className={`py-2 rounded-sm border text-xs font-bold transition-colors ${
                      !isCustom && selectedAmount === amt
                        ? 'bg-[#ff8800] text-black border-[#ff8800]'
                        : 'bg-[#0c1017] text-[#8e95a5] border-[#1a2333] hover:text-white hover:border-[#ff8800]/50'
                    }`}
                  >
                    &lt;${amt}&gt;
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    terminalAudio.playTick();
                    setIsCustom(true);
                  }}
                  className={`py-2 rounded-sm border text-xs font-bold transition-colors ${
                    isCustom
                      ? 'bg-[#ff8800] text-black border-[#ff8800]'
                      : 'bg-[#0c1017] text-[#8e95a5] border-[#1a2333] hover:text-white hover:border-[#ff8800]/50'
                  }`}
                >
                  &lt;CUSTOM&gt;
                </button>
              </div>

              {isCustom && (
                <div className="relative mt-2">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ff8800] text-xs font-bold">
                    $
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Enter custom USD allocation"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full bg-[#000000] border border-[#1a2333] rounded-sm pl-7 pr-3 py-2 text-xs text-white placeholder-[#50535e] focus:outline-none focus:border-[#ff8800]"
                    required
                  />
                </div>
              )}
            </div>

            {/* Contributor Metadata */}
            <div className="space-y-2.5 pt-2 border-t border-[#141a26]">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="anon"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded-sm border-[#1a2333] bg-[#000000] text-[#ff8800] focus:ring-0 cursor-pointer"
                />
                <label
                  htmlFor="anon"
                  className="text-xs text-[#8e95a5] cursor-pointer select-none"
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
                    className="w-full bg-[#000000] border border-[#1a2333] rounded-sm px-3 py-2 text-xs text-white placeholder-[#50535e] focus:outline-none focus:border-[#ff8800]"
                  />
                </div>
              )}

              <div>
                <input
                  type="text"
                  placeholder="Statement or Note for Public Ledger (optional)"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-[#000000] border border-[#1a2333] rounded-sm px-3 py-2 text-xs text-white placeholder-[#50535e] focus:outline-none focus:border-[#ff8800]"
                />
              </div>
            </div>

            {/* Notification Callouts */}
            {errorMsg && (
              <div className="p-2.5 rounded-sm bg-[#f23645]/10 border border-[#f23645]/40 text-[#f23645] text-xs flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-2.5 rounded-sm bg-[#00c176]/10 border border-[#00c176]/40 text-[#00c176] text-xs flex items-center gap-2">
                <Check size={14} className="shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Submission Action */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#ff8800] hover:bg-[#ffa033] text-black py-2.5 rounded-sm font-black text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-sm tracking-wider"
            >
              {loading ? (
                <span>RECORDING IN LEDGER...</span>
              ) : (
                <span>
                  &lt;CONFIRM ALLOCATION &lt;GO&gt;&gt; (${finalAmount.toFixed(2)}{' '}
                  {isMonthly ? '/ MO' : ''})
                </span>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* 4. Public Support Ledger */}
      <div className="border border-[#1a2333] bg-[#05070a] rounded-sm overflow-hidden space-y-0">
        <div className="px-4 py-2.5 border-b border-[#141a26] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="px-1 py-0.2 bg-[#ff8800] text-black font-black text-[9px]">&lt;JRNL 04&gt;</span>
            <span className="font-bold text-white tracking-tight">
              PUBLIC UNDERWRITING JOURNAL
            </span>
            <span className="text-[10px] text-[#ff8800] bg-[#101520] px-1.5 py-0.5 rounded-sm border border-[#1a2333]">
              {summary.recentDonations.length} RECORDS
            </span>
          </div>
          <span className="text-[10px] text-[#64748b]">
            APPEND-ONLY FINANCIAL JOURNAL
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#141a26] bg-[#0c1017] text-[#ff8800] text-[10px] uppercase tracking-wider">
                <th className="py-2 px-3 font-bold w-40">Timestamp</th>
                <th className="py-2 px-3 font-bold w-48">Underwriter</th>
                <th className="py-2 px-3 font-bold w-24">Cadence</th>
                <th className="py-2 px-3 font-bold">Public Note / Statement</th>
                <th className="py-2 px-3 font-bold text-right w-32">Allocation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#141a26]">
              {summary.recentDonations.map((don) => (
                <tr key={don.id} className="hover:bg-[#0c121e] transition-colors">
                  <td className="py-2.5 px-3 text-[11px] text-[#64748b]">
                    {new Date(don.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-white">
                    {don.donorName}
                  </td>
                  <td className="py-2.5 px-3 text-[10px]">
                    {don.isMonthly ? (
                      <span className="text-[#00c176] bg-[#00c176]/10 px-1.5 py-0.5 rounded-sm border border-[#00c176]/30 font-bold">
                        MONTHLY
                      </span>
                    ) : (
                      <span className="text-[#8e95a5] bg-[#101520] px-1.5 py-0.5 rounded-sm border border-[#1a2333]">
                        ONE-TIME
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-[#8e95a5] text-[11px] italic">
                    {don.message ? `“${don.message}”` : '—'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-black text-[#00c176]">
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
