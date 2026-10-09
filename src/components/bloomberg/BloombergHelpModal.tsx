// src/components/bloomberg/BloombergHelpModal.tsx
'use client';

import React from 'react';
import { X, Terminal, Shield, HelpCircle, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import { terminalAudio } from '@/lib/terminalAudio';

interface BloombergHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCommand: (cmd: string) => void;
}

export const BloombergHelpModal: React.FC<BloombergHelpModalProps> = ({
  isOpen,
  onClose,
  onSelectCommand,
}) => {
  if (!isOpen) return null;

  const commands = [
    { code: 'TOP', name: 'Top News Stories', desc: 'Real-time terminal headlines, flash dispatches & analytical wire' },
    { code: 'WEI', name: 'World Equity Indices', desc: 'Global macro overview (Americas, APAC/India 🇮🇳, Crypto, Commodities)' },
    { code: 'GP', name: 'Graph Price', desc: 'Technical candlestick & line chart with volume, moving averages & indicators' },
    { code: 'DES', name: 'Security Description', desc: 'Key fundamental stats, high/low range, VWAP, market capitalization' },
    { code: 'EMSX', name: 'Execution Management', desc: 'Deterministic order ticket & execution blotter (Market / Limit / Stop)' },
    { code: 'PORT', name: 'Portfolio & Risk', desc: 'NAV valuation, realized P&L, drawdown and Buy-and-Hold benchmark comparison' },
    { code: 'MAX GP', name: 'Maximize Chart Panel', desc: 'Expand price chart into full-screen workspace' },
    { code: 'MAX EMSX', name: 'Maximize Execution Blotter', desc: 'Expand order execution blotter into full workspace' },
    { code: 'RESTORE', name: 'Restore 4-Panel Launchpad', desc: 'Reset all tiles back to standard 4-panel Bloomberg Launchpad layout' },
    { code: 'TV', name: 'TradingView Layout', desc: 'Switch layout to TradingView Supercharts workspace' },
    { code: 'SECF', name: 'Security Finder', desc: 'Universal cross-asset search for equities, crypto pairs, and commodities' },
    { code: 'HELP', name: 'Help & Reference', desc: 'Terminal command cheat sheet and core platform invariants' },
  ];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl bg-[#090c12] border-2 border-[#ff8800]/70 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(255,136,0,0.25)] flex flex-col max-h-[90vh]"
      >
        {/* Terminal Title Bar */}
        <div className="bg-[#0f141f] border-b border-[#212b3d] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff8800] shadow-[0_0_8px_#ff8800] animate-pulse" />
            <span className="font-mono font-black text-sm text-[#ff8800] tracking-widest uppercase">
              BLOOMBERG HELP DESK &lt;HELP&gt; · OPERATOR REFERENCE
            </span>
          </div>

          <button
            onClick={() => {
              terminalAudio.playTick();
              onClose();
            }}
            className="text-[#8e95a5] hover:text-white p-1 rounded hover:bg-[#1a2233] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-[#d1d5db]">
          {/* Quick Guide */}
          <div className="p-4 bg-[#121724] border border-[#232d40] rounded-lg">
            <div className="flex items-center gap-2 text-[#ff8800] font-mono font-bold text-sm mb-2">
              <Terminal size={16} />
              <span>KEYBOARD COMMAND PROTOCOL</span>
            </div>
            <p className="text-[#a0aec0] leading-relaxed">
              You can type commands directly anywhere on the keyboard. Entering a ticker (e.g. <span className="font-mono text-[#00e5ff] font-bold">BTC</span>, <span className="font-mono text-[#00e5ff] font-bold">NIFTY</span>, <span className="font-mono text-[#00e5ff] font-bold">AAPL</span>) or mnemonic function code (e.g. <span className="font-mono text-[#ff8800] font-bold">WEI</span>, <span className="font-mono text-[#ff8800] font-bold">TOP</span>, <span className="font-mono text-[#ff8800] font-bold">EMSX</span>) and pressing <span className="font-mono text-black bg-[#ff8800] px-1.5 py-0.5 rounded font-extrabold">&lt;GO&gt; / Enter</span> immediately routes the workspace.
            </p>
          </div>

          {/* Mnemonic Cheat Sheet */}
          <div>
            <div className="font-mono font-bold text-xs uppercase tracking-wider text-[#8e95a5] mb-3">
              CORE FUNCTION CODES (&lt;MNEMONIC GO&gt;)
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {commands.map((cmd) => (
                <div
                  key={cmd.code}
                  onClick={() => {
                    terminalAudio.playTick();
                    onSelectCommand(cmd.code);
                    onClose();
                  }}
                  className="p-3 bg-[#0e121b] border border-[#1b2333] hover:border-[#ff8800] rounded-lg cursor-pointer transition-all group flex items-start gap-3"
                >
                  <span className="font-mono font-black text-xs text-[#ff8800] bg-[#ff8800]/15 border border-[#ff8800]/40 px-2 py-1 rounded shrink-0 group-hover:bg-[#ff8800] group-hover:text-black transition-colors">
                    &lt;{cmd.code}&gt;
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-white text-[13px] flex items-center justify-between">
                      <span>{cmd.name}</span>
                      <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 text-[#ff8800] transition-opacity" />
                    </div>
                    <div className="text-[11px] text-[#8e95a5] leading-snug mt-0.5 truncate">
                      {cmd.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Core Platform Invariants */}
          <div className="border-t border-[#1a2233] pt-5">
            <div className="flex items-center gap-2 text-white font-mono font-bold text-xs uppercase tracking-wider mb-3">
              <Shield size={14} className="text-[#00c176]" />
              <span>THE HONEST TERMINAL — INVARIANT RULES</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-[#0a0d15] border border-[#182030] rounded-lg">
                <div className="font-bold text-[#00c176] mb-1 flex items-center gap-1.5">
                  <CheckCircle2 size={13} />
                  <span>Integer Math</span>
                </div>
                <p className="text-[11px] text-[#8e95a5] leading-relaxed">
                  All money and quantities stored &amp; computed as 8-decimal base units ($10^8$ wei-scale). Zero floating-point drift.
                </p>
              </div>

              <div className="p-3 bg-[#0a0d15] border border-[#182030] rounded-lg">
                <div className="font-bold text-[#00e5ff] mb-1 flex items-center gap-1.5">
                  <CheckCircle2 size={13} />
                  <span>Immutable Ledger</span>
                </div>
                <p className="text-[11px] text-[#8e95a5] leading-relaxed">
                  Every order execution, fill, fee, and P&amp;L credit is hash-chained and append-only. No retroactive tampering.
                </p>
              </div>

              <div className="p-3 bg-[#0a0d15] border border-[#182030] rounded-lg">
                <div className="font-bold text-[#ffd600] mb-1 flex items-center gap-1.5">
                  <CheckCircle2 size={13} />
                  <span>Buy &amp; Hold Truth</span>
                </div>
                <p className="text-[11px] text-[#8e95a5] leading-relaxed">
                  Never show trading performance without direct BTC and NIFTY buy-and-hold benchmark context. Zero casino deception.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#0b0f17] border-t border-[#1a2233] px-6 py-3 flex items-center justify-between">
          <span className="font-mono text-[10px] text-[#5c6475]">
            PRESS &lt;ESC&gt; OR CLICK CLOSE TO RETURN TO TERMINAL
          </span>
          <button
            onClick={() => {
              terminalAudio.playTick();
              onClose();
            }}
            className="px-4 py-1.5 bg-[#ff8800] text-black font-extrabold font-mono text-xs rounded hover:bg-[#ffa033] transition-colors cursor-pointer"
          >
            DISMISS &lt;GO&gt;
          </button>
        </div>
      </div>
    </div>
  );
};
