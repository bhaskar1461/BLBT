// src/components/mobile/InstantBloombergView.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Bot,
  Users,
  ShieldAlert,
  Send,
  Terminal,
  Activity,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Clock,
  Sparkles,
} from 'lucide-react';
import { terminalAudio } from '@/lib/terminalAudio';
import { formatPrice } from '@/lib/utils';
import { useWatchlistStore } from '@/stores/useWatchlistStore';
import { useTradingStore } from '@/stores/useTradingStore';
import type { Quote } from './types';

interface InstantBloombergViewProps {
  onSelectQuote?: (quote: Quote) => void;
  quotes: Quote[];
}

interface ChatMessage {
  id: string;
  sender: string;
  senderType: 'bot' | 'trader' | 'system' | 'user';
  affiliation?: string;
  timestamp: string;
  text: string;
  quoteCard?: {
    symbol: string;
    name: string;
    price: number;
    change: number;
    percent: number;
  };
}

export const InstantBloombergView: React.FC<InstantBloombergViewProps> = ({
  onSelectQuote,
  quotes,
}) => {
  const [activeChannel, setActiveChannel] = useState<'helpdesk' | 'liquidity' | 'risk'>('helpdesk');
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const tickers = useWatchlistStore((s) => s.tickers);
  const account = useTradingStore((s) => s.account);

  const btcTicker = tickers['BTCUSDT'];
  const ethTicker = tickers['ETHUSDT'];
  const solTicker = tickers['SOLUSDT'];

  const btcPrice = btcTicker?.lastPrice || 63284.50;
  const btcChg = btcTicker?.priceChangePercent || 0.66;
  const ethPrice = ethTicker?.lastPrice || 3490.20;
  const ethChg = ethTicker?.priceChangePercent || 1.85;

  const nowStr = () => {
    const d = new Date();
    return d.toISOString().substring(11, 19) + ' UTC';
  };

  const [messages, setMessages] = useState<{ [key: string]: ChatMessage[] }>({
    helpdesk: [
      {
        id: 'h1',
        sender: 'SYSTEM',
        senderType: 'system',
        timestamp: '13:00:00 UTC',
        text: 'SESSION OPENED. Connected to Celsius Terminal Market Desk & AI Specialist Service.',
      },
      {
        id: 'h2',
        sender: 'TERMINAL DESK',
        senderType: 'bot',
        affiliation: 'CELSIUS NETWORK',
        timestamp: '13:00:02 UTC',
        text: 'Welcome to Celsius Terminal Desk. I am your market specialist and assistant. Ask me for live quotes ("BTC", "ETH", "TSLA", "NIFTY"), portfolio margin status, function codes (<WEI>, <GP>, <EMSX>), or risk limits.',
      },
    ],
    liquidity: [
      {
        id: 'l1',
        sender: 'SYSTEM',
        senderType: 'system',
        timestamp: '12:55:00 UTC',
        text: 'JOINED ROOM #402 // GLOBAL FX, RATES & CRYPTO LIQUIDITY DESK',
      },
      {
        id: 'l2',
        sender: 'M.CONNER',
        senderType: 'trader',
        affiliation: 'GOLDMAN SACHS',
        timestamp: '13:02:14 UTC',
        text: 'Flow desk noting strong institutional bids on spot BTC at $63,000 handle. Size buyers absorbing sell-side taker volume.',
      },
      {
        id: 'l3',
        sender: 'J.PATEL',
        senderType: 'trader',
        affiliation: 'CITI MUMBAI',
        timestamp: '13:03:45 UTC',
        text: 'Nifty 50 holding key 24,600 pivot following FII inflows. Watching USD/INR cross closely into European close.',
      },
      {
        id: 'l4',
        sender: 'T.VANDER',
        senderType: 'trader',
        affiliation: 'JANE STREET',
        timestamp: '13:06:10 UTC',
        text: 'ETH basis spread tightening across 30-day expiries. OTC flow remains biased to upside call spreads.',
      },
    ],
    risk: [
      {
        id: 'r1',
        sender: 'SYSTEM',
        senderType: 'system',
        timestamp: '12:00:00 UTC',
        text: 'RISK BLOTTER & MARGIN ENGINE INITIALIZED // ACCOUNT 10,000.00000000 USDT',
      },
      {
        id: 'r2',
        sender: 'RISK OFFICER',
        senderType: 'bot',
        affiliation: 'CELSIUS CLEARING',
        timestamp: '12:00:05 UTC',
        text: 'Invariant Check Passed: 1.0% per-trade risk cap active. Integer math reconciliation scale 10^8 units verified. Daily max drawdown limit armed at 5.0%.',
      },
    ],
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChannel, messages]);

  const generateBotResponse = (query: string): ChatMessage => {
    const q = query.trim().toUpperCase();

    if (q.includes('BTC') || q.includes('BITCOIN')) {
      return {
        id: 'bot-' + Date.now(),
        sender: 'CELSIUS DESK',
        senderType: 'bot',
        affiliation: 'CELSIUS NETWORK',
        timestamp: nowStr(),
        text: `Authoritative Binance Spot quote for BTC/USDT. 24h trend: ${btcChg >= 0 ? '+' : ''}${btcChg}%. Tap card below to open <GP> Chart.`,
        quoteCard: {
          symbol: 'BTCUSD',
          name: 'Bitcoin Spot',
          price: btcPrice,
          change: btcPrice * (btcChg / 100),
          percent: btcChg,
        },
      };
    }

    if (q.includes('ETH') || q.includes('ETHEREUM')) {
      return {
        id: 'bot-' + Date.now(),
        sender: 'CELSIUS DESK',
        senderType: 'bot',
        affiliation: 'CELSIUS NETWORK',
        timestamp: nowStr(),
        text: `Authoritative Binance Spot quote for ETH/USDT. Volume heavy in European hours.`,
        quoteCard: {
          symbol: 'ETHUSD',
          name: 'Ethereum Spot',
          price: ethPrice,
          change: ethPrice * (ethChg / 100),
          percent: ethChg,
        },
      };
    }

    if (q.includes('TSLA') || q.includes('TESLA')) {
      return {
        id: 'bot-' + Date.now(),
        sender: 'CELSIUS DESK',
        senderType: 'bot',
        affiliation: 'CELSIUS NETWORK',
        timestamp: nowStr(),
        text: `Equity quote for TSLA (NASDAQ). Session active.`,
        quoteCard: {
          symbol: 'TSLA',
          name: 'Tesla Inc.',
          price: 248.17,
          change: 3.45,
          percent: 1.41,
        },
      };
    }

    if (q.includes('NIFTY') || q.includes('INDIA')) {
      return {
        id: 'bot-' + Date.now(),
        sender: 'CELSIUS DESK',
        senderType: 'bot',
        affiliation: 'CELSIUS NETWORK',
        timestamp: nowStr(),
        text: `National Stock Exchange of India (NSE) Nifty 50 benchmark index.`,
        quoteCard: {
          symbol: 'NIFTY',
          name: 'Nifty 50 Index 🇮🇳',
          price: 24612.30,
          change: -120.45,
          percent: -0.49,
        },
      };
    }

    if (q.includes('PORT') || q.includes('BALANCE') || q.includes('MARGIN') || q.includes('CASH')) {
      const balanceUsd = account?.balance ? (account.balance / 100000000).toFixed(2) : '36,000.00';
      return {
        id: 'bot-' + Date.now(),
        sender: 'CELSIUS DESK',
        senderType: 'bot',
        affiliation: 'CLEARING & SETTLEMENT',
        timestamp: nowStr(),
        text: `Portfolio Telemetry: Account Balance is $${balanceUsd} USDT (≈ ₹30.00 Lakhs INR). Risk-per-trade cap is enforced at 1.0% ($360.00 max risk). Total margin utilization: 0.00%. Leverage multiplier: 1x Spot.`,
      };
    }

    if (q.includes('HELP') || q.includes('CMD') || q.includes('CODE') || q.includes('FUNCTION')) {
      return {
        id: 'bot-' + Date.now(),
        sender: 'CELSIUS DESK',
        senderType: 'bot',
        affiliation: 'TERMINAL HELP',
        timestamp: nowStr(),
        text: `Core Bloomberg Professional Functions:\n• <WEI <GO>>: World Equity Indices & Macro Monitors\n• <GP <GO>>: Graph Price & High-Frequency Candlestick Chart\n• <TOP <GO>>: Bloomberg Real-Time News Wire Dispatch\n• <EMSX <GO>>: Execution Management System Blotter\n• <IB <GO>>: Instant Bloomberg Trader Chat\n• <FUND <GO>>: Radical Financial Transparency\n• <PROOF <GO>>: SHA-256 Daily Merkle Ledger Proofs`,
      };
    }

    return {
      id: 'bot-' + Date.now(),
      sender: 'CELSIUS DESK',
      senderType: 'bot',
      affiliation: 'CELSIUS NETWORK',
      timestamp: nowStr(),
      text: `Acknowledged: "${query}". Desk has logged this inquiry. Query any ticker (BTC, ETH, TSLA, NIFTY), request <PORT> balance status, or type <HELP> for mnemonic shortcuts.`,
    };
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    terminalAudio.playTick();
    const userMsg: ChatMessage = {
      id: 'usr-' + Date.now(),
      sender: 'B.SHARMA',
      senderType: 'user',
      affiliation: 'CELSIUS ANYWHERE',
      timestamp: nowStr(),
      text: inputText.trim(),
    };

    const targetChannel = activeChannel;
    setMessages((prev) => ({
      ...prev,
      [targetChannel]: [...prev[targetChannel], userMsg],
    }));

    const textToProcess = inputText;
    setInputText('');

    if (targetChannel === 'helpdesk') {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        terminalAudio.playOrderFilled();
        const botReply = generateBotResponse(textToProcess);
        setMessages((prev) => ({
          ...prev,
          helpdesk: [...prev.helpdesk, botReply],
        }));
      }, 700);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#000000] text-white font-mono select-none pb-20">
      {/* Top Header */}
      <header className="px-3 py-2 bg-[#080b11] border-b border-[#182030] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.2 bg-[#ff8800] text-black font-black text-[10px]">
            &lt;DESK &lt;GO&gt;&gt;
          </span>
          <span className="text-white font-bold text-xs tracking-tight">
            TERMINAL DESK AI
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-[#00c176] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00c176] animate-pulse" />
          <span>CONNECTED</span>
        </div>
      </header>

      {/* Channel Switcher */}
      <div className="grid grid-cols-3 bg-[#0c1017] border-b border-[#182030] shrink-0 text-xs font-bold">
        <button
          onClick={() => {
            terminalAudio.playTick();
            setActiveChannel('helpdesk');
          }}
          className={`py-2 px-1 text-center transition-colors border-b-2 ${
            activeChannel === 'helpdesk'
              ? 'border-b-[#ff8800] text-[#ff8800] bg-[#141c2c]'
              : 'border-b-transparent text-[#8e95a5] hover:text-white'
          }`}
        >
          &lt;HELP DESK&gt;
        </button>
        <button
          onClick={() => {
            terminalAudio.playTick();
            setActiveChannel('liquidity');
          }}
          className={`py-2 px-1 text-center transition-colors border-b-2 ${
            activeChannel === 'liquidity'
              ? 'border-b-[#00c176] text-[#00c176] bg-[#141c2c]'
              : 'border-b-transparent text-[#8e95a5] hover:text-white'
          }`}
        >
          &lt;FLOWS #402&gt;
        </button>
        <button
          onClick={() => {
            terminalAudio.playTick();
            setActiveChannel('risk');
          }}
          className={`py-2 px-1 text-center transition-colors border-b-2 ${
            activeChannel === 'risk'
              ? 'border-b-[#00d8d6] text-[#00d8d6] bg-[#141c2c]'
              : 'border-b-transparent text-[#8e95a5] hover:text-white'
          }`}
        >
          &lt;RISK 1.0%&gt;
        </button>
      </div>

      {/* Message Stream */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3">
        {(messages[activeChannel] || []).map((msg) => (
          <div key={msg.id} className="space-y-1">
            <div className="flex items-baseline gap-2 text-[10px]">
              <span
                className={`font-black ${
                  msg.senderType === 'bot'
                    ? 'text-[#ff8800]'
                    : msg.senderType === 'user'
                    ? 'text-[#00d8d6]'
                    : msg.senderType === 'system'
                    ? 'text-[#64748b]'
                    : 'text-[#00c176]'
                }`}
              >
                {msg.sender}
              </span>
              {msg.affiliation && (
                <span className="text-[#64748b] text-[9px]">&lt;{msg.affiliation}&gt;</span>
              )}
              <span className="text-[#3e485e] text-[9px]">{msg.timestamp}</span>
            </div>

            <div
              className={`text-xs leading-relaxed p-2.5 rounded-sm border ${
                msg.senderType === 'user'
                  ? 'bg-[#0e1624] border-[#1d2d47] text-white ml-4'
                  : msg.senderType === 'system'
                  ? 'bg-[#080b11] border-[#141a26] text-[#64748b] font-bold text-[10px]'
                  : 'bg-[#070b12] border-[#182030] text-[#d1d5db]'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>

              {msg.quoteCard && (
                <div
                  onClick={() => {
                    terminalAudio.playTick();
                    const found = quotes.find((q) => q.symbol === msg.quoteCard!.symbol);
                    if (found && onSelectQuote) {
                      onSelectQuote(found);
                    }
                  }}
                  className="mt-2 p-2 bg-[#000000] border border-[#ff8800]/50 rounded-sm flex items-center justify-between cursor-pointer active:bg-[#121927]"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="px-1 bg-[#ff8800] text-black font-black text-[9px]">
                      &lt;{msg.quoteCard.symbol}&gt;
                    </span>
                    <span className="font-bold text-white text-xs">{msg.quoteCard.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-xs">
                    <span className="font-bold text-white">${formatPrice(msg.quoteCard.price, 2)}</span>
                    <span
                      className={`text-[10px] font-bold ${
                        msg.quoteCard.percent >= 0 ? 'text-[#00c176]' : 'text-red-400'
                      }`}
                    >
                      {msg.quoteCard.percent >= 0 ? '+' : ''}
                      {msg.quoteCard.percent.toFixed(2)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-[10px] text-[#ff8800] animate-pulse">
            <Bot size={12} />
            <span>Bloomberg Desk Bot drafting reply...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      {activeChannel === 'helpdesk' && (
        <div className="px-2 py-1 bg-[#080b11] border-t border-[#141a26] flex items-center gap-1 overflow-x-auto no-scrollbar shrink-0">
          {['QUOTE BTC', 'QUOTE NIFTY', 'PORT STATUS', 'HELP FUNCTIONS'].map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => {
                terminalAudio.playTick();
                setInputText(chip);
              }}
              className="px-2 py-0.5 rounded-sm bg-[#101520] border border-[#1a2333] text-[9px] text-[#ff8800] font-bold shrink-0"
            >
              &lt;{chip}&gt;
            </button>
          ))}
        </div>
      )}

      {/* Input Box */}
      <form
        onSubmit={handleSendMessage}
        className="p-2 bg-[#080b11] border-t border-[#182030] flex items-center gap-1.5 shrink-0"
      >
        <div className="relative flex-1">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[#ff8800] font-bold text-[10px]">
            IB&gt;
          </span>
          <input
            type="text"
            placeholder="Type message (e.g. 'QUOTE BTC')..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full bg-[#000000] border border-[#1a2333] focus:border-[#ff8800] rounded-sm pl-8 pr-2 py-2 text-xs text-white placeholder-[#5c6475] font-mono outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="px-3 py-2 bg-[#ff8800] hover:bg-[#ffa033] disabled:opacity-40 text-black font-black text-xs rounded-sm transition-colors flex items-center gap-1 shrink-0"
        >
          <span>&lt;SEND&gt;</span>
          <Send size={11} className="stroke-[2.5]" />
        </button>
      </form>
    </div>
  );
};
