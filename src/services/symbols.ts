import type { SymbolInfo } from '../types/chart';

export const POPULAR_SYMBOLS: SymbolInfo[] = [
  { symbol: 'BTCUSDT', baseAsset: 'BTC', quoteAsset: 'USDT', name: 'Bitcoin', category: 'Major', pricePrecision: 2, minQty: 0.0001 },
  { symbol: 'ETHUSDT', baseAsset: 'ETH', quoteAsset: 'USDT', name: 'Ethereum', category: 'Major', pricePrecision: 2, minQty: 0.001 },
  { symbol: 'SOLUSDT', baseAsset: 'SOL', quoteAsset: 'USDT', name: 'Solana', category: 'Layer 1', pricePrecision: 2, minQty: 0.01 },
  { symbol: 'BNBUSDT', baseAsset: 'BNB', quoteAsset: 'USDT', name: 'BNB', category: 'Major', pricePrecision: 2, minQty: 0.01 },
  { symbol: 'DOGEUSDT', baseAsset: 'DOGE', quoteAsset: 'USDT', name: 'Dogecoin', category: 'Meme', pricePrecision: 5, minQty: 1 },
  { symbol: 'XRPUSDT', baseAsset: 'XRP', quoteAsset: 'USDT', name: 'XRP', category: 'Major', pricePrecision: 4, minQty: 0.1 },
  { symbol: 'ADAUSDT', baseAsset: 'ADA', quoteAsset: 'USDT', name: 'Cardano', category: 'Layer 1', pricePrecision: 4, minQty: 1 },
  { symbol: 'AVAXUSDT', baseAsset: 'AVAX', quoteAsset: 'USDT', name: 'Avalanche', category: 'Layer 1', pricePrecision: 2, minQty: 0.01 },
  { symbol: 'SUIUSDT', baseAsset: 'SUI', quoteAsset: 'USDT', name: 'Sui Network', category: 'Layer 1', pricePrecision: 4, minQty: 1 },
  { symbol: 'NEARUSDT', baseAsset: 'NEAR', quoteAsset: 'USDT', name: 'NEAR Protocol', category: 'AI', pricePrecision: 3, minQty: 0.1 },
  { symbol: 'LINKUSDT', baseAsset: 'LINK', quoteAsset: 'USDT', name: 'Chainlink', category: 'DeFi', pricePrecision: 3, minQty: 0.1 },
  { symbol: 'PEPEUSDT', baseAsset: 'PEPE', quoteAsset: 'USDT', name: 'Pepe', category: 'Meme', pricePrecision: 8, minQty: 1000 },
  { symbol: 'SHIBUSDT', baseAsset: 'SHIB', quoteAsset: 'USDT', name: 'Shiba Inu', category: 'Meme', pricePrecision: 8, minQty: 1000 },
  { symbol: 'ARBUSDT', baseAsset: 'ARB', quoteAsset: 'USDT', name: 'Arbitrum', category: 'Layer 2', pricePrecision: 4, minQty: 1 },
  { symbol: 'OPUSDT', baseAsset: 'OP', quoteAsset: 'USDT', name: 'Optimism', category: 'Layer 2', pricePrecision: 3, minQty: 0.1 },
  { symbol: 'RENDERUSDT', baseAsset: 'RENDER', quoteAsset: 'USDT', name: 'Render Token', category: 'AI', pricePrecision: 3, minQty: 0.1 },
  { symbol: 'INJUSDT', baseAsset: 'INJ', quoteAsset: 'USDT', name: 'Injective', category: 'DeFi', pricePrecision: 3, minQty: 0.1 },
  { symbol: 'APTUSDT', baseAsset: 'APT', quoteAsset: 'USDT', name: 'Aptos', category: 'Layer 1', pricePrecision: 3, minQty: 0.1 },
  { symbol: 'DOTUSDT', baseAsset: 'DOT', quoteAsset: 'USDT', name: 'Polkadot', category: 'Layer 1', pricePrecision: 3, minQty: 0.1 },
  { symbol: 'UNIUSDT', baseAsset: 'UNI', quoteAsset: 'USDT', name: 'Uniswap', category: 'DeFi', pricePrecision: 3, minQty: 0.1 },
  // Major Indices & Equities (TradingView Parity)
  { symbol: 'NIFTY', baseAsset: 'NIFTY', quoteAsset: 'INR', name: 'Nifty 50 Index', category: 'Index', pricePrecision: 2, minQty: 1 },
  { symbol: 'BANKNIFTY', baseAsset: 'BANKNIFTY', quoteAsset: 'INR', name: 'Nifty Bank Index', category: 'Index', pricePrecision: 2, minQty: 1 },
  { symbol: 'SENSEX', baseAsset: 'SENSEX', quoteAsset: 'INR', name: 'BSE Sensex Index', category: 'Index', pricePrecision: 2, minQty: 1 },
  { symbol: 'CNXIT', baseAsset: 'CNXIT', quoteAsset: 'INR', name: 'Nifty IT Index', category: 'Index', pricePrecision: 2, minQty: 1 },
  { symbol: 'SPX', baseAsset: 'SPX', quoteAsset: 'USD', name: 'S&P 500 Index', category: 'Index', pricePrecision: 2, minQty: 1 },
  { symbol: 'RELIANCE', baseAsset: 'RELIANCE', quoteAsset: 'INR', name: 'Reliance Industries', category: 'Stock', pricePrecision: 2, minQty: 1 },
  { symbol: 'AXISBANK', baseAsset: 'AXISBANK', quoteAsset: 'INR', name: 'Axis Bank', category: 'Stock', pricePrecision: 2, minQty: 1 },
  { symbol: 'HDFCBANK', baseAsset: 'HDFCBANK', quoteAsset: 'INR', name: 'HDFC Bank', category: 'Stock', pricePrecision: 2, minQty: 1 },
  { symbol: 'ICICIBANK', baseAsset: 'ICICIBANK', quoteAsset: 'INR', name: 'ICICI Bank', category: 'Stock', pricePrecision: 2, minQty: 1 },
  { symbol: 'BAJFINANCE', baseAsset: 'BAJFINANCE', quoteAsset: 'INR', name: 'Bajaj Finance', category: 'Stock', pricePrecision: 2, minQty: 1 },
  { symbol: 'TCS', baseAsset: 'TCS', quoteAsset: 'INR', name: 'Tata Consultancy Services', category: 'Stock', pricePrecision: 2, minQty: 1 },
  { symbol: 'INFY', baseAsset: 'INFY', quoteAsset: 'INR', name: 'Infosys Limited', category: 'Stock', pricePrecision: 2, minQty: 1 },
  // US Equities
  { symbol: 'AMZN', baseAsset: 'AMZN', quoteAsset: 'USD', name: 'Amazon.com, Inc.', category: 'Stock', pricePrecision: 2, minQty: 1 },
  { symbol: 'NVDA', baseAsset: 'NVDA', quoteAsset: 'USD', name: 'NVIDIA Corporation', category: 'Stock', pricePrecision: 2, minQty: 1 },
  { symbol: 'AAPL', baseAsset: 'AAPL', quoteAsset: 'USD', name: 'Apple Inc.', category: 'Stock', pricePrecision: 2, minQty: 1 },
  { symbol: 'TSLA', baseAsset: 'TSLA', quoteAsset: 'USD', name: 'Tesla, Inc.', category: 'Stock', pricePrecision: 2, minQty: 1 },
  { symbol: 'MSFT', baseAsset: 'MSFT', quoteAsset: 'USD', name: 'Microsoft Corporation', category: 'Stock', pricePrecision: 2, minQty: 1 },
  { symbol: 'GOOGL', baseAsset: 'GOOGL', quoteAsset: 'USD', name: 'Alphabet Inc.', category: 'Stock', pricePrecision: 2, minQty: 1 },
  { symbol: 'META', baseAsset: 'META', quoteAsset: 'USD', name: 'Meta Platforms, Inc.', category: 'Stock', pricePrecision: 2, minQty: 1 },
  { symbol: 'AMD', baseAsset: 'AMD', quoteAsset: 'USD', name: 'Advanced Micro Devices', category: 'Stock', pricePrecision: 2, minQty: 1 },
];

export const DEFAULT_WATCHLIST = ['NIFTY', 'BANKNIFTY', 'SENSEX', 'CNXIT', 'SPX', 'BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'RELIANCE', 'AXISBANK', 'HDFCBANK', 'ICICIBANK', 'BAJFINANCE'];

export const SYMBOL_MAP = new Map<string, SymbolInfo>(
  POPULAR_SYMBOLS.map((s) => [s.symbol, s])
);

export function getSymbolInfo(symbol: string): SymbolInfo {
  return (
    SYMBOL_MAP.get(symbol) || {
      symbol,
      baseAsset: symbol.replace('USDT', ''),
      quoteAsset: 'USDT',
      name: symbol.replace('USDT', ''),
      category: 'Other',
      pricePrecision: 2,
      minQty: 0.01,
    }
  );
}

export function formatPrice(price: number, precision = 2): string {
  if (isNaN(price)) return '0.00';
  if (price < 0.0001) {
    return price.toFixed(8);
  }
  if (price < 1) {
    return price.toFixed(4);
  }
  return price.toLocaleString('en-US', {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  });
}

export function formatNumber(num: number, decimals = 2): string {
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(decimals) + 'B';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(decimals) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(decimals) + 'K';
  return num.toFixed(decimals);
}
