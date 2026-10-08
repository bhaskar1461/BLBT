'use client';

import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

/**
 * Authentic TradingView Top-Left Monogram Logo (17 / TV Mark)
 */
export const TradingViewLogo: React.FC<IconProps> = ({ size = 28, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
  >
    <path
      d="M4 19.5V8.5C4 7.67 4.67 7 5.5 7H10.5C11.33 7 12 7.67 12 8.5V19.5C12 20.33 11.33 21 10.5 21H5.5C4.67 21 4 20.33 4 19.5Z"
      fill="#ffffff"
    />
    <path
      d="M16 19.5V13.5C16 12.67 16.67 12 17.5 12H22.5C23.33 12 24 12.67 24 13.5V19.5C24 20.33 23.33 21 22.5 21H17.5C16.67 21 16 20.33 16 19.5Z"
      fill="#ffffff"
    />
    <path
      d="M16 8.5C16 7.67 16.67 7 17.5 7H22.5C23.33 7 24 7.67 24 8.5V9.5C24 10.33 23.33 11 22.5 11H17.5C16.67 11 16 10.33 16 9.5V8.5Z"
      fill="#ffffff"
    />
  </svg>
);

/**
 * ₿ Bitcoin (BTC) Vector Token Badge
 */
export const BitcoinIcon: React.FC<IconProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
  >
    <circle cx="16" cy="16" r="16" fill="#F7931A" />
    <path
      d="M22.8 13.7c.3-2.1-1.3-3.2-3.5-3.9l.7-2.9-1.8-.4-.7 2.8c-.5-.1-1-.2-1.5-.3l.7-2.8-1.8-.4-.7 2.9c-.4-.1-.8-.2-1.2-.3l-2.4-.6-.5 1.9s1.3.3 1.3.3c.7.2.8.7.8 1.1l-.8 3.3c.1 0 .1 0 .2.1l-.2-.1-1.1 4.6c-.1.2-.3.6-.8.4 0 0-1.3-.3-1.3-.3l-.9 2 2.3.6c.4.1.8.2 1.3.3l-.7 3 1.8.4.7-2.9c.5.1 1 .2 1.5.3l-.7 2.9 1.8.4.7-2.9c3.1.6 5.4.3 6.4-2.4.8-2.2 0-3.5-1.6-4.3 1.1-.3 2-1 2.2-2.5zm-3.9 5.3c-.6 2.3-4.5 1.1-5.8.7l1-4.2c1.3.3 5.4 1 4.8 3.5zm.6-5.4c-.5 2.1-3.8 1-4.9.7l.9-3.8c1.1.3 4.5.8 4 3.1z"
      fill="#FFFFFF"
    />
  </svg>
);

/**
 * Ξ Ethereum (ETH) Vector Token Badge
 */
export const EthereumIcon: React.FC<IconProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
  >
    <circle cx="16" cy="16" r="16" fill="#627EEA" />
    <g fill="#FFFFFF" fillRule="evenodd">
      <path d="M16 4v9.54l8.06 3.69L16 4z" fillOpacity=".6" />
      <path d="M16 4L7.94 17.23 16 13.54V4z" />
      <path d="M16 22.42v5.57l8.07-11.23L16 22.42z" fillOpacity=".6" />
      <path d="M16 27.99v-5.57L7.94 16.76 16 27.99z" />
      <path d="M16 20.89l8.06-3.66L16 13.54v7.35z" fillOpacity=".2" />
      <path d="M7.94 17.23l8.06 3.66v-7.35l-8.06 3.69z" fillOpacity=".6" />
    </g>
  </svg>
);

/**
 * 🟡 BNB (Binance Coin) Vector Token Badge
 */
export const BnbIcon: React.FC<IconProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
  >
    <circle cx="16" cy="16" r="16" fill="#F3BA2F" />
    <path
      d="M12.12 13.91L16 10.03l3.88 3.88 2.05-2.05L16 6 10.07 11.93l2.05 1.98zm-6.12 2.09l2.05-2.05 2.05 2.05-2.05 2.05L6 16zm6.12 2.09L16 21.97l3.88-3.88 2.05 2.05L16 26l-5.93-5.93 2.05-2.07zm9.88-2.09l2.05-2.05 2.05 2.05-2.05 2.05-2.05-2.05zm-3.94 0L16 13.97l-2.06 2.03 2.06 2.06 2.06-2.06z"
      fill="#FFFFFF"
    />
  </svg>
);

/**
 * 🌊 Solana (SOL) Vector Token Badge
 */
export const SolanaIcon: React.FC<IconProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
  >
    <circle cx="16" cy="16" r="16" fill="#0b0e14" />
    <path
      d="M9.2 21.6c.1-.1.3-.2.5-.2h14c.2 0 .4.1.5.3.1.2.1.4-.1.5l-2.9 2.9c-.1.1-.3.2-.5.2h-14c-.2 0-.4-.1-.5-.3-.1-.2-.1-.4.1-.5l2.9-2.9zm13.6-7.8c-.1-.1-.3-.2-.5-.2h-14c-.2 0-.4.1-.5.3-.1.2-.1.4.1.5l2.9 2.9c.1.1.3.2.5.2h14c.2 0 .4-.1.5-.3.1-.2.1-.4-.1-.5l-2.9-2.9zM9.2 6.6c.1-.1.3-.2.5-.2h14c.2 0 .4.1.5.3.1.2.1.4-.1.5l-2.9 2.9c-.1.1-.3.2-.5.2h-14c-.2 0-.4-.1-.5-.3-.1-.2-.1-.4.1-.5l2.9-2.9z"
      fill="url(#sol_grad)"
    />
    <defs>
      <linearGradient id="sol_grad" x1="6.8" y1="6.4" x2="24.8" y2="25.3" gradientUnits="userSpaceOnUse">
        <stop stopColor="#00FFA3" />
        <stop offset="1" stopColor="#DC1FFF" />
      </linearGradient>
    </defs>
  </svg>
);

/**
 * ✕ XRP Vector Token Badge
 */
export const XrpIcon: React.FC<IconProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
  >
    <circle cx="16" cy="16" r="16" fill="#23292F" />
    <path
      d="M24.7 8h2.3l-5.8 5.7c-2.9 2.8-7.5 2.8-10.4 0L5 8h2.3l4.7 4.6c1.6 1.6 4.3 1.6 5.9 0L24.7 8zM7.3 24H5l5.8-5.7c2.9-2.8 7.5-2.8 10.4 0l5.8 5.7h-2.3l-4.7-4.6c-1.6-1.6-4.3-1.6-5.9 0L7.3 24z"
      fill="#FFFFFF"
    />
  </svg>
);

/**
 * 🐕 Dogecoin (DOGE) Vector Token Badge
 */
export const DogeIcon: React.FC<IconProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
  >
    <circle cx="16" cy="16" r="16" fill="#C2A633" />
    <path
      d="M12 9h5.8c3.9 0 7.2 2.9 7.2 7s-3.3 7-7.2 7H12V9zm4 10.8h1.6c2.2 0 3.8-1.5 3.8-3.8s-1.6-3.8-3.8-3.8H16v7.6zm-5-3.3h5v-1h-5v1z"
      fill="#FFFFFF"
    />
  </svg>
);

/**
 * 💧 SUI Vector Token Badge
 */
export const SuiIcon: React.FC<IconProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
  >
    <circle cx="16" cy="16" r="16" fill="#2A82E4" />
    <path
      d="M16 6c-3.8 5-7 9.8-7 13.5 0 3.9 3.1 6.5 7 6.5s7-2.6 7-6.5C23 15.8 19.8 11 16 6zm0 17.5c-2.5 0-4.5-1.8-4.5-4.2 0-2.3 2-5.7 4.5-9 2.5 3.3 4.5 6.7 4.5 9 0 2.4-2 4.2-4.5 4.2z"
      fill="#FFFFFF"
    />
  </svg>
);

/**
 * 50 Nifty 50 (NIFTY) Vector Index Badge (NSE Style)
 */
export const Nifty50Icon: React.FC<IconProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
  >
    <circle cx="16" cy="16" r="16" fill="#1A237E" />
    <text
      x="16"
      y="21"
      textAnchor="middle"
      fill="#FFFFFF"
      fontSize="13"
      fontFamily="system-ui, -apple-system, sans-serif"
      fontWeight="900"
      letterSpacing="-0.5"
    >
      50
    </text>
  </svg>
);

/**
 * 🏦 Bank Nifty (BANKNIFTY) Vector Index Badge
 */
export const BankNiftyIcon: React.FC<IconProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
  >
    <circle cx="16" cy="16" r="16" fill="#283593" />
    <path
      d="M16 7L8 11v2h16v-2l-8-4zm-6 8v6h2v-6h-2zm5 0v6h2v-6h-2zm5 0v6h2v-6h-2zM7 23v2h18v-2H7z"
      fill="#FFFFFF"
    />
  </svg>
);

/**
 * 🏛 BSE Sensex (SENSEX) Vector Index Badge (Bombay Stock Exchange)
 */
export const SensexIcon: React.FC<IconProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
  >
    <circle cx="16" cy="16" r="16" fill="#006699" />
    <path
      d="M9 16c0-3.9 3.1-7 7-7s7 3.1 7 7-3.1 7-7 7-7-3.1-7-7zm5-4.5v9h2.5c1.8 0 3.2-1.2 3.2-2.8 0-1-.6-1.9-1.6-2.3.8-.4 1.3-1.2 1.3-2 0-1.2-1-1.9-2.5-1.9H14zm1.5 1.3h1c.8 0 1.3.4 1.3 1s-.5 1-1.3 1h-1v-2zm0 3.3h1.2c.9 0 1.5.5 1.5 1.2s-.6 1.2-1.5 1.2H15.5v-2.4z"
      fill="#FFFFFF"
    />
  </svg>
);

/**
 * 💻 Nifty IT (CNXIT) Vector Index Badge
 */
export const CnxItIcon: React.FC<IconProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
  >
    <circle cx="16" cy="16" r="16" fill="#00838F" />
    <text
      x="16"
      y="21"
      textAnchor="middle"
      fill="#FFFFFF"
      fontSize="11"
      fontFamily="monospace"
      fontWeight="900"
    >
      IT
    </text>
  </svg>
);

/**
 * 🇺🇸 S&P 500 (SPX) Vector Index Badge
 */
export const SpxIcon: React.FC<IconProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
  >
    <circle cx="16" cy="16" r="16" fill="#D32F2F" />
    <text
      x="16"
      y="21"
      textAnchor="middle"
      fill="#FFFFFF"
      fontSize="10"
      fontFamily="system-ui, sans-serif"
      fontWeight="900"
      letterSpacing="-0.5"
    >
      500
    </text>
  </svg>
);

/**
 * 🏭 Reliance Industries (RELIANCE) Vector Stock Badge
 */
export const RelianceIcon: React.FC<IconProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
  >
    <circle cx="16" cy="16" r="16" fill="#B71C1C" />
    <text
      x="16"
      y="21.5"
      textAnchor="middle"
      fill="#FFD700"
      fontSize="14"
      fontFamily="Georgia, serif"
      fontWeight="bold"
    >
      R
    </text>
  </svg>
);

/**
 * 🔺 Axis Bank (AXISBANK) Vector Stock Badge
 */
export const AxisBankIcon: React.FC<IconProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
  >
    <circle cx="16" cy="16" r="16" fill="#8A1538" />
    <path d="M16 8L8 24h6.5l4-8 4 8H24L16 8z" fill="#FFFFFF" />
  </svg>
);

/**
 * 🟦 HDFC Bank (HDFCBANK) Vector Stock Badge
 */
export const HdfcBankIcon: React.FC<IconProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
  >
    <circle cx="16" cy="16" r="16" fill="#004C8F" />
    <rect x="9" y="9" width="14" height="14" fill="#FFFFFF" rx="2" />
    <rect x="11" y="11" width="10" height="10" fill="#ED1C24" />
    <rect x="13.5" y="11" width="5" height="10" fill="#004C8F" />
    <rect x="11" y="13.5" width="10" height="5" fill="#004C8F" />
    <rect x="13.5" y="13.5" width="5" height="5" fill="#FFFFFF" />
  </svg>
);

/**
 * 🟠 ICICI Bank (ICICIBANK) Vector Stock Badge
 */
export const IciciBankIcon: React.FC<IconProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
  >
    <circle cx="16" cy="16" r="16" fill="#B33925" />
    <path
      d="M16 7c-4.9 0-9 4.1-9 9s4.1 9 9 9 9-4.1 9-9-4.1-9-9-9zm-1.5 4h3v3h-3v-3zm0 5h3v7h-3v-7z"
      fill="#FFFFFF"
    />
  </svg>
);

/**
 * 🔷 Bajaj Finance (BAJFINANCE) Vector Stock Badge
 */
export const BajajFinanceIcon: React.FC<IconProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
  >
    <circle cx="16" cy="16" r="16" fill="#0D47A1" />
    <path
      d="M11 9h6c2.8 0 4.5 1.5 4.5 3.5 0 1.2-.6 2.2-1.7 2.8 1.4.5 2.2 1.6 2.2 3.2 0 2.2-1.8 3.5-4.8 3.5H11V9zm3 3v3.5h2.8c1.2 0 1.9-.6 1.9-1.8 0-1.1-.7-1.7-1.9-1.7H14zm0 5.5V20h3c1.3 0 2.1-.6 2.1-1.8 0-1.2-.8-1.7-2.1-1.7H14z"
      fill="#FFFFFF"
    />
  </svg>
);

/**
 * Helper to dynamically render the corresponding high-res icon for any symbol
 */
export const AssetIcon: React.FC<{ symbol: string; size?: number; className?: string }> = ({
  symbol,
  size = 20,
  className = '',
}) => {
  const sym = symbol.toUpperCase();

  if (sym.startsWith('BTC')) return <BitcoinIcon size={size} className={className} />;
  if (sym.startsWith('ETH')) return <EthereumIcon size={size} className={className} />;
  if (sym.startsWith('SOL')) return <SolanaIcon size={size} className={className} />;
  if (sym.startsWith('BNB')) return <BnbIcon size={size} className={className} />;
  if (sym.startsWith('XRP')) return <XrpIcon size={size} className={className} />;
  if (sym.startsWith('DOGE')) return <DogeIcon size={size} className={className} />;
  if (sym.startsWith('SUI')) return <SuiIcon size={size} className={className} />;
  if (sym === 'NIFTY' || sym.startsWith('NIFT')) return <Nifty50Icon size={size} className={className} />;
  if (sym.includes('BANKNIFTY') || sym.startsWith('BANI')) return <BankNiftyIcon size={size} className={className} />;
  if (sym.includes('SENSEX') || sym.startsWith('SENS')) return <SensexIcon size={size} className={className} />;
  if (sym.includes('CNXIT') || sym.startsWith('CNXI')) return <CnxItIcon size={size} className={className} />;
  if (sym === 'SPX' || sym.includes('500')) return <SpxIcon size={size} className={className} />;
  if (sym.includes('RELIANCE') || sym.startsWith('RELI')) return <RelianceIcon size={size} className={className} />;
  if (sym.includes('AXIS') || sym.startsWith('AXIS')) return <AxisBankIcon size={size} className={className} />;
  if (sym.includes('HDFC') || sym.startsWith('HDFC')) return <HdfcBankIcon size={size} className={className} />;
  if (sym.includes('ICICI') || sym.startsWith('ICIC')) return <IciciBankIcon size={size} className={className} />;
  if (sym.includes('BAJ') || sym.startsWith('BAJF')) return <BajajFinanceIcon size={size} className={className} />;

  // Default fallback badge with polished typography
  const initials = sym.slice(0, 2);
  return (
    <div
      style={{ width: size, height: size }}
      className={`rounded-full bg-[#1e222d] border border-[#2a2e39] flex items-center justify-center font-bold text-[10px] text-[#2962ff] shadow-sm select-none ${className}`}
    >
      {initials}
    </div>
  );
};
