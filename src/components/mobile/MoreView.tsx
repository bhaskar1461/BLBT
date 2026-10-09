// src/components/mobile/MoreView.tsx
'use client';

import React, { useState } from 'react';
import { TerminalHeader } from './TerminalHeader';
import {
  User,
  PieChart,
  Bell,
  Settings,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
  Terminal,
} from 'lucide-react';
import Link from 'next/link';
import { terminalAudio } from '@/lib/terminalAudio';

interface MoreViewProps {
  onNavigateMarkets: () => void;
  onOpenAlerts: () => void;
  onOpenPortfolios: () => void;
}

export const MoreView: React.FC<MoreViewProps> = ({
  onNavigateMarkets,
  onOpenAlerts,
  onOpenPortfolios,
}) => {
  const [faceIdEnabled, setFaceIdEnabled] = useState(true);
  const [livePricesEnabled, setLivePricesEnabled] = useState(true);

  return (
    <div className="flex flex-col min-h-screen bg-[#000000] text-white font-mono select-none pb-28">
      <TerminalHeader title="SYSTEM CONFIGURATION" subtitle="OPERATOR COMMAND DESK <CMD <GO>>" />

      <div className="flex flex-col gap-3 px-3 pt-3">
        {/* Terminal Operator Profile Strip */}
        <section className="p-3 bg-[#070a10] border border-[#182030] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-[#101520] border border-[#ff8800] flex items-center justify-center text-xs font-black text-[#ff8800]">
              BS
            </div>

            <div className="flex flex-col leading-tight">
              <span className="text-xs font-black text-white">
                BHASKAR SHARMA
              </span>
              <span className="text-[10px] text-[#8e95a5]">
                OPERATOR ID: BS-8841-TERMINAL
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[9px] font-bold px-1.5 py-0.5 bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/30 uppercase">
              PROFESSIONAL ACTIVE
            </span>
          </div>
        </section>

        {/* Section 1: FUNCTION SHORTCUTS */}
        <section className="border border-[#182030] bg-[#070a10]">
          <div className="px-2.5 py-1 bg-[#101520] border-b border-[#182030] text-[10px] text-[#ff8800] font-bold">
            BLOTTER &amp; ANALYTICS FUNCTIONS
          </div>

          <div className="divide-y divide-[#141b28] text-xs">
            <Link
              href="/u/Bhaskar1461"
              className="p-2.5 flex items-center justify-between hover:bg-[#0e131d] transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-[#ff8800] font-bold">&lt;TRAC&gt;</span>
                <span className="text-white">Public Cryptographic Track Record</span>
              </div>
              <ChevronRight size={14} className="text-[#5c6475]" />
            </Link>

            <div
              onClick={() => {
                terminalAudio.playTick();
                onOpenPortfolios();
              }}
              className="p-2.5 flex items-center justify-between hover:bg-[#0e131d] cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-[#ff8800] font-bold">&lt;PORT&gt;</span>
                <span className="text-white">Portfolio &amp; Risk Blotter Analytics</span>
              </div>
              <ChevronRight size={14} className="text-[#5c6475]" />
            </div>

            <div
              onClick={() => {
                terminalAudio.playTick();
                onOpenAlerts();
              }}
              className="p-2.5 flex items-center justify-between hover:bg-[#0e131d] cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-[#ff8800] font-bold">&lt;ALRT&gt;</span>
                <span className="text-white">Price Volatility &amp; Drawdown Triggers</span>
              </div>
              <ChevronRight size={14} className="text-[#5c6475]" />
            </div>
          </div>
        </section>

        {/* Section 2: TERMINAL TELEMETRY & PREFERENCES */}
        <section className="border border-[#182030] bg-[#070a10]">
          <div className="px-2.5 py-1 bg-[#101520] border-b border-[#182030] text-[10px] text-[#ff8800] font-bold">
            TELEMETRY &amp; ENGINE CONFIGURATION
          </div>

          <div className="divide-y divide-[#141b28] text-xs">
            <div className="p-2.5 flex items-center justify-between">
              <div>
                <span className="text-white font-bold">Base Currency Valuation</span>
                <p className="text-[10px] text-[#8e95a5]">Dual USD ($) and INR (₹) institutional peg</p>
              </div>
              <span className="text-[10px] font-bold text-[#ff8800] bg-[#141a26] px-1.5 py-0.5 border border-[#1f2838]">
                USD + INR
              </span>
            </div>

            <div
              onClick={() => {
                terminalAudio.playTick();
                setLivePricesEnabled(!livePricesEnabled);
              }}
              className="p-2.5 flex items-center justify-between cursor-pointer hover:bg-[#0e131d]"
            >
              <div>
                <span className="text-white font-bold">Binance Spot Feed Sub-Second</span>
                <p className="text-[10px] text-[#8e95a5]">High-frequency WebSocket execution connection</p>
              </div>
              <span className={`text-[10px] font-bold ${livePricesEnabled ? 'text-[#00ff66]' : 'text-[#8e95a5]'}`}>
                {livePricesEnabled ? 'ONLINE' : 'PAUSED'}
              </span>
            </div>

            <div
              onClick={() => {
                terminalAudio.playTick();
                setFaceIdEnabled(!faceIdEnabled);
              }}
              className="p-2.5 flex items-center justify-between cursor-pointer hover:bg-[#0e131d]"
            >
              <div>
                <span className="text-white font-bold">Biometric Terminal Authentication</span>
                <p className="text-[10px] text-[#8e95a5]">Face ID &amp; Secure Enclave hardware verification</p>
              </div>
              <span className={`text-[10px] font-bold ${faceIdEnabled ? 'text-[#00ff66]' : 'text-[#8e95a5]'}`}>
                {faceIdEnabled ? 'ARMED' : 'DISARMED'}
              </span>
            </div>
          </div>
        </section>

        {/* Action: Open Markets */}
        <button
          onClick={() => {
            terminalAudio.playTick();
            onNavigateMarkets();
          }}
          className="w-full py-2.5 bg-[#ff8800] hover:bg-[#ffa033] active:bg-[#e07700] text-black font-black text-xs tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(255,136,0,0.25)]"
        >
          <Terminal size={14} />
          <span>&lt;EXECUTE WEI &amp; EMSX MARKETS &lt;GO&gt;&gt;</span>
        </button>

        {/* Section 3: AUDIT & LEDGER INTEGRITY */}
        <section className="border border-[#182030] bg-[#070a10]">
          <div className="px-2.5 py-1 bg-[#101520] border-b border-[#182030] text-[10px] text-[#ff8800] font-bold">
            AUDIT, INTEGRITY &amp; DISCLOSURES
          </div>

          <div className="divide-y divide-[#141b28] text-xs">
            <Link
              href="/transparency"
              className="p-2.5 flex items-center justify-between hover:bg-[#0e131d] transition-colors"
            >
              <span className="text-white">&lt;TRAN&gt; Cryptographic Hash-Chained Transparency</span>
              <ChevronRight size={14} className="text-[#5c6475]" />
            </Link>

            <Link
              href="/about"
              className="p-2.5 flex items-center justify-between hover:bg-[#0e131d] transition-colors"
            >
              <span className="text-white">&lt;ABOU&gt; Anti-Casino Platform Manifesto</span>
              <ChevronRight size={14} className="text-[#5c6475]" />
            </Link>

            <div
              onClick={() => {
                terminalAudio.playTick();
                if (typeof window !== 'undefined') {
                  window.location.reload();
                }
              }}
              className="p-2.5 flex items-center justify-between cursor-pointer hover:bg-[#0e131d] text-[#ff3b30]"
            >
              <span className="font-bold">&lt;RESET&gt; Disconnect Session / Reload Terminal</span>
              <LogOut size={14} />
            </div>
          </div>
        </section>

        <div className="text-center text-[10px] text-[#55637d] pt-1">
          BLOOMBERG ANYWHERE · PROFESSIONAL EDITION · BUILD 1084-SECURE
        </div>
      </div>
    </div>
  );
};
