// src/components/mobile/BloombergAnywhereMobileView.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import type { Quote, NewsItem, PortfolioSummary, MobileTab } from './types';
import { HomeView } from './HomeView';
import { MarketsView } from './MarketsView';
import { WatchlistView } from './WatchlistView';
import { QuoteDetailView } from './QuoteDetailView';
import { NewsView } from './NewsView';
import { MoreView } from './MoreView';
import { useTradingStore } from '@/stores/useTradingStore';
import { useWatchlistStore } from '@/stores/useWatchlistStore';
import {
  Home,
  BarChart2,
  Star,
  FileText,
  MoreHorizontal,
  X,
  Bell,
  CheckCircle,
} from 'lucide-react';
import { formatPrice, formatInrCrore } from '@/lib/utils';

interface BloombergAnywhereMobileViewProps {
  onSwitchToProTerminal: () => void;
}

export const BloombergAnywhereMobileView: React.FC<BloombergAnywhereMobileViewProps> = ({
  onSwitchToProTerminal,
}) => {
  const { account } = useTradingStore();
  const tickers = useWatchlistStore((s) => s.tickers);

  const [activeTab, setActiveTab] = useState<MobileTab>('home');
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);
  const [isPortfoliosModalOpen, setIsPortfoliosModalOpen] = useState(false);

  // Live Binance Spot feeds
  const btcTicker = tickers['BTCUSDT'];
  const ethTicker = tickers['ETHUSDT'];
  const solTicker = tickers['SOLUSDT'];

  const btcPrice = btcTicker?.lastPrice || 63284.50;
  const btcChg = btcTicker?.priceChangePercent || 0.66;
  const ethPrice = ethTicker?.lastPrice || 3490.20;
  const ethChg = ethTicker?.priceChangePercent || 1.85;
  const solPrice = solTicker?.lastPrice || 154.40;
  const solChg = solTicker?.priceChangePercent || 4.20;

  // Curated Quotes Dataset matching SwiftUI MarketModels.swift + Indian NSE/BSE & Global Tech
  const quotes: Quote[] = useMemo(() => [
    {
      id: 'aapl',
      symbol: 'AAPL',
      name: 'Apple Inc.',
      price: 178.32,
      change: -1.21,
      percent: -0.67,
      positive: false,
      category: 'tech',
      sparkline: [0.8, 0.65, 0.7, 0.45, 0.5, 0.25, 0.35, 0.15],
      open: 179.50,
      prevClose: 179.53,
      high: 180.20,
      low: 177.80,
      volume: '54.2M',
      currency: 'USD',
    },
    {
      id: 'tsla',
      symbol: 'TSLA',
      name: 'Tesla Inc.',
      price: 248.17,
      change: 3.45,
      percent: 1.41,
      positive: true,
      category: 'tech',
      sparkline: [0.2, 0.35, 0.3, 0.55, 0.5, 0.75, 0.65, 0.85],
      open: 244.20,
      prevClose: 244.72,
      high: 251.40,
      low: 243.60,
      volume: '88.7M',
      currency: 'USD',
    },
    {
      id: 'nifty',
      symbol: 'NIFTY',
      name: 'Nifty 50 Index 🇮🇳',
      price: 24612.30,
      change: -120.45,
      percent: -0.49,
      positive: false,
      category: 'india',
      sparkline: [0.75, 0.6, 0.68, 0.52, 0.45, 0.38, 0.22, 0.18],
      open: 24720.00,
      prevClose: 24732.75,
      high: 24745.10,
      low: 24590.20,
      volume: '342.1M',
      currency: 'INR',
    },
    {
      id: 'btcusd',
      symbol: 'BTCUSD',
      name: 'Bitcoin Spot',
      price: btcPrice,
      change: btcPrice * (btcChg / 100),
      percent: btcChg,
      positive: btcChg >= 0,
      category: 'crypto',
      sparkline: btcChg >= 0
        ? [0.25, 0.4, 0.35, 0.6, 0.55, 0.78, 0.72, 0.92]
        : [0.85, 0.7, 0.75, 0.5, 0.55, 0.32, 0.4, 0.2],
      open: btcPrice * 0.992,
      prevClose: btcPrice / (1 + btcChg / 100),
      high: btcPrice * 1.015,
      low: btcPrice * 0.985,
      volume: '$28.4B',
      currency: 'USD',
    },
    {
      id: 'nvda',
      symbol: 'NVDA',
      name: 'NVIDIA Corp.',
      price: 141.18,
      change: 2.91,
      percent: 2.10,
      positive: true,
      category: 'tech',
      sparkline: [0.3, 0.45, 0.4, 0.65, 0.6, 0.8, 0.75, 0.9],
      open: 138.50,
      prevClose: 138.27,
      high: 142.50,
      low: 137.90,
      volume: '62.4M',
      currency: 'USD',
    },
    {
      id: 'sensex',
      symbol: 'SENSEX',
      name: 'BSE Sensex 🇮🇳',
      price: 80814.73,
      change: 177.20,
      percent: 0.22,
      positive: true,
      category: 'india',
      sparkline: [0.35, 0.4, 0.5, 0.48, 0.6, 0.7, 0.65, 0.8],
      open: 80650.00,
      prevClose: 80637.53,
      high: 80920.40,
      low: 80580.10,
      volume: '185.0M',
      currency: 'INR',
    },
    {
      id: 'ethusd',
      symbol: 'ETHUSD',
      name: 'Ethereum Spot',
      price: ethPrice,
      change: ethPrice * (ethChg / 100),
      percent: ethChg,
      positive: ethChg >= 0,
      category: 'crypto',
      sparkline: [0.3, 0.5, 0.45, 0.7, 0.65, 0.85, 0.8, 0.95],
      open: ethPrice * 0.985,
      prevClose: ethPrice / (1 + ethChg / 100),
      high: ethPrice * 1.02,
      low: ethPrice * 0.98,
      volume: '$14.2B',
      currency: 'USD',
    },
    {
      id: 'reliance',
      symbol: 'RELIANCE',
      name: 'Reliance Industries 🇮🇳',
      price: 2984.50,
      change: 32.10,
      percent: 1.09,
      positive: true,
      category: 'india',
      sparkline: [0.2, 0.35, 0.4, 0.55, 0.6, 0.75, 0.7, 0.85],
      open: 2955.00,
      prevClose: 2952.40,
      high: 2995.00,
      low: 2950.00,
      volume: '12.4M',
      currency: 'INR',
    },
    {
      id: 'solusd',
      symbol: 'SOLUSD',
      name: 'Solana Spot',
      price: solPrice,
      change: solPrice * (solChg / 100),
      percent: solChg,
      positive: solChg >= 0,
      category: 'crypto',
      sparkline: [0.2, 0.4, 0.35, 0.6, 0.7, 0.85, 0.8, 0.95],
      open: solPrice * 0.96,
      prevClose: solPrice / (1 + solChg / 100),
      high: solPrice * 1.05,
      low: solPrice * 0.95,
      volume: '$4.1B',
      currency: 'USD',
    },
  ], [btcPrice, btcChg, ethPrice, ethChg, solPrice, solChg]);

  // Terminal News Items matching NewsView.swift
  const newsItems: NewsItem[] = [
    {
      id: 'news-1',
      title: 'Markets steady as Fed comments fuel rate-cut expectations and reshape the global macro outlook',
      source: 'Market Desk',
      time: '2h ago',
      category: 'Macro',
    },
    {
      id: 'news-2',
      title: 'RBI maintains durable liquidity stance as Indian GDP projections remain robust across Q3',
      source: 'Bloomberg India',
      time: '3h ago',
      category: 'India',
    },
    {
      id: 'news-3',
      title: 'Technology stocks lead the latest session with semiconductor outperformance and AI demand',
      source: 'Terminal Wire',
      time: '4h ago',
      category: 'Technology',
    },
    {
      id: 'news-4',
      title: 'Institutional inflows into Bitcoin spot vehicles surpass $800M in single-week reallocation',
      source: 'Crypto Desk',
      time: '5h ago',
      category: 'Crypto',
    },
  ];

  // User Portfolios with dual USD and INR valuation
  const equityUsdt = account?.equity || 617530;
  const portfolios: PortfolioSummary[] = [
    {
      id: 'main',
      name: 'Main Portfolio',
      valueUsd: equityUsdt,
      changePercent: 2.31,
      positive: true,
      sparkline: [0.2, 0.35, 0.45, 0.6, 0.55, 0.75, 0.8, 0.9],
    },
    {
      id: 'longterm',
      name: 'Long Term F&O',
      valueUsd: 128204.11,
      changePercent: 0.92,
      positive: true,
      sparkline: [0.4, 0.5, 0.45, 0.6, 0.7, 0.65, 0.75, 0.85],
    },
  ];

  return (
    <div className="w-full min-h-screen bg-black text-white font-sans flex flex-col justify-between selection:bg-[#ff8800]/30 select-none">
      {/* Detail View Mode (Instrument Deep Inspector) */}
      {selectedQuote ? (
        <QuoteDetailView
          quote={selectedQuote}
          onBack={() => setSelectedQuote(null)}
          onLaunchProTerminal={onSwitchToProTerminal}
        />
      ) : (
        <main className="flex-1 flex flex-col">
          {activeTab === 'home' && (
            <HomeView
              quotes={quotes}
              news={newsItems}
              portfolios={portfolios}
              onSelectQuote={setSelectedQuote}
              onViewAllMarkets={() => setActiveTab('markets')}
              onViewAllPortfolios={() => setIsPortfoliosModalOpen(true)}
              onViewAllNews={() => setActiveTab('news')}
              onOpenProfile={() => setActiveTab('more')}
              onSearchClick={() => setActiveTab('markets')}
              onAlertsClick={() => setIsAlertsModalOpen(true)}
            />
          )}

          {activeTab === 'markets' && (
            <MarketsView
              quotes={quotes}
              onSelectQuote={setSelectedQuote}
              onAlertsClick={() => setIsAlertsModalOpen(true)}
            />
          )}

          {activeTab === 'watchlist' && (
            <WatchlistView
              quotes={quotes}
              onSelectQuote={setSelectedQuote}
              onSearchClick={() => setActiveTab('markets')}
              onAlertsClick={() => setIsAlertsModalOpen(true)}
            />
          )}

          {activeTab === 'news' && (
            <NewsView
              news={newsItems}
              onSearchClick={() => setActiveTab('markets')}
              onAlertsClick={() => setIsAlertsModalOpen(true)}
            />
          )}

          {activeTab === 'more' && (
            <MoreView
              onLaunchProTerminal={onSwitchToProTerminal}
              onOpenAlerts={() => setIsAlertsModalOpen(true)}
              onOpenPortfolios={() => setIsPortfoliosModalOpen(true)}
            />
          )}
        </main>
      )}

      {/* Pristine 5-Tab Bottom Navigation Bar (SF Symbols Style, Amber Glow) */}
      <nav className="fixed bottom-0 left-0 right-0 h-[60px] bg-[#080a0e]/95 backdrop-blur-lg border-t border-[#181d28] z-50 flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom,0px)]">
        {/* Tab 1: Home */}
        <button
          onClick={() => { setSelectedQuote(null); setActiveTab('home'); }}
          className={`flex flex-col items-center justify-center flex-1 py-1 gap-1 cursor-pointer transition-all ${
            activeTab === 'home' && !selectedQuote
              ? 'text-[#ff8800]'
              : 'text-[#8e95a5] hover:text-white'
          }`}
        >
          <Home size={20} strokeWidth={activeTab === 'home' && !selectedQuote ? 2.5 : 2} />
          <span className="text-[10px] font-bold">Home</span>
        </button>

        {/* Tab 2: Markets */}
        <button
          onClick={() => { setSelectedQuote(null); setActiveTab('markets'); }}
          className={`flex flex-col items-center justify-center flex-1 py-1 gap-1 cursor-pointer transition-all ${
            activeTab === 'markets' && !selectedQuote
              ? 'text-[#ff8800]'
              : 'text-[#8e95a5] hover:text-white'
          }`}
        >
          <BarChart2 size={20} strokeWidth={activeTab === 'markets' && !selectedQuote ? 2.5 : 2} />
          <span className="text-[10px] font-bold">Markets</span>
        </button>

        {/* Tab 3: Watchlist */}
        <button
          onClick={() => { setSelectedQuote(null); setActiveTab('watchlist'); }}
          className={`flex flex-col items-center justify-center flex-1 py-1 gap-1 cursor-pointer transition-all ${
            activeTab === 'watchlist' && !selectedQuote
              ? 'text-[#ff8800]'
              : 'text-[#8e95a5] hover:text-white'
          }`}
        >
          <Star size={20} strokeWidth={activeTab === 'watchlist' && !selectedQuote ? 2.5 : 2} />
          <span className="text-[10px] font-bold">Watchlist</span>
        </button>

        {/* Tab 4: News */}
        <button
          onClick={() => { setSelectedQuote(null); setActiveTab('news'); }}
          className={`flex flex-col items-center justify-center flex-1 py-1 gap-1 cursor-pointer transition-all ${
            activeTab === 'news' && !selectedQuote
              ? 'text-[#ff8800]'
              : 'text-[#8e95a5] hover:text-white'
          }`}
        >
          <FileText size={20} strokeWidth={activeTab === 'news' && !selectedQuote ? 2.5 : 2} />
          <span className="text-[10px] font-bold">News</span>
        </button>

        {/* Tab 5: More */}
        <button
          onClick={() => { setSelectedQuote(null); setActiveTab('more'); }}
          className={`flex flex-col items-center justify-center flex-1 py-1 gap-1 cursor-pointer transition-all ${
            activeTab === 'more' && !selectedQuote
              ? 'text-[#ff8800]'
              : 'text-[#8e95a5] hover:text-white'
          }`}
        >
          <MoreHorizontal size={20} strokeWidth={activeTab === 'more' && !selectedQuote ? 2.5 : 2} />
          <span className="text-[10px] font-bold">More</span>
        </button>
      </nav>

      {/* Portfolios Modal */}
      {isPortfoliosModalOpen && (
        <div
          onClick={() => setIsPortfoliosModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end justify-center animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-[#0e1118] border-t border-[#263145] rounded-t-2xl p-5 pb-8 flex flex-col gap-4 shadow-2xl"
          >
            <div className="w-10 h-1 bg-[#3a455a] rounded-full mx-auto" />
            <div className="flex items-center justify-between">
              <h3 className="text-[17px] font-bold text-white">My Portfolios (PORT)</h3>
              <button onClick={() => setIsPortfoliosModalOpen(false)} className="text-[#8e95a5] hover:text-white p-1">
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {portfolios.map((p) => (
                <div key={p.id} className="p-4 bg-[#141924] border border-[#212b3d] rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-xs text-[#8e95a5]">{p.name}</div>
                    <div className="text-xl font-bold font-mono text-white mt-0.5">${formatPrice(p.valueUsd, 2)}</div>
                    <div className="text-xs font-mono font-bold text-[#ff8800]">≈ {formatInrCrore(p.valueUsd)}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold font-mono text-[#00c176]">+{p.changePercent.toFixed(2)}%</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => { setIsPortfoliosModalOpen(false); onSwitchToProTerminal(); }}
              className="w-full py-3 bg-[#ff8800] text-black font-extrabold text-sm rounded-xl cursor-pointer"
            >
              Trade Portfolio in Pro Terminal
            </button>
          </div>
        </div>
      )}

      {/* Alerts Modal */}
      {isAlertsModalOpen && (
        <div
          onClick={() => setIsAlertsModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end justify-center animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-[#0e1118] border-t border-[#263145] rounded-t-2xl p-5 pb-8 flex flex-col gap-4 shadow-2xl"
          >
            <div className="w-10 h-1 bg-[#3a455a] rounded-full mx-auto" />
            <div className="flex items-center justify-between">
              <h3 className="text-[17px] font-bold text-white">Active Terminal Alerts</h3>
              <button onClick={() => setIsAlertsModalOpen(false)} className="text-[#8e95a5] hover:text-white p-1">
                <X size={18} />
              </button>
            </div>

            <div className="divide-y divide-[#181d28] bg-[#141924] border border-[#212b3d] rounded-xl p-3 text-xs">
              <div className="py-2.5 flex justify-between items-center">
                <div>
                  <div className="font-bold text-white">BTCUSD &gt; $65,000</div>
                  <div className="text-[10px] text-[#8e95a5]">High volatility breakout trigger</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#00c176]/15 text-[#00c176] font-bold text-[10px]">ACTIVE</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <div>
                  <div className="font-bold text-white">NIFTY 50 &gt; 25,000</div>
                  <div className="text-[10px] text-[#8e95a5]">All-time high resistance level</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#00c176]/15 text-[#00c176] font-bold text-[10px]">ACTIVE</span>
              </div>
            </div>

            <button
              onClick={() => setIsAlertsModalOpen(false)}
              className="w-full py-2.5 bg-[#202735] text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
