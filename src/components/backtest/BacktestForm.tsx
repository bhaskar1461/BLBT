'use client';

import React, { useState } from 'react';
import {
  Play,
  RotateCcw,
  Sliders,
  AlertTriangle,
  Info,
  Calendar,
  DollarSign,
  TrendingUp,
  Sparkles,
  CheckCircle,
} from 'lucide-react';
import type { StrategyType, BacktestParams, BacktestPreset } from '@/lib/backtestService';
import { TiltCard3D } from '@/components/3d/TiltCard3D';

interface BacktestFormProps {
  presets: BacktestPreset[];
  initialReport?: any;
  onRunBacktest: (params: {
    strategyType: StrategyType;
    symbol: string;
    timeframe: string;
    periodDays: number;
    initialCapital: number;
    params: BacktestParams;
  }) => Promise<void>;
  loading: boolean;
}

export function BacktestForm({
  presets,
  onRunBacktest,
  loading,
}: BacktestFormProps) {
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyType>('ma_crossover');
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [timeframe, setTimeframe] = useState('1d');
  const [periodDays, setPeriodDays] = useState(90);
  const [initialCapital, setInitialCapital] = useState(10000);

  // Strategy Specific Parameters
  const [fastPeriod, setFastPeriod] = useState(9);
  const [slowPeriod, setSlowPeriod] = useState(21);
  const [maType, setMaType] = useState<'SMA' | 'EMA'>('SMA');

  const [rsiPeriod, setRsiPeriod] = useState(14);
  const [rsiOversold, setRsiOversold] = useState(30);
  const [rsiOverbought, setRsiOverbought] = useState(70);

  const [breakoutLookback, setBreakoutLookback] = useState(20);
  const [exitLookback, setExitLookback] = useState(10);

  const [dcaIntervalCandles, setDcaIntervalCandles] = useState(7);

  const activePreset = presets.find((p) => p.strategyType === selectedStrategy) || presets[0];

  const symbols = [
    { value: 'BTCUSDT', label: 'BTC / USDT', name: 'Bitcoin' },
    { value: 'ETHUSDT', label: 'ETH / USDT', name: 'Ethereum' },
    { value: 'SOLUSDT', label: 'SOL / USDT', name: 'Solana' },
    { value: 'BNBUSDT', label: 'BNB / USDT', name: 'BNB' },
  ];

  const periods = [
    { days: 30, label: '30 Days' },
    { days: 90, label: '90 Days' },
    { days: 180, label: '180 Days' },
    { days: 365, label: '1 Year' },
  ];

  // Beginner friendly translations
  const beginnerTranslations: Record<StrategyType, { tag: string; explanation: string }> = {
    ma_crossover: {
      tag: 'Trend Surfer',
      explanation: 'Rides big breakout waves. Great during rapid rallies, but prone to false alarms in flat markets.',
    },
    rsi_thresholds: {
      tag: 'The Dip Buyer',
      explanation: 'Waits for panic selling to buy cheap (oversold), and exits when the market becomes greedy.',
    },
    breakouts: {
      tag: 'Turtle Breakout',
      explanation: 'Buys when price breaks its 20-day high. Classic systematic wall-street trend following.',
    },
    dca: {
      tag: 'Disciplined Saver',
      explanation: 'Buys fixed dollars regularly regardless of price. Statistically beats 90% of day traders.',
    },
  };

  // Beginner One-Click Quick Presets
  const handleQuickPreset = (strat: StrategyType, days: number, coin: string) => {
    setSelectedStrategy(strat);
    setPeriodDays(days);
    setSymbol(coin);
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const strategyParams: BacktestParams = {};

    if (selectedStrategy === 'ma_crossover') {
      strategyParams.fastPeriod = fastPeriod;
      strategyParams.slowPeriod = slowPeriod;
      strategyParams.maType = maType;
    } else if (selectedStrategy === 'rsi_thresholds') {
      strategyParams.rsiPeriod = rsiPeriod;
      strategyParams.rsiOversold = rsiOversold;
      strategyParams.rsiOverbought = rsiOverbought;
    } else if (selectedStrategy === 'breakouts') {
      strategyParams.breakoutLookback = breakoutLookback;
      strategyParams.exitLookback = exitLookback;
    } else if (selectedStrategy === 'dca') {
      strategyParams.dcaIntervalCandles = dcaIntervalCandles;
    }

    onRunBacktest({
      strategyType: selectedStrategy,
      symbol,
      timeframe,
      periodDays,
      initialCapital,
      params: strategyParams,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface border border-subtle rounded-2xl p-6 space-y-6 shadow-xl">
      {/* Beginner Quick Presets Banner */}
      <div className="p-3.5 rounded-xl bg-canvas border border-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Sparkles size={15} className="text-amber-400" />
          <span className="font-extrabold text-white">Beginner 1-Click Presets:</span>
          <span className="text-muted text-[11px] hidden md:inline">Test realistic historical outcomes in 1 click</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => handleQuickPreset('dca', 365, 'BTCUSDT')}
            className="px-2.5 py-1 rounded-lg bg-surface hover:bg-hover border border-subtle text-[11px] font-mono text-zinc-300 hover:text-white transition-colors"
          >
            🛡️ Safe Accumulator (DCA 1Y)
          </button>
          <button
            type="button"
            onClick={() => handleQuickPreset('ma_crossover', 90, 'BTCUSDT')}
            className="px-2.5 py-1 rounded-lg bg-surface hover:bg-hover border border-subtle text-[11px] font-mono text-zinc-300 hover:text-white transition-colors"
          >
            🏄 Trend Surfer (MA 90D)
          </button>
          <button
            type="button"
            onClick={() => handleQuickPreset('rsi_thresholds', 180, 'ETHUSDT')}
            className="px-2.5 py-1 rounded-lg bg-surface hover:bg-hover border border-subtle text-[11px] font-mono text-zinc-300 hover:text-white transition-colors"
          >
            🎯 Dip Hunter (RSI 180D)
          </button>
        </div>
      </div>

      {/* 1. Strategy Selector Tabs with 3D Tilt */}
      <div className="space-y-3">
        <label className="text-xs font-mono uppercase tracking-wider text-muted flex items-center justify-between">
          <span className="text-white font-bold">Preset Strategy Library</span>
          <span className="text-faint text-[11px] font-sans">Tested against real Binance historical candles</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {presets.map((preset) => {
            const isSelected = selectedStrategy === preset.strategyType;
            const beginnerInfo = beginnerTranslations[preset.strategyType];

            return (
              <TiltCard3D key={preset.id} maxTilt={5}>
                <button
                  type="button"
                  onClick={() => setSelectedStrategy(preset.strategyType)}
                  className={`w-full p-4 rounded-xl border text-left transition-all h-full flex flex-col justify-between ${
                    isSelected
                      ? 'bg-primary/15 border-primary text-white shadow-lg shadow-primary/15'
                      : 'bg-canvas border-subtle text-muted hover:border-muted hover:text-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <div className="font-extrabold text-xs text-white leading-tight">
                        {preset.name.split('(')[0]}
                      </div>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-white/5 border border-subtle text-amber-300">
                        {beginnerInfo.tag}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-300 leading-snug mb-2 font-medium">
                      {beginnerInfo.explanation}
                    </div>
                  </div>

                  <div className="text-[10px] text-faint line-clamp-1 border-t border-subtle pt-2 mt-auto">
                    {preset.description}
                  </div>
                </button>
              </TiltCard3D>
            );
          })}
        </div>

        {/* Reality Fact Box for the Selected Strategy */}
        {activePreset && (
          <div className="p-3.5 bg-canvas border border-subtle rounded-xl text-xs flex items-start gap-2.5 text-muted">
            <Info size={15} className="text-amber-400 mt-0.5 shrink-0" />
            <div className="space-y-0.5">
              <span className="font-extrabold text-amber-300">The Reality Fact:</span>{' '}
              <span className="text-zinc-300 leading-relaxed">{activePreset.realityFact}</span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Asset & Time Horizon Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-subtle">
        {/* Symbol */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono text-muted">Trading Pair</label>
          <div className="grid grid-cols-2 gap-1.5">
            {symbols.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setSymbol(s.value)}
                className={`px-3 py-2 rounded-xl border text-xs font-mono font-bold transition-all ${
                  symbol === s.value
                    ? 'bg-primary/20 border-primary text-white shadow-sm'
                    : 'bg-canvas border-subtle text-muted hover:border-muted hover:text-white'
                }`}
              >
                {s.value.replace('USDT', '')}
              </button>
            ))}
          </div>
        </div>

        {/* Duration / Horizon */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono text-muted">Test Period</label>
          <div className="grid grid-cols-2 gap-1.5">
            {periods.map((p) => (
              <button
                key={p.days}
                type="button"
                onClick={() => setPeriodDays(p.days)}
                className={`px-3 py-2 rounded-xl border text-xs font-mono font-bold transition-all ${
                  periodDays === p.days
                    ? 'bg-white/10 border-white text-white shadow-sm'
                    : 'bg-canvas border-subtle text-muted hover:border-muted hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Initial Capital */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono text-muted">Starting Capital (USDT)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-faint font-mono text-xs">$</span>
            <input
              type="number"
              min="100"
              max="1000000"
              step="100"
              value={initialCapital}
              onChange={(e) => setInitialCapital(Math.max(100, parseInt(e.target.value) || 10000))}
              className="w-full bg-canvas border border-subtle rounded-xl py-2 pl-7 pr-3 text-xs font-mono text-white focus:outline-none focus:border-primary transition-all"
            />
          </div>
          <span className="text-[10px] text-faint font-mono">Standard paper account: $10,000 USDT</span>
        </div>
      </div>

      {/* 3. Strategy Dynamic Parameters */}
      <div className="p-4 bg-canvas border border-subtle rounded-2xl space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono text-white font-bold">
          <Sliders size={14} className="text-primary" />
          <span>Strategy Parameter Tuning</span>
        </div>

        {selectedStrategy === 'ma_crossover' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="space-y-1">
              <label className="text-muted font-mono text-[11px]">Fast MA Period (Days)</label>
              <input
                type="number"
                min="2"
                max="50"
                value={fastPeriod}
                onChange={(e) => setFastPeriod(parseInt(e.target.value) || 9)}
                className="w-full bg-surface border border-subtle rounded-xl py-2 px-3 text-xs font-mono text-white focus:outline-none focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-muted font-mono text-[11px]">Slow MA Period (Days)</label>
              <input
                type="number"
                min="5"
                max="200"
                value={slowPeriod}
                onChange={(e) => setSlowPeriod(parseInt(e.target.value) || 21)}
                className="w-full bg-surface border border-subtle rounded-xl py-2 px-3 text-xs font-mono text-white focus:outline-none focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-muted font-mono text-[11px]">MA Type</label>
              <select
                value={maType}
                onChange={(e) => setMaType(e.target.value as 'SMA' | 'EMA')}
                className="w-full bg-surface border border-subtle rounded-xl py-2 px-3 text-xs font-mono text-white focus:outline-none focus:border-primary transition-all cursor-pointer"
              >
                <option value="SMA">SMA (Simple Moving Average)</option>
                <option value="EMA">EMA (Exponential Moving Average)</option>
              </select>
            </div>
          </div>
        )}

        {selectedStrategy === 'rsi_thresholds' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="space-y-1">
              <label className="text-muted font-mono text-[11px]">RSI Period</label>
              <input
                type="number"
                min="3"
                max="30"
                value={rsiPeriod}
                onChange={(e) => setRsiPeriod(parseInt(e.target.value) || 14)}
                className="w-full bg-surface border border-subtle rounded-xl py-2 px-3 text-xs font-mono text-white focus:outline-none focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-muted font-mono text-[11px]">Oversold Buy Level (&lt;)</label>
              <input
                type="number"
                min="10"
                max="45"
                value={rsiOversold}
                onChange={(e) => setRsiOversold(parseInt(e.target.value) || 30)}
                className="w-full bg-surface border border-subtle rounded-xl py-2 px-3 text-xs font-mono text-white focus:outline-none focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-muted font-mono text-[11px]">Overbought Sell Level (&gt;)</label>
              <input
                type="number"
                min="55"
                max="90"
                value={rsiOverbought}
                onChange={(e) => setRsiOverbought(parseInt(e.target.value) || 70)}
                className="w-full bg-surface border border-subtle rounded-xl py-2 px-3 text-xs font-mono text-white focus:outline-none focus:border-primary transition-all"
              />
            </div>
          </div>
        )}

        {selectedStrategy === 'breakouts' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <label className="text-muted font-mono text-[11px]">High Breakout Lookback (Bars)</label>
              <input
                type="number"
                min="5"
                max="60"
                value={breakoutLookback}
                onChange={(e) => setBreakoutLookback(parseInt(e.target.value) || 20)}
                className="w-full bg-surface border border-subtle rounded-xl py-2 px-3 text-xs font-mono text-white focus:outline-none focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-muted font-mono text-[11px]">Exit Low Lookback (Bars)</label>
              <input
                type="number"
                min="3"
                max="30"
                value={exitLookback}
                onChange={(e) => setExitLookback(parseInt(e.target.value) || 10)}
                className="w-full bg-surface border border-subtle rounded-xl py-2 px-3 text-xs font-mono text-white focus:outline-none focus:border-primary transition-all"
              />
            </div>
          </div>
        )}

        {selectedStrategy === 'dca' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <label className="text-muted font-mono text-[11px]">Deployment Interval (Candles)</label>
              <input
                type="number"
                min="1"
                max="30"
                value={dcaIntervalCandles}
                onChange={(e) => setDcaIntervalCandles(parseInt(e.target.value) || 7)}
                className="w-full bg-surface border border-subtle rounded-xl py-2 px-3 text-xs font-mono text-white focus:outline-none focus:border-primary transition-all"
              />
              <span className="text-[10px] text-faint font-mono">e.g. 7 candles = once a week on 1D timeframe</span>
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-between pt-2 border-t border-subtle">
        <div className="text-[11px] font-mono text-faint hidden sm:block">
          Fee invariant: 0.10% deducted server-side on every trade
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-extrabold text-xs flex items-center gap-2 w-full sm:w-auto justify-center shadow-lg shadow-primary/20 transition-all"
        >
          {loading ? (
            <>
              <RotateCcw size={15} className="animate-spin" />
              <span>Simulating Against Binance Data...</span>
            </>
          ) : (
            <>
              <Play size={15} />
              <span>Run Server-Side Backtest</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
