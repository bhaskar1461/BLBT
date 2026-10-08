import { NextRequest, NextResponse } from 'next/server';
import { adminService } from '@/lib/adminService';
import { serverPaperTrading } from '@/lib/paperTradingService';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const userId = req.headers.get('x-user-id') || body?.userId || 'usr_celsius_demo';

    // Update last_active timestamp
    adminService.pingUserActive(userId);

    // Track daily visit streak
    const streak = serverPaperTrading.recordUserVisit(userId);

    // Weekly performance recap (shown on Mondays or on demand)
    const isMonday = new Date().getDay() === 1;
    const weeklyRecap = serverPaperTrading.getUserWeeklyRecap(userId);

    // Retrieve any unread broadcast messages
    const broadcasts = adminService.getUserBroadcasts(userId);
    const unread = broadcasts.filter((b) => !b.isRead);

    const isFrozen = adminService.isUserFrozen(userId);

    return NextResponse.json({
      success: true,
      isFrozen,
      unreadMessages: unread,
      streak,
      weeklyRecap,
      isMonday,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to record ping' }, { status: 500 });
  }
}
