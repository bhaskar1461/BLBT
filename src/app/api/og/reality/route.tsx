// src/app/api/og/reality/route.tsx
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { realityService } from '@/lib/realityService';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const periodParam = searchParams.get('period');
    const period = periodParam === '90' ? 90 : 30;

    const stats = realityService.getRealityStats(period);

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
              'radial-gradient(circle at 50% 25%, rgba(239, 68, 68, 0.15), transparent 75%)',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #ef4444 0%, #f59e0b 100%)',
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
                <span style={{ fontSize: '13px', color: '#ef4444', letterSpacing: '1px' }}>
                  THE REALITY CHECK
                </span>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                padding: '8px 18px',
                borderRadius: '30px',
              }}
            >
              <span style={{ fontSize: '14px', fontWeight: 800, color: '#f87171' }}>
                AGGREGATE DATABASE PROOF ({period}D)
              </span>
            </div>
          </div>

          {/* Core Reality Statement */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              margin: '20px 0',
            }}
          >
            <span
              style={{
                fontSize: '44px',
                fontWeight: 900,
                color: '#ffffff',
                letterSpacing: '-1px',
                lineHeight: 1.2,
              }}
            >
              &quot;Everyone shows you their wins. We show you everything.&quot;
            </span>

            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '12px',
                marginTop: '18px',
              }}
            >
              <span
                style={{
                  fontSize: '88px',
                  fontWeight: 900,
                  color: '#ef4444',
                  lineHeight: 1,
                  textShadow: '0 0 40px rgba(239, 68, 68, 0.4)',
                }}
              >
                {stats.unprofitableTradersPct}%
              </span>
              <span style={{ fontSize: '32px', fontWeight: 800, color: '#fca5a5' }}>
                Lost Money
              </span>
            </div>
          </div>

          {/* 3 Metric Summary Pillars */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '20px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '20px 36px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>
                Median P&L
              </span>
              <span style={{ fontSize: '22px', fontWeight: 800, color: '#ef4444' }}>
                -${Math.abs(stats.medianPnlUsdt).toFixed(2)} USDT
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>
                Lost To BTC Buy & Hold
              </span>
              <span style={{ fontSize: '22px', fontWeight: 800, color: '#fbbf24' }}>
                {stats.buyAndHoldOutperformedPct}% of Traders
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>
                Avg Hold Duration
              </span>
              <span style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff' }}>
                {stats.averageHoldTimeFormatted}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>
                Integrity Guarantee
              </span>
              <span style={{ fontSize: '18px', fontWeight: 800, color: '#38bdf8' }}>
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
    console.error('Reality OG generation failed:', error);
    return new Response('Failed to generate reality check card preview', { status: 500 });
  }
}
