'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Percent,
  DollarSign,
  AlertOctagon,
  Award,
  Zap,
  ArrowRight,
  ShieldAlert,
  Clock,
  Layers,
  Share2,
  Check,
} from 'lucide-react';
import type { BacktestReport } from '@/lib/backtestService';
import { BacktestEquityChart } from './BacktestEquityChart';
import { AdoptForwardModal } from './AdoptForwardModal';
import { formatPrice } from '@/lib/utils';

interface BacktestResultsViewProps {
  report: BacktestReport;
}

export function BacktestResultsView({ report }: BacktestResultsViewProps) {
  const [isAdoptModalOpen, setIsAdoptModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const {
    strategyName,
    symbol,
    periodDays,
    initialCapital,
    finalEquity,
    netProfitUsdt,
    returnPct,
    maxDrawdownPct,
    winRatePct,
    totalTrades,
    winningTrades,
    losingTrades,
    profitFactor,
    totalFeesPaid,
    feeDragPct,
    avgTradeDurationHours,
    trades,
    equityCurve,
    benchmark,
    honestSummaryLine,
  } = report;

  const baseAsset = symbol.replace('USDT', '');
  const isProfitable = netProfitUsdt >= 0;
  const beatBenchmark = benchmark.strategyBeatBenchmark;

  function handleShare() {
    const text = `The Honest Terminal Backtest: ${strategyName} on ${symbol} over ${periodDays}d.\n${honestSummaryLine}\nFees paid: $${totalFeesPaid.toFixed(2)}.\nBenchmark: ${benchmark.permanentStatement}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. HERO HONEST SUMMARY BANNER (Permanent Unvarnished Reality Check) */}
      <div className="rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-5 space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400">
          <AlertOctagon size={15} />
          <span>UNVARNISHED PERFORMANCE VERDICT</span>
        </div>
        <p className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
          &ldquo;{honestSummaryLine}&rdquo;
        </p>
        <p className="text-xs text-muted">
          Every number is derived strictly from Binance historical Spot candles with a mandatory 0.10% transaction fee deduction on every trade.
        </p>
      </div>

      {/* 2. PERMANENT BUY-AND-HOLD BENCHMARK COMPARISON (Never Collapsible) */}
      <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-b from-cyan-950/20 to-panel p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-subtle pb-3">
          <div className="space-y-0.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-400 uppercase">
              <Award size={13} />
              <span>Mandatory Buy-and-Hold Benchmark</span>
            </div>
            <p className="text-xs text-muted">
              Invariant: Permanently visible and never collapsible. We never hide when doing nothing beats active trading.
            </p>
          </div>
          <div
            className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full ${
              beatBenchmark
                ? 'bg-bull/10 text-bull border border-bull/30'
                : 'bg-bear/10 text-bear border border-bear/30'
            }`}
          >
            {beatBenchmark ? 'Strategy Beat Benchmark' : 'Holding Asset Beat Strategy'}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Strategy Return */}
          <div className="bg-canvas/60 border border-subtle rounded-lg p-3 space-y-1">
            <span className="text-[11px] font-mono text-faint uppercase">Active Strategy Return</span>
            <div className="font-mono text-xl font-bold text-white">
              <span className={returnPct >= 0 ? 'text-bull' : 'text-bear'}>
                {returnPct >= 0 ? '+' : ''}
                {returnPct.toFixed(2)}%
              </span>
            </div>
            <div className="text-[11px] font-mono text-muted">
              Final Equity: ${formatPrice(finalEquity)}
            </div>
          </div>

          {/* Buy and Hold Return */}
          <div className="bg-canvas/60 border border-subtle rounded-lg p-3 space-y-1">
            <span className="text-[11px] font-mono text-faint uppercase">{baseAsset} Buy-and-Hold</span>
            <div className="font-mono text-xl font-bold text-white">
              <span className={benchmark.returnPct >= 0 ? 'text-bull' : 'text-bear'}>
                {benchmark.returnPct >= 0 ? '+' : ''}
                {benchmark.returnPct.toFixed(2)}%
              </span>
            </div>
            <div className="text-[11px] font-mono text-muted">
              Passive Equity: ${formatPrice(benchmark.finalEquity)}
            </div>
          </div>

          {/* Net Alpha Difference */}
          <div className="bg-canvas/60 border border-subtle rounded-lg p-3 space-y-1">
            <span className="text-[11px] font-mono text-faint uppercase">Net Alpha Difference</span>
            <div className="font-mono text-xl font-bold text-white">
              <span className={benchmark.alphaPct >= 0 ? 'text-bull' : 'text-bear'}>
                {benchmark.alphaPct >= 0 ? '+' : ''}
                {benchmark.alphaPct.toFixed(2)}%
              </span>
            </div>
            <div className="text-[11px] font-mono text-muted">
              {beatBenchmark
                ? `+$${formatPrice(finalEquity - benchmark.finalEquity)} added vs holding`
                : `-$${formatPrice(benchmark.finalEquity - finalEquity)} lost vs doing nothing`}
            </div>
          </div>
        </div>

        <div className="p-3 bg-canvas/80 border border-subtle rounded-lg text-xs font-mono text-white flex items-center justify-between">
          <span>{benchmark.permanentStatement}</span>
          <span className="text-faint hidden md:inline">{periodDays} Days Tested</span>
        </div>
      </div>

      {/* 3. CORE PERFORMANCE METRICS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Net Profit */}
        <div className="bg-panel border border-subtle rounded-xl p-3.5 space-y-1">
          <div className="flex items-center justify-between text-muted text-xs">
            <span>Net P&L</span>
            {isProfitable ? (
              <TrendingUp size={13} className="text-bull" />
            ) : (
              <TrendingDown size={13} className="text-bear" />
            )}
          </div>
          <div
            className={`font-mono text-lg font-bold ${
              isProfitable ? 'text-bull' : 'text-bear'
            }`}
          >
            {netProfitUsdt >= 0 ? '+$' : '-$'}
            {formatPrice(Math.abs(netProfitUsdt))}
          </div>
          <div className="text-[10px] font-mono text-faint">Capital: ${formatPrice(initialCapital)}</div>
        </div>

        {/* Max Drawdown */}
        <div className="bg-panel border border-subtle rounded-xl p-3.5 space-y-1">
          <div className="flex items-center justify-between text-muted text-xs">
            <span>Max Drawdown</span>
            <AlertOctagon size={13} className="text-bear" />
          </div>
          <div className="font-mono text-lg font-bold text-bear">
            -{maxDrawdownPct.toFixed(1)}%
          </div>
          <div className="text-[10px] font-mono text-faint">Peak-to-trough drop</div>
        </div>

        {/* Win Rate */}
        <div className="bg-panel border border-subtle rounded-xl p-3.5 space-y-1">
          <div className="flex items-center justify-between text-muted text-xs">
            <span>Win Rate</span>
            <Percent size={13} className="text-amber-400" />
          </div>
          <div className="font-mono text-lg font-bold text-white">
            {winRatePct.toFixed(1)}%
          </div>
          <div className="text-[10px] font-mono text-faint">
            {winningTrades}W / {losingTrades}L
          </div>
        </div>

        {/* Total Fees Paid (What the Casino Made) */}
        <div className="bg-panel border border-amber-500/20 rounded-xl p-3.5 space-y-1 bg-amber-500/5">
          <div className="flex items-center justify-between text-amber-300 text-xs">
            <span>Fees Paid</span>
            <DollarSign size={13} className="text-amber-400" />
          </div>
          <div className="font-mono text-lg font-bold text-amber-400">
            ${formatPrice(totalFeesPaid)}
          </div>
          <div className="text-[10px] font-mono text-amber-400/80">
            {feeDragPct}% capital drag
          </div>
        </div>

        {/* Profit Factor */}
        <div className="bg-panel border border-subtle rounded-xl p-3.5 space-y-1">
          <div className="flex items-center justify-between text-muted text-xs">
            <span>Profit Factor</span>
            <Layers size={13} className="text-cyan-400" />
          </div>
          <div className="font-mono text-lg font-bold text-white">
            {profitFactor > 99 ? '∞' : profitFactor.toFixed(2)}
          </div>
          <div className="text-[10px] font-mono text-faint">Gross Win / Gross Loss</div>
        </div>

        {/* Total Trades & Duration */}
        <div className="bg-panel border border-subtle rounded-xl p-3.5 space-y-1">
          <div className="flex items-center justify-between text-muted text-xs">
            <span>Total Trades</span>
            <Clock size={13} className="text-faint" />
          </div>
          <div className="font-mono text-lg font-bold text-white">{totalTrades}</div>
          <div className="text-[10px] font-mono text-faint">
            Avg: {avgTradeDurationHours}h hold
          </div>
        </div>
      </div>

      {/* 4. INTERACTIVE EQUITY CURVE CHART */}
      <BacktestEquityChart data={equityCurve} symbol={symbol} />

      {/* 5. CALL TO ACTION: RUN FORWARD IN PAPER TRADING & SHARE */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-panel border border-subtle rounded-xl">
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Zap size={15} className="text-primary" />
            <span>Test this live without risking real money</span>
          </h4>
          <p className="text-xs text-muted max-w-xl">
            Run this strategy forward in our paper trading engine. We track real Binance execution fills
            and enforce your personal risk cap so you can verify live viability.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleShare}
            className="btn btn-secondary px-3.5 py-2 text-xs font-mono flex items-center gap-1.5"
            title="Share honest backtest results"
          >
            {copied ? <Check size={13} className="text-bull" /> : <Share2 size={13} />}
            <span>{copied ? 'Copied' : 'Share Result'}</span>
          </button>

          <button
            onClick={() => setIsAdoptModalOpen(true)}
            className="btn btn-primary px-4 py-2 text-xs font-bold flex items-center gap-1.5"
          >
            <span>Run Forward in Paper Trading</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* 6. TRADE HISTORY LOG (Equal Billing for Losses & Wins) */}
      <div className="bg-panel border border-subtle rounded-xl overflow-hidden space-y-3 p-5">
        <div className="flex items-center justify-between border-b border-subtle pb-3">
          <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-white">Simulated Trades Log</h4>
            <p className="text-xs text-muted">
              Equal prominence for losses and wins. Every trade accounts for entry/exit fee deductions.
            </p>
          </div>
          <div className="text-xs font-mono text-faint">
            {totalTrades} Closed Positions
          </div>
        </div>

        {trades.length === 0 ? (
          <div className="py-8 text-center text-xs text-faint">
            No closed trades triggered during this backtest window.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="text-[11px] text-faint uppercase border-b border-subtle/50">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Entry Time</th>
                  <th className="py-2.5 px-3">Exit Time</th>
                  <th className="py-2.5 px-3 text-right">Entry Price</th>
                  <th className="py-2.5 px-3 text-right">Exit Price</th>
                  <th className="py-2.5 px-3 text-right">Fees</th>
                  <th className="py-2.5 px-3 text-right">Net P&L ($)</th>
                  <th className="py-2.5 px-3 text-right">Net P&L (%)</th>
                  <th className="py-2.5 px-3 text-center">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-subtle/30">
                {trades.map((t, idx) => (
                  <tr key={t.id || idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-2.5 px-3 text-muted">{idx + 1}</td>
                    <td className="py-2.5 px-3 text-muted">
                      {new Date(t.entryTime).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="py-2.5 px-3 text-muted">
                      {new Date(t.exitTime).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="py-2.5 px-3 text-right text-white">
                      ${formatPrice(t.entryPrice)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-white">
                      ${formatPrice(t.exitPrice)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-amber-400">
                      -${formatPrice(t.feesPaidUsdt)}
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-bold ${
                        t.isWin ? 'text-bull' : 'text-bear'
                      }`}
                    >
                      {t.netPnlUsdt >= 0 ? '+$' : '-$'}
                      {formatPrice(Math.abs(t.netPnlUsdt))}
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-bold ${
                        t.isWin ? 'text-bull' : 'text-bear'
                      }`}
                    >
                      {t.netPnlPct >= 0 ? '+' : ''}
                      {t.netPnlPct.toFixed(2)}%
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.isWin
                            ? 'bg-bull/10 text-bull border border-bull/20'
                            : 'bg-bear/10 text-bear border border-bear/20'
                        }`}
                      >
                        {t.isWin ? 'WIN' : 'LOSS'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Forward Adoption */}
      <AdoptForwardModal
        report={report}
        isOpen={isAdoptModalOpen}
        onClose={() => setIsAdoptModalOpen(false)}
      />
    </div>
  );
}
