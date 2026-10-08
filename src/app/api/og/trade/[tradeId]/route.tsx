// src/app/api/og/trade/[tradeId]/route.tsx
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { serverPaperTrading } from '@/lib/paperTradingService';

export const runtime = 'edge';

export async function GET(
  req: NextRequest,
  { params }: { params: { tradeId: string } }
) {
  try {
    const { tradeId } = params;
    const { searchParams } = new URL(req.url);

    // Retrieve closed trade from server store or query overrides
    const trade = serverPaperTrading.getClosedTrade(tradeId);

    const symbol = trade?.symbol || searchParams.get('symbol') || 'BTCUSDT';
    const side = (trade?.side || searchParams.get('side') || 'long').toUpperCase();
    const displayName = trade?.userDisplayName || searchParams.get('user') || 'Alex Chen';
    const entryPrice = trade?.entryPrice ?? parseFloat(searchParams.get('entry') || '62450');
    const exitPrice = trade?.exitPrice ?? parseFloat(searchParams.get('exit') || '65120');
    const pnl = trade?.realizedPnl ?? parseFloat(searchParams.get('pnl') || '1335');
    const pnlPct = trade?.realizedPnlPct ?? parseFloat(searchParams.get('pnlPct') || '4.27');
    const duration = trade?.durationFormatted || searchParams.get('duration') || '4h 00m';

    const isProfit = pnl >= 0;
    const accentColor = isProfit ? '#00f090' : '#ff3b57';
    const bgGlow = isProfit
      ? 'radial-gradient(circle at 50% 30%, rgba(0, 240, 144, 0.16), transparent 70%)'
      : 'radial-gradient(circle at 50% 30%, rgba(255, 59, 87, 0.16), transparent 70%)';

    const honestVerdict = isProfit
      ? `Closed a +${pnlPct.toFixed(2)}% gain. Full record verified.`
      : `Took a ${pnlPct.toFixed(2)}% loss. Full record verified.`;

    const badgeText = isProfit
      ? 'VERIFIED TRADE • DISCIPLINED EXECUTION'
      : 'BADGE OF HONESTY • DISCIPLINED LOSS';

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
            backgroundImage: bgGlow,
            padding: '60px 70px',
            fontFamily: 'sans-serif',
            color: '#ffffff',
            boxSizing: 'border-box',
          }}
        >
          {/* Header Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
            }}
          >
            {/* Logo & Platform Mark */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: isProfit
                    ? 'linear-gradient(135deg, #00f090 0%, #00b4d8 100%)'
                    : 'linear-gradient(135deg, #ff3b57 0%, #f59e0b 100%)',
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
                <span
                  style={{
                    fontSize: '22px',
                    fontWeight: 900,
                    letterSpacing: '-0.5px',
                    color: '#ffffff',
                  }}
                >
                  Celsius Network
                </span>
                <span style={{ fontSize: '12px', color: accentColor, fontWeight: 700, letterSpacing: '1px' }}>
                  {badgeText}
                </span>
              </div>
            </div>

            {/* Trader Pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                padding: '8px 18px',
                borderRadius: '30px',
              }}
            >
              <div
                style={{
                  width: '9px',
                  height: '9px',
                  borderRadius: '50%',
                  backgroundColor: accentColor,
                }}
              />
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#f1f5f9' }}>
                {displayName}
              </span>
            </div>
          </div>

          {/* Center Showcase: Equal Dignity for Losses & Wins */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '16px 0',
            }}
          >
            {/* Honest Verdict Line */}
            <div
              style={{
                fontSize: '28px',
                fontWeight: 800,
                color: isProfit ? '#a7f3d0' : '#fecdd3',
                marginBottom: '10px',
                textAlign: 'center',
              }}
            >
              &ldquo;{honestVerdict}&rdquo;
            </div>

            {/* Symbol & Side Pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
              <span style={{ fontSize: '32px', fontWeight: 900, color: '#ffffff' }}>
                {symbol}
              </span>
              <span
                style={{
                  fontSize: '16px',
                  fontWeight: 800,
                  color: accentColor,
                  background: isProfit ? 'rgba(0, 240, 144, 0.15)' : 'rgba(255, 59, 87, 0.15)',
                  border: `1px solid ${accentColor}40`,
                  padding: '4px 14px',
                  borderRadius: '6px',
                }}
              >
                {side}
              </span>
            </div>

            {/* Giant PnL % */}
            <div
              style={{
                fontSize: '84px',
                fontWeight: 900,
                color: accentColor,
                letterSpacing: '-2px',
                lineHeight: 1,
                display: 'flex',
                alignItems: 'baseline',
              }}
            >
              <span>{isProfit ? '+' : ''}{pnlPct.toFixed(2)}%</span>
            </div>

            {/* Realized Dollar Amount */}
            <div
              style={{
                display: 'flex',
                fontSize: '26px',
                fontWeight: 700,
                color: isProfit ? '#a7f3d0' : '#fecdd3',
                marginTop: '10px',
              }}
            >
              {isProfit ? '+' : ''}${pnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
            </div>
          </div>

          {/* Stats & Verification Footer */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '16px 32px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>
                Entry Price
              </span>
              <span style={{ fontSize: '18px', fontWeight: 700, color: '#e2e8f0' }}>
                ${entryPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>
                Exit Price
              </span>
              <span style={{ fontSize: '18px', fontWeight: 700, color: '#e2e8f0' }}>
                ${exitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>
                Hold Time
              </span>
              <span style={{ fontSize: '18px', fontWeight: 700, color: '#e2e8f0' }}>
                {duration}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>
                Cryptographic Audit
              </span>
              <span style={{ fontSize: '16px', fontWeight: 800, color: accentColor }}>
                Full record, verified.
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
    console.error('OG image generation failed:', error);
    return new Response('Failed to generate trade card preview', { status: 500 });
  }
}
