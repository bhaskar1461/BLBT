// src/components/bloomberg/BloombergTerminalDesktop.tsx
'use client';

import React, { useState, useMemo } from 'react';
import type { BloombergSecurity } from './BloombergPanelWEI';
import { BloombergTopCommandBar } from './BloombergTopCommandBar';
import { BloombergPanelWEI } from './BloombergPanelWEI';
import { BloombergPanelGP } from './BloombergPanelGP';
import { BloombergPanelTOP } from './BloombergPanelTOP';
import { BloombergPanelEMSX } from './BloombergPanelEMSX';
import { BloombergStatusRibbon } from './BloombergStatusRibbon';
import { BloombergHelpModal } from './BloombergHelpModal';
import { BloombergSearchModal } from '@/components/mobile/BloombergSearchModal';
import { NewsArticleModal } from '@/components/mobile/NewsArticleModal';
import type { NewsItem, Quote } from '@/components/mobile/types';
import { useWatchlistStore } from '@/stores/useWatchlistStore';
import { terminalAudio } from '@/lib/terminalAudio';

interface BloombergTerminalDesktopProps {
  onToggleToTradingView?: () => void;
}

export const BloombergTerminalDesktop: React.FC<BloombergTerminalDesktopProps> = ({
  onToggleToTradingView,
}) => {
  const tickers = useWatchlistStore((s) => s.tickers);

  // Binance Spot live feeds
  const btcTicker = tickers['BTCUSDT'];
  const ethTicker = tickers['ETHUSDT'];
  const solTicker = tickers['SOLUSDT'];

  const btcPrice = btcTicker?.lastPrice || 63284.50;
  const btcChg = btcTicker?.priceChangePercent || 0.66;
  const ethPrice = ethTicker?.lastPrice || 3490.20;
  const ethChg = ethTicker?.priceChangePercent || 1.85;
  const solPrice = solTicker?.lastPrice || 154.40;
  const solChg = solTicker?.priceChangePercent || 4.20;

  // Master Securities Universe (Indian Equities, Global Tech, Crypto Majors, Commodities)
  const securities: BloombergSecurity[] = useMemo(() => [
    {
      symbol: 'BTCUSD',
      name: 'Bitcoin Spot',
      tickerClass: 'Curncy',
      region: 'Crypto',
      price: btcPrice,
      change: btcPrice * (btcChg / 100),
      percent: btcChg,
      positive: btcChg >= 0,
      high: btcPrice * 1.015,
      low: btcPrice * 0.985,
      volume: '$28.4B',
      currency: 'USD',
      sparkline: [0.3, 0.45, 0.4, 0.65, 0.6, 0.8, 0.75, 0.9],
    },
    {
      symbol: 'NIFTY',
      name: 'Nifty 50 Index 🇮🇳',
      tickerClass: 'Index',
      region: 'APAC',
      price: 24612.30,
      change: -120.45,
      percent: -0.49,
      positive: false,
      high: 24745.10,
      low: 24590.20,
      volume: '342.1M',
      currency: 'INR',
      sparkline: [0.75, 0.6, 0.68, 0.52, 0.45, 0.38, 0.22, 0.18],
    },
    {
      symbol: 'SENSEX',
      name: 'BSE Sensex 🇮🇳',
      tickerClass: 'Index',
      region: 'APAC',
      price: 80814.73,
      change: 177.20,
      percent: 0.22,
      positive: true,
      high: 80920.40,
      low: 80580.10,
      volume: '185.0M',
      currency: 'INR',
      sparkline: [0.35, 0.4, 0.5, 0.48, 0.6, 0.7, 0.65, 0.8],
    },
    {
      symbol: 'GOLD',
      name: 'Gold Spot (XAU/USD) 🟡',
      tickerClass: 'Comdty',
      region: 'Commodities',
      price: 2658.20,
      change: 22.40,
      percent: 0.85,
      positive: true,
      high: 2664.10,
      low: 2632.40,
      volume: '$18.2B',
      currency: 'USD',
      sparkline: [0.3, 0.4, 0.45, 0.6, 0.55, 0.7, 0.8, 0.9],
    },
    {
      symbol: 'ETHUSD',
      name: 'Ethereum Spot',
      tickerClass: 'Curncy',
      region: 'Crypto',
      price: ethPrice,
      change: ethPrice * (ethChg / 100),
      percent: ethChg,
      positive: ethChg >= 0,
      high: ethPrice * 1.02,
      low: ethPrice * 0.98,
      volume: '$14.2B',
      currency: 'USD',
      sparkline: [0.3, 0.5, 0.45, 0.7, 0.65, 0.85, 0.8, 0.95],
    },
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      tickerClass: 'Equity',
      region: 'Americas',
      price: 178.32,
      change: -1.21,
      percent: -0.67,
      positive: false,
      high: 180.20,
      low: 177.80,
      volume: '54.2M',
      currency: 'USD',
      sparkline: [0.8, 0.65, 0.7, 0.45, 0.5, 0.25, 0.35, 0.15],
    },
    {
      symbol: 'TSLA',
      name: 'Tesla Inc.',
      tickerClass: 'Equity',
      region: 'Americas',
      price: 248.17,
      change: 3.45,
      percent: 1.41,
      positive: true,
      high: 251.40,
      low: 243.60,
      volume: '88.7M',
      currency: 'USD',
      sparkline: [0.2, 0.35, 0.3, 0.55, 0.5, 0.75, 0.65, 0.85],
    },
    {
      symbol: 'NVDA',
      name: 'NVIDIA Corp.',
      tickerClass: 'Equity',
      region: 'Americas',
      price: 141.18,
      change: 2.91,
      percent: 2.10,
      positive: true,
      high: 142.50,
      low: 137.90,
      volume: '62.4M',
      currency: 'USD',
      sparkline: [0.3, 0.45, 0.4, 0.65, 0.6, 0.8, 0.75, 0.9],
    },
    {
      symbol: 'RELIANCE',
      name: 'Reliance Industries 🇮🇳',
      tickerClass: 'Equity',
      region: 'APAC',
      price: 2984.50,
      change: 32.10,
      percent: 1.09,
      positive: true,
      high: 2995.00,
      low: 2950.00,
      volume: '12.4M',
      currency: 'INR',
      sparkline: [0.2, 0.35, 0.4, 0.55, 0.6, 0.75, 0.7, 0.85],
    },
    {
      symbol: 'SOLUSD',
      name: 'Solana Spot',
      tickerClass: 'Curncy',
      region: 'Crypto',
      price: solPrice,
      change: solPrice * (solChg / 100),
      percent: solChg,
      positive: solChg >= 0,
      high: solPrice * 1.05,
      low: solPrice * 0.95,
      volume: '$4.1B',
      currency: 'USD',
      sparkline: [0.2, 0.4, 0.35, 0.6, 0.7, 0.85, 0.8, 0.95],
    },
    {
      symbol: 'BRENT',
      name: 'Brent Crude Oil 🛢️',
      tickerClass: 'Comdty',
      region: 'Commodities',
      price: 78.40,
      change: -0.89,
      percent: -1.12,
      positive: false,
      high: 79.80,
      low: 77.95,
      volume: '4.8M',
      currency: 'USD',
      sparkline: [0.7, 0.65, 0.8, 0.55, 0.6, 0.45, 0.35, 0.25],
    },
  ], [btcPrice, btcChg, ethPrice, ethChg, solPrice, solChg]);

  const [activeSecurity, setActiveSecurity] = useState<BloombergSecurity>(securities[0]);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);

  // Wire News Dispatch Feed
  const newsItems: NewsItem[] = [
    {
      id: 'bn-1',
      title: 'Global markets hold firm as Federal Reserve commentary signals potential rate easing trajectory',
      source: 'Bloomberg News Desk',
      time: '10:48:12',
      category: 'Macro',
      bullets: [
        'Federal Reserve officials note progress on core inflation indicators.',
        'Sovereign yields across major economies contract moderately.',
        'Asian equity bourses, notably Indian indices, register net foreign inflows.'
      ],
      body: 'Global financial instruments advanced during morning trading as institutional desks assessed statements from Federal Reserve officials indicating increased confidence in sustainable disinflation.'
    },
    {
      id: 'bn-2',
      title: 'India NIFTY 50 and Sensex trade near record territory backed by domestic mutual fund inflows',
      source: 'Mumbai Bureau 🇮🇳',
      time: '10:45:03',
      category: 'India',
      bullets: [
        'Systematic investment plans (SIP) in Indian equities cross ₹23,000 Cr monthly milestone.',
        'Heavyweights Reliance Industries and banking majors anchor benchmark support.',
        'Foreign portfolio investors re-evaluate India weighting in regional allocations.'
      ],
      body: 'The benchmark Nifty 50 and S&P BSE Sensex hovered near historic highs today, buoyed by domestic institutional resilience and sustained retail systematic investments.'
    },
    {
      id: 'bn-3',
      title: 'Bitcoin tests $64,000 threshold as institutional spot ETF daily accumulation reaches $450M',
      source: 'Digital Assets Desk',
      time: '10:32:45',
      category: 'Crypto',
      bullets: [
        'US Spot Bitcoin ETFs absorb over 7,200 BTC in latest clearing cycle.',
        'Exchange liquid inventory tightens to multi-year lows.',
        'Implied volatility across derivative expiries stabilizes near baseline.'
      ],
      body: 'Bitcoin consolidated above key technical resistance zones as regulated ETF accumulation steadily absorbed spot exchange availability.'
    },
    {
      id: 'bn-4',
      title: 'Gold spot holds above $2,650 as central bank sovereign reserves continue diversification',
      source: 'Commodities Desk',
      time: '10:18:20',
      category: 'Commodities',
      bullets: [
        'Central bank net bullion purchases persist above historical median.',
        'Real yields remain supportive of non-yielding reserve assets.',
        'Physical premiums in Asian trading hubs remain firm.'
      ],
      body: 'Spot gold held firmly above $2,650 per ounce as ongoing sovereign reserve accumulation and macroeconomic hedging provided sustained physical demand.'
    },
  ];

  // Convert securities to Quote interface for compatibility with Search Modal
  const quotesForSearch: Quote[] = useMemo(() => {
    return securities.map((s) => {
      let cat: 'india' | 'tech' | 'crypto' | 'all' = 'all';
      const reg = s.region.toLowerCase();
      if (reg === 'apac' || s.currency === 'INR') cat = 'india';
      else if (reg === 'crypto') cat = 'crypto';
      else if (reg === 'americas') cat = 'tech';
      return {
        id: s.symbol.toLowerCase(),
        symbol: s.symbol,
        name: s.name,
        price: s.price,
        change: s.change,
        percent: s.percent,
        positive: s.positive,
        category: cat,
        sparkline: s.sparkline,
        high: s.high,
        low: s.low,
        volume: s.volume,
        currency: s.currency,
      };
    });
  }, [securities]);

  // Command Execution Handler (The Heart of the Terminal)
  const handleExecuteCommand = (cmd: string) => {
    terminalAudio.playTick();
    const cleanCmd = cmd.trim().toUpperCase();

    // 1. Mnemonic Function routing
    if (cleanCmd === 'HELP') {
      setIsHelpOpen(true);
      return;
    }
    if (cleanCmd === 'SECF' || cleanCmd === 'SEARCH') {
      setIsSearchOpen(true);
      return;
    }

    // 2. Check for security matches (e.g. BTC, AAPL, NIFTY)
    const matched = securities.find(
      (s) =>
        s.symbol.toUpperCase() === cleanCmd ||
        cleanCmd.startsWith(s.symbol.toUpperCase())
    );

    if (matched) {
      setActiveSecurity(matched);
      return;
    }

    // 3. If user typed an unknown command, trigger search
    setIsSearchOpen(true);
  };

  return (
    <div className="w-screen h-screen bg-[#000000] text-white font-mono flex flex-col overflow-hidden select-none">
      {/* 1. Top Bloomberg Professional Header & Command Bar */}
      <BloombergTopCommandBar
        onExecuteCommand={handleExecuteCommand}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onToggleLayoutMode={onToggleToTradingView}
        currentLayoutMode="bloomberg"
      />

      {/* 2. Main 4-Panel Tiled Workspace (Bloomberg Launchpad Style) */}
      <main className="flex-1 p-2 grid grid-cols-1 lg:grid-cols-12 grid-rows-2 gap-2 min-h-0 overflow-hidden">
        {/* Panel 1: Top-Left (WEI: World Equity Indices & Macro Monitor) */}
        <div className="lg:col-span-6 h-full min-h-0 overflow-hidden shadow-lg">
          <BloombergPanelWEI
            securities={securities}
            activeSymbol={activeSecurity.symbol}
            onSelectSecurity={(sec) => {
              setActiveSecurity(sec);
            }}
          />
        </div>

        {/* Panel 2: Top-Right (GP: Graph Price & Security Description Inspector) */}
        <div className="lg:col-span-6 h-full min-h-0 overflow-hidden shadow-lg">
          <BloombergPanelGP
            security={activeSecurity}
            onTradeAction={(side) => {
              terminalAudio.playTick();
            }}
          />
        </div>

        {/* Panel 3: Bottom-Left (TOP: Bloomberg Real-Time Wire Dispatch) */}
        <div className="lg:col-span-6 h-full min-h-0 overflow-hidden shadow-lg">
          <BloombergPanelTOP
            news={newsItems}
            onSelectArticle={setSelectedArticle}
          />
        </div>

        {/* Panel 4: Bottom-Right (EMSX: Execution Management System & Risk Blotter) */}
        <div className="lg:col-span-6 h-full min-h-0 overflow-hidden shadow-lg">
          <BloombergPanelEMSX
            security={activeSecurity}
          />
        </div>
      </main>

      {/* 3. Bottom Bloomberg Telemetry Ribbon & Streaming Ticker Tape */}
      <BloombergStatusRibbon securities={securities} />

      {/* 4. Interactive Help Reference Modal (<HELP>) */}
      <BloombergHelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        onSelectCommand={handleExecuteCommand}
      />

      {/* 5. Security Finder & Command Search Modal (<SECF>) */}
      <BloombergSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        quotes={quotesForSearch}
        onSelectQuote={(q) => {
          const match = securities.find((s) => s.symbol.toUpperCase() === q.symbol.toUpperCase());
          if (match) setActiveSecurity(match);
        }}
        onSelectFunction={handleExecuteCommand}
      />

      {/* 6. Wire News Article Reader Modal */}
      <NewsArticleModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
        onSelectQuote={(sym) => {
          const match = securities.find((s) => s.symbol.toUpperCase() === sym.toUpperCase());
          if (match) setActiveSecurity(match);
        }}
      />
    </div>
  );
};
