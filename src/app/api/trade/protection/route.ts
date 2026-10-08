import { NextRequest, NextResponse } from 'next/server';
import { lossProtectionService } from '@/lib/lossProtectionService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = req.headers.get('x-user-id') || searchParams.get('userId') || 'usr_celsius_demo';

    const config = lossProtectionService.getConfig(userId);
    const dailyStatus = lossProtectionService.checkDailyLossStatus(userId);
    const revengeStatus = lossProtectionService.detectRevengeTrading(userId);
    const sessionReview = lossProtectionService.computeSessionReview(userId);

    return NextResponse.json({
      success: true,
      userId,
      config,
      dailyStatus,
      revengeStatus,
      sessionReview,
    });
  } catch (error) {
    console.error('Error fetching protection status:', error);
    return NextResponse.json({ error: 'Failed to retrieve loss protection status' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id') || 'usr_celsius_demo';
    const body = await req.json().catch(() => ({}));
    const { action, dailyLossCapPct, riskPerTradePct, cooldownMinutes } = body;

    if (action === 'set_daily_loss_cap') {
      const cap = parseFloat(dailyLossCapPct);
      if (isNaN(cap)) {
        return NextResponse.json({ error: 'Invalid daily loss cap percentage' }, { status: 400 });
      }

      const result = lossProtectionService.updateDailyLossCap(userId, cap);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 403 });
      }

      return NextResponse.json({
        success: true,
        message: `Daily loss limit set to ${result.config?.maxDailyLossPct}%.`,
        config: result.config,
        dailyStatus: lossProtectionService.checkDailyLossStatus(userId),
      });
    }

    if (action === 'set_risk_per_trade') {
      const risk = parseFloat(riskPerTradePct);
      if (isNaN(risk)) {
        return NextResponse.json({ error: 'Invalid risk percentage' }, { status: 400 });
      }

      const updated = lossProtectionService.updateRiskPerTradeCap(userId, risk);
      return NextResponse.json({
        success: true,
        message: `Risk-per-trade cap set to ${updated.riskPerTradePct}%.`,
        config: updated,
      });
    }

    if (action === 'activate_cooldown') {
      const minutes = parseInt(cooldownMinutes || '5', 10);
      const until = lossProtectionService.activateBreakCooldown(userId, minutes);
      return NextResponse.json({
        success: true,
        message: `Trading paused for ${minutes} minutes. Walk away and reset.`,
        cooldownUntil: until,
        revengeStatus: lossProtectionService.detectRevengeTrading(userId),
      });
    }

    return NextResponse.json({ error: 'Unrecognized action' }, { status: 400 });
  } catch (error) {
    console.error('Error updating loss protection:', error);
    return NextResponse.json({ error: 'Failed to update loss protection' }, { status: 500 });
  }
}
