// src/components/mobile/BloombergAnywhereMobileView.tsx
'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import type { Quote, NewsItem, PortfolioSummary, MobileTab } from './types';
import { HomeView } from './HomeView';
import { MarketsView } from './MarketsView';
import { WatchlistView } from './WatchlistView';
import { QuoteDetailView } from './QuoteDetailView';
import { NewsView } from './NewsView';
import { MoreView } from './MoreView';
import { NewsArticleModal } from './NewsArticleModal';
import { BloombergSearchModal } from './BloombergSearchModal';
import { InstantBloombergView } from './InstantBloombergView';
import { useTradingStore } from '@/stores/useTradingStore';
import { useWatchlistStore } from '@/stores/useWatchlistStore';
import {
  Home,
  BarChart2,
  Star,
  FileText,
  MoreHorizontal,
  MessageSquare,
  Terminal,
  Activity,
  X,
} from 'lucide-react';
import { formatPrice, formatInrCrore } from '@/lib/utils';
import { terminalAudio } from '@/lib/terminalAudio';

interface BloombergAnywhereMobileViewProps {
  onSwitchToProTerminal?: () => void;
}

export const BloombergAnywhereMobileView: React.FC<BloombergAnywhereMobileViewProps> = () => {
  const { account } = useTradingStore();
  const tickers = useWatchlistStore((s) => s.tickers);

  const [activeTab, setActiveTab] = useState<MobileTab>('home');
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);
  const [isPortfoliosModalOpen, setIsPortfoliosModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

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

  // Curated Quotes Dataset matching SwiftUI MarketModels.swift + Indian NSE/BSE & Global Tech & Commodities
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
      id: 'gold',
      symbol: 'GOLD',
      name: 'Gold Spot (XAU/USD) 🟡',
      price: 2658.20,
      change: 22.40,
      percent: 0.85,
      positive: true,
      category: 'all',
      sparkline: [0.3, 0.4, 0.45, 0.6, 0.55, 0.7, 0.8, 0.9],
      open: 2635.80,
      prevClose: 2635.80,
      high: 2664.10,
      low: 2632.40,
      volume: '$18.2B',
      currency: 'USD',
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
    {
      id: 'brent',
      symbol: 'BRENT',
      name: 'Brent Crude Oil 🛢️',
      price: 78.40,
      change: -0.89,
      percent: -1.12,
      positive: false,
      category: 'all',
      sparkline: [0.7, 0.65, 0.8, 0.55, 0.6, 0.45, 0.35, 0.25],
      open: 79.29,
      prevClose: 79.29,
      high: 79.80,
      low: 77.95,
      volume: '4.8M',
      currency: 'USD',
    },
  ], [btcPrice, btcChg, ethPrice, ethChg, solPrice, solChg]);

  // Terminal News Items with Live API Hook
  const [newsItems, setNewsItems] = useState<NewsItem[]>([
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
  ]);

  const fetchMobileNews = useCallback(async () => {
    try {
      const res = await fetch('/api/news');
      if (!res.ok) return;
      const data = await res.json();
      if (data.items && Array.isArray(data.items) && data.items.length > 0) {
        setNewsItems(data.items);
      }
    } catch (err) {
      // Retain fallback news items on network issue
    }
  }, []);

  useEffect(() => {
    fetchMobileNews();
    const interval = setInterval(fetchMobileNews, 60000);
    return () => clearInterval(interval);
  }, [fetchMobileNews]);

  // User Portfolios with dual USD and INR valuation
  const equityUsdt = account?.equity || 617530;
  const portfolios: PortfolioSummary[] = [
    {
      id: 'main',
      name: 'ACCOUNT #C782-9901 (INSTITUTIONAL MASTER MARGIN)',
      valueUsd: equityUsdt,
      changePercent: 2.31,
      positive: true,
      sparkline: [0.2, 0.35, 0.45, 0.6, 0.55, 0.75, 0.8, 0.9],
    },
    {
      id: 'longterm',
      name: 'ACCOUNT #D441-2044 (DERIVATIVES & L/S HEDGE)',
      valueUsd: 128204.11,
      changePercent: 0.92,
      positive: true,
      sparkline: [0.4, 0.5, 0.45, 0.6, 0.7, 0.65, 0.75, 0.85],
    },
  ];

  // Bloomberg Mnemonic Function Code Handler
  const handleSelectFunction = (fnCode: string) => {
    terminalAudio.playTick();
    switch (fnCode) {
      case 'TOP':
        setActiveTab('news');
        setSelectedQuote(null);
        break;
      case 'WEI':
        setActiveTab('markets');
        setSelectedQuote(null);
        break;
      case 'PORT':
        setIsPortfoliosModalOpen(true);
        break;
      case 'WL':
        setActiveTab('watchlist');
        setSelectedQuote(null);
        break;
      case 'GP':
      case 'DES':
        if (!selectedQuote) setSelectedQuote(quotes[0]);
        break;
      case 'SECF':
        setIsSearchModalOpen(true);
        break;
      default:
        setActiveTab('home');
        setSelectedQuote(null);
        break;
    }
  };

  return (
    <div className="w-full min-h-screen bg-black text-white font-sans flex flex-col justify-between selection:bg-[#ff8800]/30 select-none">
      {/* Detail View Mode (Instrument Deep Inspector) */}
      {selectedQuote ? (
        <QuoteDetailView
          quote={selectedQuote}
          onBack={() => {
            terminalAudio.playTick();
            setSelectedQuote(null);
          }}
        />
      ) : (
        <main className="flex-1 flex flex-col">
          {(activeTab === 'home' || activeTab === 'monitors') && (
            <HomeView
              quotes={quotes}
              news={newsItems}
              portfolios={portfolios}
              onSelectQuote={setSelectedQuote}
              onSelectNews={setSelectedArticle}
              onViewAllMarkets={() => setActiveTab('markets')}
              onViewAllPortfolios={() => setIsPortfoliosModalOpen(true)}
              onViewAllNews={() => setActiveTab('news')}
              onOpenProfile={() => setIsPortfoliosModalOpen(true)}
              onSearchClick={() => setIsSearchModalOpen(true)}
              onAlertsClick={() => setIsAlertsModalOpen(true)}
              onSelectFunction={handleSelectFunction}
              onOpenIB={() => setActiveTab('ib')}
            />
          )}

          {(activeTab === 'markets' || activeTab === 'emsx') && (
            <MarketsView
              quotes={quotes}
              onSelectQuote={setSelectedQuote}
              onAlertsClick={() => setIsAlertsModalOpen(true)}
            />
          )}

          {activeTab === 'news' && (
            <NewsView
              news={newsItems}
              onSelectNews={setSelectedArticle}
              onSearchClick={() => setIsSearchModalOpen(true)}
              onAlertsClick={() => setIsAlertsModalOpen(true)}
            />
          )}

          {activeTab === 'ib' && (
            <InstantBloombergView
              quotes={quotes}
              onSelectQuote={setSelectedQuote}
            />
          )}

          {(activeTab === 'more' || activeTab === 'cmd') && (
            <MoreView
              onNavigateMarkets={() => setActiveTab('markets')}
              onOpenAlerts={() => setIsAlertsModalOpen(true)}
              onOpenPortfolios={() => setIsPortfoliosModalOpen(true)}
            />
          )}
        </main>
      )}

      {/* Authentic Bloomberg Professional Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-[58px] bg-[#05070a] border-t-2 border-[#182030] z-50 flex items-center justify-around px-1 font-mono pb-[env(safe-area-inset-bottom,0px)]">
        {/* Tab 1: <MON> Monitors */}
        <button
          onClick={() => {
            terminalAudio.playTick();
            setSelectedQuote(null);
            setActiveTab('home');
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 gap-0.5 cursor-pointer transition-all ${
            (activeTab === 'home' || activeTab === 'monitors') && !selectedQuote
              ? 'text-[#ff8800]'
              : 'text-[#8e95a5] hover:text-white'
          }`}
        >
          <Activity size={18} strokeWidth={2.5} />
          <span className="text-[10px] font-black tracking-tight">&lt;MON&gt;</span>
        </button>

        {/* Tab 2: <EMSX> Execution */}
        <button
          onClick={() => {
            terminalAudio.playTick();
            setSelectedQuote(null);
            setActiveTab('markets');
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 gap-0.5 cursor-pointer transition-all ${
            (activeTab === 'markets' || activeTab === 'emsx') && !selectedQuote
              ? 'text-[#ff8800]'
              : 'text-[#8e95a5] hover:text-white'
          }`}
        >
          <BarChart2 size={18} strokeWidth={2.5} />
          <span className="text-[10px] font-black tracking-tight">&lt;EMSX&gt;</span>
        </button>

        {/* Tab 3: <TOP> News */}
        <button
          onClick={() => {
            terminalAudio.playTick();
            setSelectedQuote(null);
            setActiveTab('news');
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 gap-0.5 cursor-pointer transition-all ${
            activeTab === 'news' && !selectedQuote
              ? 'text-[#ff8800]'
              : 'text-[#8e95a5] hover:text-white'
          }`}
        >
          <FileText size={18} strokeWidth={2.5} />
          <span className="text-[10px] font-black tracking-tight">&lt;TOP&gt;</span>
        </button>

        {/* Tab 4: <IB> Instant Bloomberg Messaging (The Heart of Bloomberg) */}
        <button
          onClick={() => {
            terminalAudio.playTick();
            setSelectedQuote(null);
            setActiveTab('ib');
          }}
          className={`relative flex flex-col items-center justify-center flex-1 py-1 gap-0.5 cursor-pointer transition-all ${
            activeTab === 'ib' && !selectedQuote
              ? 'text-[#ff8800]'
              : 'text-[#8e95a5] hover:text-white'
          }`}
        >
          <div className="relative">
            <MessageSquare size={18} strokeWidth={2.5} />
            <span className="absolute -top-1 -right-1.5 w-2 h-2 bg-[#00c176] rounded-full animate-pulse shadow-[0_0_6px_#00c176]" />
          </div>
          <span className="text-[10px] font-black tracking-tight text-[#ff8800]">&lt;IB&gt;</span>
        </button>

        {/* Tab 5: <CMD> Functions */}
        <button
          onClick={() => {
            terminalAudio.playTick();
            setSelectedQuote(null);
            setActiveTab('more');
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 gap-0.5 cursor-pointer transition-all ${
            (activeTab === 'more' || activeTab === 'cmd') && !selectedQuote
              ? 'text-[#ff8800]'
              : 'text-[#8e95a5] hover:text-white'
          }`}
        >
          <Terminal size={18} strokeWidth={2.5} />
          <span className="text-[10px] font-black tracking-tight">&lt;CMD&gt;</span>
        </button>
      </nav>

      {/* Full Bloomberg News Article Modal */}
      <NewsArticleModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
        onSelectQuote={(sym) => {
          const match = quotes.find((q) => q.symbol.toUpperCase() === sym.toUpperCase());
          if (match) setSelectedQuote(match);
        }}
      />

      {/* Security Finder <SECF> & Bloomberg Command Search Modal */}
      <BloombergSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        quotes={quotes}
        onSelectQuote={(q) => {
          setSelectedQuote(q);
        }}
        onSelectFunction={handleSelectFunction}
      />

      {/* Portfolios Modal <PORT <GO>> */}
      {isPortfoliosModalOpen && (
        <div
          onClick={() => setIsPortfoliosModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end justify-center p-2 font-mono"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-[#070a10] border-2 border-[#ff8800] p-4 flex flex-col gap-3 shadow-[0_0_30px_rgba(0,0,0,0.9)]"
          >
            {/* Blotter Header */}
            <div className="flex items-center justify-between border-b border-[#182030] pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#ff8800] animate-pulse" />
                <h3 className="text-xs font-black text-white tracking-wider">
                  PORT &lt;GO&gt; &mdash; MASTER PORTFOLIO BLOTTER
                </h3>
              </div>
              <button
                onClick={() => {
                  terminalAudio.playTick();
                  setIsPortfoliosModalOpen(false);
                }}
                className="text-[#8e95a5] hover:text-white text-xs px-2 py-0.5 border border-[#1e2a40] bg-[#101520]"
              >
                &lt;ESC&gt;
              </button>
            </div>

            {/* Risk Invariant Strip */}
            <div className="p-2 bg-[#0d121c] border border-[#1f2a3e] text-[10px] text-[#94a3b8] flex items-center justify-between">
              <span>RISK CAP INVARIANT: <strong className="text-[#00ff66]">1.0% MAX PER TRADE</strong></span>
              <span>DAILY VAR (99%): <strong className="text-[#ffd600]">2.15%</strong></span>
            </div>

            {/* Benchmark Invariant */}
            <div className="p-2 bg-[#121008] border border-[#ff8800]/40 text-[10px] flex items-center justify-between">
              <span className="text-[#ff8800] font-bold">BENCHMARK MIRROR:</span>
              <span className="text-white">BTC BUY-AND-HOLD: <strong className="text-[#00ff66]">+1.42%</strong> · YOU: <strong className="text-[#00ff66]">+2.31%</strong></span>
            </div>

            {/* Account List */}
            <div className="flex flex-col gap-2">
              {portfolios.map((p) => (
                <div key={p.id} className="p-2.5 bg-[#0b0f17] border border-[#1c2436] flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-[#8e95a5] font-bold">{p.name}</div>
                    <div className="text-base font-black text-white tabular-nums mt-0.5">
                      ${formatPrice(p.valueUsd, 2)}
                    </div>
                    <div className="text-[10px] font-bold text-[#ff8800] tabular-nums">
                      &asymp; {formatInrCrore(p.valueUsd)}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-[#00ff66] tabular-nums">
                      +{p.changePercent.toFixed(2)}%
                    </span>
                    <div className="text-[9px] text-[#55637d] mt-1">STATUS: MARGIN OK</div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                terminalAudio.playTick();
                setIsPortfoliosModalOpen(false);
                setActiveTab('markets');
              }}
              className="w-full py-2 bg-[#ff8800] text-black font-black text-xs tracking-wider cursor-pointer border border-[#ff8800]"
            >
              &lt;EXECUTE INSTRUMENTS IN EMSX &lt;GO&gt;&gt;
            </button>
          </div>
        </div>
      )}

      {/* Alerts Modal <ALRT <GO>> */}
      {isAlertsModalOpen && (
        <div
          onClick={() => setIsAlertsModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end justify-center p-2 font-mono"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-[#070a10] border-2 border-[#ff8800] p-4 flex flex-col gap-3 shadow-[0_0_30px_rgba(0,0,0,0.9)]"
          >
            <div className="flex items-center justify-between border-b border-[#182030] pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00e5ff] animate-pulse" />
                <h3 className="text-xs font-black text-white tracking-wider">
                  ALRT &lt;GO&gt; &mdash; VOLATILITY &amp; BREAKOUT TRIGGERS
                </h3>
              </div>
              <button
                onClick={() => {
                  terminalAudio.playTick();
                  setIsAlertsModalOpen(false);
                }}
                className="text-[#8e95a5] hover:text-white text-xs px-2 py-0.5 border border-[#1e2a40] bg-[#101520]"
              >
                &lt;ESC&gt;
              </button>
            </div>

            <div className="divide-y divide-[#182030] border border-[#1c2436] bg-[#0b0f17] text-xs">
              <div className="p-2.5 flex justify-between items-center">
                <div>
                  <div className="font-bold text-white">BTCUSD &gt; $65,000.00</div>
                  <div className="text-[10px] text-[#8e95a5]">High volatility breakout trigger (Binance Spot)</div>
                </div>
                <span className="px-1.5 py-0.5 bg-[#00ff66]/10 text-[#00ff66] font-bold text-[10px] border border-[#00ff66]/30">ARMED</span>
              </div>
              <div className="p-2.5 flex justify-between items-center">
                <div>
                  <div className="font-bold text-white">NIFTY 50 &gt; 25,000.00</div>
                  <div className="text-[10px] text-[#8e95a5]">All-time high resistance level (NSE India)</div>
                </div>
                <span className="px-1.5 py-0.5 bg-[#00ff66]/10 text-[#00ff66] font-bold text-[10px] border border-[#00ff66]/30">ARMED</span>
              </div>
              <div className="p-2.5 flex justify-between items-center">
                <div>
                  <div className="font-bold text-white">GOLD (XAU) &gt; $2,700.00</div>
                  <div className="text-[10px] text-[#8e95a5]">Sovereign reserve safe haven trigger</div>
                </div>
                <span className="px-1.5 py-0.5 bg-[#00ff66]/10 text-[#00ff66] font-bold text-[10px] border border-[#00ff66]/30">ARMED</span>
              </div>
            </div>

            <button
              onClick={() => {
                terminalAudio.playTick();
                setIsAlertsModalOpen(false);
              }}
              className="w-full py-2 bg-[#121824] hover:bg-[#1a2334] text-white font-bold text-xs border border-[#202c42] cursor-pointer"
            >
              &lt;DISMISS ALERTS &lt;ESC&gt;&gt;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
