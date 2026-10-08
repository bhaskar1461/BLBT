import { NextRequest, NextResponse } from 'next/server';
import { serverPaperTrading } from '@/lib/paperTradingService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = req.headers.get('x-user-id') || searchParams.get('userId') || 'usr_celsius_demo';

    const { account, positions, orders, transactions, isNew } =
      await serverPaperTrading.getOrCreateAccount(userId);

    const metrics = serverPaperTrading.getAccountMetrics(account, positions);

    return NextResponse.json({
      success: true,
      isNew,
      account: {
        id: account.id,
        userId: account.user_id,
        currency: account.currency,
        ...metrics,
        createdAt: account.created_at,
        updatedAt: account.updated_at,
      },
      positions,
      orders,
      transactions,
    });
  } catch (error) {
    console.error('Error fetching paper account:', error);
    return NextResponse.json(
      { error: 'Internal server error while retrieving paper account' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, userId: bodyUserId } = body;
    const userId =
      req.headers.get('x-user-id') || bodyUserId || 'usr_celsius_demo';

    if (action === 'reset') {
      const { account, transaction } = await serverPaperTrading.resetAccount(userId);
      const metrics = serverPaperTrading.getAccountMetrics(account, []);

      return NextResponse.json({
        success: true,
        message: 'Paper trading account reset to 10,000 USDT',
        account: {
          id: account.id,
          userId: account.user_id,
          currency: account.currency,
          ...metrics,
          createdAt: account.created_at,
          updatedAt: account.updated_at,
        },
        transaction,
      });
    }

    // Default action: Ensure / Auto-create
    const { account, positions, isNew } =
      await serverPaperTrading.getOrCreateAccount(userId);
    const metrics = serverPaperTrading.getAccountMetrics(account, positions);

    return NextResponse.json({
      success: true,
      isNew,
      account: {
        id: account.id,
        userId: account.user_id,
        currency: account.currency,
        ...metrics,
      },
    });
  } catch (error) {
    console.error('Error in paper account POST:', error);
    return NextResponse.json(
      { error: 'Failed to process account request' },
      { status: 500 }
    );
  }
}
