// src/components/funding/FundingClientView.tsx
'use client';

import React, { useState } from 'react';
import {
  Heart,
  ShieldCheck,
  Server,
  Database,
  Radio,
  Lock,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
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
      setErrorMsg('Please enter a valid contribution amount');
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
        throw new Error(data.error || 'Failed to process contribution');
      }

      setSuccessMsg(`Thank you for contributing $${finalAmount.toFixed(2)} to protect independent trading transparency!`);

      // Refresh summary
      const refreshRes = await fetch('/api/funding');
      const refreshData = await refreshRes.json();
      if (refreshData.summary) {
        setSummary(refreshData.summary);
      }

      // Reset fields
      setMessage('');
      if (!isAnonymous) setDonorName('');
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during submission');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: CostItem['category']) => {
    switch (category) {
      case 'infrastructure':
        return <Server size={14} className="text-bull" />;
      case 'database':
        return <Database size={14} className="text-primary" />;
      case 'market_data_feeds':
        return <Radio size={14} className="text-amber-400" />;
      case 'security_and_dns':
        return <Lock size={14} className="text-emerald-400" />;
      default:
        return <Server size={14} />;
    }
  };

  const monthlyCostUsd = (summary.monthlyOperatingCostCents / 100).toFixed(2);
  const monthlyDonationsUsd = (summary.monthlyDonationsCents / 100).toFixed(2);
  const reserveUsd = (summary.currentReserveCents / 100).toFixed(2);

  return (
    <div className="space-y-10">
      {/* Metrics Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Monthly Cost */}
        <div className="p-5 rounded-2xl bg-panel border border-subtle space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-faint uppercase">Monthly Operating Cost</span>
            <Server size={14} className="text-muted" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            ${monthlyCostUsd}
            <span className="text-xs font-normal text-muted ml-1">/ month</span>
          </div>
          <p className="text-[11px] text-muted">
            Itemized down to the penny. Zero bloated corporate overhead.
          </p>
        </div>

        {/* Monthly Donations */}
        <div className="p-5 rounded-2xl bg-panel border border-subtle space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-faint uppercase">Community Inflow (This Month)</span>
            <Heart size={14} className="text-bull" />
          </div>
          <div className="text-2xl font-black text-bull font-mono">
            ${monthlyDonationsUsd}
            <span className="text-xs font-normal text-muted ml-1">
              ({summary.currentMonthCoveredPct}% covered)
            </span>
          </div>
          <p className="text-[11px] text-muted">
            Micro-donations from traders who value honest numbers.
          </p>
        </div>

        {/* Runway */}
        <div className="p-5 rounded-2xl bg-panel border border-subtle space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-faint uppercase">Treasury Runway</span>
            <ShieldCheck size={14} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {summary.runwayMonths} Months
            <span className="text-xs font-normal text-muted ml-1">(${reserveUsd} in reserve)</span>
          </div>
          <p className="text-[11px] text-muted">
            Sufficient runway to operate without answering to VC or casino broker pressure.
          </p>
        </div>
      </div>

      {/* Itemized Cost Breakdown Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Server size={16} className="text-bull" />
            <span>Itemized Operating Expenses</span>
          </h2>
          <span className="text-xs font-mono text-faint">Audited & Verified Monthly</span>
        </div>

        <div className="border border-subtle rounded-xl overflow-hidden bg-panel">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-subtle bg-surface/60 text-faint font-mono text-[11px]">
                <th className="py-3 px-4">Line Item</th>
                <th className="py-3 px-4">Provider</th>
                <th className="py-3 px-4">Purpose</th>
                <th className="py-3 px-4 text-right">Monthly Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-subtle/60">
              {summary.costBreakdown.map((item) => (
                <tr key={item.id} className="hover:bg-hover/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2 font-medium text-white">
                      {getCategoryIcon(item.category)}
                      <span>{item.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-muted text-[11px]">
                    {item.provider}
                  </td>
                  <td className="py-3.5 px-4 text-muted text-[11px] leading-relaxed max-w-md">
                    {item.description}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                    ${(item.amountCents / 100).toFixed(2)}
                  </td>
                </tr>
              ))}
              <tr className="bg-surface/80 font-bold">
                <td colSpan={3} className="py-3 px-4 text-white uppercase text-[11px] font-mono">
                  Total Monthly Operating Commitment
                </td>
                <td className="py-3 px-4 text-right font-mono text-bull text-sm">
                  ${monthlyCostUsd} / mo
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Support The Truth Contribution Dock */}
      <div className="bg-panel border border-subtle rounded-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-bull/15 text-bull border border-bull/30 text-[11px] font-mono font-bold">
            <Heart size={12} />
            <span>SUPPORT THE TRUTH</span>
          </div>
          <h2 className="text-xl font-extrabold text-white">
            Fund the only platform that profits from you not losing money.
          </h2>
          <p className="text-xs text-muted leading-relaxed max-w-2xl">
            Casino brokers make fortunes when you blow up. Celsius is funded by community members who believe
            unfiltered market truth and cryptographic proof should remain free for everyone.
          </p>
        </div>

        <form onSubmit={handleDonate} className="space-y-5 max-w-xl">
          {/* Cadence Toggle */}
          <div className="inline-flex rounded-lg bg-surface p-1 border border-subtle text-xs">
            <button
              type="button"
              onClick={() => setIsMonthly(true)}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                isMonthly ? 'bg-bull text-black font-bold' : 'text-muted hover:text-white'
              }`}
            >
              Monthly Supporter (Recommended)
            </button>
            <button
              type="button"
              onClick={() => setIsMonthly(false)}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                !isMonthly ? 'bg-bull text-black font-bold' : 'text-muted hover:text-white'
              }`}
            >
              One-Time Contribution
            </button>
          </div>

          {/* Amount Presets */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-faint block uppercase">Select Contribution Amount</label>
            <div className="grid grid-cols-5 gap-2">
              {[3, 5, 10, 25].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    setSelectedAmount(amt);
                    setIsCustom(false);
                  }}
                  className={`py-2 rounded-lg text-xs font-mono font-bold border transition-colors ${
                    !isCustom && selectedAmount === amt
                      ? 'bg-bull/20 text-bull border-bull shadow-sm'
                      : 'bg-surface text-muted border-subtle hover:text-white hover:border-zinc-700'
                  }`}
                >
                  ${amt}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setIsCustom(true)}
                className={`py-2 rounded-lg text-xs font-mono font-bold border transition-colors ${
                  isCustom
                    ? 'bg-bull/20 text-bull border-bull shadow-sm'
                    : 'bg-surface text-muted border-subtle hover:text-white hover:border-zinc-700'
                }`}
              >
                Custom
              </button>
            </div>

            {isCustom && (
              <div className="relative mt-2">
                <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
                <input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Enter custom amount in USD"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full bg-surface border border-subtle rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-faint focus:outline-none focus:border-bull font-mono"
                  required
                />
              </div>
            )}
          </div>

          {/* Donor Info */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="anon"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="rounded border-subtle text-bull focus:ring-bull"
              />
              <label htmlFor="anon" className="text-xs text-muted cursor-pointer select-none">
                Contribute anonymously (hide my name on public ledger)
              </label>
            </div>

            {!isAnonymous && (
              <input
                type="text"
                placeholder="Your Name or Handle (optional)"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                className="w-full bg-surface border border-subtle rounded-lg px-3 py-2 text-xs text-white placeholder-faint focus:outline-none focus:border-bull font-sans"
              />
            )}

            <input
              type="text"
              placeholder="Leave an encouraging note for the platform (optional)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-surface border border-subtle rounded-lg px-3 py-2 text-xs text-white placeholder-faint focus:outline-none focus:border-bull font-sans"
            />
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="p-3 rounded-lg bg-bear/15 border border-bear/30 text-bear text-xs flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-lg bg-bull/15 border border-bull/30 text-bull text-xs flex items-center gap-2">
              <CheckCircle2 size={14} className="shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Processing...</span>
            ) : (
              <>
                <Heart size={14} className="fill-black" />
                <span>
                  Confirm Contribution (${finalAmount.toFixed(2)} {isMonthly ? '/ month' : ''})
                </span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Recent Public Contributions Ledger */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Heart size={16} className="text-bull" />
            <span>Public Support Ledger</span>
          </h2>
          <span className="text-xs font-mono text-faint">
            {summary.recentDonations.length} Contributions Recorded
          </span>
        </div>

        <div className="border border-subtle rounded-xl overflow-hidden bg-panel">
          <div className="divide-y divide-subtle/60">
            {summary.recentDonations.map((don) => (
              <div key={don.id} className="p-4 flex items-start justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{don.donorName}</span>
                    {don.isMonthly && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-bull/15 text-bull border border-bull/30">
                        MONTHLY
                      </span>
                    )}
                  </div>
                  {don.message && (
                    <p className="text-muted text-[11px] italic">“{don.message}”</p>
                  )}
                  <div className="text-faint font-mono text-[10px]">
                    {new Date(don.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                </div>

                <div className="text-right font-mono font-bold text-bull text-sm shrink-0">
                  +${(don.amountCents / 100).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
