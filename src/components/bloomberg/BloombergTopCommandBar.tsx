// src/components/bloomberg/BloombergTopCommandBar.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal,
  Volume2,
  VolumeX,
  HelpCircle,
  Search,
  RotateCcw,
  LayoutGrid,
  Activity,
  ShieldCheck,
} from 'lucide-react';
import { terminalAudio } from '@/lib/terminalAudio';

interface BloombergTopCommandBarProps {
  onExecuteCommand: (command: string) => void;
  onOpenHelp: () => void;
  onOpenSearch: () => void;
  onToggleLayoutMode?: () => void;
  currentLayoutMode?: 'bloomberg' | 'tradingview';
}

export const BloombergTopCommandBar: React.FC<BloombergTopCommandBarProps> = ({
  onExecuteCommand,
  onOpenHelp,
  onOpenSearch,
  onToggleLayoutMode,
  currentLayoutMode = 'bloomberg',
}) => {
  const [commandInput, setCommandInput] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [clocks, setClocks] = useState({
    utc: '',
    nyc: '',
    lon: '',
    ist: '',
  });

  const inputRef = useRef<HTMLInputElement>(null);

  // Live multi-timezone clocks
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

  // Global hotkey listener: typing automatically focuses the command line
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is already typing in an input/textarea or using Ctrl/Cmd shortcuts
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.ctrlKey ||
        e.metaKey ||
        e.altKey
      ) {
        return;
      }

      if (e.key === 'Escape') {
        setCommandInput('');
        return;
      }

      // If user presses an alphanumeric key, focus the input and append
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleRunCommand = (e?: React.FormEvent) => {
    e?.preventDefault();
    const cmd = commandInput.trim().toUpperCase();
    if (!cmd) return;

    if (soundEnabled) terminalAudio.playTick();
    onExecuteCommand(cmd);
    setCommandInput('');
  };

  const handleSpecialKey = (keyName: string) => {
    if (soundEnabled) terminalAudio.playTick();
    if (keyName === 'HELP') {
      onOpenHelp();
    } else if (keyName === 'SEARCH') {
      onOpenSearch();
    } else if (keyName === 'CANCEL') {
      setCommandInput('');
      inputRef.current?.focus();
    } else if (keyName === 'MENU') {
      onExecuteCommand('WEI');
    } else if (keyName === 'GO') {
      handleRunCommand();
    }
  };

  return (
    <div className="w-full bg-[#05070a] border-b-2 border-[#182030] text-white select-none flex flex-col font-mono">
      {/* Top Telemetry Strip */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#000000] border-b border-[#141a26] text-[11px] text-[#8e95a5]">
        {/* Brand & User Serial */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold tracking-wider text-[#ff8800]">
            <span className="w-2 h-2 rounded-full bg-[#ff8800] shadow-[0_0_8px_#ff8800] animate-pulse" />
            <span className="text-white font-black tracking-normal">BLOOMBERG</span>
            <span className="text-[10px] text-[#ff8800] px-1 py-0.2 bg-[#ff8800]/20 rounded border border-[#ff8800]/40">
              PROFESSIONAL
            </span>
          </div>

          <span className="text-[#2a364d]">|</span>

          <div className="flex items-center gap-1 text-[10px] text-[#a0aec0]">
            <span>DESK:</span>
            <span className="text-white font-bold">BHASKAR SHARMA (89412-01)</span>
            <span className="text-[#00c176] font-bold">· INDIA 🇮🇳</span>
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
          <div className="flex items-center gap-1 text-[#ff8800]">
            <span className="text-[#ff8800]/80">MUM (IST 🇮🇳):</span>
            <span className="text-white font-bold bg-[#ff8800]/20 px-1 rounded border border-[#ff8800]/40">
              {clocks.ist || '00:00:00'}
            </span>
          </div>
        </div>

        {/* Controls: Audio, Layout Toggle */}
        <div className="flex items-center gap-2">
          {onToggleLayoutMode && (
            <button
              onClick={() => {
                if (soundEnabled) terminalAudio.playTick();
                onToggleLayoutMode();
              }}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#101520] hover:bg-[#182030] text-[#00e5ff] border border-[#1e2a40] text-[10px] transition-colors cursor-pointer"
              title="Toggle Layout View"
            >
              <LayoutGrid size={11} />
              <span>{currentLayoutMode === 'bloomberg' ? 'TRADINGVIEW' : 'TERMINAL'}</span>
            </button>
          )}

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] border transition-colors cursor-pointer ${
              soundEnabled
                ? 'bg-[#00c176]/15 text-[#00c176] border-[#00c176]/40'
                : 'bg-[#1a202c] text-[#8e95a5] border-[#2d3748]'
            }`}
            title="Terminal Audio Feedback"
          >
            {soundEnabled ? <Volume2 size={11} /> : <VolumeX size={11} />}
            <span>{soundEnabled ? 'AUDIO' : 'MUTE'}</span>
          </button>
        </div>
      </div>

      {/* Main Command Input Prompt Bar (The Iconic Amber Command Line) */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[#080b11]">
        {/* Amber Command Prompt Container */}
        <form onSubmit={handleRunCommand} className="flex-1 flex items-center gap-2">
          <div className="flex-1 flex items-center bg-[#0e131d] border-2 border-[#ff8800] rounded px-3 py-1.5 shadow-[0_0_12px_rgba(255,136,0,0.2)] focus-within:shadow-[0_0_16px_rgba(255,136,0,0.4)] transition-all">
            <span className="text-[#ff8800] font-black text-sm mr-2 animate-pulse">&gt;</span>
            <input
              ref={inputRef}
              type="text"
              value={commandInput}
              onChange={(e) => {
                if (soundEnabled) terminalAudio.playTick();
                setCommandInput(e.target.value);
              }}
              placeholder="Enter ticker or mnemonic code (e.g. BTC <Curncy> GO, AAPL <Equity> GO, WEI <GO>, TOP <GO>, EMSX <GO>)..."
              className="w-full bg-transparent text-[#ff8800] font-mono font-bold text-xs tracking-wider placeholder-[#5c6880] outline-none uppercase"
            />
            {commandInput && (
              <button
                type="button"
                onClick={() => {
                  setCommandInput('');
                  inputRef.current?.focus();
                }}
                className="text-[#8e95a5] hover:text-white text-xs px-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Action <GO> Key */}
          <button
            type="submit"
            className="px-4 py-2 bg-[#ff8800] hover:bg-[#ffa033] active:scale-[0.98] text-black font-mono font-black text-xs tracking-widest rounded shadow-md transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>&lt;GO&gt;</span>
          </button>
        </form>

        {/* Bloomberg Special Function Keys */}
        <div className="hidden sm:flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleSpecialKey('HELP')}
            className="px-2.5 py-1.5 bg-[#141b27] hover:bg-[#1f2a3d] border border-[#26354d] hover:border-[#00e5ff] text-[#00e5ff] font-bold text-[11px] rounded transition-colors cursor-pointer"
          >
            &lt;HELP&gt;
          </button>

          <button
            type="button"
            onClick={() => handleSpecialKey('SEARCH')}
            className="px-2.5 py-1.5 bg-[#141b27] hover:bg-[#1f2a3d] border border-[#26354d] hover:border-[#ffd600] text-[#ffd600] font-bold text-[11px] rounded transition-colors cursor-pointer"
          >
            &lt;SEARCH&gt;
          </button>

          <button
            type="button"
            onClick={() => handleSpecialKey('MENU')}
            className="px-2.5 py-1.5 bg-[#141b27] hover:bg-[#1f2a3d] border border-[#26354d] hover:border-[#ff8800] text-[#ff8800] font-bold text-[11px] rounded transition-colors cursor-pointer"
          >
            &lt;MENU&gt;
          </button>

          <button
            type="button"
            onClick={() => handleSpecialKey('CANCEL')}
            className="px-2.5 py-1.5 bg-[#141b27] hover:bg-[#1f2a3d] border border-[#26354d] hover:border-[#ff3b30] text-[#ff3b30] font-bold text-[11px] rounded transition-colors cursor-pointer"
          >
            &lt;CANCEL&gt;
          </button>
        </div>
      </div>
    </div>
  );
};
