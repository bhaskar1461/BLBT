import { NextRequest, NextResponse } from 'next/server';
import { serverPaperTrading } from '@/lib/paperTradingService';
import { fromBaseUnits } from '@/lib/tradeUnits';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  let body: {
    userId?: string;
    amount?: string | number;
    destinationAddress?: string;
    network?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Malformed or missing JSON request body.' },
      { status: 400 }
    );
  }

  try {
    const { userId = 'usr_bhaskar_sharma', amount, destinationAddress, network = 'TRC-20' } = body;

    const numAmount = typeof amount === 'number' ? amount : parseFloat(String(amount ?? ''));
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid redemption amount greater than 0 USDT.' },
        { status: 400 }
      );
    }

    if (!destinationAddress || typeof destinationAddress !== 'string' || destinationAddress.trim().length < 6) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid destination wallet address (minimum 6 characters).' },
        { status: 400 }
      );
    }

    const result = await serverPaperTrading.redeemBalance(
      userId,
      numAmount,
      destinationAddress.trim(),
      network
    );

    if (!result.success || !result.account) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to process redemption' },
        { status: 400 }
      );
    }

    const currentBalance = fromBaseUnits(BigInt(result.account.balance_units));

    return NextResponse.json({
      success: true,
      message: `Successfully redeemed ${numAmount.toFixed(2)} USDT to ${network}`,
      newBalance: currentBalance,
      txHash: result.txHash,
      transaction: result.transaction,
    });
  } catch (error) {
    console.error('Error in /api/trade/redeem:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error processing redemption' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || 'usr_bhaskar_sharma';

    const { transactions, account } = await serverPaperTrading.getOrCreateAccount(userId);
    const withdrawals = transactions.filter((t) => t.type === 'withdrawal');

    return NextResponse.json({
      success: true,
      balance: fromBaseUnits(BigInt(account.balance_units)),
      withdrawals,
    });
  } catch (error) {
    console.error('Error fetching redemption history:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch redemption history' },
      { status: 500 }
    );
  }
}
