'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Scale } from 'lucide-react';
import { useWatchlistStore } from '@/stores/useWatchlistStore';
import { useChartStore } from '@/stores/useChartStore';
import { formatPrice } from '@/services/symbols';
import {
  BitcoinIcon,
  EthereumIcon,
  BnbIcon,
  XrpIcon,
  SolanaIcon,
  Nifty50Icon,
  SensexIcon,
  SpxIcon,
} from '@/components/ui/TradingViewIcons';

export const TradingViewMarketCards: React.FC = () => {
  const tickers = useWatchlistStore((s) => s.tickers);
  const setActiveSymbol = useChartStore((s) => s.setActiveSymbol);

  // Top Crypto coins shown in TradingView cryptocurrencies overview
  const cryptos = [
    {
      symbol: 'BTCUSDT',
      display: 'BTCUSD',
      name: 'Bitcoin',
      icon: <BitcoinIcon size={22} />,
      price: tickers['BTCUSDT']?.lastPrice ?? 82842.58,
      changePercent: tickers['BTCUSDT']?.priceChangePercent ?? -0.56,
    },
    {
      symbol: 'ETHUSDT',
      display: 'ETHUSD',
      name: 'Ethereum',
      icon: <EthereumIcon size={22} />,
      price: tickers['ETHUSDT']?.lastPrice ?? 2568.75,
      changePercent: tickers['ETHUSDT']?.priceChangePercent ?? -0.20,
    },
    {
      symbol: 'BNBUSDT',
      display: 'BNBUSD',
      name: 'BNB',
      icon: <BnbIcon size={22} />,
      price: tickers['BNBUSDT']?.lastPrice ?? 769.71,
      changePercent: tickers['BNBUSDT']?.priceChangePercent ?? -0.33,
    },
    {
      symbol: 'XRPUSDT',
      display: 'XRPUSD',
      name: 'XRP',
      icon: <XrpIcon size={22} />,
      price: tickers['XRPUSDT']?.lastPrice ?? 1.4041,
      changePercent: tickers['XRPUSDT']?.priceChangePercent ?? -1.21,
    },
    {
      symbol: 'SOLUSDT',
      display: 'SOLUSD',
      name: 'Solana',
      icon: <SolanaIcon size={22} />,
      price: tickers['SOLUSDT']?.lastPrice ?? 115.29,
      changePercent: tickers['SOLUSDT']?.priceChangePercent ?? -0.85,
    },
  ];

  // Major Indices
  const indices = [
    {
      symbol: 'NIFTY',
      display: 'NIFTY',
      name: 'Nifty 50',
      venue: 'NSE',
      icon: <Nifty50Icon size={22} />,
      price: tickers['NIFTY']?.lastPrice ?? 22434.55,
      changePercent: tickers['NIFTY']?.priceChangePercent ?? -0.75,
    },
    {
      symbol: 'SENSEX',
      display: 'SENSEX',
      name: 'Sensex',
      venue: 'BSE',
      icon: <SensexIcon size={22} />,
      price: tickers['SENSEX']?.lastPrice ?? 72166.15,
      changePercent: tickers['SENSEX']?.priceChangePercent ?? -0.65,
    },
    {
      symbol: 'SPX',
      display: 'SPX',
      name: 'S&P 500',
      venue: 'US',
      icon: <SpxIcon size={22} />,
      price: tickers['SPX']?.lastPrice ?? 7801.77,
      changePercent: tickers['SPX']?.priceChangePercent ?? -0.22,
    },
  ];

  return (
    <div className="bg-[#131722] border-t border-[#2a2e39] p-3 grid grid-cols-1 lg:grid-cols-3 gap-3 select-none shrink-0 text-[#d1d4dc]">
      {/* 1. Cryptocurrencies Table (Exact match to left card in screenshot) */}
      <div className="bg-[#1e222d] border border-[#2a2e39] rounded-lg p-3 hover:border-[#2962ff]/40 transition-colors flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-[#f0f3fa]">Cryptocurrencies</span>
            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[#131722] text-[#787b86] border border-[#2a2e39]">
              SPOT 24H
            </span>
          </div>
          <span className="text-[10px] text-[#787b86] font-mono">Top Assets</span>
        </div>

        <div className="space-y-1.5 divide-y divide-[#2a2e39]/40">
          {cryptos.map((c) => {
            const isPos = c.changePercent >= 0;
            return (
              <button
                key={c.symbol}
                onClick={() => setActiveSymbol(c.symbol)}
                className="w-full pt-1.5 first:pt-0 flex items-center justify-between text-left hover:bg-[#2a2e39]/50 px-1 py-1 rounded transition-colors group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="shrink-0 flex items-center justify-center drop-shadow">
                    {c.icon}
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-semibold text-[#f0f3fa] group-hover:text-[#2962ff] transition-colors leading-tight">
                      {c.name}
                    </div>
                    <div className="text-[10px] font-mono text-[#787b86] leading-tight">
                      {c.display}
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <div className="text-xs font-bold text-[#f0f3fa]">
                    {formatPrice(c.price, c.price > 10 ? 2 : 4)} <span className="text-[9px] text-[#787b86]">USD</span>
                  </div>
                  <div className={`text-[10px] font-semibold flex items-center justify-end gap-0.5 ${isPos ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                    {isPos ? '+' : ''}{c.changePercent.toFixed(2)}%
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Middle Column: Stablecoin Market Cap + Bitcoin Dominance (Matches Screenshot!) */}
      <div className="flex flex-col gap-3">
        {/* Top Sub-Card: Stablecoin Market Cap */}
        <div className="bg-[#1e222d] border border-[#2a2e39] rounded-lg p-3 hover:border-[#2962ff]/40 transition-colors flex-1 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-[#f0f3fa]">Stablecoin market cap</span>
              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[#131722] text-[#787b86] border border-[#2a2e39]">
                STABLE.C
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#089981] font-bold">+0.77%</span>
          </div>

          <div className="flex items-end justify-between mt-2">
            <div>
              <div className="text-lg font-extrabold font-mono text-[#f0f3fa]">
                311.81 <span className="text-xs text-[#787b86] font-normal">B USD</span>
              </div>
              <div className="text-[9px] font-mono text-[#787b86]">1 month growth</div>
            </div>

            {/* Smooth Sparkline */}
            <svg width="120" height="32" viewBox="0 0 120 32" className="overflow-visible">
              <defs>
                <linearGradient id="stableGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#089981" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#089981" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0 24 Q 25 22, 45 28 T 80 18 T 105 10 T 120 8 L 120 32 L 0 32 Z"
                fill="url(#stableGrad)"
              />
              <path
                d="M0 24 Q 25 22, 45 28 T 80 18 T 105 10 T 120 8"
                fill="none"
                stroke="#089981"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>

        {/* Bottom Sub-Card: Bitcoin Dominance (Matches Screenshot Segmented Progress Bar!) */}
        <div className="bg-[#1e222d] border border-[#2a2e39] rounded-lg p-3 hover:border-[#2962ff]/40 transition-colors flex-1 flex flex-col justify-between">
          <div className="text-xs font-bold text-[#f0f3fa] mb-1.5">
            Bitcoin dominance
          </div>

          {/* Legend Items */}
          <div className="flex items-center justify-between text-[11px] font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#2962ff]" />
              <span className="text-[#787b86]">Bitcoin</span>
              <span className="text-[#f0f3fa] font-bold">59.63%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#089981]" />
              <span className="text-[#787b86]">Ethereum</span>
              <span className="text-[#f0f3fa] font-bold">11.24%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#f23645]" />
              <span className="text-[#787b86]">Others</span>
              <span className="text-[#f0f3fa] font-bold">29.13%</span>
            </div>
          </div>

          {/* Segmented Progress Bar */}
          <div className="w-full h-2 rounded-full bg-[#131722] overflow-hidden flex mt-2 border border-[#2a2e39]">
            <div style={{ width: '59.63%' }} className="h-full bg-[#2962ff] transition-all" />
            <div style={{ width: '11.24%' }} className="h-full bg-[#089981] transition-all" />
            <div style={{ width: '29.13%' }} className="h-full bg-[#f23645] transition-all" />
          </div>
        </div>
      </div>

      {/* 3. Major Indices & The Honest Benchmark */}
      <div className="bg-[#1e222d] border border-[#2a2e39] rounded-lg p-3 hover:border-[#2962ff]/40 transition-colors flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#f0f3fa] tracking-tight">Major indices</span>
            <span className="text-[10px] text-[#787b86] font-mono">GLOBAL FEEDS</span>
          </div>

          <div className="space-y-1.5">
            {indices.map((idx) => {
              const isPos = idx.changePercent >= 0;
              return (
                <button
                  key={idx.symbol}
                  onClick={() => setActiveSymbol(idx.symbol)}
                  className="w-full flex items-center justify-between text-left hover:bg-[#2a2e39]/50 p-1.5 rounded transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <div className="shrink-0 flex items-center justify-center drop-shadow">
                      {idx.icon}
                    </div>
                    <div>
                      <span className="text-xs font-medium text-[#d1d4dc] group-hover:text-[#2962ff] transition-colors">
                        {idx.name}
                      </span>
                      <span className="text-[9px] text-[#787b86] ml-1 font-mono">{idx.venue}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-[#f0f3fa]">
                      {formatPrice(idx.price, 2)} <span className="text-[9px] text-[#787b86]">POINT</span>
                    </div>
                    <div className={`text-[10px] font-mono font-medium flex items-center justify-end gap-0.5 ${isPos ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                      {isPos ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      {isPos ? '+' : ''}{idx.changePercent.toFixed(2)}%
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* The Honest Benchmark Context Banner */}
        <div className="border-t border-[#2a2e39] pt-2 mt-2">
          <div className="flex items-center justify-between text-[11px] font-mono mb-1">
            <span className="text-[#787b86] flex items-center gap-1">
              <Scale size={11} className="text-[#089981]" />
              BTC Hold (30D):
            </span>
            <span className="text-[#089981] font-bold">+28.4%</span>
          </div>
          <div className="text-[9px] text-[#787b86] leading-tight">
            "No result shown without context: drawdown, sample size & BTC buy-and-hold."
          </div>
        </div>
      </div>
    </div>
  );
};
