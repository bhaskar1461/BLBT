// src/app/api/og/scoreboard/route.tsx
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const caller = searchParams.get('caller') || 'YouTube Traders';
    const accuracy = searchParams.get('accuracy') || '17.6%';
    const wrongPct = searchParams.get('wrong') || '82.4%';
    const totalCalls = searchParams.get('calls') || '17';
    const headline =
      searchParams.get('headline') || '82% of YouTube calls this month were wrong.';

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
              'radial-gradient(circle at 50% 20%, rgba(239, 68, 68, 0.12), transparent 75%)',
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
                ⚖️
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    fontSize: '20px',
                    fontWeight: 800,
                    letterSpacing: '-0.5px',
                    color: '#ffffff',
                  }}
                >
                  CELSIUS SCOREBOARD
                </span>
                <span
                  style={{
                    fontSize: '12px',
                    color: '#ef4444',
                    fontWeight: 700,
                    letterSpacing: '1px',
                  }}
                >
                  PUBLIC CALL ACCOUNTABILITY LEDGER
                </span>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 18px',
                borderRadius: '999px',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ef4444',
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '0.5px',
              }}
            >
              <span>BINANCE-SCORED CALLS</span>
            </div>
          </div>

          {/* Headline Truth Section */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              margin: '20px 0',
            }}
          >
            <span
              style={{
                fontSize: '14px',
                color: '#94a3b8',
                fontWeight: 600,
                letterSpacing: '1px',
                textTransform: 'uppercase',
              }}
            >
              Target: {caller} ({totalCalls} calls tracked)
            </span>
            <div
              style={{
                fontSize: '46px',
                fontWeight: 900,
                lineHeight: 1.15,
                color: '#ffffff',
                letterSpacing: '-1px',
              }}
            >
              &ldquo;{headline}&rdquo;
            </div>
            <span
              style={{
                fontSize: '16px',
                color: '#94a3b8',
                fontWeight: 500,
              }}
            >
              Every public trading call objectively scored against real Binance prices upon expiry.
            </span>
          </div>

          {/* Metrics Pill Grid */}
          <div
            style={{
              display: 'flex',
              gap: '24px',
              width: '100%',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                padding: '20px 24px',
                borderRadius: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <span
                style={{
                  fontSize: '12px',
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                }}
              >
                Failed / Wrong Rate
              </span>
              <span
                style={{
                  fontSize: '34px',
                  fontWeight: 900,
                  color: '#ef4444',
                  marginTop: '4px',
                }}
              >
                {wrongPct}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                padding: '20px 24px',
                borderRadius: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <span
                style={{
                  fontSize: '12px',
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                }}
              >
                Accuracy Rate
              </span>
              <span
                style={{
                  fontSize: '34px',
                  fontWeight: 900,
                  color: '#10b981',
                  marginTop: '4px',
                }}
              >
                {accuracy}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                padding: '20px 24px',
                borderRadius: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <span
                style={{
                  fontSize: '12px',
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                }}
              >
                Grounding Philosophy
              </span>
              <span
                style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  color: '#f59e0b',
                  marginTop: '10px',
                }}
              >
                Neutral. Factual. Undeniable.
              </span>
            </div>
          </div>

          {/* Footer Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              paddingTop: '20px',
              fontSize: '13px',
              color: '#64748b',
            }}
          >
            <span>celsius.network/scoreboard • Free Public Verification</span>
            <span>&ldquo;The only trading platform that profits from you not losing money.&rdquo;</span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (err) {
    console.error('Error generating scoreboard OG image:', err);
    return new Response('Failed to generate image', { status: 500 });
  }
}
