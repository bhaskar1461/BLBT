'use client';

import React from 'react';
import { useChartStore } from '@/stores/useChartStore';
import { Badge } from '@/components/ui/badge';

export const IndicatorOverlays: React.FC = () => {
  const indicators = useChartStore((s) => s.indicators);
  const setIndicators = useChartStore((s) => s.setIndicators);

  return (
    <div className="flex items-center gap-1.5 font-mono text-[10px]">
      {indicators.ema.enabled9 && (
        <Badge
          variant="outline"
          className="cursor-pointer text-cyan-400 border-cyan-500/40"
          onClick={() =>
            setIndicators({
              ...indicators,
              ema: { ...indicators.ema, enabled9: false },
            })
          }
          title="Click to hide EMA 9"
        >
          EMA 9
        </Badge>
      )}

      {indicators.ema.enabled21 && (
        <Badge
          variant="outline"
          className="cursor-pointer text-yellow-400 border-yellow-500/40"
          onClick={() =>
            setIndicators({
              ...indicators,
              ema: { ...indicators.ema, enabled21: false },
            })
          }
          title="Click to hide EMA 21"
        >
          EMA 21
        </Badge>
      )}

      {indicators.ema.enabled50 && (
        <Badge
          variant="outline"
          className="cursor-pointer text-purple-400 border-purple-500/40"
          onClick={() =>
            setIndicators({
              ...indicators,
              ema: { ...indicators.ema, enabled50: false },
            })
          }
          title="Click to hide EMA 50"
        >
          EMA 50
        </Badge>
      )}

      {indicators.ema.enabled200 && (
        <Badge
          variant="outline"
          className="cursor-pointer text-red-500 border-red-500/40"
          onClick={() =>
            setIndicators({
              ...indicators,
              ema: { ...indicators.ema, enabled200: false },
            })
          }
          title="Click to hide EMA 200"
        >
          EMA 200
        </Badge>
      )}

      {indicators.sma.enabled20 && (
        <Badge
          variant="outline"
          className="cursor-pointer text-lime-400 border-lime-500/40"
          onClick={() =>
            setIndicators({
              ...indicators,
              sma: { ...indicators.sma, enabled20: false },
            })
          }
          title="Click to hide SMA 20"
        >
          SMA 20
        </Badge>
      )}
    </div>
  );
};
