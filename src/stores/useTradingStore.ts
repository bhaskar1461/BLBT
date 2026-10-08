import { create } from 'zustand';
import type {
  PaperAccountRecord,
  PaperPositionRecord,
  PaperOrderRecord,
  PaperTransactionRecord,
} from '@/lib/paperTradingService';
import { fromBaseUnits, formatBaseUnits, toBaseUnits } from '@/lib/tradeUnits';

export interface TradingAccountState {
  id: string;
  userId: string;
  currency: string;
  balanceUnits: string;
  equityUnits: string;
  availableFundsUnits: string;
  marginUnits: string;
  balance: number;
  equity: number;
  availableFunds: number;
  margin: number;
  formattedBalance: string;
  formattedEquity: string;
  formattedAvailableFunds: string;
}

interface TradingStoreState {
  account: TradingAccountState | null;
  positions: PaperPositionRecord[];
  orders: PaperOrderRecord[];
  transactions: PaperTransactionRecord[];
  isLoading: boolean;
  isInitialized: boolean;
  activeBottomTab: 'positions' | 'holdings' | 'orders' | 'history' | 'transactions';
  isDockCollapsed: boolean;
  mobileActiveTab: 'chart' | 'trading' | 'order' | 'watchlist';

  // Actions
  initAccount: (userId?: string) => Promise<void>;
  fetchAccount: (userId?: string) => Promise<void>;
  resetAccount: (userId?: string) => Promise<void>;
  setActiveBottomTab: (tab: 'positions' | 'holdings' | 'orders' | 'history' | 'transactions') => void;
  setDockCollapsed: (collapsed: boolean) => void;
  toggleDock: () => void;
  setMobileActiveTab: (tab: 'chart' | 'trading' | 'order' | 'watchlist') => void;
  updateLiveEquity: (prices: Record<string, number>) => void;
}

export const useTradingStore = create<TradingStoreState>((set, get) => ({
  account: {
    id: 'acc_usr_bhaskar_sharma',
    userId: 'usr_bhaskar_sharma',
    currency: 'USDT',
    balanceUnits: '5838000000000',
    equityUnits: '57600000000000',
    availableFundsUnits: '5838000000000',
    marginUnits: '51762000000000',
    balance: 58380,
    equity: 576000,
    availableFunds: 58380,
    margin: 517620,
    formattedBalance: '58,380.00',
    formattedEquity: '576,000.00',
    formattedAvailableFunds: '58,380.00',
  },
  positions: [],
  orders: [],
  transactions: [],
  isLoading: false,
  isInitialized: false,
  activeBottomTab: 'positions',
  isDockCollapsed: true,
  mobileActiveTab: 'chart',

  initAccount: async (userId?: string) => {
    if (get().isInitialized && get().account && get().positions.length > 0) return;
    await get().fetchAccount(userId);
  },

  fetchAccount: async (userId?: string) => {
    set({ isLoading: true });
    try {
      const uid = userId || 'usr_bhaskar_sharma';
      const res = await fetch(`/api/trade/account?userId=${encodeURIComponent(uid)}`, {
        headers: { 'x-user-id': uid },
      });
      if (res.ok) {
        const data = await res.json();
        set({
          account: data.account,
          positions: data.positions || [],
          orders: data.orders || [],
          transactions: data.transactions || [],
          isInitialized: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (e) {
      console.error('Failed to fetch trading account:', e);
      set({ isLoading: false });
    }
  },

  resetAccount: async (userId?: string) => {
    set({ isLoading: true });
    try {
      const uid = userId || 'usr_bhaskar_sharma';
      const res = await fetch('/api/trade/account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': uid,
        },
        body: JSON.stringify({ action: 'reset', userId: uid }),
      });
      if (res.ok) {
        const data = await res.json();
        set({
          account: data.account,
          positions: [],
          orders: [],
          transactions: data.transaction ? [data.transaction, ...get().transactions] : get().transactions,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (e) {
      console.error('Failed to reset paper account:', e);
      set({ isLoading: false });
    }
  },

  setActiveBottomTab: (tab) => set({ activeBottomTab: tab }),
  setDockCollapsed: (collapsed) => set({ isDockCollapsed: collapsed }),
  toggleDock: () => set((s) => ({ isDockCollapsed: !s.isDockCollapsed })),
  setMobileActiveTab: (tab) => set({ mobileActiveTab: tab }),

  updateLiveEquity: (prices: Record<string, number>) => {
    const { account, positions } = get();
    if (!account) return;

    const balanceUnits = BigInt(account.balanceUnits || '0');
    let totalMarginUnits = 0n;
    let totalUnrealizedPnlUnits = 0n;

    for (const pos of positions) {
      const margin = BigInt(pos.margin_units || '0');
      totalMarginUnits += margin;

      const qty = BigInt(pos.quantity_units || '0');
      const entryPrice = BigInt(pos.entry_price_units || '0');
      const currentPriceFloat = prices[pos.symbol] || fromBaseUnits(entryPrice);
      const markPrice = toBaseUnits(currentPriceFloat);

      const diff = pos.side === 'long' ? markPrice - entryPrice : entryPrice - markPrice;
      const unrealizedPnl = (diff * qty) / 100_000_000n;
      totalUnrealizedPnlUnits += unrealizedPnl;
    }

    const equityUnits = balanceUnits + totalMarginUnits + totalUnrealizedPnlUnits;

    set({
      account: {
        ...account,
        equity: fromBaseUnits(equityUnits),
        equityUnits: equityUnits.toString(),
        formattedEquity: formatBaseUnits(equityUnits, 2),
        margin: fromBaseUnits(totalMarginUnits),
        marginUnits: totalMarginUnits.toString(),
      },
    });
  },
}));
