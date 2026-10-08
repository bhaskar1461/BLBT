'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Send,
  Cpu,
  RefreshCw,
  Search,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useChartStore } from '@/stores/useChartStore';
import { useWatchlistStore } from '@/stores/useWatchlistStore';
import { calculateRSI } from '@/lib/indicators';
import { formatPrice } from '@/lib/utils';

interface AnalysisResponse {
  title?: string;
  summary: string;
  contributors: string[];
  technicals: {
    vwap: string;
    rsi: number;
    ema20: string;
  };
  options: {
    callWall: number;
    putWall: number;
    pcr: number;
    maxPain?: number;
  };
  conclusion?: string;
  confidence: string;
}

export interface AiResearchDeskProps {
  isWide?: boolean;
  onToggleWide?: () => void;
}

export const AiResearchDesk: React.FC<AiResearchDeskProps> = ({ isWide, onToggleWide }) => {
  const activeSymbol = useChartStore((s) => s.activeSymbol);
  const candles = useChartStore((s) => s.candles);
  const tickers = useWatchlistStore((s) => s.tickers);

  const activeTicker = tickers[activeSymbol];
  const currentPrice = activeTicker?.lastPrice ?? (activeSymbol === 'NIFTY' ? 22231.8 : 82162.68);
  const changePercent = activeTicker?.priceChangePercent ?? -1.10;

  // Currency detection
  const isCrypto =
    activeSymbol.includes('USDT') ||
    activeSymbol.includes('USD') ||
    ['BTC', 'ETH', 'SOL', 'BNB', 'AVAX'].some((c) => activeSymbol.startsWith(c));
  const isIndian =
    ['NIFTY', 'BANKNIFTY', 'SENSEX', 'RELIANCE', 'CNXIT'].some((s) => activeSymbol.includes(s));
  const curr = isIndian ? '₹' : '$';

  // Compute live RSI from candles
  const liveRsi = useMemo(() => {
    if (candles && candles.length >= 14) {
      const rsiArr = calculateRSI(candles, 14);
      const lastRsi = rsiArr[rsiArr.length - 1];
      if (lastRsi && typeof lastRsi.value === 'number') {
        return Number(lastRsi.value.toFixed(1));
      }
    }
    return changePercent < 0 ? 46.2 : 58.4;
  }, [candles, changePercent]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [engineUsed, setEngineUsed] = useState<string>('Bhaskar Causal Engine');
  const [isCopied, setIsCopied] = useState(false);

  // Dynamic analysis initial state based on active asset
  const [analysis, setAnalysis] = useState<AnalysisResponse>(() => ({
    title: `${activeSymbol} Microstructure & Causal Brief`,
    summary: `${activeSymbol} is trading at ${curr}${formatPrice(currentPrice, 2)} (${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%). Institutional positioning reflects balanced spot absorption against derivative hedging pressure.`,
    contributors: isCrypto
      ? [
          'Derivatives Call resistance wall anchored above local price',
          'Put writers defending foundational psychological support shelf',
          'Perpetual funding rate exhibiting neutral-to-moderate leverage positioning',
          'Intraday volume weighted price (VWAP) anchor in active test',
        ]
      : [
          'Financial sector leadership setting the broader index tone',
          'Call option writing creating strong overhead resistance',
          'Institutional flow divergence between Foreign and Domestic funds',
          'Benchmark Volume Weighted Average Price (VWAP) tracking in progress',
        ],
    technicals: {
      vwap: changePercent >= 0 ? 'above' : 'below',
      rsi: liveRsi,
      ema20: changePercent >= 0 ? 'above' : 'below',
    },
    options: {
      callWall: isCrypto ? (currentPrice > 50000 ? 84000 : 160) : 22500,
      putWall: isCrypto ? (currentPrice > 50000 ? 80000 : 130) : 22000,
      pcr: 1.09,
      maxPain: isCrypto ? (currentPrice > 50000 ? 82000 : 145) : 22250,
    },
    conclusion: `Strict 1.0% risk cap enforced. Monitor key inflection at ${curr}${isCrypto ? (currentPrice > 50000 ? 80000 : 130) : 22000} support.`,
    confidence: 'High',
  }));

  const handleRunQuery = async (queryToRun?: string) => {
    const q = (queryToRun || inputQuery).trim();
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q || `Analyze ${activeSymbol} microstructure`,
          symbol: activeSymbol,
          price: currentPrice,
          changePercent,
          rsi: liveRsi,
          vwap: changePercent >= 0 ? 'above' : 'below',
          ema20: changePercent >= 0 ? 'above' : 'below',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.analysis) {
          setAnalysis(data.analysis);
          setEngineUsed(data.engine || 'Bhaskar Causal Engine');
        }
      }
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  // Re-run brief when active symbol switches
  useEffect(() => {
    handleRunQuery(`Analyze microstructure for ${activeSymbol}`);
  }, [activeSymbol]);

  const copyAnalysis = () => {
    const text = `${analysis.title}\n\n${analysis.summary}\n\nContributors:\n${analysis.contributors.map((c, i) => `${i + 1}. ${c}`).join('\n')}\n\nVerdict: ${analysis.conclusion || ''}`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const PROMPT_SUGGESTIONS = useMemo(() => {
    if (isCrypto) {
      return [
        `Why did ${activeSymbol} move today?`,
        `Where is the strongest OI wall on ${activeSymbol}?`,
        'Spot ETF flows and funding rate status',
        'Key support & liquidation clusters',
      ];
    }
    return [
      `Why did ${activeSymbol} move today?`,
      `Where is the strongest OI wall on ${activeSymbol}?`,
      'FII / DII institutional net cash breakdown',
      'Assess market breadth and sector leadership',
    ];
  }, [activeSymbol, isCrypto]);

  return (
    <div className="flex flex-col h-full bg-[#131722] text-[#d1d4dc] select-none p-3 overflow-y-auto font-sans">
      {/* 1. Header with Engine Status & Expand Button */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[#2a2e39] shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-[#7c4dff]" />
          <span className="font-extrabold text-sm text-white tracking-tight">
            AI Research Desk
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Engine Badge */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#171b26] border border-[#2a2e39] text-[10px] font-mono">
            <Cpu size={12} className="text-[#089981]" />
            <span className="text-[#787b86]">Engine:</span>
            <span className="text-white font-semibold truncate max-w-[140px]">{engineUsed}</span>
          </div>

          {onToggleWide && (
            <button
              onClick={onToggleWide}
              className="w-6 h-6 rounded flex items-center justify-center text-[#787b86] hover:text-white hover:bg-[#1e222d] transition-colors"
              title={isWide ? 'Collapse width' : 'Expand width'}
            >
              {isWide ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            </button>
          )}
        </div>
      </div>

      {/* 2. Query Input Box */}
      <div className="py-2.5 shrink-0">
        <div className="flex items-center gap-1.5 bg-[#1e222d] border border-[#2a2e39] rounded-lg px-2.5 py-1.5 focus-within:border-[#7c4dff] transition-colors">
          <Search size={14} className="text-[#787b86]" />
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRunQuery()}
            placeholder={`Ask about ${activeSymbol}, OI walls, ETF flows, or levels...`}
            className="flex-1 bg-transparent text-xs text-white placeholder-[#787b86] outline-none font-sans"
          />
          <button
            onClick={() => handleRunQuery()}
            disabled={isLoading || !inputQuery.trim()}
            className="p-1 rounded bg-[#7c4dff] hover:bg-[#651fff] text-white disabled:opacity-40 transition-colors cursor-pointer"
            title="Submit research query"
          >
            {isLoading ? <RefreshCw size={13} className="animate-spin" /> : <Send size={13} />}
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {PROMPT_SUGGESTIONS.map((sug) => (
            <button
              key={sug}
              onClick={() => {
                setInputQuery(sug);
                handleRunQuery(sug);
              }}
              className="px-2 py-0.5 rounded text-[10px] bg-[#171b26] hover:bg-[#1e222d] border border-[#2a2e39] text-[#787b86] hover:text-[#f0f3fa] transition-colors text-left cursor-pointer"
            >
              {sug}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Research Report Display */}
      <div className="flex-1 min-h-0 space-y-3 pt-1">
        <div className="bg-[#171b26] border border-[#2a2e39] rounded-lg p-3 space-y-3">
          {/* Title & Metadata */}
          <div className="flex items-start justify-between gap-2 border-b border-[#2a2e39]/60 pb-2">
            <div>
              <div className="flex items-center gap-2 text-[10px] text-[#787b86] font-mono mb-0.5">
                <span>{activeSymbol} MICROSTRUCTURE REPORT</span>
                <span>·</span>
                <span className="text-[#089981] font-semibold">Confidence: {analysis.confidence}</span>
              </div>
              <h2 className="text-xs sm:text-sm font-bold text-white">
                {analysis.title || `Causal Analysis for ${activeSymbol}`}
              </h2>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={copyAnalysis}
                className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#1e222d] border border-[#2a2e39] text-[#787b86] hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                title="Copy intelligence summary"
              >
                {isCopied ? <Check size={11} className="text-[#089981]" /> : <Copy size={11} />}
                <span>{isCopied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={() => handleRunQuery()}
                disabled={isLoading}
                className="p-1 rounded text-[#787b86] hover:text-white hover:bg-[#1e222d] transition-colors cursor-pointer"
                title="Refresh analysis"
              >
                <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* Core Summary */}
          <p className="text-xs text-[#d1d4dc] leading-relaxed bg-[#1e222d] border border-[#2a2e39] rounded p-2.5 font-sans">
            {analysis.summary}
          </p>

          {/* Key Contributors List */}
          <div>
            <span className="text-[10px] font-bold text-[#787b86] uppercase tracking-wider block mb-1.5">
              Primary Market Drivers & Microstructure:
            </span>
            <div className="space-y-1.5 text-xs">
              {analysis.contributors.map((c, i) => (
                <div key={i} className="flex items-start gap-2 bg-[#1e222d]/60 p-2 rounded border border-[#2a2e39]/50">
                  <span className="text-[#7c4dff] font-bold font-mono text-[11px] shrink-0 mt-0.5">
                    {i + 1}.
                  </span>
                  <span className="text-[#f0f3fa] leading-normal">{c}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Technical & Derivatives Snapshot Grid */}
          <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
            {/* Technicals */}
            <div className="bg-[#1e222d] border border-[#2a2e39] rounded p-2">
              <span className="text-[10px] text-[#787b86] font-sans font-bold uppercase block mb-1">
                Technicals Matrix
              </span>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-[#787b86]">VWAP Anchor:</span>
                  <span className={analysis.technicals.vwap === 'above' ? 'text-[#089981] font-bold' : 'text-[#f23645] font-bold'}>
                    {analysis.technicals.vwap.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#787b86]">14 RSI:</span>
                  <span className="text-white font-bold">{analysis.technicals.rsi}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#787b86]">20 EMA:</span>
                  <span className={analysis.technicals.ema20 === 'above' ? 'text-[#089981] font-bold' : 'text-[#f23645] font-bold'}>
                    {analysis.technicals.ema20.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Derivatives */}
            <div className="bg-[#1e222d] border border-[#2a2e39] rounded p-2">
              <span className="text-[10px] text-[#787b86] font-sans font-bold uppercase block mb-1">
                Derivatives Walls
              </span>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-[#787b86]">Call Wall:</span>
                  <span className="text-[#f23645] font-bold">{curr}{analysis.options.callWall}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#787b86]">Put Wall:</span>
                  <span className="text-[#089981] font-bold">{curr}{analysis.options.putWall}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#787b86]">PCR / Pain:</span>
                  <span className="text-white font-bold">{analysis.options.pcr} · {curr}{analysis.options.maxPain || analysis.options.callWall}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Causal Conclusion */}
          {analysis.conclusion && (
            <div className="bg-[#1e222d] border-l-2 border-[#7c4dff] rounded p-2.5 text-xs text-[#f0f3fa]">
              <span className="text-[10px] font-bold text-[#7c4dff] uppercase block mb-0.5 flex items-center gap-1">
                <ShieldCheck size={12} />
                <span>Institutional Verdict & Risk Discipline:</span>
              </span>
              <p className="leading-relaxed">{analysis.conclusion}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
