'use client';

import React, { useState } from 'react';
import { Shield, Zap, X, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import type { BacktestReport } from '@/lib/backtestService';

interface AdoptForwardModalProps {
  report: BacktestReport;
  isOpen: boolean;
  onClose: () => void;
}

export function AdoptForwardModal({ report, isOpen, onClose }: AdoptForwardModalProps) {
  const [riskCap, setRiskCap] = useState(1.0);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleAdopt() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/backtest/adopt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategyType: report.strategyType,
          symbol: report.symbol,
          timeframe: report.timeframe,
          parameters: report.parameters,
          riskPerTradeCapPct: riskCap,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to deploy forward strategy');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Error adopting forward strategy');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#12131a] border border-subtle w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">
              <Zap size={12} />
              <span>Forward Paper Trading</span>
            </div>
            <h3 className="text-lg font-bold text-white">Run Strategy Forward</h3>
          </div>
          <button
            onClick={onClose}
            className="text-faint hover:text-white p-1 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {success ? (
          <div className="space-y-5 text-center py-4">
            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={24} />
            </div>
            <div className="space-y-2">
              <h4 className="text-base font-bold text-white">Strategy Queued For Forward Paper Trading</h4>
              <p className="text-xs text-muted max-w-sm mx-auto">
                <span className="font-semibold text-white">{report.strategyName}</span> on{' '}
                <span className="font-mono text-white">{report.symbol}</span> will track live Binance Spot ticks
                with an enforced <span className="text-emerald-400 font-mono">{riskCap}% risk cap</span> per trade.
              </p>
            </div>
            <div className="pt-2 flex justify-center">
              <button
                onClick={onClose}
                className="btn btn-primary px-6 py-2 rounded-lg text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5 text-xs">
            <div className="bg-canvas border border-subtle rounded-xl p-4 space-y-3 font-mono">
              <div className="flex justify-between">
                <span className="text-faint">Strategy:</span>
                <span className="text-white font-bold">{report.strategyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-faint">Asset:</span>
                <span className="text-white font-bold">{report.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-faint">Backtested Fee Drag:</span>
                <span className="text-amber-400 font-bold">${report.totalFeesPaid.toFixed(2)} ({report.feeDragPct}%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-faint">Historical Max Drawdown:</span>
                <span className="text-bear font-bold">-{report.maxDrawdownPct.toFixed(1)}%</span>
              </div>
            </div>

            {/* Risk Management Invariant Guardrail */}
            <div className="space-y-2">
              <label className="text-muted font-medium flex items-center justify-between">
                <span>Risk Cap Per Trade (% of Account)</span>
                <span className="font-mono font-bold text-white">{riskCap}%</span>
              </label>
              <input
                type="range"
                min="0.25"
                max="5.0"
                step="0.25"
                value={riskCap}
                onChange={(e) => setRiskCap(parseFloat(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex items-center gap-1.5 text-[11px] text-faint">
                <Shield size={12} className="text-bull" />
                <span>Default 1.0% cap protects your paper account from catastrophic ruin streaks.</span>
              </div>
            </div>

            {/* Reality Notice */}
            <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 text-amber-300 text-[11px] space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle size={13} />
                <span>Honest Guardrail Notice</span>
              </div>
              <p className="text-faint">
                Paper trading forward validates live fill viability without execution slippage illusions.
                All fills adhere to the 0.10% fee invariant and tamper-evident append-only ledger.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-bear/10 border border-bear/30 rounded-lg text-bear text-xs">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary px-4 py-2 rounded-lg text-xs"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAdopt}
                disabled={submitting}
                className="btn btn-primary px-5 py-2 rounded-lg text-xs font-bold inline-flex items-center gap-1.5"
              >
                {submitting ? 'Deploying...' : 'Deploy Forward in Paper Trading'}
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
