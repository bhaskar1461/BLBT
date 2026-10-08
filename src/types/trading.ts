export type OrderSide = 'buy' | 'sell';
export type OrderType = 'market' | 'limit';
export type OrderStatus = 'open' | 'filled' | 'cancelled';
export type PositionSide = 'long' | 'short';

export interface Order {
  id: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  price: number; // Target price for limit orders or execution price for market
  amount: number; // In base asset (e.g., BTC)
  filledAmount: number;
  totalCost: number; // In quote asset (e.g., USDT)
  status: OrderStatus;
  takeProfit?: number;
  stopLoss?: number;
  createdAt: number;
  filledAt?: number;
}

export interface Position {
  id: string;
  symbol: string;
  side: PositionSide;
  entryPrice: number;
  markPrice: number;
  size: number; // Quantity in base asset
  margin: number; // USDT allocated
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  takeProfit?: number;
  stopLoss?: number;
  openedAt: number;
}

export interface Portfolio {
  balance: number; // Available USDT
  initialBalance: number;
  equity: number; // balance + total unrealized PnL
  realizedPnl: number;
  totalTrades: number;
  winningTrades: number;
}

export interface ClosedTradeRecord {
  id: string;
  userId: string;
  userDisplayName: string;
  symbol: string;
  side: 'long' | 'short';
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  margin: number;
  realizedPnl: number;
  realizedPnlPct: number;
  fee: number;
  durationSeconds: number;
  durationFormatted: string;
  openedAt: string;
  closedAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  realizedPnlPct: number;
  realizedPnl: number;
  winRatePct: number;
  tradesCount: number;
  profitableTrades: number;
  isCurrentUser?: boolean;
  streakDays?: number;
}

export interface UserStreak {
  currentStreak: number;
  longestStreak: number;
  lastVisitDate: string;
  todayVisited: boolean;
}

export interface WeeklyRecap {
  tradesCount: number;
  winRatePct: number;
  netPnl: number;
  bestTradeSymbol?: string;
  weekStartDate: string;
  weekEndDate: string;
}
