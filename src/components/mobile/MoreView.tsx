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
} from 'lucide-react';
import Link from 'next/link';

interface MoreViewProps {
  onLaunchProTerminal: () => void;
  onOpenAlerts: () => void;
  onOpenPortfolios: () => void;
}

export const MoreView: React.FC<MoreViewProps> = ({
  onLaunchProTerminal,
  onOpenAlerts,
  onOpenPortfolios,
}) => {
  const [faceIdEnabled, setFaceIdEnabled] = useState(true);
  const [livePricesEnabled, setLivePricesEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [currencyMode, setCurrencyMode] = useState<'DUAL' | 'USD' | 'INR'>('DUAL');

  return (
    <div className="flex flex-col min-h-screen bg-black text-white select-none pb-28">
      <TerminalHeader title="More" subtitle="PREFERENCES & DESK" />

      <div className="flex flex-col gap-5 px-4 pt-4">
        {/* Profile Card Header (Bhaskar Sharma, BS) */}
        <section className="p-4 bg-[#0e1118] border border-[#1b2230] rounded-2xl flex items-center gap-4 shadow-md">
          <div className="w-[62px] h-[62px] rounded-full bg-[#151a24] border-2 border-[#2b3547] flex items-center justify-center text-xl font-bold text-white shrink-0 shadow-inner">
            BS
          </div>

          <div className="flex flex-col flex-1 min-w-0">
            <h2 className="text-[18px] font-bold text-white truncate">
              Bhaskar Sharma
            </h2>
            <p className="text-[12px] text-[#8e95a5] font-medium leading-tight">
              Individual Investor · India
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[9px] font-bold font-mono px-2 py-0.5 rounded bg-[#18202d] text-[#00c176] border border-[#00c176]/30 uppercase">
                BLOOMBERG TERMINAL VERIFIED
              </span>
            </div>
          </div>
        </section>

        {/* Section 1: ACCOUNT */}
        <section className="flex flex-col gap-1.5">
          <h3 className="text-[11px] font-extrabold tracking-[1.5px] text-[#8e95a5] uppercase px-1">
            ACCOUNT
          </h3>

          <div className="bg-[#0e1118] border border-[#1b2230] rounded-xl overflow-hidden divide-y divide-[#181d28]/70 text-[14px]">
            <Link
              href="/u/Bhaskar1461"
              className="p-3.5 flex items-center justify-between hover:bg-[#151a24] transition-colors"
            >
              <div className="flex items-center gap-3">
                <User size={18} className="text-[#ff8800]" />
                <span className="font-semibold text-white">Public Track Record</span>
              </div>
              <ChevronRight size={17} className="text-[#5c6475]" />
            </Link>

            <div
              onClick={onOpenPortfolios}
              className="p-3.5 flex items-center justify-between hover:bg-[#151a24] cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <PieChart size={18} className="text-[#ff8800]" />
                <span className="font-semibold text-white">Portfolios & Net Worth</span>
              </div>
              <ChevronRight size={17} className="text-[#5c6475]" />
            </div>

            <div
              onClick={onOpenAlerts}
              className="p-3.5 flex items-center justify-between hover:bg-[#151a24] cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <Bell size={18} className="text-[#ff8800]" />
                <span className="font-semibold text-white">Price & Volatility Alerts</span>
              </div>
              <ChevronRight size={17} className="text-[#5c6475]" />
            </div>
          </div>
        </section>

        {/* Section 2: PREFERENCES */}
        <section className="flex flex-col gap-1.5">
          <h3 className="text-[11px] font-extrabold tracking-[1.5px] text-[#8e95a5] uppercase px-1">
            PREFERENCES
          </h3>

          <div className="bg-[#0e1118] border border-[#1b2230] rounded-xl overflow-hidden divide-y divide-[#181d28]/70 text-[14px]">
            <div className="p-3.5 flex items-center justify-between">
              <div>
                <span className="font-semibold text-white">Base Currency</span>
                <p className="text-[11px] text-[#8e95a5]">Dual USD ($) and INR (₹) valuation</p>
              </div>
              <span className="font-mono text-[12px] font-bold text-[#ff8800] bg-[#1a2130] px-2 py-0.5 rounded border border-[#2b374e]">
                USD + INR
              </span>
            </div>

            <div
              onClick={() => setLivePricesEnabled(!livePricesEnabled)}
              className="p-3.5 flex items-center justify-between cursor-pointer"
            >
              <div>
                <span className="font-semibold text-white">Live WebSocket Prices</span>
                <p className="text-[11px] text-[#8e95a5]">Direct sub-second Binance streaming</p>
              </div>
              <span className={`font-mono text-xs font-bold ${livePricesEnabled ? 'text-[#00c176]' : 'text-[#8e95a5]'}`}>
                {livePricesEnabled ? 'ENABLED' : 'PAUSED'}
              </span>
            </div>

            <div
              onClick={() => setFaceIdEnabled(!faceIdEnabled)}
              className="p-3.5 flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Shield size={18} className="text-[#ff8800]" />
                <span className="font-semibold text-white">Face ID Authentication</span>
              </div>
              <span className={`font-mono text-xs font-bold ${faceIdEnabled ? 'text-[#00c176]' : 'text-[#8e95a5]'}`}>
                {faceIdEnabled ? 'ON' : 'OFF'}
              </span>
            </div>
          </div>
        </section>

        {/* Action: Switch to Full Pro Candlestick Terminal */}
        <section className="flex flex-col gap-2">
          <button
            onClick={onLaunchProTerminal}
            className="w-full py-3.5 bg-gradient-to-r from-[#ff8800] to-[#e07700] hover:from-[#ff941a] hover:to-[#eb7f08] active:scale-[0.99] text-black font-extrabold text-[14px] rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#ff8800]/20 transition-all cursor-pointer"
          >
            <Sparkles size={17} />
            <span>Launch Full Candlestick Terminal</span>
          </button>
        </section>

        {/* Section 3: SUPPORT & LEGAL */}
        <section className="flex flex-col gap-1.5">
          <h3 className="text-[11px] font-extrabold tracking-[1.5px] text-[#8e95a5] uppercase px-1">
            SUPPORT
          </h3>

          <div className="bg-[#0e1118] border border-[#1b2230] rounded-xl overflow-hidden divide-y divide-[#181d28]/70 text-[14px]">
            <Link
              href="/transparency"
              className="p-3.5 flex items-center justify-between hover:bg-[#151a24] transition-colors"
            >
              <div className="flex items-center gap-3">
                <HelpCircle size={18} className="text-[#8e95a5]" />
                <span className="font-semibold text-white">Transparency & Cryptographic Ledger</span>
              </div>
              <ChevronRight size={17} className="text-[#5c6475]" />
            </Link>

            <Link
              href="/about"
              className="p-3.5 flex items-center justify-between hover:bg-[#151a24] transition-colors"
            >
              <div className="flex items-center gap-3">
                <HelpCircle size={18} className="text-[#8e95a5]" />
                <span className="font-semibold text-white">About Bloomberg Terminal & Mission</span>
              </div>
              <ChevronRight size={17} className="text-[#5c6475]" />
            </Link>

            <div
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.reload();
                }
              }}
              className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-[#151a24] text-[#ff4d4f] transition-colors"
            >
              <div className="flex items-center gap-3">
                <LogOut size={18} />
                <span className="font-semibold">Reset / Sign Out</span>
              </div>
            </div>
          </div>
        </section>

        <div className="text-center text-[10px] text-[#5c6475] font-mono pb-2">
          BLOOMBERG ANYWHERE · VERSION 3.2.0 (BUILD 1084)
        </div>
      </div>
    </div>
  );
};
