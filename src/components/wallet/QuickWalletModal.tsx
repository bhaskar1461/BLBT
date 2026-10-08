'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Zap,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Info,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';
import { useTradingStore } from '@/stores/useTradingStore';
import { useChartStore } from '@/stores/useChartStore';
import { useWatchlistStore } from '@/stores/useWatchlistStore';
import { AssetIcon } from '@/components/ui/TradingViewIcons';
import { formatPrice } from '@/services/symbols';

interface QuickWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'buy' | 'redeem' | 'info';
}

const SUPPORTED_ASSETS = [
  { symbol: 'BTCUSDT', coin: 'BTC', name: 'Bitcoin', defaultPrice: 85000 },
  { symbol: 'ETHUSDT', coin: 'ETH', name: 'Ethereum', defaultPrice: 3420 },
  { symbol: 'SOLUSDT', coin: 'SOL', name: 'Solana', defaultPrice: 175 },
  { symbol: 'BNBUSDT', coin: 'BNB', name: 'Binance Coin', defaultPrice: 580 },
  { symbol: 'XRPUSDT', coin: 'XRP', name: 'Ripple', defaultPrice: 0.58 },
  { symbol: 'DOGEUSDT', coin: 'DOGE', name: 'Dogecoin', defaultPrice: 0.14 },
];

const NETWORKS = [
  { id: 'TRC-20', name: 'TRC-20 (Tron Network)', fee: 1.0, speed: '< 2 mins' },
  { id: 'ERC-20', name: 'ERC-20 (Ethereum)', fee: 3.5, speed: '< 5 mins' },
  { id: 'Solana', name: 'Solana (SPL)', fee: 0.5, speed: '< 30 secs' },
  { id: 'Bank', name: 'Simulated Bank Wire (ACH/SEPA)', fee: 0.0, speed: '< 1 hour' },
];

export const QuickWalletModal: React.FC<QuickWalletModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'buy',
}) => {
  const [activeTab, setActiveTab] = useState<'buy' | 'redeem' | 'info'>(initialTab);
  const account = useTradingStore((s) => s.account);
  const fetchAccount = useTradingStore((s) => s.fetchAccount);
  const tickers = useWatchlistStore((s) => s.tickers);
  const activeSymbol = useChartStore((s) => s.activeSymbol);
  const setActiveSymbol = useChartStore((s) => s.setActiveSymbol);

  // Buy State
  const [selectedCoin, setSelectedCoin] = useState(
    SUPPORTED_ASSETS.find((a) => a.symbol === activeSymbol)?.symbol || 'BTCUSDT'
  );
  const [buyAmountUsdt, setBuyAmountUsdt] = useState<number>(100);
  const [isBuying, setIsBuying] = useState(false);
  const [buySuccess, setBuySuccess] = useState<{
    coin: string;
    quantity: number;
    totalCost: number;
  } | null>(null);
  const [buyError, setBuyError] = useState<string | null>(null);

  // Redeem / Cash-out State
  const [redeemAmount, setRedeemAmount] = useState<number>(250);
  const [selectedNetwork, setSelectedNetwork] = useState('TRC-20');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemReceipt, setRedeemReceipt] = useState<{
    txHash: string;
    amount: number;
    destination: string;
    network: string;
    remainingBalance: number;
  } | null>(null);
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  // Sync activeTab if initialTab changes on open
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setBuySuccess(null);
      setBuyError(null);
      setRedeemReceipt(null);
      setRedeemError(null);
      fetchAccount();
    }
  }, [isOpen, initialTab, fetchAccount]);

  if (!isOpen) return null;

  const currentBalance = account?.balance ?? 10000;
  const currentTicker = tickers[selectedCoin];
  const coinDef = SUPPORTED_ASSETS.find((a) => a.symbol === selectedCoin) || SUPPORTED_ASSETS[0];
  const livePrice = currentTicker?.lastPrice ?? coinDef.defaultPrice;
  const estimatedCryptoQty = livePrice > 0 ? buyAmountUsdt / livePrice : 0;
  const flatFeeUsdt = buyAmountUsdt * 0.001; // 0.10% flat fee

  // Handle Quick Purchase Execution
  const handleExecutePurchase = async () => {
    if (isBuying || buyAmountUsdt <= 0) return;
    setIsBuying(true);
    setBuyError(null);
    setBuySuccess(null);

    try {
      const res = await fetch('/api/trade/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: account?.userId || 'usr_bhaskar_sharma',
          symbol: selectedCoin,
          side: 'buy',
          type: 'market',
          quantity: estimatedCryptoQty,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setBuyError(data.error || 'Failed to execute purchase');
      } else {
        setBuySuccess({
          coin: coinDef.coin,
          quantity: estimatedCryptoQty,
          totalCost: buyAmountUsdt + flatFeeUsdt,
        });
        await fetchAccount();
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Network error during execution';
      setBuyError(msg);
    } finally {
      setIsBuying(false);
    }
  };

  // Handle Balance Redemption Execution
  const handleExecuteRedemption = async () => {
    if (isRedeeming || redeemAmount <= 0) return;
    if (!destinationAddress.trim()) {
      setRedeemError('Please provide a destination wallet address.');
      return;
    }

    setIsRedeeming(true);
    setRedeemError(null);
    setRedeemReceipt(null);

    try {
      const res = await fetch('/api/trade/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: account?.userId || 'usr_bhaskar_sharma',
          amount: redeemAmount,
          destinationAddress: destinationAddress.trim(),
          network: selectedNetwork,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setRedeemError(data.error || 'Failed to process redemption');
      } else {
        setRedeemReceipt({
          txHash: data.txHash,
          amount: redeemAmount,
          destination: destinationAddress.trim(),
          network: selectedNetwork,
          remainingBalance: data.newBalance,
        });
        await fetchAccount();
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error executing redemption';
      setRedeemError(msg);
    } finally {
      setIsRedeeming(false);
    }
  };

  const generateDemoAddress = () => {
    const prefixes: Record<string, string> = {
      'TRC-20': 'TX',
      'ERC-20': '0x',
      Solana: 'Sol',
      Bank: 'US89',
    };
    const prefix = prefixes[selectedNetwork] || '0x';
    const rand = Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12);
    setDestinationAddress(`${prefix}${rand.toUpperCase()}`);
  };

  const copyTxHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#1e222d] border border-[#2a2e39] rounded-2xl w-full max-w-xl shadow-2xl flex flex-col overflow-hidden text-[#d1d4dc]">
        {/* Header with Balance Banner */}
        <div className="p-5 border-b border-[#2a2e39] bg-gradient-to-b from-[#2a2e39]/30 to-transparent">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2962ff] to-[#6200ea] flex items-center justify-center text-white shadow-md">
                <Wallet size={18} />
              </div>
              <div>
                <h2 className="font-bold text-base text-white flex items-center gap-2">
                  Celsius Quick Wallet
                  <span className="text-[10px] font-mono font-semibold bg-[#089981]/20 text-[#089981] px-2 py-0.5 rounded-full border border-[#089981]/30">
                    Live
                  </span>
                </h2>
                <p className="text-xs text-[#787b86]">Instant spot purchasing & ledger-backed redemption</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#787b86] hover:text-white hover:bg-[#2a2e39] transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Balance Display Pill */}
          <div className="bg-[#131722] border border-[#2a2e39] rounded-xl p-3 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-[#787b86] font-medium">Available Paper Balance</div>
              <div className="font-mono text-xl font-bold text-white tracking-tight">
                ${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
                <span className="text-xs text-[#089981] font-semibold">USDT</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-[#787b86]">Protection Status</div>
              <div className="flex items-center gap-1 text-xs text-[#089981] font-semibold">
                <ShieldCheck size={14} /> Solvency Verified
              </div>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-3 border-b border-[#2a2e39] bg-[#131722]/50 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('buy')}
            className={`py-3 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'buy'
                ? 'border-[#2962ff] text-[#2962ff] bg-[#2962ff]/5'
                : 'border-transparent text-[#787b86] hover:text-[#d1d4dc]'
            }`}
          >
            <Zap size={14} />
            <span>1-Click Buy</span>
          </button>
          <button
            onClick={() => setActiveTab('redeem')}
            className={`py-3 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'redeem'
                ? 'border-[#089981] text-[#089981] bg-[#089981]/5'
                : 'border-transparent text-[#787b86] hover:text-[#d1d4dc]'
            }`}
          >
            <ArrowDownLeft size={14} />
            <span>Redeem Balance</span>
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`py-3 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'info'
                ? 'border-[#ff9f1c] text-[#ff9f1c] bg-[#ff9f1c]/5'
                : 'border-transparent text-[#787b86] hover:text-[#d1d4dc]'
            }`}
          >
            <Info size={14} />
            <span>Coin Intel</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 overflow-y-auto max-h-[460px]">
          {/* TAB 1: QUICK BUY */}
          {activeTab === 'buy' && (
            <div className="space-y-4">
              {buySuccess ? (
                <div className="bg-[#089981]/10 border border-[#089981]/30 rounded-xl p-5 text-center space-y-3 animate-in fade-in">
                  <div className="w-12 h-12 bg-[#089981]/20 rounded-full flex items-center justify-center text-[#089981] mx-auto">
                    <CheckCircle2 size={28} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Purchase Executed!</h3>
                    <p className="text-xs text-[#787b86] mt-1">
                      Acquired <span className="text-[#089981] font-mono font-bold">{buySuccess.quantity.toFixed(6)} {buySuccess.coin}</span> at live market rate.
                    </p>
                  </div>
                  <div className="bg-[#131722] rounded-lg p-3 text-xs font-mono space-y-1 text-left border border-[#2a2e39]">
                    <div className="flex justify-between">
                      <span className="text-[#787b86]">Total Debited:</span>
                      <span className="text-white">${buySuccess.totalCost.toFixed(2)} USDT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#787b86]">New Balance:</span>
                      <span className="text-[#089981]">${(currentBalance).toFixed(2)} USDT</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setBuySuccess(null)}
                    className="w-full bg-[#2a2e39] hover:bg-[#363a45] text-white text-xs font-bold py-2 rounded-lg transition-colors"
                  >
                    Buy Another Asset
                  </button>
                </div>
              ) : (
                <>
                  {/* Select Coin Chips */}
                  <div>
                    <label className="text-xs text-[#787b86] font-medium block mb-2">Select Asset to Purchase</label>
                    <div className="grid grid-cols-3 gap-2">
                      {SUPPORTED_ASSETS.map((asset) => {
                        const isSel = selectedCoin === asset.symbol;
                        return (
                          <button
                            key={asset.symbol}
                            type="button"
                            onClick={() => {
                              setSelectedCoin(asset.symbol);
                              setActiveSymbol(asset.symbol);
                            }}
                            className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${
                              isSel
                                ? 'bg-[#2962ff]/15 border-[#2962ff] text-white shadow-sm'
                                : 'bg-[#131722] border-[#2a2e39] text-[#787b86] hover:border-[#434651]'
                            }`}
                          >
                            <AssetIcon symbol={asset.symbol} size={22} />
                            <div className="truncate">
                              <div className="font-bold text-xs text-white leading-none">{asset.coin}</div>
                              <div className="text-[10px] text-[#787b86] truncate mt-0.5">{asset.name}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Live Price Strip */}
                  <div className="bg-[#131722] border border-[#2a2e39] rounded-xl p-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <AssetIcon symbol={selectedCoin} size={18} />
                      <span className="font-bold text-white">{coinDef.coin} Spot Price:</span>
                    </div>
                    <div className="font-mono font-bold text-white">
                      ${formatPrice(livePrice, livePrice > 100 ? 2 : 4)}
                    </div>
                  </div>

                  {/* Amount Selector */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs text-[#787b86] font-medium">Purchase Amount in USDT</label>
                      <span className="text-[11px] text-[#787b86]">
                        Max: ${currentBalance.toFixed(2)}
                      </span>
                    </div>

                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#787b86] font-mono">$</span>
                      <input
                        type="number"
                        min="10"
                        max={currentBalance}
                        value={buyAmountUsdt || ''}
                        onChange={(e) => setBuyAmountUsdt(parseFloat(e.target.value) || 0)}
                        className="w-full bg-[#131722] border border-[#2a2e39] focus:border-[#2962ff] rounded-xl pl-8 pr-16 py-2.5 text-sm font-mono text-white outline-none"
                        placeholder="100.00"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#787b86] font-bold">
                        USDT
                      </span>
                    </div>

                    {/* Presets */}
                    <div className="flex items-center gap-2 mt-2">
                      {[50, 100, 250, 500, 1000].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setBuyAmountUsdt(preset)}
                          className={`flex-1 py-1 rounded-lg text-xs font-mono font-bold border transition-colors ${
                            buyAmountUsdt === preset
                              ? 'bg-[#2962ff] text-white border-[#2962ff]'
                              : 'bg-[#131722] border-[#2a2e39] text-[#787b86] hover:text-white'
                          }`}
                        >
                          ${preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Summary & Transparent Fee */}
                  <div className="bg-[#131722] border border-[#2a2e39] rounded-xl p-3 text-xs space-y-1.5">
                    <div className="flex justify-between text-[#787b86]">
                      <span>Est. {coinDef.coin} Received:</span>
                      <span className="text-white font-mono font-bold">
                        ≈ {estimatedCryptoQty.toFixed(6)} {coinDef.coin}
                      </span>
                    </div>
                    <div className="flex justify-between text-[#787b86]">
                      <span>Exchange Fee (0.10% flat):</span>
                      <span className="font-mono text-[#787b86]">${flatFeeUsdt.toFixed(2)} USDT</span>
                    </div>
                    <div className="flex justify-between text-[#787b86] pt-1.5 border-t border-[#2a2e39]">
                      <span className="font-semibold text-white">Total Deducted:</span>
                      <span className="font-mono font-bold text-white">${(buyAmountUsdt + flatFeeUsdt).toFixed(2)} USDT</span>
                    </div>
                  </div>

                  {buyError && (
                    <div className="p-3 rounded-xl bg-[#f23645]/10 border border-[#f23645]/30 text-xs text-[#f23645] flex items-center gap-2">
                      <AlertCircle size={15} className="shrink-0" />
                      <span>{buyError}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="button"
                    disabled={isBuying || buyAmountUsdt <= 0 || buyAmountUsdt > currentBalance}
                    onClick={handleExecutePurchase}
                    className="w-full bg-[#2962ff] hover:bg-[#1e53e5] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm py-3 rounded-xl transition-all shadow-lg shadow-[#2962ff]/20 flex items-center justify-center gap-2"
                  >
                    {isBuying ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Executing Order...</span>
                      </>
                    ) : (
                      <>
                        <Zap size={16} />
                        <span>Buy {coinDef.coin} Now (${buyAmountUsdt.toFixed(2)})</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          )}

          {/* TAB 2: REDEEM BALANCE */}
          {activeTab === 'redeem' && (
            <div className="space-y-4">
              {redeemReceipt ? (
                <div className="bg-[#089981]/10 border border-[#089981]/30 rounded-xl p-5 text-center space-y-3 animate-in fade-in">
                  <div className="w-12 h-12 bg-[#089981]/20 rounded-full flex items-center justify-center text-[#089981] mx-auto">
                    <CheckCircle2 size={28} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Redemption Confirmed!</h3>
                    <p className="text-xs text-[#787b86] mt-1">
                      Withdrawal recorded in the immutable ledger.
                    </p>
                  </div>

                  <div className="bg-[#131722] rounded-xl p-3 text-xs font-mono space-y-2 text-left border border-[#2a2e39]">
                    <div className="flex justify-between">
                      <span className="text-[#787b86]">Amount Redeemed:</span>
                      <span className="text-white font-bold">${redeemReceipt.amount.toFixed(2)} USDT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#787b86]">Network:</span>
                      <span className="text-white">{redeemReceipt.network}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#787b86]">Destination:</span>
                      <span className="text-white truncate max-w-[200px]" title={redeemReceipt.destination}>
                        {redeemReceipt.destination}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-[#2a2e39]">
                      <div className="text-[10px] text-[#787b86] mb-1">Transaction Hash (Cryptographically Sealed):</div>
                      <div className="flex items-center justify-between bg-[#1e222d] px-2 py-1.5 rounded border border-[#2a2e39]">
                        <span className="text-[11px] text-[#089981] truncate">{redeemReceipt.txHash}</span>
                        <button
                          onClick={() => copyTxHash(redeemReceipt.txHash)}
                          className="text-[#787b86] hover:text-white transition-colors ml-2"
                          title="Copy Tx Hash"
                        >
                          {copiedHash ? <Check size={13} className="text-[#089981]" /> : <Copy size={13} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setRedeemReceipt(null)}
                    className="w-full bg-[#2a2e39] hover:bg-[#363a45] text-white text-xs font-bold py-2 rounded-lg transition-colors"
                  >
                    New Redemption
                  </button>
                </div>
              ) : (
                <>
                  {/* Network Selector */}
                  <div>
                    <label className="text-xs text-[#787b86] font-medium block mb-2">Payout Method & Network</label>
                    <div className="grid grid-cols-2 gap-2">
                      {NETWORKS.map((net) => {
                        const isSel = selectedNetwork === net.id;
                        return (
                          <button
                            key={net.id}
                            type="button"
                            onClick={() => setSelectedNetwork(net.id)}
                            className={`p-2.5 rounded-xl border text-left transition-all ${
                              isSel
                                ? 'bg-[#089981]/15 border-[#089981] text-white'
                                : 'bg-[#131722] border-[#2a2e39] text-[#787b86] hover:border-[#434651]'
                            }`}
                          >
                            <div className="font-bold text-xs text-white">{net.name}</div>
                            <div className="text-[10px] text-[#787b86] mt-0.5">Est. {net.speed} · Fee: ${net.fee.toFixed(2)}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Destination Address */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs text-[#787b86] font-medium">Destination Wallet / Account Address</label>
                      <button
                        type="button"
                        onClick={generateDemoAddress}
                        className="text-[11px] text-[#2962ff] hover:underline flex items-center gap-1 font-semibold"
                      >
                        <Sparkles size={11} /> Auto-Generate Test Address
                      </button>
                    </div>
                    <input
                      type="text"
                      value={destinationAddress}
                      onChange={(e) => setDestinationAddress(e.target.value)}
                      placeholder="e.g. TXh2... or 0x71C... or Bank Account"
                      className="w-full bg-[#131722] border border-[#2a2e39] focus:border-[#089981] rounded-xl px-3.5 py-2.5 text-xs font-mono text-white outline-none"
                    />
                  </div>

                  {/* Amount to Redeem */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs text-[#787b86] font-medium">Redemption Amount</label>
                      <span className="text-[11px] text-[#787b86]">
                        Available: ${currentBalance.toFixed(2)} USDT
                      </span>
                    </div>

                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#787b86] font-mono">$</span>
                      <input
                        type="number"
                        min="10"
                        max={currentBalance}
                        value={redeemAmount || ''}
                        onChange={(e) => setRedeemAmount(parseFloat(e.target.value) || 0)}
                        className="w-full bg-[#131722] border border-[#2a2e39] focus:border-[#089981] rounded-xl pl-8 pr-16 py-2.5 text-sm font-mono text-white outline-none"
                        placeholder="250.00"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#787b86] font-bold">
                        USDT
                      </span>
                    </div>

                    {/* Presets */}
                    <div className="flex items-center gap-2 mt-2">
                      {[100, 250, 500, 1000].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setRedeemAmount(preset)}
                          className={`flex-1 py-1 rounded-lg text-xs font-mono font-bold border transition-colors ${
                            redeemAmount === preset
                              ? 'bg-[#089981] text-white border-[#089981]'
                              : 'bg-[#131722] border-[#2a2e39] text-[#787b86] hover:text-white'
                          }`}
                        >
                          ${preset}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setRedeemAmount(Math.floor(currentBalance))}
                        className="flex-1 py-1 rounded-lg text-xs font-mono font-bold border bg-[#131722] border-[#2a2e39] text-[#ff9f1c] hover:text-white"
                      >
                        100%
                      </button>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-[#131722] border border-[#2a2e39] rounded-xl p-3 text-xs space-y-1.5">
                    <div className="flex justify-between text-[#787b86]">
                      <span>Redemption Amount:</span>
                      <span className="text-white font-mono">${redeemAmount.toFixed(2)} USDT</span>
                    </div>
                    <div className="flex justify-between text-[#787b86]">
                      <span>Network Gas Fee (Fixed):</span>
                      <span className="text-[#089981] font-mono">$1.00 USDT</span>
                    </div>
                    <div className="flex justify-between text-[#787b86] pt-1.5 border-t border-[#2a2e39]">
                      <span className="font-semibold text-white">Remaining Balance After:</span>
                      <span className="font-mono font-bold text-white">
                        ${Math.max(0, currentBalance - redeemAmount).toFixed(2)} USDT
                      </span>
                    </div>
                  </div>

                  {redeemError && (
                    <div className="p-3 rounded-xl bg-[#f23645]/10 border border-[#f23645]/30 text-xs text-[#f23645] flex items-center gap-2">
                      <AlertCircle size={15} className="shrink-0" />
                      <span>{redeemError}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="button"
                    disabled={isRedeeming || redeemAmount <= 0 || redeemAmount > currentBalance}
                    onClick={handleExecuteRedemption}
                    className="w-full bg-[#089981] hover:bg-[#078570] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm py-3 rounded-xl transition-all shadow-lg shadow-[#089981]/20 flex items-center justify-center gap-2"
                  >
                    {isRedeeming ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Processing Ledger Entry...</span>
                      </>
                    ) : (
                      <>
                        <ArrowDownLeft size={16} />
                        <span>Redeem ${redeemAmount.toFixed(2)} USDT</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          )}

          {/* TAB 3: ASSET INTELLIGENCE */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div className="bg-[#131722] border border-[#2a2e39] rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <AssetIcon symbol={selectedCoin} size={30} />
                    <div>
                      <div className="font-bold text-sm text-white">{coinDef.name} ({coinDef.coin})</div>
                      <div className="text-[11px] text-[#787b86]">Tier 1 Liquid Spot Market</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-base font-bold text-white">
                      ${formatPrice(livePrice, livePrice > 100 ? 2 : 4)}
                    </div>
                    <div className="text-[11px] text-[#089981] font-semibold">Binance Spot Feed</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[#2a2e39]">
                  <div className="bg-[#1e222d] p-2 rounded-lg">
                    <div className="text-[10px] text-[#787b86]">24h High</div>
                    <div className="font-mono font-semibold text-white">
                      ${currentTicker?.highPrice ? formatPrice(currentTicker.highPrice, 2) : '—'}
                    </div>
                  </div>
                  <div className="bg-[#1e222d] p-2 rounded-lg">
                    <div className="text-[10px] text-[#787b86]">24h Low</div>
                    <div className="font-mono font-semibold text-white">
                      ${currentTicker?.lowPrice ? formatPrice(currentTicker.lowPrice, 2) : '—'}
                    </div>
                  </div>
                </div>
              </div>

              {/* The Honest Reality Check Banner */}
              <div className="bg-[#f23645]/5 border border-[#f23645]/20 rounded-xl p-3.5 space-y-1.5 text-xs">
                <div className="font-bold text-[#f23645] flex items-center gap-1.5">
                  <AlertCircle size={14} /> The Honest Reality Rule
                </div>
                <p className="text-[#d1d4dc] leading-relaxed">
                  Active day trading results in 78.2% of retail traders underperforming buy-and-hold BTC over 30 days. Practice with virtual paper capital first before taking real risk.
                </p>
              </div>

              {/* Switch to Buy Button */}
              <button
                type="button"
                onClick={() => setActiveTab('buy')}
                className="w-full bg-[#2962ff] hover:bg-[#1e53e5] text-white text-xs font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <Zap size={14} />
                <span>Buy {coinDef.coin} Now</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-[#2a2e39] bg-[#131722] flex items-center justify-between text-[11px] text-[#787b86]">
          <span className="flex items-center gap-1">
            <ShieldCheck size={13} className="text-[#089981]" /> All executions logged to append-only ledger
          </span>
          <span className="font-mono text-[#2962ff]">Zero Broker Markup</span>
        </div>
      </div>
    </div>
  );
};
