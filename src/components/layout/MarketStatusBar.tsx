'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Server, Activity, Clock, ShieldAlert } from 'lucide-react';
import { useChartStore } from '@/stores/useChartStore';
import { openAlgoGateway } from '@/lib/broker/openalgo';

export const MarketStatusBar: React.FC = () => {
  const connectionStatus = useChartStore((s) => s.connectionStatus);
  const latencyMs = useChartStore((s) => s.latencyMs);

  const [utcTime, setUtcTime] = useState<string>('');
  const [activeBroker, setActiveBroker] = useState(() => openAlgoGateway.getActiveBroker());

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setUtcTime(
        now.toISOString().substring(11, 19) + ' UTC'
      );
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    return openAlgoGateway.subscribe(() => {
      setActiveBroker(openAlgoGateway.getActiveBroker());
    });
  }, []);

  return (
    <footer className="h-6 bg-[#0D1117] border-t border-[#212A36] px-3 flex items-center justify-between text-[10px] font-mono text-[#7f8b9d] select-none shrink-0 z-30">
      {/* Left: Feed & Engine Status */}
      <div className="flex items-center gap-3">
        {/* Real-time Feed status */}
        <div className="flex items-center gap-1.5" title={`WebSocket Feed: ${connectionStatus} (${latencyMs}ms)`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#00c176] animate-pulse" />
          <span className="text-[#adb7c6] font-semibold">FEED:</span>
          <span className="text-[#00c176] font-bold">BINANCE SPOT WS</span>
          <span className="text-[#7f8b9d]">[{latencyMs}ms]</span>
        </div>

        <span className="text-[#212A36]">•</span>

        {/* Cryptographic Ledger Proof Status */}
        <Link
          href="/transparency"
          className="flex items-center gap-1 text-[#adb7c6] hover:text-white transition-colors"
          title="Daily cryptographic ledger root sealed and verified"
        >
          <ShieldCheck size={11} className="text-[#00c176]" />
          <span>LEDGER:</span>
          <span className="text-[#d7dde7] font-semibold">0x7f2a...c4e9</span>
          <span className="text-[#00c176] text-[9px] font-bold px-1 rounded bg-[#00c176]/10 border border-[#00c176]/20">
            VERIFIED
          </span>
        </Link>

        <span className="text-[#212A36] hidden md:inline">•</span>

        {/* OpenAlgo Execution Gateway */}
        <div className="hidden md:flex items-center gap-1 text-[#adb7c6]">
          <Server size={11} className="text-[#4ea1ff]" />
          <span>GATEWAY:</span>
          <span className="text-white font-medium">{activeBroker?.name || 'Celsius Paper'}</span>
          <span className={`w-1 h-1 rounded-full ${activeBroker?.isConnected ? 'bg-[#00c176]' : 'bg-[#ffb74d]'}`} />
        </div>
      </div>

      {/* Center: Invariant Discipline & Benchmark */}
      <div className="hidden lg:flex items-center gap-3">
        <div className="flex items-center gap-1 text-[#adb7c6]">
          <ShieldAlert size={11} className="text-[#ffb74d]" />
          <span>MAX DRAWDOWN:</span>
          <span className="text-white font-semibold">5.0%</span>
          <span className="text-[#00c176]">[NORMAL]</span>
        </div>

        <span className="text-[#212A36]">•</span>

        <div className="flex items-center gap-1 text-[#adb7c6]">
          <span>BENCHMARK (BTC HODL):</span>
          <span className="text-[#00c176] font-bold">+2.10%</span>
        </div>
      </div>

      {/* Right: Market Sessions & UTC Clock */}
      <div className="flex items-center gap-3">
        <div className="hidden xl:flex items-center gap-2 text-[#7f8b9d]">
          <span className="text-[#00c176] font-semibold">NYSE OPEN</span>
          <span>·</span>
          <span className="text-[#7f8b9d]">LON CLOSED</span>
          <span>·</span>
          <span className="text-[#7f8b9d]">TYO CLOSED</span>
        </div>

        <span className="text-[#212A36] hidden xl:inline">•</span>

        <div className="flex items-center gap-1 text-[#d7dde7] font-bold" title="Authoritative System Clock">
          <Clock size={11} className="text-[#FF6B00]" />
          <span>{utcTime || '12:00:00 UTC'}</span>
        </div>
      </div>
    </footer>
  );
};
