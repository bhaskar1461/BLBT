import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { serverPaperTrading } from '@/lib/paperTradingService';

export const runtime = 'edge';

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const { searchParams } = new URL(req.url);

    // Retrieve leaderboard metrics for user
    const leaderboard = serverPaperTrading.getLeaderboard('all', userId);
    const entry = leaderboard.currentUserRank;

    const displayName = entry?.displayName || searchParams.get('user') || 'CryptoDegen99';
    const rank = entry?.rank || parseInt(searchParams.get('rank') || '4');
    const pnlPct = entry?.realizedPnlPct || parseFloat(searchParams.get('pnlPct') || '39.4');
    const pnl = entry?.realizedPnl || parseFloat(searchParams.get('pnl') || '3939');
    const winRate = entry?.winRatePct || parseFloat(searchParams.get('winRate') || '66.7');
    const totalTrades = entry?.tradesCount || parseInt(searchParams.get('trades') || '42');
    const streak = entry?.streakDays || 5;

    const isProfit = pnl >= 0;
    const accentColor = isProfit ? '#00f090' : '#ff3b57';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: '#0c0d12',
            backgroundImage:
              'radial-gradient(circle at 50% 20%, rgba(0, 240, 144, 0.12), transparent 70%)',
            padding: '60px 70px',
            fontFamily: 'sans-serif',
            color: '#ffffff',
            boxSizing: 'border-box',
          }}
        >
          {/* Top Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #00f090 0%, #00b4d8 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  fontWeight: 900,
                  color: '#0c0d12',
                }}
              >
                °C
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '24px', fontWeight: 900, color: '#ffffff' }}>
                  CELSIUS NETWORK
                </span>
                <span style={{ fontSize: '13px', color: '#8892b0' }}>TRADER PERFORMANCE CARD</span>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255, 215, 0, 0.12)',
                border: '1px solid rgba(255, 215, 0, 0.3)',
                padding: '8px 18px',
                borderRadius: '30px',
              }}
            >
              <span style={{ fontSize: '20px' }}>🏆</span>
              <span style={{ fontSize: '16px', fontWeight: 800, color: '#ffd700' }}>
                LEADERBOARD #{rank}
              </span>
            </div>
          </div>

          {/* User Name & Streak */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '42px', fontWeight: 900, color: '#ffffff' }}>
                {displayName}
              </span>
              <span
                style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#ff9f1c',
                  background: 'rgba(255, 159, 28, 0.15)',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 159, 28, 0.3)',
                }}
              >
                🔥 {streak} Day Streak
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: '84px',
                fontWeight: 900,
                color: accentColor,
                lineHeight: 1,
                marginTop: '16px',
                textShadow: `0 0 35px ${accentColor}40`,
              }}
            >
              +{pnlPct.toFixed(1)}% P&L
            </div>
          </div>

          {/* 3 Key Stats Grid */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '20px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '24px 36px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '13px', color: '#64748b', textTransform: 'uppercase' }}>
                Realized Return
              </span>
              <span style={{ fontSize: '24px', fontWeight: 800, color: accentColor }}>
                +${pnl.toLocaleString()} USDT
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '13px', color: '#64748b', textTransform: 'uppercase' }}>
                Win Rate
              </span>
              <span style={{ fontSize: '24px', fontWeight: 800, color: '#f1f5f9' }}>
                {winRate.toFixed(1)}%
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '13px', color: '#64748b', textTransform: 'uppercase' }}>
                Total Executed Trades
              </span>
              <span style={{ fontSize: '24px', fontWeight: 800, color: '#f1f5f9' }}>
                {totalTrades} Trades
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '13px', color: '#64748b', textTransform: 'uppercase' }}>
                Join Live
              </span>
              <span style={{ fontSize: '20px', fontWeight: 800, color: '#00f090' }}>
                celsius.trade
              </span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('OG stats card generation failed:', error);
    return new Response('Failed to generate stats card preview', { status: 500 });
  }
}
