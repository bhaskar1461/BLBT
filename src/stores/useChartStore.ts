import { create } from 'zustand';
import type { Candle, Timeframe, IndicatorConfig, CrosshairData } from '../types/chart';
import type { WsStatus } from '../lib/binance';
import { DEFAULT_INDICATORS } from '../services/storage';

export interface ChartDrawing {
  id: string;
  tool: string;
  color?: string;
  points: Array<{ time: number; price: number }>;
  text?: string;
}

interface ChartState {
  activeSymbol: string;
  timeframe: Timeframe;
  chartType: 'candles' | 'line';
  candles: Candle[];
  isLoading: boolean;
  indicators: IndicatorConfig;
  crosshairData: CrosshairData | null;
  connectionStatus: WsStatus;
  latencyMs: number;

  // Drawing tools state
  activeDrawingTool: string;
  isMagnetMode: boolean;
  isDrawingsLocked: boolean;
  isDrawingsHidden: boolean;
  drawings: ChartDrawing[];

  setActiveSymbol: (symbol: string) => void;
  setTimeframe: (tf: Timeframe) => void;
  setChartType: (type: 'candles' | 'line') => void;
  setCandles: (candles: Candle[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  updateCandle: (candle: Candle, isClosed: boolean) => void;
  setIndicators: (indicators: IndicatorConfig) => void;
  setCrosshairData: (data: CrosshairData | null) => void;
  setConnectionStatus: (status: WsStatus, latency?: number) => void;

  // Drawing actions
  setActiveDrawingTool: (tool: string) => void;
  setMagnetMode: (active: boolean) => void;
  setDrawingsLocked: (locked: boolean) => void;
  setDrawingsHidden: (hidden: boolean) => void;
  addDrawing: (drawing: ChartDrawing) => void;
  removeDrawing: (id: string) => void;
  clearDrawings: () => void;
}

export const useChartStore = create<ChartState>((set) => ({
  activeSymbol: 'BTCUSDT',
  timeframe: '1h',
  chartType: 'candles',
  candles: [],
  isLoading: true,
  indicators: DEFAULT_INDICATORS,
  crosshairData: null,
  connectionStatus: 'connecting',
  latencyMs: 24,

  // Default drawing state
  activeDrawingTool: 'crosshair',
  isMagnetMode: false,
  isDrawingsLocked: false,
  isDrawingsHidden: false,
  drawings: [],

  setActiveSymbol: (activeSymbol) =>
    set({ activeSymbol, candles: [], isLoading: true, drawings: [], activeDrawingTool: 'crosshair' }),
  setTimeframe: (timeframe) => set({ timeframe }),
  setChartType: (chartType) => set({ chartType }),
  setCandles: (candles) => set({ candles, isLoading: false }),
  setIsLoading: (isLoading) => set({ isLoading }),

  setActiveDrawingTool: (activeDrawingTool) => set({ activeDrawingTool }),
  setMagnetMode: (isMagnetMode) => set({ isMagnetMode }),
  setDrawingsLocked: (isDrawingsLocked) => set({ isDrawingsLocked }),
  setDrawingsHidden: (isDrawingsHidden) => set({ isDrawingsHidden }),
  addDrawing: (drawing) => set((s) => ({ drawings: [...s.drawings, drawing] })),
  removeDrawing: (id) => set((s) => ({ drawings: s.drawings.filter((d) => d.id !== id) })),
  clearDrawings: () => set({ drawings: [], activeDrawingTool: 'crosshair' }),

  updateCandle: (candle, _isClosed) =>
    set((state) => {
      const prev = state.candles;
      if (prev.length === 0) return { candles: [candle] };
      const last = prev[prev.length - 1];

      if (last.time === candle.time) {
        const copy = [...prev];
        copy[copy.length - 1] = candle;
        return { candles: copy };
      } else if (candle.time > last.time) {
        const next = [...prev, candle];
        return { candles: next.length > 1000 ? next.slice(-1000) : next };
      } else {
        const existingIdx = prev.findIndex((c) => c.time === candle.time);
        if (existingIdx !== -1) {
          const copy = [...prev];
          copy[existingIdx] = candle;
          return { candles: copy };
        }
        const next = [...prev, candle].sort((a, b) => a.time - b.time);
        return { candles: next.length > 1000 ? next.slice(-1000) : next };
      }
    }),

  setIndicators: (indicators) => set({ indicators }),
  setCrosshairData: (crosshairData) => set({ crosshairData }),
  setConnectionStatus: (connectionStatus, latencyMs) =>
    set((state) => ({
      connectionStatus,
      latencyMs: latencyMs !== undefined ? latencyMs : state.latencyMs,
    })),
}));
