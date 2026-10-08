/**
 * Server-Side Integer Financial Units & Wei-style Arithmetic
 *
 * Invariant Rule:
 * All paper-trading balances, orders, and positions are computed using integer base units.
 * Scale is 8 decimals (1 USDT = 100,000,000 base units, 1 BTC = 100,000,000 satoshis).
 * Never use floating-point numbers in server-side financial calculations.
 */

export const UNIT_DECIMALS = 8;
export const SCALE = 100_000_000n; // 10^8

// Default 10,000 USDT = 10,000 * 10^8 = 1,000,000,000,000 base units
export const DEFAULT_PAPER_BALANCE_UNITS = 1_000_000_000_000n;

// Flat 0.1% fee = 10 / 10,000 = 1 / 1,000
export const FEE_BPS = 10n; // 10 basis points = 0.10%
export const BPS_DIVISOR = 10_000n;

/**
 * Convert human decimal string or number to integer base units
 */
export function toBaseUnits(val: number | string): bigint {
  if (typeof val === 'number') {
    if (isNaN(val) || !isFinite(val)) return 0n;
    // Format to fixed 8 decimals to avoid IEEE 754 float glitches before parsing
    val = val.toFixed(UNIT_DECIMALS);
  }

  const str = val.trim();
  if (!str) return 0n;

  const parts = str.split('.');
  const wholeStr = parts[0] || '0';
  const fracStr = (parts[1] || '').padEnd(UNIT_DECIMALS, '0').slice(0, UNIT_DECIMALS);

  const isNeg = wholeStr.startsWith('-');
  const absWhole = isNeg ? wholeStr.slice(1) : wholeStr;

  const raw = BigInt(absWhole) * SCALE + BigInt(fracStr);
  return isNeg ? -raw : raw;
}

/**
 * Convert integer base units to floating number for rendering / display
 */
export function fromBaseUnits(units: bigint | string | number): number {
  const b = typeof units === 'bigint' ? units : BigInt(units || 0);
  return Number(b) / Number(SCALE);
}

/**
 * Format integer base units as fixed decimal display string
 */
export function formatBaseUnits(units: bigint | string | number, decimals: number = 2): string {
  const b = typeof units === 'bigint' ? units : BigInt(units || 0);
  const isNeg = b < 0n;
  const abs = isNeg ? -b : b;

  const whole = abs / SCALE;
  const frac = abs % SCALE;

  const fracStr = frac.toString().padStart(UNIT_DECIMALS, '0').slice(0, decimals);
  const sign = isNeg ? '-' : '';

  if (decimals === 0) {
    return `${sign}${whole.toLocaleString('en-US')}`;
  }

  return `${sign}${whole.toLocaleString('en-US')}.${fracStr}`;
}

/**
 * Calculate total quote cost in integer units
 * cost_units = (quantity_units * price_units) / SCALE
 */
export function calcCostUnits(quantityUnits: bigint, priceUnits: bigint): bigint {
  if (quantityUnits <= 0n || priceUnits <= 0n) return 0n;
  return (quantityUnits * priceUnits) / SCALE;
}

/**
 * Calculate flat 0.1% fee in integer units
 * fee_units = (cost_units * FEE_BPS) / BPS_DIVISOR
 */
export function calcFeeUnits(costUnits: bigint): bigint {
  if (costUnits <= 0n) return 0n;
  return (costUnits * FEE_BPS) / BPS_DIVISOR;
}

/**
 * Calculate Realized or Unrealized P&L in integer units
 * Long: ((markPrice - entryPrice) * quantity) / SCALE
 * Short: ((entryPrice - markPrice) * quantity) / SCALE
 */
export function calcPnlUnits(
  side: 'long' | 'short',
  entryPriceUnits: bigint,
  markPriceUnits: bigint,
  quantityUnits: bigint
): bigint {
  if (quantityUnits <= 0n) return 0n;

  const priceDiffUnits = side === 'long'
    ? markPriceUnits - entryPriceUnits
    : entryPriceUnits - markPriceUnits;

  return (priceDiffUnits * quantityUnits) / SCALE;
}
