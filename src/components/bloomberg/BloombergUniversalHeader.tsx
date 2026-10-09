// src/components/bloomberg/BloombergUniversalHeader.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Terminal,
  ShieldCheck,
  TrendingUp,
  RotateCcw,
  Volume2,
  VolumeX,
  ExternalLink,
  HelpCircle,
} from 'lucide-react';
import { terminalAudio } from '@/lib/terminalAudio';

interface BloombergUniversalHeaderProps {
  activeMnemonic?: string;
  subtitle?: string;
}

export const BloombergUniversalHeader: React.FC<BloombergUniversalHeaderProps> = ({
  activeMnemonic = 'FUND',
  subtitle = 'TREASURY LEDGER',
}) => {
  const [clocks, setClocks] = useState({
    utc: '',
    nyc: '',
    lon: '',
    ist: '',
  });

  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();
      const formatTime = (timeZone: string) =>
        new Intl.DateTimeFormat('en-GB', {
          timeZone,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }).format(now);

      setClocks({
        utc: formatTime('UTC'),
        nyc: formatTime('America/New_York'),
        lon: formatTime('Europe/London'),
        ist: formatTime('Asia/Kolkata'),
      });
    };

    updateClocks();
    const interval = setInterval(updateClocks, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="w-full bg-[#05070a] border-b-2 border-[#182030] text-white select-none font-mono sticky top-0 z-40">
      {/* Top Telemetry Strip */}
      <div className="flex items-center justify-between px-3 sm:px-6 py-1.5 bg-[#000000] border-b border-[#141a26] text-[11px] text-[#8e95a5]">
        {/* Brand & Terminal Identity */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            onClick={() => terminalAudio.playTick()}
            className="flex items-center gap-1.5 font-bold tracking-wider text-[#ff8800] hover:opacity-90 transition-opacity"
          >
            <span className="w-2 h-2 rounded-full bg-[#ff8800] shadow-[0_0_8px_#ff8800] animate-pulse" />
            <span className="text-white font-black tracking-normal">BLOOMBERG</span>
            <span className="text-[10px] text-[#ff8800] px-1 py-0.2 bg-[#ff8800]/20 rounded border border-[#ff8800]/40">
              PROFESSIONAL
            </span>
          </Link>

          <span className="text-[#2a364d]">|</span>

          <div className="flex items-center gap-1.5 text-[10px]">
            <span className="px-1.5 py-0.2 bg-[#ff8800] text-black font-black rounded-[2px]">
              &lt;{activeMnemonic}&gt;
            </span>
            <span className="text-white font-bold uppercase hidden sm:inline">
              {subtitle}
            </span>
          </div>
        </div>

        {/* Global Multi-Timezone Clocks */}
        <div className="hidden lg:flex items-center gap-3.5 text-[10px]">
          <div className="flex items-center gap-1">
            <span className="text-[#64748b]">UTC:</span>
            <span className="text-[#d1d5db] font-bold">{clocks.utc || '00:00:00'}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[#64748b]">NYC (EST):</span>
            <span className="text-[#d1d5db] font-bold">{clocks.nyc || '00:00:00'}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[#64748b]">LON (BST):</span>
            <span className="text-[#d1d5db] font-bold">{clocks.lon || '00:00:00'}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[#ff8800] font-bold">MUMBAI (IST 🇮🇳):</span>
            <span className="text-white font-bold">{clocks.ist || '00:00:00'}</span>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-2 text-[10px]">
          <span className="text-[#00c176] font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00c176] animate-pulse" />
            <span>LIVE LEDGER</span>
          </span>
        </div>
      </div>

      {/* Main Terminal Navigation Bar */}
      <div className="px-3 sm:px-6 py-2 bg-[#080b11] flex flex-wrap items-center justify-between gap-2">
        {/* Navigation Mnemonic Pills */}
        <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <Link
            href="/"
            onClick={() => terminalAudio.playTick()}
            className="px-2.5 py-1 rounded bg-[#ff8800] hover:bg-[#ffa033] text-black font-mono font-black text-xs tracking-wider transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Terminal size={12} />
            <span>&lt;LAUNCHPAD GO&gt;</span>
          </Link>

          <Link
            href="/"
            onClick={() => terminalAudio.playTick()}
            className="px-2 py-1 rounded text-[11px] font-bold tracking-tight transition-colors text-[#ff8800] bg-[#101520] border border-[#ff8800]/40 flex items-center gap-1"
            title="Instant Bloomberg Messaging Desk <IB>"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#00ff66] animate-pulse" />
            <span>&lt;IB&gt; DESK</span>
          </Link>

          <Link
            href="/funding"
            onClick={() => terminalAudio.playTick()}
            className={`px-2 py-1 rounded text-[11px] font-bold tracking-tight transition-colors ${
              activeMnemonic === 'FUND'
                ? 'bg-[#182338] text-[#ff8800] border border-[#ff8800]/50'
                : 'text-[#8e95a5] hover:text-white bg-[#101520]'
            }`}
          >
            &lt;FUND&gt; TREASURY
          </Link>

          <Link
            href="/transparency"
            onClick={() => terminalAudio.playTick()}
            className={`px-2 py-1 rounded text-[11px] font-bold tracking-tight transition-colors ${
              activeMnemonic === 'PROOF'
                ? 'bg-[#182338] text-[#ff8800] border border-[#ff8800]/50'
                : 'text-[#8e95a5] hover:text-white bg-[#101520]'
            }`}
          >
            &lt;PROOF&gt; LEDGER
          </Link>

          <Link
            href="/reality"
            onClick={() => terminalAudio.playTick()}
            className={`px-2 py-1 rounded text-[11px] font-bold tracking-tight transition-colors ${
              activeMnemonic === 'REALITY'
                ? 'bg-[#182338] text-[#ff8800] border border-[#ff8800]/50'
                : 'text-[#8e95a5] hover:text-white bg-[#101520]'
            }`}
          >
            &lt;REALITY&gt; CHECK
          </Link>

          <Link
            href="/scoreboard"
            onClick={() => terminalAudio.playTick()}
            className={`px-2 py-1 rounded text-[11px] font-bold tracking-tight transition-colors hidden md:inline ${
              activeMnemonic === 'SCORE'
                ? 'bg-[#182338] text-[#ff8800] border border-[#ff8800]/50'
                : 'text-[#8e95a5] hover:text-white bg-[#101520]'
            }`}
          >
            &lt;SCORE&gt; INFLUENCERS
          </Link>

          <Link
            href="/backtest"
            onClick={() => terminalAudio.playTick()}
            className={`px-2 py-1 rounded text-[11px] font-bold tracking-tight transition-colors hidden lg:inline ${
              activeMnemonic === 'BTST'
                ? 'bg-[#182338] text-[#ff8800] border border-[#ff8800]/50'
                : 'text-[#8e95a5] hover:text-white bg-[#101520]'
            }`}
          >
            &lt;BTST&gt; BACKTEST
          </Link>

          <Link
            href="/tournaments"
            onClick={() => terminalAudio.playTick()}
            className={`px-2 py-1 rounded text-[11px] font-bold tracking-tight transition-colors hidden lg:inline ${
              activeMnemonic === 'TOUR'
                ? 'bg-[#182338] text-[#ff8800] border border-[#ff8800]/50'
                : 'text-[#8e95a5] hover:text-white bg-[#101520]'
            }`}
          >
            &lt;TOUR&gt; TOURNAMENTS
          </Link>

          <Link
            href="/leaderboard"
            onClick={() => terminalAudio.playTick()}
            className={`px-2 py-1 rounded text-[11px] font-bold tracking-tight transition-colors hidden sm:inline ${
              activeMnemonic === 'LEAD'
                ? 'bg-[#182338] text-[#ff8800] border border-[#ff8800]/50'
                : 'text-[#8e95a5] hover:text-white bg-[#101520]'
            }`}
          >
            &lt;LEAD&gt; RANKINGS
          </Link>

          <Link
            href="/developers"
            onClick={() => terminalAudio.playTick()}
            className={`px-2 py-1 rounded text-[11px] font-bold tracking-tight transition-colors hidden xl:inline ${
              activeMnemonic === 'API'
                ? 'bg-[#182338] text-[#ff8800] border border-[#ff8800]/50'
                : 'text-[#8e95a5] hover:text-white bg-[#101520]'
            }`}
          >
            &lt;API&gt; DOCS
          </Link>
        </nav>

        {/* Right Action */}
        <div className="flex items-center gap-2">
          <Link
            href="/"
            onClick={() => terminalAudio.playTick()}
            className="px-3 py-1 bg-[#121927] hover:bg-[#1a2337] border border-[#23314d] hover:border-[#ff8800] rounded text-[11px] text-[#ff8800] font-bold transition-colors flex items-center gap-1.5"
          >
            <span>OPEN 4-PANEL WORKSPACE</span>
            <span>&lt;GO&gt;</span>
          </Link>
        </div>
      </div>
    </header>
  );
};
