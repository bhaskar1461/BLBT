'use client';

import React, { useState, useEffect } from 'react';
import {
  Server,
  CheckCircle2,
  Zap,
  Key,
  ShieldCheck,
  Activity,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  openAlgoGateway,
  type BrokerConfig,
  type BrokerId,
  type MarketDepth,
} from '@/lib/broker/openalgo';
import { formatPrice } from '@/services/symbols';

interface OpenAlgoBrokerWidgetProps {
  activeSymbol: string;
  currentPrice: number;
  onOpenBrokerModal?: () => void;
}

export const OpenAlgoBrokerWidget: React.FC<OpenAlgoBrokerWidgetProps> = ({
  activeSymbol,
  currentPrice,
  onOpenBrokerModal,
}) => {
  const [brokers, setBrokers] = useState<BrokerConfig[]>(() => openAlgoGateway.getBrokers());
  const [activeBroker, setActiveBroker] = useState<BrokerConfig>(() => openAlgoGateway.getActiveBroker());
  const [depth, setDepth] = useState<MarketDepth>(() =>
    openAlgoGateway.getMarketDepth(activeSymbol, currentPrice || 83000)
  );

  // Subscribe to gateway state changes
  useEffect(() => {
    return openAlgoGateway.subscribe(() => {
      setBrokers(openAlgoGateway.getBrokers());
      setActiveBroker(openAlgoGateway.getActiveBroker());
    });
  }, []);

  // Update market depth periodically or when price changes
  useEffect(() => {
    const updateDepth = () => {
      setDepth(openAlgoGateway.getMarketDepth(activeSymbol, currentPrice || 83000));
    };
    updateDepth();
    const timer = setInterval(updateDepth, 1500);
    return () => clearInterval(timer);
  }, [activeSymbol, currentPrice]);

  const handleSelectBroker = (id: BrokerId) => {
    openAlgoGateway.setActiveBroker(id);
    const updated = openAlgoGateway.getActiveBroker();
    setActiveBroker(updated);
    setBrokers(openAlgoGateway.getBrokers());
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto p-3.5 gap-3.5 bg-[#131722] text-[#d1d4dc] select-none font-sans">
      {/* 1. Header Banner: Active Broker Connection Status */}
      <div className="bg-[#171b26] border border-[#2a2e39] rounded-lg p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server size={15} className="text-[#2962ff]" />
            <span className="font-bold text-xs text-white uppercase tracking-wider">
              OpenAlgo Gateway
            </span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#089981]/20 text-[#089981] border border-[#089981]/40 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#089981] animate-pulse" />
            {activeBroker.name}
          </span>
        </div>

        <p className="text-[11px] text-[#787b86] leading-relaxed">
          {activeBroker.tagline}
        </p>

        {onOpenBrokerModal && (
          <button
            onClick={onOpenBrokerModal}
            className="w-full mt-1 py-1.5 rounded bg-[#1e222d] hover:bg-[#2a2e39] border border-[#2a2e39] hover:border-[#2962ff]/50 text-xs font-semibold text-white transition-all flex items-center justify-center gap-1.5"
          >
            <Key size={12} className="text-[#2962ff]" />
            <span>Manage Broker API Keys & Gateway</span>
          </button>
        )}
      </div>

      {/* 2. Broker Selector Grid */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-bold text-[#787b86] uppercase tracking-wider px-1">
          Select Active Execution Broker
        </div>

        <div className="space-y-1.5">
          {brokers.map((b) => {
            const isSelected = b.id === activeBroker.id;

            return (
              <button
                key={b.id}
                onClick={() => handleSelectBroker(b.id)}
                className={`w-full p-2.5 rounded-lg border text-left transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-[#1e222d] border-[#2962ff] ring-1 ring-[#2962ff]/40'
                    : 'bg-[#171b26] border-[#2a2e39] hover:border-[#434651]'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white">{b.name}</span>
                    {isSelected && (
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#2962ff]/20 text-[#2962ff] border border-[#2962ff]/40">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-[#787b86] truncate max-w-[220px]">
                    {b.tagline}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-1 text-[10px] font-mono">
                  {b.isConnected ? (
                    <span className="text-[#089981]">Ready</span>
                  ) : (
                    <span className="text-[#787b86]">Not Configured</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. OpenAlgo 5-Level Market Depth (DOM) Order Book */}
      <div className="bg-[#171b26] border border-[#2a2e39] rounded-lg p-3 space-y-2.5">
        <div className="flex items-center justify-between border-b border-[#2a2e39] pb-2">
          <div className="flex items-center gap-1.5">
            <Activity size={13} className="text-[#2962ff]" />
            <span className="font-bold text-xs text-white">5-Level Market Depth (DOM)</span>
          </div>
          <span className="text-[10px] font-mono text-[#787b86]">{activeSymbol}</span>
        </div>

        {/* Buy / Sell Pressure Meter */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-mono">
            <span className="text-[#089981] font-bold">
              Bids: {depth.buyPressurePercent}% ({depth.totalBuyQty.toLocaleString()})
            </span>
            <span className="text-[#f23645] font-bold">
              Asks: {100 - depth.buyPressurePercent}% ({depth.totalSellQty.toLocaleString()})
            </span>
          </div>
          <div className="w-full h-1.5 bg-[#f23645]/40 rounded-full overflow-hidden flex">
            <div
              className="bg-[#089981] h-full transition-all duration-300"
              style={{ width: `${depth.buyPressurePercent}%` }}
            />
          </div>
        </div>

        {/* DOM Table */}
        <div className="text-[11px] font-mono">
          <div className="grid grid-cols-6 text-[9px] text-[#787b86] pb-1 border-b border-[#2a2e39]">
            <span className="col-span-1 text-left">Orders</span>
            <span className="col-span-1 text-right">Qty</span>
            <span className="col-span-1 text-right text-[#089981]">Bid</span>
            <span className="col-span-1 text-left text-[#f23645] pl-2">Ask</span>
            <span className="col-span-1 text-right">Qty</span>
            <span className="col-span-1 text-right">Orders</span>
          </div>

          <div className="divide-y divide-[#2a2e39]/40">
            {depth.levels.map((lvl, idx) => (
              <div key={idx} className="grid grid-cols-6 py-1 items-center hover:bg-[#1e222d]/40">
                <span className="col-span-1 text-left text-[#787b86] text-[10px]">{lvl.bidOrders}</span>
                <span className="col-span-1 text-right text-[#d1d4dc]">{lvl.bidQty}</span>
                <span className="col-span-1 text-right text-[#089981] font-bold">
                  {formatPrice(lvl.bidPrice, 2)}
                </span>
                <span className="col-span-1 text-left text-[#f23645] font-bold pl-2">
                  {formatPrice(lvl.askPrice, 2)}
                </span>
                <span className="col-span-1 text-right text-[#d1d4dc]">{lvl.askQty}</span>
                <span className="col-span-1 text-right text-[#787b86] text-[10px]">{lvl.askOrders}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. OpenAlgo Protocol Specification Notes */}
      <div className="p-3 bg-[#171b26]/60 border border-[#2a2e39] rounded-lg text-[10px] text-[#787b86] space-y-1">
        <div className="font-semibold text-white flex items-center gap-1">
          <ShieldCheck size={12} className="text-[#089981]" />
          <span>OpenAlgo v2.4 Spec Compliance</span>
        </div>
        <p>
          Normalized schema aligns KiteConnect, Upstox API v2, and DhanHQ into a unified execution bus.
          Default routing stays on the deterministic, append-only Celsius Paper Ledger.
        </p>
      </div>
    </div>
  );
};
