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
  MessageSquare,
  Lock,
} from 'lucide-react';
import Link from 'next/link';
import { terminalAudio } from '@/lib/terminalAudio';

interface MoreViewProps {
  onNavigateMarkets: () => void;
  onOpenAlerts: () => void;
  onOpenPortfolios: () => void;
  onOpenIB?: () => void;
}

export const MoreView: React.FC<MoreViewProps> = ({
  onNavigateMarkets,
  onOpenAlerts,
  onOpenPortfolios,
  onOpenIB,
}) => {
  const [faceIdEnabled, setFaceIdEnabled] = useState(true);
  const [livePricesEnabled, setLivePricesEnabled] = useState(true);

  return (
    <div className="flex flex-col min-h-screen bg-[#080a0f] text-white font-sans select-none pb-28">
      <TerminalHeader title="MORE" subtitle="SETTINGS &amp; TERMINAL DESK" />

      <div className="flex flex-col gap-3 px-3 pt-3">
        {/* Terminal Operator Profile Strip */}
        <section className="p-3 bg-[#0e131d] border border-[#1e2638] rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#131926] border border-[#f59e0b] flex items-center justify-center text-sm font-black text-[#f59e0b] font-mono">
              BS
            </div>

            <div className="flex flex-col leading-tight">
              <span className="text-sm font-bold text-white">
                Bhaskar Sharma
              </span>
              <span className="text-[11px] text-[#94a3b8] font-mono">
                ID: BS-8841-TERMINAL
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 uppercase font-mono">
              VERIFIED ACTIVE
            </span>
          </div>
        </section>

        {/* Section 1: TERMINAL DESK & ANALYTICS SHORTCUTS */}
        <section className="border border-[#1e2638] bg-[#0c1018] rounded-lg overflow-hidden">
          <div className="px-3 py-1.5 bg-[#121824] border-b border-[#1e2638] text-[11px] text-[#f59e0b] font-bold font-mono">
            TERMINAL TOOLS &amp; ANALYTICS
          </div>

          <div className="divide-y divide-[#161f30] text-xs">
            {onOpenIB && (
              <div
                onClick={() => {
                  terminalAudio.playTick();
                  onOpenIB();
                }}
                className="p-3 flex items-center justify-between hover:bg-[#121824] cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquare size={16} className="text-[#f59e0b]" />
                  <div>
                    <span className="text-white font-medium block">Celsius Terminal Desk AI</span>
                    <span className="text-[10px] text-[#94a3b8]">Live market specialist assistant</span>
                  </div>
                </div>
                <ChevronRight size={14} className="text-[#64748b]" />
              </div>
            )}

            <div
              onClick={() => {
                terminalAudio.playTick();
                onOpenPortfolios();
              }}
              className="p-3 flex items-center justify-between hover:bg-[#121824] cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <PieChart size={16} className="text-[#38bdf8]" />
                <div>
                  <span className="text-white font-medium block">Portfolio &amp; Risk Blotter</span>
                  <span className="text-[10px] text-[#94a3b8]">Sub-accounts, positions &amp; drawdown limits</span>
                </div>
              </div>
              <ChevronRight size={14} className="text-[#64748b]" />
            </div>

            <div
              onClick={() => {
                terminalAudio.playTick();
                onOpenAlerts();
              }}
              className="p-3 flex items-center justify-between hover:bg-[#121824] cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Bell size={16} className="text-[#f59e0b]" />
                <div>
                  <span className="text-white font-medium block">Price Volatility &amp; Breakout Alerts</span>
                  <span className="text-[10px] text-[#94a3b8]">Multi-asset armed price triggers</span>
                </div>
              </div>
              <ChevronRight size={14} className="text-[#64748b]" />
            </div>

            <Link
              href="/u/Bhaskar1461"
              className="p-3 flex items-center justify-between hover:bg-[#121824] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Shield size={16} className="text-[#10b981]" />
                <div>
                  <span className="text-white font-medium block">Public Cryptographic Track Record</span>
                  <span className="text-[10px] text-[#94a3b8]">Complete verified trade history</span>
                </div>
              </div>
              <ChevronRight size={14} className="text-[#64748b]" />
            </Link>
          </div>
        </section>

        {/* Section 2: PREFERENCES & CONNECTIVITY */}
        <section className="border border-[#1e2638] bg-[#0c1018] rounded-lg overflow-hidden">
          <div className="px-3 py-1.5 bg-[#121824] border-b border-[#1e2638] text-[11px] text-[#f59e0b] font-bold font-mono">
            PREFERENCES &amp; FEED SETTINGS
          </div>

          <div className="divide-y divide-[#161f30] text-xs">
            <div className="p-3 flex items-center justify-between">
              <div>
                <span className="text-white font-medium">Base Currency Valuation</span>
                <p className="text-[10px] text-[#94a3b8]">Dual USD ($) and INR (₹) institutional peg</p>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#f59e0b] bg-[#141a26] px-2 py-0.5 rounded border border-[#1e2638]">
                USD + INR
              </span>
            </div>

            <div
              onClick={() => {
                terminalAudio.playTick();
                setLivePricesEnabled(!livePricesEnabled);
              }}
              className="p-3 flex items-center justify-between cursor-pointer hover:bg-[#121824]"
            >
              <div>
                <span className="text-white font-medium">Binance Spot Feed Sub-Second</span>
                <p className="text-[10px] text-[#94a3b8]">Real-time WebSocket streaming connection</p>
              </div>
              <span className={`text-[10px] font-mono font-bold ${livePricesEnabled ? 'text-[#10b981]' : 'text-[#64748b]'}`}>
                {livePricesEnabled ? 'ONLINE' : 'PAUSED'}
              </span>
            </div>

            <div
              onClick={() => {
                terminalAudio.playTick();
                setFaceIdEnabled(!faceIdEnabled);
              }}
              className="p-3 flex items-center justify-between cursor-pointer hover:bg-[#121824]"
            >
              <div>
                <span className="text-white font-medium">Biometric Terminal Authentication</span>
                <p className="text-[10px] text-[#94a3b8]">Face ID &amp; Secure Enclave verification</p>
              </div>
              <span className={`text-[10px] font-mono font-bold ${faceIdEnabled ? 'text-[#10b981]' : 'text-[#64748b]'}`}>
                {faceIdEnabled ? 'ARMED' : 'DISARMED'}
              </span>
            </div>
          </div>
        </section>

        {/* Section 3: AUDIT & PLATFORM INTEGRITY */}
        <section className="border border-[#1e2638] bg-[#0c1018] rounded-lg overflow-hidden">
          <div className="px-3 py-1.5 bg-[#121824] border-b border-[#1e2638] text-[11px] text-[#f59e0b] font-bold font-mono">
            AUDIT, INTEGRITY &amp; DISCLOSURES
          </div>

          <div className="divide-y divide-[#161f30] text-xs">
            <Link
              href="/transparency"
              className="p-3 flex items-center justify-between hover:bg-[#121824] transition-colors"
            >
              <span className="text-white">Daily Merkle Ledger Roots &amp; Hash Proofs</span>
              <ChevronRight size={14} className="text-[#64748b]" />
            </Link>

            <Link
              href="/about"
              className="p-3 flex items-center justify-between hover:bg-[#121824] transition-colors"
            >
              <span className="text-white">Anti-Casino Platform Manifesto</span>
              <ChevronRight size={14} className="text-[#64748b]" />
            </Link>

            <div
              onClick={() => {
                terminalAudio.playTick();
                if (typeof window !== 'undefined') {
                  window.location.reload();
                }
              }}
              className="p-3 flex items-center justify-between cursor-pointer hover:bg-[#121824] text-[#f43f5e]"
            >
              <span className="font-semibold">Reset Session / Reload Terminal</span>
              <LogOut size={14} />
            </div>
          </div>
        </section>

        <div className="text-center text-[10px] text-[#64748b] font-mono pt-1">
          CELSIUS TERMINAL &bull; INSTITUTIONAL MOBILE PLATFORM &bull; BUILD 2026.10
        </div>
      </div>
    </div>
  );
};
