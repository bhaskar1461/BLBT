'use client';

import React from 'react';
import { useChartStore } from '@/stores/useChartStore';
import { formatPrice, formatNumber } from '@/lib/utils';
import { getSymbolInfo } from '@/services/symbols';

export const CandleSeries: React.FC = () => {
  const activeSymbol = useChartStore((s) => s.activeSymbol);
  const candles = useChartStore((s) => s.candles);
  const crosshair = useChartStore((s) => s.crosshairData);
  const symbolInfo = getSymbolInfo(activeSymbol);

  const latest = candles[candles.length - 1];
  const d = crosshair || (latest ? {
    open: latest.open,
    high: latest.high,
    low: latest.low,
    close: latest.close,
    volume: latest.volume,
    change: latest.close - latest.open,
    changePercent: latest.open > 0 ? ((latest.close - latest.open) / latest.open) * 100 : 0,
  } : null);

  if (!d) return null;
  const isBull = (d.change ?? 0) >= 0;

  return (
    <div className="flex items-center gap-3 font-mono text-[11px] select-none">
      <span className="font-semibold text-main">{activeSymbol}</span>
      <span>O <b className={isBull ? 'text-bull' : 'text-bear'}>{formatPrice(d.open ?? 0, symbolInfo.pricePrecision)}</b></span>
      <span>H <b className={isBull ? 'text-bull' : 'text-bear'}>{formatPrice(d.high ?? 0, symbolInfo.pricePrecision)}</b></span>
      <span>L <b className={isBull ? 'text-bull' : 'text-bear'}>{formatPrice(d.low ?? 0, symbolInfo.pricePrecision)}</b></span>
      <span>C <b className={isBull ? 'text-bull' : 'text-bear'}>{formatPrice(d.close ?? 0, symbolInfo.pricePrecision)}</b></span>
      <span>Vol <b className="text-muted">{formatNumber(d.volume ?? 0)}</b></span>
      <span>Change <b className={isBull ? 'text-bull' : 'text-bear'}>{isBull ? '+' : ''}{(d.changePercent ?? 0).toFixed(2)}%</b></span>
    </div>
  );
};
