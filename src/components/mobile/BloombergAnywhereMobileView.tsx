// src/components/mobile/BloombergAnywhereMobileView.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  Search,
  Bell,
  Menu,
  Home,
  BarChart2,
  Star,
  FileText,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  X,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useTradingStore } from '@/stores/useTradingStore';
import { useWatchlistStore } from '@/stores/useWatchlistStore';
import { formatPrice, formatInrCrore, formatInrShort } from '@/lib/utils';

interface BloombergAnywhereMobileViewProps {
  onSwitchToProTerminal: () => void;
}

export const BloombergAnywhereMobileView: React.FC<BloombergAnywhereMobileViewProps> = ({
  onSwitchToProTerminal,
}) => {
  const { account, positions } = useTradingStore();
  const tickers = useWatchlistStore((s) => s.tickers);

  const [activeTab, setActiveTab] = useState<'overview' | 'watchlists' | 'portfolios' | 'alerts'>('overview');
  const [activeNav, setActiveNav] = useState<'home' | 'markets' | 'watchlist' | 'news' | 'more'>('home');
  const [isMoreModalOpen, setIsMoreModalOpen] = useState(false);
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useState({
    symbol: 'BTCUSD',
    name: 'Bitcoin',
    price: 63284.50,
    change: 0.66,
    isUp: true,
  });

  // Calculate live portfolio values
  const equityUsdt = account?.equity || 617530;
  const inrCrore = formatInrCrore(equityUsdt);

  // Live BTC price from watchlist store if available
  const btcTicker = tickers['BTCUSDT'];
  const btcPrice = btcTicker?.lastPrice || 63284.50;
  const btcChange = btcTicker?.priceChangePercent || 0.66;
  const isBtcUp = btcChange >= 0;

  const handleOpenInstrument = (symbol: string, name: string, price: number, change: number) => {
    setSelectedInstrument({
      symbol,
      name,
      price,
      change,
      isUp: change >= 0,
    });
    setIsChartModalOpen(true);
  };

  return (
    <div className="w-full min-h-screen bg-[#000000] text-white font-sans flex flex-col justify-between selection:bg-[#ff8800]/30 select-none pb-20">
      {/* 1. Top Bloomberg Anywhere Header */}
      <header className="sticky top-0 z-40 bg-[#000000]/95 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-[#181d28]">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsMoreModalOpen(true)}
            className="text-white hover:text-[#ff8800] transition-colors p-1 -ml-1 cursor-pointer"
            aria-label="Navigation Menu"
          >
            <ChevronLeft size={22} strokeWidth={2.5} />
          </button>
          <div className="flex flex-col leading-none">
            <span className="text-[19px] font-extrabold tracking-tight text-white">
              Bloomberg
            </span>
            <span className="text-[9px] font-bold tracking-[0.2em] text-[#8e95a5] uppercase mt-0.5">
              ANYWHERE
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Search Icon */}
          <button
            onClick={() => handleOpenInstrument('BTCUSDT', 'Bitcoin', btcPrice, btcChange)}
            className="text-white hover:text-[#ff8800] transition-colors cursor-pointer"
            aria-label="Search instruments"
          >
            <Search size={20} strokeWidth={2.2} />
          </button>

          {/* Notifications Bell with Red Indicator Dot */}
          <button
            onClick={() => setActiveTab('alerts')}
            className="text-white hover:text-[#ff8800] transition-colors relative cursor-pointer"
            aria-label="Notifications"
          >
            <Bell size={20} strokeWidth={2.2} />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#ff4d4f] ring-2 ring-[#000000]" />
          </button>

          {/* Hamburger Menu */}
          <button
            onClick={() => setIsMoreModalOpen(true)}
            className="text-white hover:text-[#ff8800] transition-colors cursor-pointer"
            aria-label="More options"
          >
            <Menu size={21} strokeWidth={2.2} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {/* 2. Profile Card (Initials BS, Bhaskar Sharma, Individual Investor, Active) */}
        <section
          onClick={() => setIsMoreModalOpen(true)}
          className="px-4 pt-4 pb-3 flex items-center gap-3.5 cursor-pointer hover:bg-[#0c0f15] transition-colors"
        >
          <div className="w-[58px] h-[58px] rounded-full bg-[#141923] border-2 border-[#2b3547] flex items-center justify-center text-xl font-bold text-white shrink-0 shadow-lg">
            BS
          </div>

          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
            <h1 className="text-lg font-bold text-white truncate leading-tight">
              Bhaskar Sharma
            </h1>
            <p className="text-xs text-[#8e95a5] font-medium leading-none">
              Individual Investor
            </p>

            <div className="flex items-center gap-2.5 mt-1.5">
              <span className="text-[9px] font-bold font-mono tracking-wider text-[#d1d5db] bg-[#161c28] border border-[#263145] px-2 py-0.5 rounded-[3px] uppercase">
                BLOOMBERG ANYWHERE USER
              </span>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#00c176]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00c176] shadow-[0_0_8px_#00c176] animate-pulse" />
                <span>Active</span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Navigation Underline Tabs (Overview, Watchlists, Portfolios, Alerts) */}
        <nav className="px-4 flex items-center gap-6 border-b border-[#181d28] overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'watchlists', label: 'Watchlists' },
            { id: 'portfolios', label: 'Portfolios' },
            { id: 'alerts', label: 'Alerts' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2.5 text-xs font-bold transition-all relative whitespace-nowrap cursor-pointer ${
                  isActive ? 'text-white' : 'text-[#8e95a5] hover:text-white'
                }`}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#ff8800] rounded-t-sm shadow-[0_0_6px_#ff8800]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-4 p-4">
            {/* 4. Market Snapshot (My Watchlist) */}
            <section className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white flex items-center gap-1">
                  <span>Market Snapshot</span>
                  <span className="text-xs font-normal text-[#8e95a5]">(My Watchlist)</span>
                </h2>
                <button
                  onClick={() => setActiveTab('watchlists')}
                  className="text-xs font-semibold text-[#2979ff] hover:underline cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="bg-[#12151c] border border-[#1e2430] rounded-xl overflow-hidden divide-y divide-[#1a202c]">
                {/* AAPL */}
                <div
                  onClick={() => handleOpenInstrument('AAPL', 'Apple Inc', 178.32, -0.67)}
                  className="p-3 flex items-center justify-between cursor-pointer active:bg-[#181e28] transition-colors"
                >
                  <div className="w-24">
                    <div className="font-bold text-sm text-white">AAPL</div>
                    <div className="text-[11px] text-[#8e95a5] truncate">Apple Inc</div>
                  </div>
                  {/* Red mini sparkline */}
                  <svg className="w-20 h-6 shrink-0" viewBox="0 0 80 24">
                    <path d="M0,8 Q20,6 35,14 T60,16 T80,21" fill="none" stroke="#ff4d4f" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <div className="text-right w-24">
                    <div className="font-mono text-sm font-bold text-white tabular-nums">178.32</div>
                    <div className="font-mono text-[11px] font-semibold text-[#ff4d4f] tabular-nums">-1.21 (-0.67%)</div>
                  </div>
                </div>

                {/* TSLA */}
                <div
                  onClick={() => handleOpenInstrument('TSLA', 'Tesla Inc', 248.17, 1.41)}
                  className="p-3 flex items-center justify-between cursor-pointer active:bg-[#181e28] transition-colors"
                >
                  <div className="w-24">
                    <div className="font-bold text-sm text-white">TSLA</div>
                    <div className="text-[11px] text-[#8e95a5] truncate">Tesla Inc</div>
                  </div>
                  {/* Green mini sparkline */}
                  <svg className="w-20 h-6 shrink-0" viewBox="0 0 80 24">
                    <path d="M0,20 Q20,18 40,11 T60,13 T80,4" fill="none" stroke="#00c176" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <div className="text-right w-24">
                    <div className="font-mono text-sm font-bold text-white tabular-nums">248.17</div>
                    <div className="font-mono text-[11px] font-semibold text-[#00c176] tabular-nums">+3.45 (+1.41%)</div>
                  </div>
                </div>

                {/* NIFTY 50 (Indian Equity Index) */}
                <div
                  onClick={() => handleOpenInstrument('NIFTY', 'Nifty 50 🇮🇳', 24612.30, -0.49)}
                  className="p-3 flex items-center justify-between cursor-pointer active:bg-[#181e28] transition-colors"
                >
                  <div className="w-24">
                    <div className="font-bold text-sm text-white flex items-center gap-1">
                      <span>NIFTY</span>
                      <span className="text-[10px]">🇮🇳</span>
                    </div>
                    <div className="text-[11px] text-[#8e95a5] truncate">Nifty 50 Index</div>
                  </div>
                  {/* Red mini sparkline */}
                  <svg className="w-20 h-6 shrink-0" viewBox="0 0 80 24">
                    <path d="M0,6 Q20,12 38,10 T60,18 T80,22" fill="none" stroke="#ff4d4f" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <div className="text-right w-24">
                    <div className="font-mono text-sm font-bold text-white tabular-nums">24,612.30</div>
                    <div className="font-mono text-[11px] font-semibold text-[#ff4d4f] tabular-nums">-120.45 (-0.49%)</div>
                  </div>
                </div>

                {/* BTCUSD (Live Binance Crypto) */}
                <div
                  onClick={() => handleOpenInstrument('BTCUSD', 'Bitcoin', btcPrice, btcChange)}
                  className="p-3 flex items-center justify-between cursor-pointer active:bg-[#181e28] transition-colors"
                >
                  <div className="w-24">
                    <div className="font-bold text-sm text-white">BTCUSD</div>
                    <div className="text-[11px] text-[#8e95a5] truncate">Bitcoin</div>
                  </div>
                  {/* Green mini sparkline */}
                  <svg className="w-20 h-6 shrink-0" viewBox="0 0 80 24">
                    <path d="M0,18 Q20,15 35,10 T55,13 T80,3" fill="none" stroke={isBtcUp ? '#00c176' : '#ff4d4f'} strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <div className="text-right w-24">
                    <div className="font-mono text-sm font-bold text-white tabular-nums">
                      ${formatPrice(btcPrice, 2)}
                    </div>
                    <div className={`font-mono text-[11px] font-semibold tabular-nums ${isBtcUp ? 'text-[#00c176]' : 'text-[#ff4d4f]'}`}>
                      {isBtcUp ? '+' : ''}{btcChange.toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 5. My Portfolios */}
            <section className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white">My Portfolios</h2>
                <Link
                  href="/u/Bhaskar1461"
                  className="text-xs font-semibold text-[#2979ff] hover:underline cursor-pointer"
                >
                  View All
                </Link>
              </div>

              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                {/* Main Portfolio Card */}
                <Link
                  href="/u/Bhaskar1461"
                  className="flex-1 min-w-[210px] bg-[#12151c] border border-[#1e2430] hover:border-[#ff8800] rounded-xl p-3.5 flex flex-col justify-between transition-colors shadow-md"
                >
                  <div>
                    <div className="text-xs font-semibold text-[#8e95a5]">Main Portfolio</div>
                    <div className="font-mono text-xl font-extrabold text-white mt-1 tabular-nums">
                      ${formatPrice(equityUsdt, 2)}
                    </div>
                    <div className="font-mono text-xs font-bold text-[#ff8800] mt-0.5">
                      ≈ {inrCrore}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs font-bold text-[#00c176]">+2.31% (Today)</span>
                    <svg className="w-16 h-6" viewBox="0 0 64 24">
                      <path d="M0,18 Q16,14 32,8 T50,10 T64,3" fill="none" stroke="#00c176" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                </Link>

                {/* Long Term Portfolio Card */}
                <div
                  onClick={() => setIsMoreModalOpen(true)}
                  className="flex-1 min-w-[190px] bg-[#12151c] border border-[#1e2430] rounded-xl p-3.5 flex flex-col justify-between cursor-pointer shadow-md"
                >
                  <div>
                    <div className="text-xs font-semibold text-[#8e95a5]">Long Term F&O</div>
                    <div className="font-mono text-xl font-extrabold text-white mt-1 tabular-nums">
                      $128,204.11
                    </div>
                    <div className="font-mono text-xs font-bold text-[#ff8800] mt-0.5">
                      ≈ ₹1.07 Cr INR
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs font-bold text-[#00c176]">+0.92% (Today)</span>
                    <svg className="w-16 h-6" viewBox="0 0 64 24">
                      <path d="M0,16 Q16,17 32,11 T50,13 T64,5" fill="none" stroke="#00c176" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>
              </div>
            </section>

            {/* 6. Recent News Section */}
            <section className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white">Recent News</h2>
                <button
                  onClick={() => setActiveNav('news')}
                  className="text-xs font-semibold text-[#2979ff] hover:underline cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="flex flex-col gap-2.5">
                {/* News 1: Fed / US Macro */}
                <div
                  onClick={() => setIsMoreModalOpen(true)}
                  className="bg-[#12151c] border border-[#1e2430] rounded-xl p-3 flex gap-3 cursor-pointer active:bg-[#181e28] transition-colors"
                >
                  <div className="w-[72px] h-[60px] rounded-lg bg-[#18202d] border border-[#232d3d] flex items-center justify-center shrink-0 overflow-hidden">
                    <svg className="w-full h-full" viewBox="0 0 72 60">
                      <rect width="72" height="60" fill="#18202d" />
                      <path d="M12,48 L26,22 L40,32 L60,12" stroke="#ff8800" strokeWidth="2.5" fill="none" />
                    </svg>
                  </div>
                  <div className="flex flex-col justify-between flex-1">
                    <h3 className="text-[13px] font-semibold text-white line-clamp-2 leading-snug">
                      Markets steady as Fed comments fuel rate cut expectations
                    </h3>
                    <span className="text-[10px] text-[#8e95a5]">Bloomberg · 2h ago</span>
                  </div>
                </div>

                {/* News 2: Indian Macro / RBI */}
                <div
                  onClick={() => setIsMoreModalOpen(true)}
                  className="bg-[#12151c] border border-[#1e2430] rounded-xl p-3 flex gap-3 cursor-pointer active:bg-[#181e28] transition-colors"
                >
                  <div className="w-[72px] h-[60px] rounded-lg bg-[#18202d] border border-[#232d3d] flex items-center justify-center shrink-0 overflow-hidden">
                    <svg className="w-full h-full" viewBox="0 0 72 60">
                      <rect width="72" height="60" fill="#18202d" />
                      <circle cx="36" cy="30" r="14" fill="#202a3a" />
                      <path d="M26,30 L46,30 M36,20 L36,40" stroke="#00c176" strokeWidth="2" />
                    </svg>
                  </div>
                  <div className="flex flex-col justify-between flex-1">
                    <h3 className="text-[13px] font-semibold text-white line-clamp-2 leading-snug">
                      RBI maintains durable liquidity stance as Indian GDP projections remain robust
                    </h3>
                    <span className="text-[10px] text-[#8e95a5]">Bloomberg Markets · 3h ago</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Tab 2: Watchlists Tab */}
        {activeTab === 'watchlists' && (
          <div className="p-4 flex flex-col gap-3">
            <h2 className="text-base font-bold text-white">Full Market Watchlist</h2>
            <div className="bg-[#12151c] border border-[#1e2430] rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-[#1f2634] text-xs text-[#8e95a5]">
                <span>INSTRUMENT</span>
                <span>LAST / 24H CHG</span>
              </div>
              {[
                { s: 'AAPL', n: 'Apple Inc', p: 178.32, c: -0.67 },
                { s: 'TSLA', n: 'Tesla Inc', p: 248.17, c: 1.41 },
                { s: 'NIFTY', n: 'Nifty 50 Index 🇮🇳', p: 24612.30, c: -0.49 },
                { s: 'BTCUSD', n: 'Bitcoin Spot', p: btcPrice, c: btcChange },
                { s: 'ETHUSD', n: 'Ethereum Spot', p: 3490.50, c: 2.15 },
                { s: 'SOLUSD', n: 'Solana Spot', p: 154.20, c: 4.80 },
              ].map((item) => (
                <div
                  key={item.s}
                  onClick={() => handleOpenInstrument(item.s, item.n, item.p, item.c)}
                  className="flex justify-between items-center py-1.5 cursor-pointer hover:bg-[#19202c] rounded px-1 transition-colors"
                >
                  <div>
                    <div className="font-bold text-sm text-white">{item.s}</div>
                    <div className="text-[11px] text-[#8e95a5]">{item.n}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm font-bold text-white">${formatPrice(item.p, 2)}</div>
                    <div className={`font-mono text-xs font-bold ${item.c >= 0 ? 'text-[#00c176]' : 'text-[#ff4d4f]'}`}>
                      {item.c >= 0 ? '+' : ''}{item.c.toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Portfolios Tab */}
        {activeTab === 'portfolios' && (
          <div className="p-4 flex flex-col gap-3">
            <h2 className="text-base font-bold text-white">Bloomberg Portfolios (PORT)</h2>
            <div className="bg-[#12151c] border border-[#1e2430] rounded-xl p-4 flex flex-col gap-3">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-[#8e95a5]">Total Net Worth (NAV)</span>
                <span className="text-xs font-mono font-bold text-[#00c176]">+2.06% (24h)</span>
              </div>
              <div className="text-3xl font-extrabold font-mono text-white">
                ${formatPrice(equityUsdt, 2)}
              </div>
              <div className="text-sm font-bold font-mono text-[#ff8800]">
                ≈ {inrCrore}
              </div>
              <div className="pt-2 border-t border-[#1f2634] flex gap-2">
                <Link
                  href="/u/Bhaskar1461"
                  className="flex-1 py-2 bg-[#ff8800] text-black font-bold text-xs rounded text-center"
                >
                  View Audited Ledger
                </Link>
                <button
                  onClick={onSwitchToProTerminal}
                  className="flex-1 py-2 bg-[#1f2736] text-white font-bold text-xs rounded text-center"
                >
                  Trade in Terminal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="p-4 flex flex-col gap-3">
            <h2 className="text-base font-bold text-white">Active Price Alerts</h2>
            <div className="bg-[#12151c] border border-[#1e2430] rounded-xl p-4 divide-y divide-[#1f2634] text-xs">
              <div className="py-2 flex justify-between items-center">
                <div>
                  <span className="font-bold text-white">BTC &gt; $65,000</span>
                  <div className="text-[10px] text-[#8e95a5]">Push Notification Enabled</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#00c176]/15 text-[#00c176] font-bold text-[10px]">Active</span>
              </div>
              <div className="py-2 flex justify-between items-center">
                <div>
                  <span className="font-bold text-white">NIFTY &gt; 25,000</span>
                  <div className="text-[10px] text-[#8e95a5]">Breakout Trigger</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#00c176]/15 text-[#00c176] font-bold text-[10px]">Active</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 7. Bottom Navigation Bar (Home, Markets, Watchlist, News, More) */}
      <nav className="fixed bottom-0 left-0 right-0 h-14 bg-[#080a0e] border-t border-[#1a202c] z-50 flex items-center justify-around px-2">
        {/* Home */}
        <button
          onClick={() => { setActiveNav('home'); setActiveTab('overview'); }}
          className={`flex flex-col items-center justify-center flex-1 py-1 gap-1 cursor-pointer transition-colors ${
            activeNav === 'home' ? 'text-[#ff8800]' : 'text-[#8e95a5] hover:text-white'
          }`}
        >
          <Home size={19} />
          <span className="text-[10px] font-bold">Home</span>
        </button>

        {/* Markets */}
        <button
          onClick={() => onSwitchToProTerminal()}
          className={`flex flex-col items-center justify-center flex-1 py-1 gap-1 cursor-pointer transition-colors ${
            activeNav === 'markets' ? 'text-[#ff8800]' : 'text-[#8e95a5] hover:text-white'
          }`}
        >
          <BarChart2 size={19} />
          <span className="text-[10px] font-bold">Markets</span>
        </button>

        {/* Watchlist */}
        <button
          onClick={() => { setActiveNav('watchlist'); setActiveTab('watchlists'); }}
          className={`flex flex-col items-center justify-center flex-1 py-1 gap-1 cursor-pointer transition-colors ${
            activeNav === 'watchlist' ? 'text-[#ff8800]' : 'text-[#8e95a5] hover:text-white'
          }`}
        >
          <Star size={19} />
          <span className="text-[10px] font-bold">Watchlist</span>
        </button>

        {/* News */}
        <button
          onClick={() => { setActiveNav('news'); }}
          className={`flex flex-col items-center justify-center flex-1 py-1 gap-1 cursor-pointer transition-colors ${
            activeNav === 'news' ? 'text-[#ff8800]' : 'text-[#8e95a5] hover:text-white'
          }`}
        >
          <FileText size={19} />
          <span className="text-[10px] font-bold">News</span>
        </button>

        {/* More */}
        <button
          onClick={() => setIsMoreModalOpen(true)}
          className={`flex flex-col items-center justify-center flex-1 py-1 gap-1 cursor-pointer transition-colors ${
            activeNav === 'more' ? 'text-[#ff8800]' : 'text-[#8e95a5] hover:text-white'
          }`}
        >
          <MoreHorizontal size={19} />
          <span className="text-[10px] font-bold">More</span>
        </button>
      </nav>

      {/* 8. More Options Drawer Sheet */}
      {isMoreModalOpen && (
        <div
          onClick={() => setIsMoreModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end justify-center animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-[#121620] border-t border-[#2a3346] rounded-t-2xl p-5 pb-8 flex flex-col gap-3 shadow-2xl"
          >
            <div className="w-10 h-1 bg-[#3a455a] rounded-full mx-auto mb-2" />

            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Bloomberg Anywhere Options</h3>
              <button
                onClick={() => setIsMoreModalOpen(false)}
                className="text-[#8e95a5] hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <Link
                href="/u/Bhaskar1461"
                className="p-3 bg-[#181d28] hover:bg-[#1e2535] rounded-xl flex items-center justify-between transition-colors"
              >
                <div>
                  <div className="font-bold text-sm text-white">Account Settings</div>
                  <div className="text-xs text-[#8e95a5]">Bhaskar Sharma · Individual Investor</div>
                </div>
                <ChevronLeft size={16} className="rotate-180 text-[#ff8800]" />
              </Link>

              <div className="p-3 bg-[#181d28] rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-white">Subscription Details</div>
                  <div className="text-xs text-[#00c176]">Bloomberg Anywhere License: Active</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#00c176]/15 text-[#00c176]">
                  Verified
                </span>
              </div>

              <div className="p-3 bg-[#181d28] rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-white">Base Currency Preference</div>
                  <div className="text-xs text-[#8e95a5]">Dual Valuation: USD + INR (1 USDT = ₹83.33)</div>
                </div>
                <span className="font-bold font-mono text-xs text-[#ff8800]">₹ INR / $</span>
              </div>

              {/* Action: Launch Pro Candlestick Terminal */}
              <button
                onClick={() => { setIsMoreModalOpen(false); onSwitchToProTerminal(); }}
                className="w-full mt-2 py-3 bg-[#ff8800] hover:bg-[#e07700] text-black font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg transition-colors cursor-pointer"
              >
                <Sparkles size={16} />
                <span>Launch Full Pro Candlestick Terminal</span>
              </button>

              <button
                onClick={() => setIsMoreModalOpen(false)}
                className="w-full py-2.5 bg-[#222834] text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instrument Chart & Trading Sheet Modal */}
      {isChartModalOpen && (
        <div
          onClick={() => setIsChartModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end justify-center animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-[#121620] border-t border-[#2a3346] rounded-t-2xl p-5 pb-8 flex flex-col gap-3 shadow-2xl"
          >
            <div className="w-10 h-1 bg-[#3a455a] rounded-full mx-auto mb-2" />

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">{selectedInstrument.symbol}</h3>
                <span className="text-xs text-[#8e95a5]">{selectedInstrument.name}</span>
              </div>
              <div className="text-right">
                <div className="font-mono text-lg font-bold text-white">
                  ${formatPrice(selectedInstrument.price, 2)}
                </div>
                <div className={`font-mono text-xs font-bold ${selectedInstrument.isUp ? 'text-[#00c176]' : 'text-[#ff4d4f]'}`}>
                  {selectedInstrument.isUp ? '+' : ''}{selectedInstrument.change.toFixed(2)}%
                </div>
              </div>
            </div>

            {/* Simulated Live Sparkline */}
            <div className="h-28 bg-[#0b0e14] border border-[#1b2230] rounded-xl flex items-center justify-center p-2 my-1">
              <svg className="w-full h-full" viewBox="0 0 280 80">
                <path
                  d="M0,50 Q40,30 80,45 T160,20 T240,35 T280,10"
                  fill="none"
                  stroke={selectedInstrument.isUp ? '#00c176' : '#ff4d4f'}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Quick Buy & Sell Buttons */}
            <div className="grid grid-cols-2 gap-3 mt-2">
              <button
                onClick={() => {
                  alert(`Market BUY order executed for ${selectedInstrument.symbol}`);
                  setIsChartModalOpen(false);
                }}
                className="py-3 bg-[#00c176] hover:bg-[#00a866] text-white font-extrabold text-sm rounded-xl transition-colors cursor-pointer shadow-lg"
              >
                BUY / LONG
              </button>
              <button
                onClick={() => {
                  alert(`Market SELL order executed for ${selectedInstrument.symbol}`);
                  setIsChartModalOpen(false);
                }}
                className="py-3 bg-[#ff4d4f] hover:bg-[#e03b3d] text-white font-extrabold text-sm rounded-xl transition-colors cursor-pointer shadow-lg"
              >
                SELL / SHORT
              </button>
            </div>

            <button
              onClick={() => {
                setIsChartModalOpen(false);
                onSwitchToProTerminal();
              }}
              className="py-2.5 bg-[#1e2535] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer mt-1"
            >
              <ExternalLink size={13} />
              <span>Open in Full Candlestick Terminal</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
