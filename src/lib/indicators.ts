import type { Candle } from '../types/chart';

export interface IndicatorPoint {
  time: number;
  value: number;
}

export interface MacdPoint {
  time: number;
  macd: number;
  signal: number;
  histogram: number;
}

/**
 * Pure function: Calculate Simple Moving Average (SMA)
 */
export function calculateSMA(candles: Candle[], period: number): IndicatorPoint[] {
  const result: IndicatorPoint[] = [];
  if (candles.length < period) return result;

  for (let i = period - 1; i < candles.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += candles[i - j].close;
    }
    result.push({
      time: candles[i].time,
      value: Number((sum / period).toFixed(6)),
    });
  }

  return result;
}

/**
 * Pure function: Calculate Exponential Moving Average (EMA)
 */
export function calculateEMA(candles: Candle[], period: number): IndicatorPoint[] {
  const result: IndicatorPoint[] = [];
  if (candles.length < period) return result;

  const multiplier = 2 / (period + 1);

  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += candles[i].close;
  }
  let prevEma = sum / period;

  result.push({
    time: candles[period - 1].time,
    value: Number(prevEma.toFixed(6)),
  });

  for (let i = period; i < candles.length; i++) {
    const currentClose = candles[i].close;
    const currentEma = (currentClose - prevEma) * multiplier + prevEma;
    result.push({
      time: candles[i].time,
      value: Number(currentEma.toFixed(6)),
    });
    prevEma = currentEma;
  }

  return result;
}

/**
 * Pure function: Calculate Relative Strength Index (RSI) using Wilder's smoothing
 */
export function calculateRSI(candles: Candle[], period = 14): IndicatorPoint[] {
  const result: IndicatorPoint[] = [];
  if (candles.length <= period) return result;

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const change = candles[i].close - candles[i - 1].close;
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  let rsi = 100 - 100 / (1 + rs);

  result.push({
    time: candles[period].time,
    value: Number(rsi.toFixed(2)),
  });

  for (let i = period + 1; i < candles.length; i++) {
    const change = candles[i].close - candles[i - 1].close;
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi = 100 - 100 / (1 + rs);

    result.push({
      time: candles[i].time,
      value: Number(rsi.toFixed(2)),
    });
  }

  return result;
}

/**
 * Pure function: Calculate MACD (Fast, Slow, Signal)
 */
export function calculateMACD(
  candles: Candle[],
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9
): MacdPoint[] {
  const result: MacdPoint[] = [];
  if (candles.length < slowPeriod + signalPeriod) return result;

  const fastEma = calculateEMA(candles, fastPeriod);
  const slowEma = calculateEMA(candles, slowPeriod);

  const slowTimeMap = new Map<number, number>();
  slowEma.forEach((p) => slowTimeMap.set(p.time, p.value));

  const macdLinePoints: { time: number; value: number }[] = [];
  for (const fast of fastEma) {
    const slowVal = slowTimeMap.get(fast.time);
    if (slowVal !== undefined) {
      macdLinePoints.push({
        time: fast.time,
        value: fast.value - slowVal,
      });
    }
  }

  if (macdLinePoints.length < signalPeriod) return result;

  const multiplier = 2 / (signalPeriod + 1);
  let sum = 0;
  for (let i = 0; i < signalPeriod; i++) {
    sum += macdLinePoints[i].value;
  }
  let prevSignal = sum / signalPeriod;

  const firstMacd = macdLinePoints[signalPeriod - 1];
  result.push({
    time: firstMacd.time,
    macd: Number(firstMacd.value.toFixed(6)),
    signal: Number(prevSignal.toFixed(6)),
    histogram: Number((firstMacd.value - prevSignal).toFixed(6)),
  });

  for (let i = signalPeriod; i < macdLinePoints.length; i++) {
    const currentMacd = macdLinePoints[i].value;
    const currentSignal = (currentMacd - prevSignal) * multiplier + prevSignal;
    result.push({
      time: macdLinePoints[i].time,
      macd: Number(currentMacd.toFixed(6)),
      signal: Number(currentSignal.toFixed(6)),
      histogram: Number((currentMacd - currentSignal).toFixed(6)),
    });
    prevSignal = currentSignal;
  }

  return result;
}
