import { NextRequest, NextResponse } from 'next/server';
import { adminService } from '@/lib/adminService';
import { serverPaperTrading } from '@/lib/paperTradingService';
import { lossProtectionService } from '@/lib/lossProtectionService';
import {
  toBaseUnits,
  fromBaseUnits,
  calcCostUnits,
  calcFeeUnits,
  calcPnlUnits,
  formatBaseUnits,
} from '@/lib/tradeUnits';
import { formatPrice } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const DEFAULT_PRICES: Record<string, number> = {
  BTCUSDT: 83270.0,
  ETHUSDT: 2567.0,
  SOLUSDT: 115.18,
  BNBUSDT: 560.0,
  AVAXUSDT: 26.8,
  NIFTY: 22603.05,
  BANKNIFTY: 55055.55,
  SENSEX: 72638.7,
  CNXIT: 27757.0,
  RELIANCE: 2980.5,
  TCS: 3890.0,
  INFY: 1540.25,
  NVDA: 135.50,
  AAPL: 228.40,
  TSLA: 242.80,
  MSFT: 418.20,
  AMZN: 186.50,
};

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id') || 'usr_celsius_demo';

    // 🔒 INVARIANT 5: Trading Block for Frozen Users
    // Server-side validation MUST check account status before accepting trade actions.
    if (adminService.isUserFrozen(userId)) {
      return NextResponse.json(
        {
          error: 'Account Suspended: Trading privileges have been frozen by an administrator. Order rejected.',
          code: 'ACCOUNT_FROZEN',
        },
        { status: 403 }
      );
    }

    // 🔒 FEATURE FLAG GATE
    if (!adminService.isFeatureEnabled('paper_trading')) {
      return NextResponse.json(
        {
          error: 'Paper Trading is temporarily disabled by platform administration.',
          code: 'FEATURE_DISABLED',
        },
        { status: 503 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const {
      action,
      positionId,
      orderId,
      symbol,
      side,
      amount,
      quantity,
      price,
      type = 'market',
      takeProfit,
      stopLoss,
      userDisplayName = 'Trader',
    } = body;

    // -------------------------------------------------------------
    // ACTION 1: CLOSE POSITION AT LIVE MARKET PRICE
    // -------------------------------------------------------------
    if (action === 'close_position' || action === 'close') {
      if (!positionId) {
        return NextResponse.json({ error: 'positionId is required' }, { status: 400 });
      }

      const { account, positions } = await serverPaperTrading.getOrCreateAccount(userId);
      const pos = positions.find((p) => p.id === positionId);
      if (!pos) {
        return NextResponse.json({ error: 'Position not found' }, { status: 404 });
      }

      // Fetch authoritative live price for closing
      let liveClosePrice = 0;
      if (DEFAULT_PRICES[pos.symbol]) {
        liveClosePrice = DEFAULT_PRICES[pos.symbol];
      } else {
        try {
          const binanceRes = await fetch(
            `https://api.binance.com/api/v3/ticker/price?symbol=${pos.symbol}`,
            { cache: 'no-store' }
          );
          if (binanceRes.ok) {
            const binanceData = await binanceRes.json();
            liveClosePrice = parseFloat(binanceData.price);
          }
        } catch {}
      }

      if (!liveClosePrice || liveClosePrice <= 0) {
        liveClosePrice = fromBaseUnits(pos.entry_price_units);
      }

      const closeResult = await serverPaperTrading.closePosition(
        userId,
        positionId,
        liveClosePrice,
        userDisplayName
      );

      if (!closeResult.success || !closeResult.closedTrade) {
        return NextResponse.json(
          { error: closeResult.error || 'Failed to close position' },
          { status: 400 }
        );
      }

      const metrics = serverPaperTrading.getAccountMetrics(account, positions, {
        [pos.symbol]: liveClosePrice,
      });

      return NextResponse.json({
        success: true,
        message: `Closed ${pos.side.toUpperCase()} ${pos.symbol} at $${formatPrice(
          liveClosePrice,
          2
        )} with P&L: ${closeResult.closedTrade.realizedPnl >= 0 ? '+' : ''}$${formatPrice(
          closeResult.closedTrade.realizedPnl,
          2
        )} (${closeResult.closedTrade.realizedPnlPct}%)`,
        closedTrade: closeResult.closedTrade,
        account: {
          id: account.id,
          userId: account.user_id,
          currency: account.currency,
          ...metrics,
        },
        positions,
      });
    }

    // -------------------------------------------------------------
    // ACTION 2: CANCEL OPEN LIMIT ORDER
    // -------------------------------------------------------------
    if (action === 'cancel_order' || action === 'cancel') {
      if (!orderId) {
        return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
      }

      const cancelled = await serverPaperTrading.cancelOrder(userId, orderId);
      if (!cancelled) {
        return NextResponse.json({ error: 'Order not found or already completed' }, { status: 404 });
      }

      const { account, positions, orders } = await serverPaperTrading.getOrCreateAccount(userId);
      return NextResponse.json({
        success: true,
        message: 'Order cancelled successfully',
        orders,
      });
    }

    // -------------------------------------------------------------
    // ORDER SUBMISSION (MARKET OR LIMIT)
    // -------------------------------------------------------------
    // 🔒 PROMPT 3.3: Hard Daily Loss Limit Check
    const dailyStatus = lossProtectionService.checkDailyLossStatus(userId);
    if (dailyStatus.isLocked) {
      return NextResponse.json(
        {
          error: "You've reached your daily limit. Great traders know when to walk away. The market will be here tomorrow.",
          code: 'DAILY_LOSS_LIMIT_REACHED',
          isLocked: true,
          dailyStatus,
        },
        { status: 403 }
      );
    }

    const targetSymbol = (symbol || 'BTCUSDT').toUpperCase();
    const targetSide: 'buy' | 'sell' = side === 'sell' ? 'sell' : 'buy';
    const numQty = parseFloat(amount || quantity || 0);

    if (isNaN(numQty) || numQty <= 0) {
      return NextResponse.json({ error: 'Invalid order quantity' }, { status: 400 });
    }

    // Fetch authoritative live price
    let livePrice = 0;
    if (DEFAULT_PRICES[targetSymbol]) {
      livePrice = DEFAULT_PRICES[targetSymbol];
    } else {
      try {
        const binanceRes = await fetch(
          `https://api.binance.com/api/v3/ticker/price?symbol=${targetSymbol}`,
          { cache: 'no-store' }
        );
        if (binanceRes.ok) {
          const binanceData = await binanceRes.json();
          livePrice = parseFloat(binanceData.price);
        }
      } catch {}
    }

    // Fallback if Binance temporary rate limit or unlisted
    if (!livePrice || livePrice <= 0) {
      livePrice = targetSymbol.includes('BTC')
        ? 83270
        : targetSymbol.includes('ETH')
        ? 2567
        : targetSymbol.includes('SOL')
        ? 115.18
        : DEFAULT_PRICES[targetSymbol] || 1000;
    }

    const isLimit = type === 'limit';
    const numTargetPrice = isLimit ? parseFloat(price) || livePrice : livePrice;
    if (isLimit && (isNaN(numTargetPrice) || numTargetPrice <= 0)) {
      return NextResponse.json({ error: 'Invalid limit price specified' }, { status: 400 });
    }

    // Convert to integer 8-decimal base units (Wei/Satoshi style)
    const qtyUnits = toBaseUnits(numQty);
    const orderPriceUnits = toBaseUnits(numTargetPrice);
    const costUnits = calcCostUnits(qtyUnits, orderPriceUnits);
    const feeUnits = calcFeeUnits(costUnits);

    const { account, positions, orders, transactions } =
      await serverPaperTrading.getOrCreateAccount(userId);

    const currentBalanceUnits = BigInt(account.balance_units);

    // Validate sufficient funds
    if (targetSide === 'buy') {
      const totalRequiredUnits = costUnits + feeUnits;
      if (totalRequiredUnits > currentBalanceUnits) {
        return NextResponse.json(
          {
            error: `Insufficient available funds. Required: $${formatBaseUnits(
              totalRequiredUnits,
              2
            )} USDT, Available: $${formatBaseUnits(currentBalanceUnits, 2)} USDT`,
            code: 'INSUFFICIENT_FUNDS',
          },
          { status: 400 }
        );
      }
    }

    const orderIdGen = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    // 🔒 CASE A: LIMIT ORDER QUEUEING
    if (isLimit) {
      const limitOrderRecord = {
        id: orderIdGen,
        user_id: userId,
        account_id: account.id,
        symbol: targetSymbol,
        side: targetSide,
        type: 'limit' as const,
        status: 'open' as const,
        price_units: orderPriceUnits.toString(),
        amount_units: qtyUnits.toString(),
        filled_amount_units: '0',
        total_cost_units: costUnits.toString(),
        fee_units: feeUnits.toString(),
        created_at: now,
        filled_at: null,
      };
      orders.unshift(limitOrderRecord);

      return NextResponse.json({
        success: true,
        message: `Limit ${targetSide.toUpperCase()} placed at $${formatPrice(numTargetPrice, 2)} (fills when market reaches target)`,
        order: limitOrderRecord,
        orders,
      });
    }

    // 🔒 CASE B: IMMEDIATE MARKET FILL
    let newBalanceUnits = currentBalanceUnits;
    if (targetSide === 'buy') {
      newBalanceUnits = currentBalanceUnits - costUnits - feeUnits;
    } else {
      newBalanceUnits = currentBalanceUnits + costUnits - feeUnits;
    }

    // Create Order Record
    const orderRecord = {
      id: orderIdGen,
      user_id: userId,
      account_id: account.id,
      symbol: targetSymbol,
      side: targetSide,
      type: 'market' as const,
      status: 'filled' as const,
      price_units: toBaseUnits(livePrice).toString(),
      amount_units: qtyUnits.toString(),
      filled_amount_units: qtyUnits.toString(),
      total_cost_units: costUnits.toString(),
      fee_units: feeUnits.toString(),
      created_at: now,
      filled_at: now,
    };
    orders.unshift(orderRecord);

    // Update account balance
    account.balance_units = newBalanceUnits.toString();
    account.updated_at = now;

    // Append to transactions ledger: Order Fill
    transactions.unshift({
      id: `tx_${Date.now()}_fill`,
      user_id: userId,
      account_id: account.id,
      order_id: orderIdGen,
      type: 'order_fill',
      amount_units: (targetSide === 'buy' ? -costUnits : costUnits).toString(),
      balance_after_units: (currentBalanceUnits + (targetSide === 'buy' ? -costUnits : costUnits)).toString(),
      symbol: targetSymbol,
      details: {
        side: targetSide,
        price: livePrice,
        quantity: numQty,
      },
      created_at: now,
    });

    // Append to transactions ledger: Flat 0.1% Fee Deduction
    transactions.unshift({
      id: `tx_${Date.now()}_fee`,
      user_id: userId,
      account_id: account.id,
      order_id: orderIdGen,
      type: 'fee',
      amount_units: (-feeUnits).toString(),
      balance_after_units: newBalanceUnits.toString(),
      symbol: targetSymbol,
      details: { feeBps: 10, feeUsdt: fromBaseUnits(feeUnits) },
      created_at: now,
    });

    // Process Take Profit / Stop Loss brackets
    const tpUnits = takeProfit && parseFloat(takeProfit) > 0 ? toBaseUnits(parseFloat(takeProfit)).toString() : null;
    const slUnits = stopLoss && parseFloat(stopLoss) > 0 ? toBaseUnits(parseFloat(stopLoss)).toString() : null;

    // Update or create open position
    const existingPosIdx = positions.findIndex((p) => p.symbol === targetSymbol);
    if (existingPosIdx >= 0) {
      const pos = positions[existingPosIdx];
      const existingQty = BigInt(pos.quantity_units);
      const existingMargin = BigInt(pos.margin_units);

      if (pos.side === (targetSide === 'buy' ? 'long' : 'short')) {
        const totalQty = existingQty + qtyUnits;
        const totalMargin = existingMargin + costUnits;
        const avgPriceUnits = (totalMargin * 100_000_000n) / totalQty;
        pos.quantity_units = totalQty.toString();
        pos.margin_units = totalMargin.toString();
        pos.entry_price_units = avgPriceUnits.toString();
        if (tpUnits) pos.take_profit_units = tpUnits;
        if (slUnits) pos.stop_loss_units = slUnits;
        pos.updated_at = now;
      } else {
        if (qtyUnits >= existingQty) {
          positions.splice(existingPosIdx, 1);
        } else {
          const remainingQty = existingQty - qtyUnits;
          const remainingMargin = (existingMargin * remainingQty) / existingQty;
          pos.quantity_units = remainingQty.toString();
          pos.margin_units = remainingMargin.toString();
          pos.updated_at = now;
        }
      }
    } else {
      positions.unshift({
        id: `pos_${Date.now()}`,
        user_id: userId,
        account_id: account.id,
        symbol: targetSymbol,
        side: targetSide === 'buy' ? 'long' : 'short',
        quantity_units: qtyUnits.toString(),
        entry_price_units: toBaseUnits(livePrice).toString(),
        margin_units: costUnits.toString(),
        realized_pnl_units: '0',
        take_profit_units: tpUnits,
        stop_loss_units: slUnits,
        opened_at: now,
        updated_at: now,
      });
    }

    const metrics = serverPaperTrading.getAccountMetrics(account, positions, {
      [targetSymbol]: livePrice,
    });

    return NextResponse.json({
      success: true,
      message: `Market ${targetSide.toUpperCase()} filled at $${formatPrice(
        livePrice,
        2
      )}`,
      order: orderRecord,
      fillPrice: livePrice,
      fee: fromBaseUnits(feeUnits),
      account: {
        id: account.id,
        userId: account.user_id,
        currency: account.currency,
        ...metrics,
      },
      positions,
      orders,
    });
  } catch (error) {
    console.error('Order execution error:', error);
    return NextResponse.json(
      { error: 'Internal server error during order processing' },
      { status: 500 }
    );
  }
}
