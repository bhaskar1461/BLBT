import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, precision = 2): string {
  if (isNaN(price)) return '0.00';
  if (price < 0.0001) return price.toFixed(8);
  if (price < 1) return price.toFixed(4);
  return price.toLocaleString('en-US', {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  });
}

export function formatNumber(num: number, decimals = 2): string {
  if (isNaN(num)) return '0';
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(decimals) + 'B';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(decimals) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(decimals) + 'K';
  return num.toFixed(decimals);
}

/**
 * Format USDT amount into Indian Rupees (INR) with Crores (Cr) and Lakhs (L) notation.
 * Exchange rate: 1 USDT ~ 83.333333 INR -> 576,000 USDT = 48,000,000 INR = 4.80 Crore.
 */
export function formatInrCrore(usdtValue: number): string {
  if (isNaN(usdtValue) || usdtValue <= 0) return '₹0.00';
  const inr = usdtValue * 83.33333333;
  if (inr >= 10_000_000) {
    const crore = inr / 10_000_000;
    return `₹${crore.toFixed(2)} Cr`;
  }
  if (inr >= 100_000) {
    const lakh = inr / 100_000;
    return `₹${lakh.toFixed(2)} L`;
  }
  return `₹${Math.round(inr).toLocaleString('en-IN')}`;
}

/**
 * Format USDT value into Indian Rupees with full en-IN comma separation.
 */
export function formatInrExact(usdtValue: number): string {
  if (isNaN(usdtValue)) return '₹0';
  const inr = Math.round(usdtValue * 83.33333333);
  const prefix = inr < 0 ? '-' : '';
  return `${prefix}₹${Math.abs(inr).toLocaleString('en-IN')}`;
}

/**
 * Format USDT value into Indian Crore / Lakh short notation with optional sign.
 */
export function formatInrShort(usdtValue: number, showSign = false): string {
  if (isNaN(usdtValue)) return '₹0.00';
  const sign = usdtValue < 0 ? '-' : (showSign && usdtValue > 0 ? '+' : '');
  const absUsdt = Math.abs(usdtValue);
  const inr = absUsdt * 83.33333333;
  if (inr >= 10_000_000) {
    return `${sign}₹${(inr / 10_000_000).toFixed(2)} Cr`;
  }
  if (inr >= 100_000) {
    return `${sign}₹${(inr / 100_000).toFixed(2)} L`;
  }
  return `${sign}₹${Math.round(inr).toLocaleString('en-IN')}`;
}


