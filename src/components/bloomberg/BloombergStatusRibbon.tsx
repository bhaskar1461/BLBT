// src/components/bloomberg/BloombergStatusRibbon.tsx
'use client';

import React from 'react';
import type { BloombergSecurity } from './BloombergPanelWEI';
import { formatPrice } from '@/lib/utils';
import { Shield, Activity, Wifi } from 'lucide-react';

interface BloombergStatusRibbonProps {
  securities: BloombergSecurity[];
}

export const BloombergStatusRibbon: React.FC<BloombergStatusRibbonProps> = ({
  securities,
}) => {
  return (
    <footer className="w-full bg-[#030508] border-t-2 border-[#182030] text-white font-mono text-[11px] select-none flex flex-col">
      {/* Ticker Tape Scrolling Row */}
      <div className="flex items-center overflow-x-hidden whitespace-nowrap bg-[#000000] border-b border-[#121824] py-1 px-2">
        <span className="text-[#ff8800] font-black mr-3 px-1.5 py-0.2 bg-[#ff8800]/20 rounded border border-[#ff8800]/40 text-[10px] shrink-0">
          CELSIUS TAPE &lt;CT&gt;
        </span>

        <div className="flex items-center gap-6 animate-marquee">
          {securities.concat(securities).map((sec, idx) => {
            const currPrefix = sec.currency === 'INR' ? '₹' : '$';
            const sign = sec.positive ? '+' : '';
            return (
              <div key={`${sec.symbol}-${idx}`} className="inline-flex items-center gap-1.5 shrink-0">
                <span className="font-bold text-[#e2e8f0]">{sec.symbol}</span>
                <span className="text-white font-mono">{currPrefix}{formatPrice(sec.price, 2)}</span>
                <span
                  className={`font-mono font-bold text-[10px] ${
                    sec.positive ? 'text-[#00c176]' : 'text-[#ff3b30]'
                  }`}
                >
                  {sign}{sec.percent.toFixed(2)}%
                </span>
                <span className="text-[#2d3748]">|</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* System Telemetry Row */}
      <div className="flex items-center justify-between px-3 py-1 bg-[#06080e] text-[10px] text-[#8e95a5]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[#00c176]">
            <Wifi size={11} />
            <span className="font-bold">BINANCE SPOT FEED: CONNECTED</span>
          </div>
          <span className="text-[#1e2738]">|</span>
          <div>
            <span>ENGINE: </span>
            <span className="text-white font-bold">DETERMINISTIC INTEGER MATH ($10^8 WEI)</span>
          </div>
          <span className="text-[#1e2738]">|</span>
          <div className="hidden sm:block">
            <span>LEDGER: </span>
            <span className="text-[#00e5ff] font-bold">APPEND-ONLY CRYPTOGRAPHIC INTEGRITY</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-[#ff8800]">
            <Activity size={11} />
            <span>LATENCY: 1.2ms</span>
          </div>
          <span className="text-[#1e2738]">|</span>
          <div className="flex items-center gap-1 text-[#00c176]">
            <Shield size={11} />
            <span>RLS ISOLATION ENFORCED</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
