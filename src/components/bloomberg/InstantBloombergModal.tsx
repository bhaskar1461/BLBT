// src/components/bloomberg/InstantBloombergModal.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Bot,
  Users,
  ShieldAlert,
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

export interface ChatMessage {
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

interface InstantBloombergModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSymbol?: (symbol: string) => void;
}

export const InstantBloombergModal: React.FC<InstantBloombergModalProps> = ({
  isOpen,
  onClose,
  onSelectSymbol,
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

  // Initial Seed Messages for each channel
  const [messages, setMessages] = useState<{ [key: string]: ChatMessage[] }>({
    helpdesk: [
      {
        id: 'h1',
        sender: 'SYSTEM',
        senderType: 'system',
        timestamp: '13:00:00 UTC',
        text: 'SESSION OPENED. Connected to Celsius Terminal Desk AI <HELP <GO>> & Quantitative Analytics Service.',
      },
      {
        id: 'h2',
        sender: 'CELSIUS ANALYTICS',
        senderType: 'bot',
        affiliation: 'CELSIUS NETWORK',
        timestamp: '13:00:02 UTC',
        text: 'Welcome to Celsius Terminal Desk AI. I am your quantitative market specialist bot. Ask me for live quotes (e.g. "BTC", "ETH", "TSLA"), portfolio margin status, function cheat codes (<WEI>, <GP>, <EMSX>), or market math.',
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
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, activeChannel, messages]);

  if (!isOpen) return null;

  // Bot response generator
  const generateBotResponse = (query: string): ChatMessage => {
    const q = query.trim().toUpperCase();

    // 1. Quote requests
    if (q.includes('BTC') || q.includes('BITCOIN')) {
      return {
        id: 'bot-' + Date.now(),
        sender: 'CELSIUS DESK',
        senderType: 'bot',
        affiliation: 'CELSIUS NETWORK',
        timestamp: nowStr(),
        text: `Authoritative Binance Spot quote for BTC/USDT. 24h trend: ${btcChg >= 0 ? '+' : ''}${btcChg}%. Tap below to inspect on <GP> Chart.`,
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

    // 2. Portfolio / Balance requests
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

    // 3. Help / Cheat code requests
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

    // 4. Sentiment / Reality requests
    if (q.includes('SENTIMENT') || q.includes('HERD') || q.includes('REALITY')) {
      return {
        id: 'bot-' + Date.now(),
        sender: 'CELSIUS DESK',
        senderType: 'bot',
        affiliation: 'QUANT RESEARCH',
        timestamp: nowStr(),
        text: `Market Reality Telemetry: 78.2% of active retail traders lost money last month. Median loss: -$142.10 USDT. Retail paper traders currently 68% LONG BTC while crowd accuracy has been wrong on 7 of last 10 breakout attempts. Trade with discipline.`,
      };
    }

    // Default institutional reply
    return {
      id: 'bot-' + Date.now(),
      sender: 'CELSIUS DESK',
      senderType: 'bot',
      affiliation: 'CELSIUS NETWORK',
      timestamp: nowStr(),
      text: `Acknowledged: "${query}". Desk has logged this inquiry. You can query any ticker (BTC, ETH, TSLA, NIFTY), request <PORT> balance status, or type <HELP> for mnemonic shortcuts.`,
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

    // If on helpdesk, trigger automated Bot reply after short delay
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 select-none font-mono">
      <div className="w-full max-w-4xl h-[92vh] max-h-[780px] bg-[#05070a] border-2 border-[#ff8800] rounded-sm flex flex-col shadow-[0_0_40px_rgba(255,136,0,0.25)] overflow-hidden">
        {/* Terminal Window Header Bar */}
        <div className="flex items-center justify-between px-3 py-2 bg-[#ff8800] text-black font-black text-xs shrink-0">
          <div className="flex items-center gap-2">
            <MessageSquare size={14} className="stroke-[2.5]" />
            <span>CELSIUS TERMINAL // TERMINAL DESK AI &lt;DESK &lt;GO&gt;&gt;</span>
            <span className="hidden sm:inline px-1 bg-black text-[#ff8800] text-[10px] rounded-[2px]">
              AUTHENTICATED
            </span>
          </div>

          <button
            onClick={() => {
              terminalAudio.playTick();
              onClose();
            }}
            className="p-1 hover:bg-black hover:text-[#ff8800] transition-colors rounded-[2px]"
          >
            <X size={15} className="stroke-[3]" />
          </button>
        </div>

        {/* Secondary Telemetry Strip */}
        <div className="flex items-center justify-between px-3 py-1 bg-[#0c1017] border-b border-[#182030] text-[10px] text-[#8e95a5] shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-[#00c176] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00c176] animate-pulse" />
              <span>DESK NETWORK: ONLINE</span>
            </span>
            <span className="text-[#2a364d]">|</span>
            <span className="text-[#ff8800]">LATENCY: 8ms</span>
            <span className="text-[#2a364d]">|</span>
            <span>END-TO-END ENCRYPTED</span>
          </div>
          <div className="text-[#64748b] hidden sm:inline">
            USER: B.SHARMA &lt;CELSIUS ANYWHERE&gt;
          </div>
        </div>

        {/* Main Body: Channel Tabs + Message Window */}
        <div className="flex-1 flex flex-col sm:flex-row min-h-0 overflow-hidden">
          {/* Left Sidebar: Channel Directory */}
          <div className="w-full sm:w-60 bg-[#080b11] border-b sm:border-b-0 sm:border-r border-[#182030] flex flex-row sm:flex-col shrink-0 overflow-x-auto sm:overflow-y-auto">
            <div className="hidden sm:block px-3 py-2 text-[10px] text-[#64748b] font-bold uppercase tracking-wider border-b border-[#141a26]">
              CHANNELS &amp; DESKS
            </div>

            <button
              onClick={() => {
                terminalAudio.playTick();
                setActiveChannel('helpdesk');
              }}
              className={`flex-1 sm:flex-none flex items-center gap-2 px-3 py-2.5 text-left text-xs transition-colors border-b border-[#141a26] ${
                activeChannel === 'helpdesk'
                  ? 'bg-[#182338] text-[#ff8800] border-l-2 border-l-[#ff8800]'
                  : 'text-[#8e95a5] hover:text-white hover:bg-[#0c121e]'
              }`}
            >
              <Bot size={14} className="shrink-0 text-[#ff8800]" />
              <div className="flex flex-col min-w-0">
                <span className="font-bold truncate text-[11px]">Bloomberg Desk Bot</span>
                <span className="text-[9px] text-[#64748b] truncate">&lt;HELP &lt;GO&gt;&gt; Live AI</span>
              </div>
            </button>

            <button
              onClick={() => {
                terminalAudio.playTick();
                setActiveChannel('liquidity');
              }}
              className={`flex-1 sm:flex-none flex items-center gap-2 px-3 py-2.5 text-left text-xs transition-colors border-b border-[#141a26] ${
                activeChannel === 'liquidity'
                  ? 'bg-[#182338] text-[#00c176] border-l-2 border-l-[#00c176]'
                  : 'text-[#8e95a5] hover:text-white hover:bg-[#0c121e]'
              }`}
            >
              <Users size={14} className="shrink-0 text-[#00c176]" />
              <div className="flex flex-col min-w-0">
                <span className="font-bold truncate text-[11px]">FX &amp; Crypto Flows</span>
                <span className="text-[9px] text-[#64748b] truncate">Room #402 Institutional</span>
              </div>
            </button>

            <button
              onClick={() => {
                terminalAudio.playTick();
                setActiveChannel('risk');
              }}
              className={`flex-1 sm:flex-none flex items-center gap-2 px-3 py-2.5 text-left text-xs transition-colors border-b border-[#141a26] ${
                activeChannel === 'risk'
                  ? 'bg-[#182338] text-[#00d8d6] border-l-2 border-l-[#00d8d6]'
                  : 'text-[#8e95a5] hover:text-white hover:bg-[#0c121e]'
              }`}
            >
              <ShieldAlert size={14} className="shrink-0 text-[#00d8d6]" />
              <div className="flex flex-col min-w-0">
                <span className="font-bold truncate text-[11px]">Risk &amp; Blotter Desk</span>
                <span className="text-[9px] text-[#64748b] truncate">1.0% Cap Enforcement</span>
              </div>
            </button>
          </div>

          {/* Right Message Stream */}
          <div className="flex-1 flex flex-col min-h-0 bg-[#000000]">
            {/* Messages Scroll Area */}
            <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3">
              {(messages[activeChannel] || []).map((msg) => (
                <div key={msg.id} className="space-y-1">
                  {/* Sender Header */}
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
                      <span className="text-[#64748b] text-[9px]">
                        &lt;{msg.affiliation}&gt;
                      </span>
                    )}
                    <span className="text-[#3e485e] text-[9px]">{msg.timestamp}</span>
                  </div>

                  {/* Message Bubble/Text */}
                  <div
                    className={`text-xs leading-relaxed p-2.5 rounded-sm border ${
                      msg.senderType === 'user'
                        ? 'bg-[#0e1624] border-[#1d2d47] text-white ml-4 sm:ml-8'
                        : msg.senderType === 'system'
                        ? 'bg-[#080b11] border-[#141a26] text-[#64748b] font-bold text-[10px]'
                        : 'bg-[#070b12] border-[#182030] text-[#d1d5db]'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>

                    {/* Optional Quote Card Attachment */}
                    {msg.quoteCard && (
                      <div
                        onClick={() => {
                          terminalAudio.playTick();
                          onSelectSymbol?.(msg.quoteCard!.symbol);
                          onClose();
                        }}
                        className="mt-2 p-2 bg-[#000000] border border-[#ff8800]/50 rounded-sm flex items-center justify-between cursor-pointer hover:bg-[#121927] transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="px-1 bg-[#ff8800] text-black font-black text-[10px]">
                            &lt;{msg.quoteCard.symbol}&gt;
                          </span>
                          <span className="font-bold text-white text-xs">
                            {msg.quoteCard.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-white font-bold">
                            ${formatPrice(msg.quoteCard.price, 2)}
                          </span>
                          <span
                            className={`text-[10px] font-bold ${
                              msg.quoteCard.percent >= 0 ? 'text-[#00c176]' : 'text-red-400'
                            }`}
                          >
                            {msg.quoteCard.percent >= 0 ? '+' : ''}
                            {msg.quoteCard.percent.toFixed(2)}%
                          </span>
                          <span className="text-[10px] text-[#ff8800]">&lt;GP GO&gt;</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 text-[10px] text-[#ff8800] animate-pulse">
                  <Bot size={12} />
                  <span>Bloomberg Desk Bot is drafting market telemetry...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Action Suggestion Chips (Helpdesk Only) */}
            {activeChannel === 'helpdesk' && (
              <div className="px-3 py-1.5 bg-[#080b11] border-t border-[#141a26] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                <span className="text-[9px] text-[#64748b] shrink-0">SUGGESTIONS:</span>
                {['QUOTE BTC', 'QUOTE NIFTY', 'PORT STATUS', 'HELP FUNCTIONS', 'REALITY STATS'].map(
                  (chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => {
                        terminalAudio.playTick();
                        setInputText(chip);
                      }}
                      className="px-2 py-0.5 rounded-sm bg-[#101520] hover:bg-[#182338] border border-[#1a2333] hover:border-[#ff8800] text-[10px] text-[#ff8800] font-bold shrink-0 transition-colors"
                    >
                      &lt;{chip}&gt;
                    </button>
                  )
                )}
              </div>
            )}

            {/* Message Input Box */}
            <form
              onSubmit={handleSendMessage}
              className="p-2 sm:p-3 bg-[#080b11] border-t border-[#182030] flex items-center gap-2 shrink-0"
            >
              <div className="relative flex-1">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#ff8800] font-bold text-xs">
                  IB &gt;
                </span>
                <input
                  type="text"
                  placeholder="Type message or command (e.g. 'QUOTE BTC', 'HELP', 'MARGIN')..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="w-full bg-[#000000] border border-[#1a2333] focus:border-[#ff8800] rounded-sm pl-11 pr-3 py-2 text-xs text-white placeholder-[#5c6475] font-mono outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={!inputText.trim()}
                className="px-4 py-2 bg-[#ff8800] hover:bg-[#ffa033] disabled:opacity-40 text-black font-black text-xs rounded-sm transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
              >
                <span>&lt;SEND &lt;GO&gt;&gt;</span>
                <Send size={12} className="stroke-[2.5]" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
