// src/components/mobile/BloombergFunctionBar.tsx
'use client';

import React from 'react';
import { terminalAudio } from '@/lib/terminalAudio';

interface BloombergFunctionBarProps {
  onSelectFunction: (fnCode: string) => void;
  activeCode?: string;
}

export const BloombergFunctionBar: React.FC<BloombergFunctionBarProps> = ({
  onSelectFunction,
  activeCode = 'TOP',
}) => {
  const functions = [
    { code: 'TOP', label: 'Top News' },
    { code: 'WEI', label: 'World Indices' },
    { code: 'PORT', label: 'Portfolios' },
    { code: 'WL', label: 'Watchlists' },
    { code: 'GP', label: 'Charts' },
    { code: 'DES', label: 'Key Stats' },
    { code: 'SECF', label: 'Settings' },
  ];

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 px-4 bg-[#0a0d14] border-b border-[#181d28] select-none">
      <span className="text-[10px] font-mono font-bold text-[#ff8800] tracking-wider shrink-0 mr-1">
        &lt;GO&gt;
      </span>
      {functions.map((fn) => {
        const isActive = activeCode === fn.code;
        return (
          <button
            key={fn.code}
            onClick={() => {
              terminalAudio.playTick();
              onSelectFunction(fn.code);
            }}
            className={`px-2.5 py-1 rounded-[4px] text-[11px] font-mono font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              isActive
                ? 'bg-[#ff8800] text-black shadow-[0_0_8px_rgba(255,136,0,0.4)]'
                : 'bg-[#121622] text-[#8e95a5] hover:text-white border border-[#1f2636]'
            }`}
          >
            <span className={isActive ? 'text-black' : 'text-[#ff8800]'}>
              {fn.code}
            </span>
            <span className={`text-[10px] ${isActive ? 'text-black/80' : 'text-[#6c7487]'}`}>
              {fn.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
