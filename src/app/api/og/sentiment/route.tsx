// src/app/api/og/sentiment/route.tsx
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const symbol = (searchParams.get('symbol') || 'BTCUSDT').toUpperCase();
    const longPct = parseInt(searchParams.get('long') || '71', 10);
    const shortPct = 100 - longPct;
    const wrongCount = parseInt(searchParams.get('wrong') || '8', 10);
    const totalCount = parseInt(searchParams.get('total') || '12', 10);

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
              'radial-gradient(circle at 50% 25%, rgba(245, 158, 11, 0.15), transparent 75%)',
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
                  background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  fontWeight: 900,
                  color: '#0c0d12',
                }}
              >
                📊
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    fontSize: '22px',
                    fontWeight: 800,
                    letterSpacing: '-0.5px',
                    color: '#ffffff',
                  }}
                >
                  Celsius Sentiment Index
                </span>
                <span style={{ fontSize: '13px', color: '#9ca3af' }}>
                  The Honest Terminal • Contrarian Intelligence
                </span>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                padding: '8px 16px',
                borderRadius: '999px',
                fontSize: '13px',
                fontWeight: 700,
                color: '#f59e0b',
                letterSpacing: '0.5px',
              }}
            >
              HERD VS REALITY
            </div>
          </div>

          {/* Core Visual Banner */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '24px',
              padding: '36px 44px',
              gap: '20px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                <span style={{ fontSize: '38px', fontWeight: 900, color: '#ffffff' }}>
                  {symbol}
                </span>
                <span style={{ fontSize: '18px', color: '#9ca3af' }}>
                  Retail Paper Positioning
                </span>
              </div>

              <div style={{ display: 'flex', gap: '16px', fontSize: '16px', fontWeight: 700 }}>
                <span style={{ color: '#00f090' }}>LONGS: {longPct}%</span>
                <span style={{ color: '#ff3b57' }}>SHORTS: {shortPct}%</span>
              </div>
            </div>

            {/* Split Bar */}
            <div
              style={{
                display: 'flex',
                width: '100%',
                height: '24px',
                borderRadius: '12px',
                overflow: 'hidden',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  width: `${longPct}%`,
                  height: '100%',
                  backgroundColor: '#00f090',
                }}
              />
              <div
                style={{
                  display: 'flex',
                  width: `${shortPct}%`,
                  height: '100%',
                  backgroundColor: '#ff3b57',
                }}
              />
            </div>

            {/* Insight Statement */}
            <div
              style={{
                display: 'flex',
                fontSize: '20px',
                color: '#e5e7eb',
                fontWeight: 600,
                lineHeight: '1.4',
              }}
            >
              {`Retail crowd has been wrong ${wrongCount} of last ${totalCount} significant moves on ${symbol}.`}
            </div>
          </div>

          {/* Footer Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '14px',
              color: '#9ca3af',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              paddingTop: '24px',
            }}
          >
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <span>Aggregate-Only Data</span>
              <span>•</span>
              <span>25+ Trader Cohort Barrier</span>
              <span>•</span>
              <span style={{ color: '#00f090', fontWeight: 700 }}>Full record, verified.</span>
            </div>
            <div style={{ display: 'flex', fontWeight: 700, color: '#ffffff' }}>
              celsius.network/sentiment
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    return new Response(`Failed to generate sentiment OG image: ${e.message}`, { status: 500 });
  }
}
