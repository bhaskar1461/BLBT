import type { Order, Position, Portfolio, OrderSide, OrderType } from '../types/trading';
import { storage } from './storage';
import { sounds } from './audio';

export interface CreateOrderParams {
  symbol: string;
  side: OrderSide;
  type: OrderType;
  amount: number;
  price: number; // Current mark price if market, or target if limit
  takeProfit?: number;
  stopLoss?: number;
}

class TradingEngine {
  private portfolio: Portfolio;
  private orders: Order[];
  private positions: Position[];
  private listeners: (() => void)[] = [];

  constructor() {
    this.portfolio = storage.getPortfolio();
    this.orders = storage.getOrders();
    this.positions = storage.getPositions();
  }

  public subscribe(cb: () => void) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notify() {
    storage.setPortfolio(this.portfolio);
    storage.setOrders(this.orders);
    storage.setPositions(this.positions);
    this.listeners.forEach((l) => l());
  }

  public getPortfolio(): Portfolio {
    return { ...this.portfolio };
  }

  public getOrders(): Order[] {
    return [...this.orders];
  }

  public getPositions(): Position[] {
    return [...this.positions];
  }

  public resetPortfolio() {
    this.portfolio = {
      balance: 100000.0,
      initialBalance: 100000.0,
      equity: 100000.0,
      realizedPnl: 0.0,
      totalTrades: 0,
      winningTrades: 0,
    };
    this.orders = [];
    this.positions = [];
    this.notify();
  }

  // Submit Order
  public submitOrder(params: CreateOrderParams): { success: boolean; message: string; order?: Order } {
    const cost = params.amount * params.price;

    if (cost <= 0) {
      return { success: false, message: 'Invalid order amount or price' };
    }

    if (params.side === 'buy' && cost > this.portfolio.balance) {
      sounds.playWarningTone();
      return {
        success: false,
        message: `Insufficient funds. Cost: $${cost.toFixed(2)}, Available: $${this.portfolio.balance.toFixed(2)}`,
      };
    }

    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const isMarket = params.type === 'market';

    const newOrder: Order = {
      id: orderId,
      symbol: params.symbol,
      side: params.side,
      type: params.type,
      price: params.price,
      amount: params.amount,
      filledAmount: isMarket ? params.amount : 0,
      totalCost: cost,
      status: isMarket ? 'filled' : 'open',
      takeProfit: params.takeProfit,
      stopLoss: params.stopLoss,
      createdAt: Date.now(),
      filledAt: isMarket ? Date.now() : undefined,
    };

    if (isMarket) {
      this.executeMarketFill(newOrder);
      sounds.playOrderFilledPing();
      return { success: true, message: `Market ${params.side.toUpperCase()} filled for ${params.amount} ${params.symbol}`, order: newOrder };
    } else {
      this.orders.unshift(newOrder);
      this.notify();
      return { success: true, message: `Limit ${params.side.toUpperCase()} placed at $${params.price.toFixed(2)}`, order: newOrder };
    }
  }

  private executeMarketFill(order: Order) {
    const cost = order.amount * order.price;
    const positionSide = order.side === 'buy' ? 'long' : 'short';

    // Deduct balance for buy
    this.portfolio.balance -= cost;

    // Check if there is an existing position for this symbol
    const existingIdx = this.positions.findIndex((p) => p.symbol === order.symbol);

    if (existingIdx >= 0) {
      const pos = this.positions[existingIdx];
      if (pos.side === positionSide) {
        // Average up/down
        const totalSize = pos.size + order.amount;
        const totalMargin = pos.margin + cost;
        const avgPrice = totalMargin / totalSize;
        pos.size = totalSize;
        pos.entryPrice = avgPrice;
        pos.margin = totalMargin;
        pos.markPrice = order.price;
      } else {
        // Opposite side: reduce or flip position
        if (order.amount >= pos.size) {
          // Close full existing position
          this.closePositionInternal(pos.id, order.price);
        } else {
          // Partial close
          const closeRatio = order.amount / pos.size;
          const pnlChunk = pos.unrealizedPnl * closeRatio;
          this.portfolio.realizedPnl += pnlChunk;
          this.portfolio.balance += pos.margin * closeRatio + pnlChunk;
          pos.size -= order.amount;
          pos.margin -= pos.margin * closeRatio;
        }
      }
    } else {
      // Create new position
      const newPos: Position = {
        id: `pos_${Date.now()}`,
        symbol: order.symbol,
        side: positionSide,
        entryPrice: order.price,
        markPrice: order.price,
        size: order.amount,
        margin: cost,
        unrealizedPnl: 0,
        unrealizedPnlPercent: 0,
        takeProfit: order.takeProfit,
        stopLoss: order.stopLoss,
        openedAt: Date.now(),
      };
      this.positions.push(newPos);
    }

    this.orders.unshift(order);
    this.recalculateEquity();
    this.notify();
  }

  // Close Position
  public closePosition(positionId: string, currentPrice: number): { success: boolean; pnl: number } {
    const pnl = this.closePositionInternal(positionId, currentPrice);
    if (pnl !== null) {
      sounds.playOrderFilledPing();
      this.notify();
      return { success: true, pnl };
    }
    return { success: false, pnl: 0 };
  }

  private closePositionInternal(positionId: string, currentPrice: number): number | null {
    const idx = this.positions.findIndex((p) => p.id === positionId);
    if (idx === -1) return null;

    const pos = this.positions[idx];
    const diff = pos.side === 'long' ? currentPrice - pos.entryPrice : pos.entryPrice - currentPrice;
    const realizedPnl = diff * pos.size;

    this.portfolio.realizedPnl += realizedPnl;
    this.portfolio.balance += pos.margin + realizedPnl;
    this.portfolio.totalTrades += 1;
    if (realizedPnl > 0) this.portfolio.winningTrades += 1;

    // Log closing order
    const closeOrder: Order = {
      id: `ord_close_${Date.now()}`,
      symbol: pos.symbol,
      side: pos.side === 'long' ? 'sell' : 'buy',
      type: 'market',
      price: currentPrice,
      amount: pos.size,
      filledAmount: pos.size,
      totalCost: pos.size * currentPrice,
      status: 'filled',
      createdAt: Date.now(),
      filledAt: Date.now(),
    };
    this.orders.unshift(closeOrder);

    this.positions.splice(idx, 1);
    this.recalculateEquity();
    return realizedPnl;
  }

  // Cancel pending order
  public cancelOrder(orderId: string): boolean {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order || order.status !== 'open') return false;

    order.status = 'cancelled';
    this.notify();
    return true;
  }

  // Check pending limit orders and SL/TP when a new price tick arrives
  public onPriceTick(symbol: string, currentPrice: number) {
    let changed = false;

    // 1. Update mark price and PnL for open positions of this symbol
    for (const pos of this.positions) {
      if (pos.symbol === symbol) {
        pos.markPrice = currentPrice;
        const diff = pos.side === 'long' ? currentPrice - pos.entryPrice : pos.entryPrice - currentPrice;
        pos.unrealizedPnl = diff * pos.size;
        pos.unrealizedPnlPercent = pos.margin > 0 ? (pos.unrealizedPnl / pos.margin) * 100 : 0;

        // Check TP/SL triggers
        if (pos.takeProfit && ((pos.side === 'long' && currentPrice >= pos.takeProfit) || (pos.side === 'short' && currentPrice <= pos.takeProfit))) {
          this.closePositionInternal(pos.id, currentPrice);
          changed = true;
          continue;
        }

        if (pos.stopLoss && ((pos.side === 'long' && currentPrice <= pos.stopLoss) || (pos.side === 'short' && currentPrice >= pos.stopLoss))) {
          this.closePositionInternal(pos.id, currentPrice);
          changed = true;
          continue;
        }

        changed = true;
      }
    }

    // 2. Check pending limit orders
    for (const order of this.orders) {
      if (order.symbol === symbol && order.status === 'open') {
        const shouldFillBuy = order.side === 'buy' && currentPrice <= order.price;
        const shouldFillSell = order.side === 'sell' && currentPrice >= order.price;

        if (shouldFillBuy || shouldFillSell) {
          order.status = 'filled';
          order.filledAmount = order.amount;
          order.filledAt = Date.now();
          order.price = currentPrice;
          this.executeMarketFill(order);
          sounds.playOrderFilledPing();
          changed = true;
        }
      }
    }

    if (changed) {
      this.recalculateEquity();
      this.notify();
    }
  }

  private recalculateEquity() {
    const totalUnrealized = this.positions.reduce((acc, p) => acc + p.unrealizedPnl, 0);
    this.portfolio.equity = this.portfolio.balance + this.positions.reduce((acc, p) => acc + p.margin, 0) + totalUnrealized;
  }
}

export const tradingEngine = new TradingEngine();
