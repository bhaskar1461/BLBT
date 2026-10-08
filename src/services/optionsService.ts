// src/services/optionsService.ts
// Mathematical Options Engine: Black-Scholes, Greeks, Implied Volatility, Open Interest, PCR, and Max Pain
// Inspired by OpenBull (marketcalls/openbull) Indian Options Architecture

export interface OptionStrikeData {
  strikePrice: number;
  // Call Side
  callLtp: number;
  callChange: number;
  callChangePercent: number;
  callVolume: number;
  callOi: number;
  callOiChange: number;
  callIv: number; // in %
  callDelta: number;
  callGamma: number;
  callTheta: number;
  callVega: number;
  // Put Side
  putLtp: number;
  putChange: number;
  putChangePercent: number;
  putVolume: number;
  putOi: number;
  putOiChange: number;
  putIv: number; // in %
  putDelta: number;
  putGamma: number;
  putTheta: number;
  putVega: number;
  // Classification
  isAtm: boolean;
  isCallItm: boolean;
  isPutItm: boolean;
}

export interface OptionChainSummary {
  underlyingSymbol: string;
  underlyingPrice: number;
  expiryDate: string;
  daysToExpiry: number;
  pcr: number; // Put Call Ratio
  pcrSentiment: 'Extremely Bullish' | 'Bullish' | 'Neutral' | 'Bearish' | 'Extremely Bearish';
  maxPainStrike: number;
  totalCallOi: number;
  totalPutOi: number;
  highestCallOiStrike: number;
  highestPutOiStrike: number;
  strikes: OptionStrikeData[];
}

// Standard Normal CDF approximation (Abramowitz & Stegun)
function normalCdf(x: number): number {
  const b1 = 0.31938153;
  const b2 = -0.356563782;
  const b3 = 1.781477937;
  const b4 = -1.821255978;
  const b5 = 1.330274429;
  const p = 0.2316419;
  const c2 = 0.39894228;

  if (x >= 0.0) {
    const t = 1.0 / (1.0 + p * x);
    return 1.0 - c2 * Math.exp((-x * x) / 2.0) * t * (t * (t * (t * (t * b5 + b4) + b3) + b2) + b1);
  } else {
    const t = 1.0 / (1.0 - p * x);
    return c2 * Math.exp((-x * x) / 2.0) * t * (t * (t * (t * (t * b5 + b4) + b3) + b2) + b1);
  }
}

// Standard Normal PDF
function normalPdf(x: number): number {
  return (1.0 / Math.sqrt(2.0 * Math.PI)) * Math.exp(-0.5 * x * x);
}

// Black-Scholes Greeks Calculator
export function calculateGreeks(
  spotPrice: number,
  strikePrice: number,
  daysToExpiry: number,
  impliedVolPercent: number = 18,
  riskFreeRate: number = 0.065 // 6.5% standard Indian RBI repo/treasury proxy
) {
  const T = Math.max(0.001, daysToExpiry / 365);
  const sigma = impliedVolPercent / 100;
  const r = riskFreeRate;
  const S = spotPrice;
  const K = strikePrice;

  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);

  const callDelta = normalCdf(d1);
  const putDelta = callDelta - 1;

  const gamma = normalPdf(d1) / (S * sigma * Math.sqrt(T));
  const vega = (S * Math.sqrt(T) * normalPdf(d1)) / 100; // per 1% change in vol

  const callTheta =
    (-((S * normalPdf(d1) * sigma) / (2 * Math.sqrt(T))) -
      r * K * Math.exp(-r * T) * normalCdf(d2)) /
    365;
  const putTheta =
    (-((S * normalPdf(d1) * sigma) / (2 * Math.sqrt(T))) +
      r * K * Math.exp(-r * T) * normalCdf(-d2)) /
    365;

  return {
    callDelta,
    putDelta,
    gamma,
    vega,
    callTheta,
    putTheta,
  };
}

// Generate Realistic Indian & Global Option Chains
export function getOptionChain(
  symbol: string,
  spotPrice: number,
  expiryIndex: number = 0
): OptionChainSummary {
  // Determine strike step & range
  let step = 50;
  let strikeCount = 13;
  if (symbol.includes('BANKNIFTY')) {
    step = 100;
    strikeCount = 15;
  } else if (symbol.includes('SENSEX')) {
    step = 100;
    strikeCount = 15;
  } else if (symbol.includes('BTC')) {
    step = 1000;
    strikeCount = 13;
  } else if (spotPrice > 1000) {
    step = 50;
    strikeCount = 11;
  } else {
    step = 10;
    strikeCount = 11;
  }

  // Find Nearest ATM Strike
  const roundedSpot = Math.round(spotPrice / step) * step;
  const halfCount = Math.floor(strikeCount / 2);
  const minStrike = roundedSpot - halfCount * step;

  // Expiries (Weekly Thursdays for Indian markets)
  const expiries = ['15-OCT-2026 (Weekly)', '22-OCT-2026 (Weekly)', '29-OCT-2026 (Monthly)', '26-NOV-2026 (Monthly)'];
  const expiryDate = expiries[expiryIndex] || expiries[0];
  const daysToExpiry = (expiryIndex + 1) * 7;

  const strikes: OptionStrikeData[] = [];
  let totalCallOi = 0;
  let totalPutOi = 0;

  for (let i = 0; i < strikeCount; i++) {
    const strike = minStrike + i * step;
    const isAtm = strike === roundedSpot;
    const isCallItm = spotPrice > strike;
    const isPutItm = spotPrice < strike;

    // IV curve with realistic smile
    const moneyness = Math.abs(spotPrice - strike) / spotPrice;
    const baseIv = 14.5 + moneyness * 30; // smile
    const callIv = parseFloat(baseIv.toFixed(1));
    const putIv = parseFloat((baseIv * 1.05).toFixed(1));

    const greeks = calculateGreeks(spotPrice, strike, daysToExpiry, baseIv);

    // Realistic theoretical price + premium
    const intrinsicCall = Math.max(0, spotPrice - strike);
    const intrinsicPut = Math.max(0, strike - spotPrice);
    const timeValue = Math.max(12, (spotPrice * (baseIv / 100) * Math.sqrt(daysToExpiry / 365)) / 2.5);

    const callLtp = parseFloat((intrinsicCall + timeValue * (1 - (strike - roundedSpot) / (step * 10))).toFixed(2));
    const putLtp = parseFloat((intrinsicPut + timeValue * (1 + (strike - roundedSpot) / (step * 10))).toFixed(2));

    // OI modeling (Call OI peaks at resistance above ATM, Put OI peaks at support below ATM)
    const distFromAtm = (strike - roundedSpot) / step;
    const callOiBase = Math.max(12000, Math.round(180000 * Math.exp(-0.5 * Math.pow((distFromAtm - 2) / 2.5, 2))));
    const putOiBase = Math.max(14000, Math.round(195000 * Math.exp(-0.5 * Math.pow((distFromAtm + 2) / 2.5, 2))));

    const callOi = callOiBase;
    const putOi = putOiBase;
    totalCallOi += callOi;
    totalPutOi += putOi;

    strikes.push({
      strikePrice: strike,
      callLtp: Math.max(0.5, callLtp),
      callChange: isCallItm ? 18.5 : -12.4,
      callChangePercent: isCallItm ? 4.2 : -8.5,
      callVolume: Math.round(callOi * 0.45),
      callOi,
      callOiChange: distFromAtm >= 0 ? 14200 : -5200,
      callIv,
      callDelta: parseFloat(greeks.callDelta.toFixed(3)),
      callGamma: parseFloat(greeks.gamma.toFixed(5)),
      callTheta: parseFloat(greeks.callTheta.toFixed(2)),
      callVega: parseFloat(greeks.vega.toFixed(2)),
      putLtp: Math.max(0.5, putLtp),
      putChange: isPutItm ? 24.0 : -16.2,
      putChangePercent: isPutItm ? 6.1 : -11.4,
      putVolume: Math.round(putOi * 0.42),
      putOi,
      putOiChange: distFromAtm <= 0 ? 18400 : -3100,
      putIv,
      putDelta: parseFloat(greeks.putDelta.toFixed(3)),
      putGamma: parseFloat(greeks.gamma.toFixed(5)),
      putTheta: parseFloat(greeks.putTheta.toFixed(2)),
      putVega: parseFloat(greeks.vega.toFixed(2)),
      isAtm,
      isCallItm,
      isPutItm,
    });
  }

  // Calculate Put-Call Ratio
  const pcr = parseFloat((totalPutOi / (totalCallOi || 1)).toFixed(2));
  let pcrSentiment: OptionChainSummary['pcrSentiment'] = 'Neutral';
  if (pcr > 1.3) pcrSentiment = 'Extremely Bullish';
  else if (pcr > 1.0) pcrSentiment = 'Bullish';
  else if (pcr < 0.7) pcrSentiment = 'Extremely Bearish';
  else if (pcr < 0.9) pcrSentiment = 'Bearish';

  // Calculate Max Pain: strike that minimizes total payout to option buyers
  let minLoss = Infinity;
  let maxPainStrike = roundedSpot;
  for (const s of strikes) {
    let totalLoss = 0;
    for (const other of strikes) {
      const callLoss = Math.max(0, s.strikePrice - other.strikePrice) * other.callOi;
      const putLoss = Math.max(0, other.strikePrice - s.strikePrice) * other.putOi;
      totalLoss += callLoss + putLoss;
    }
    if (totalLoss < minLoss) {
      minLoss = totalLoss;
      maxPainStrike = s.strikePrice;
    }
  }

  // Identify highest OI walls
  const highestCallOiStrike = [...strikes].sort((a, b) => b.callOi - a.callOi)[0]?.strikePrice ?? roundedSpot;
  const highestPutOiStrike = [...strikes].sort((a, b) => b.putOi - a.putOi)[0]?.strikePrice ?? roundedSpot;

  return {
    underlyingSymbol: symbol,
    underlyingPrice: spotPrice,
    expiryDate,
    daysToExpiry,
    pcr,
    pcrSentiment,
    maxPainStrike,
    totalCallOi,
    totalPutOi,
    highestCallOiStrike,
    highestPutOiStrike,
    strikes,
  };
}
