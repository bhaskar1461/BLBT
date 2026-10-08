'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useKlineStream } from '@/hooks/useKlineStream';
import { useTicker } from '@/hooks/useTicker';

// Dynamic import with ssr: false prevents hydration mismatch between server and local storage
const Shell = dynamic(() => import('@/components/layout/Shell').then((m) => m.Shell), {
  ssr: false,
  loading: () => (
    <div className="w-screen h-screen bg-[#0b0e14] flex flex-col items-center justify-center text-muted font-mono text-xs gap-3">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-bull to-primary flex items-center justify-center font-extrabold text-base text-black shadow-lg shadow-bull/20">
        °C
      </div>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-bull animate-ping" />
        <span className="text-white font-bold">CONNECTING TO CELSIUS HIGH-FREQUENCY ENGINE...</span>
      </div>
      <span className="text-faint text-[11px]">Loading real-time Binance feeds & Paper portfolio</span>
    </div>
  ),
});

export default function TerminalPage() {
  // Streams klines and tickers into Zustand stores
  useKlineStream();
  useTicker();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <Shell />;
}
