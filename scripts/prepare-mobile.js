import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const distDir = path.join(rootDir, 'dist');
const publicDir = path.join(rootDir, 'public');
const iosPublicDir = path.join(rootDir, 'ios', 'App', 'App', 'public');

// Ensure directories exist
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}
if (!fs.existsSync(iosPublicDir)) {
  fs.mkdirSync(iosPublicDir, { recursive: true });
}

// Copy public assets to dist and iosPublicDir
if (fs.existsSync(publicDir)) {
  const publicFiles = fs.readdirSync(publicDir);
  for (const file of publicFiles) {
    const src = path.join(publicDir, file);
    const destDist = path.join(distDir, file);
    const destIos = path.join(iosPublicDir, file);
    try {
      if (fs.statSync(src).isFile()) {
        fs.copyFileSync(src, destDist);
        fs.copyFileSync(src, destIos);
      }
    } catch (e) {
      console.warn(`[prepare-mobile] Warning copying ${file}:`, e.message);
    }
  }
}

// Generate authentic Bloomberg Professional Anywhere Mobile Terminal in dist/index.html & ios/App/App/public/index.html
const mobileBloombergAnywhereHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
  <title>CELSIUS TERMINAL — ANYWHERE</title>
  <link rel="icon" type="image/png" href="icon.png" />
  <style>
    :root {
      --bg: #080a0f;
      --panel-bg: #0c1018;
      --panel-header: #121824;
      --panel-border: #1a2336;
      --amber: #f59e0b;
      --amber-dim: rgba(245, 158, 11, 0.15);
      --cyan: #38bdf8;
      --green: #10b981;
      --red: #f43f5e;
      --yellow: #eab308;
      --text-white: #ffffff;
      --text-muted: #94a3b8;
      --text-dim: #64748b;
      --safe-top: env(safe-area-inset-top, 44px);
      --safe-bottom: env(safe-area-inset-bottom, 34px);
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-tap-highlight-color: transparent;
      user-select: none;
      -webkit-user-select: none;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif;
    }
    body {
      background-color: var(--bg);
      color: var(--text-white);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      overflow-x: hidden;
      padding-top: var(--safe-top);
      padding-bottom: calc(var(--safe-bottom) + 60px);
    }

    /* Pinned Top Terminal Header */
    .terminal-header {
      position: sticky;
      top: 0;
      z-index: 100;
      background: #000000;
      border-bottom: 2px solid var(--panel-border);
      padding: 8px 12px;
    }
    .telemetry-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 10px;
      color: var(--text-dim);
      border-bottom: 1px solid #101622;
      padding-bottom: 4px;
      margin-bottom: 6px;
    }
    .brand-id {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 800;
      color: var(--amber);
    }
    .pulse-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--amber);
      box-shadow: 0 0 6px var(--amber);
      animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.35; transform: scale(0.8); }
    }
    .header-main-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .header-title-box {
      display: flex;
      flex-direction: column;
      line-height: 1.1;
    }
    .header-title {
      font-size: 15px;
      font-weight: 900;
      letter-spacing: 0.5px;
      color: #ffffff;
      text-transform: uppercase;
    }
    .header-subtitle {
      font-size: 9px;
      font-weight: 800;
      color: var(--amber);
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-top: 2px;
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .btn-key {
      padding: 4px 8px;
      background: #101622;
      border: 1px solid var(--panel-border);
      color: var(--cyan);
      font-size: 10px;
      font-weight: 800;
      cursor: pointer;
    }
    .btn-key:active { background: #182436; }

    /* Mnemonic Ribbon */
    .mnemonic-ribbon {
      display: flex;
      gap: 6px;
      overflow-x: auto;
      padding: 6px 12px;
      background: #05070a;
      border-bottom: 1px solid var(--panel-border);
      scrollbar-width: none;
    }
    .mnemonic-ribbon::-webkit-scrollbar { display: none; }
    .m-chip {
      padding: 3px 8px;
      background: #0d121c;
      border: 1px solid #1a2436;
      font-size: 10px;
      font-weight: 800;
      color: var(--text-muted);
      white-space: nowrap;
      cursor: pointer;
    }
    .m-chip.active {
      background: var(--amber);
      color: #000000;
      border-color: var(--amber);
    }

    /* Screen Views */
    .tab-view {
      display: none;
      flex-direction: column;
      width: 100%;
      padding: 8px 12px;
      gap: 10px;
    }
    .tab-view.active { display: flex; }

    /* Institutional Panels */
    .panel {
      background: var(--panel-bg);
      border: 1px solid var(--panel-border);
      display: flex;
      flex-direction: column;
    }
    .panel-bar {
      background: var(--panel-header);
      border-bottom: 1px solid var(--panel-border);
      padding: 6px 10px;
      font-size: 10px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: var(--text-muted);
    }
    .panel-bar strong { color: var(--amber); }

    /* Dense Monospace Quotes Table */
    .quote-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 10px;
      border-bottom: 1px solid #141b26;
      cursor: pointer;
      font-size: 12px;
    }
    .quote-row:last-child { border-bottom: none; }
    .quote-row:active { background: #101624; }
    .q-left {
      display: flex;
      flex-direction: column;
      min-width: 110px;
      line-height: 1.15;
    }
    .q-sym {
      font-weight: 900;
      color: var(--amber);
      font-size: 13px;
    }
    .q-tag {
      font-size: 9px;
      color: var(--cyan);
      font-weight: 700;
    }
    .q-name {
      font-size: 10px;
      color: var(--text-muted);
      margin-top: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 120px;
    }
    .q-right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      line-height: 1.15;
    }
    .q-price {
      font-size: 13px;
      font-weight: 900;
      color: #ffffff;
    }
    .q-chg {
      font-size: 11px;
      font-weight: 800;
      margin-top: 2px;
    }

    /* Bottom 5 Bloomberg Professional Function Keys */
    .bottom-nav {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: calc(56px + var(--safe-bottom));
      padding-bottom: var(--safe-bottom);
      background: #05070a;
      border-top: 2px solid var(--panel-border);
      display: flex;
      align-items: center;
      justify-content: space-around;
      z-index: 100;
    }
    .nav-btn {
      flex: 1;
      height: 100%;
      background: none;
      border: none;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 3px;
      color: var(--text-muted);
      cursor: pointer;
      font-size: 11px;
      font-weight: 900;
      letter-spacing: 0.5px;
    }
    .nav-btn.active {
      color: var(--amber);
    }
    .ib-beacon {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: var(--green);
      animation: pulse 1s infinite;
      margin-bottom: -1px;
    }

    /* Instant Bloomberg Chat View */
    .ib-chat-stream {
      display: flex;
      flex-direction: column;
      gap: 8px;
      height: 380px;
      overflow-y: auto;
      padding: 10px;
      background: #040609;
      border: 1px solid var(--panel-border);
    }
    .msg-row {
      display: flex;
      flex-direction: column;
      gap: 3px;
      font-size: 11px;
    }
    .msg-header {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 10px;
    }
    .msg-sender { font-weight: 900; }
    .msg-time { color: var(--text-dim); }
    .msg-body {
      padding: 6px 8px;
      background: #0c1018;
      border-left: 2px solid var(--panel-border);
      color: #e2e8f0;
      line-height: 1.4;
    }
    .msg-bot .msg-sender { color: var(--amber); }
    .msg-bot .msg-body {
      background: #0e1420;
      border-left-color: var(--amber);
    }
    .msg-user .msg-sender { color: var(--cyan); }
    .msg-user .msg-body {
      background: #0a131f;
      border-left-color: var(--cyan);
    }
    .msg-floor .msg-sender { color: var(--green); }
    .msg-floor .msg-body {
      background: #08140e;
      border-left-color: var(--green);
    }

    /* Modal / Popups */
    .modal-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.88);
      z-index: 200;
      align-items: flex-end;
      justify-content: center;
      padding: 8px;
    }
    .modal-overlay.open { display: flex; }
    .modal-box {
      width: 100%;
      max-width: 500px;
      background: #070a10;
      border: 2px solid var(--amber);
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-height: 88vh;
      overflow-y: auto;
    }
  </style>
</head>
<body>

  <!-- Top Pinned Celsius Terminal Header -->
  <header class="terminal-header">
    <div class="telemetry-row">
      <div class="brand-id">
        <span class="pulse-dot"></span>
        <span style="color:#ffffff">CELSIUS</span>
        <span>TERMINAL ANYWHERE</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;font-family:ui-monospace,monospace;">
        <span style="color:var(--green)">LIVE FEEDS</span>
        <span id="topClock" style="color:#ffffff;font-weight:700">10:48:12</span>
      </div>
    </div>

    <div class="header-main-row">
      <div class="header-title-box">
        <span class="header-title" id="screenTitle">MARKETS &amp; HIGHLIGHTS</span>
        <span class="header-subtitle" id="screenSubtitle">CELSIUS TERMINAL ANYWHERE</span>
      </div>

      <div class="header-actions">
        <button class="btn-key" onclick="openSearchModal()">SEARCH</button>
        <button class="btn-key" style="color:var(--amber)" onclick="switchTab('ib')">DESK AI</button>
        <button class="btn-key" style="color:var(--yellow)" onclick="openAlertsModal()">ALERTS</button>
      </div>
    </div>
  </header>

  <!-- Mnemonic Shortcut Ribbon -->
  <div class="mnemonic-ribbon">
    <div class="m-chip active" onclick="switchTab('mon')">Markets</div>
    <div class="m-chip" onclick="switchTab('wl')">Watchlist</div>
    <div class="m-chip" onclick="switchTab('port')">Portfolio</div>
    <div class="m-chip" onclick="switchTab('top')">News Wire</div>
    <div class="m-chip" onclick="switchTab('ib')">Desk AI</div>
    <div class="m-chip" onclick="switchTab('cmd')">More / Settings</div>
  </div>

  <!-- TAB 1: MARKETS & HIGHLIGHTS -->
  <div class="tab-view active" id="view-mon">
    <!-- Portfolio Summary Card (Tap to open full Portfolio tab) -->
    <div class="panel" style="border-color:var(--amber);cursor:pointer;" onclick="switchTab('port')">
      <div class="panel-bar">
        <span><strong>PORTFOLIO BLOTTER</strong> MASTER ACCOUNT #C782-9901</span>
        <span style="color:var(--amber);font-weight:700;">VIEW DETAILS &rarr;</span>
      </div>
      <div style="padding:10px;display:flex;justify-content:space-between;align-items:center;">
        <div>
          <div style="font-size:10px;color:var(--text-muted);font-family:ui-monospace,monospace;">NET WORTH VALUATION</div>
          <div style="font-size:22px;font-weight:900;color:#fff;margin-top:2px;font-family:ui-monospace,monospace;" id="navUsd">$36,000.00</div>
          <div style="font-size:11px;font-weight:800;color:var(--amber);font-family:ui-monospace,monospace;">≈ ₹30.00 Lakhs INR &bull; MARGIN 99.4% OK</div>
        </div>
        <div style="text-align:right;font-family:ui-monospace,monospace;">
          <div style="font-size:13px;font-weight:900;color:var(--green)">+2.31% TODAY</div>
          <div style="font-size:9px;color:var(--text-dim);margin-top:2px;">+$830.00 GAIN</div>
        </div>
      </div>
      <!-- BTC Benchmark Mirror -->
      <div style="padding:6px 10px;background:#0d111a;border-top:1px solid #141b26;font-size:10px;display:flex;justify-content:space-between;font-family:ui-monospace,monospace;">
        <span style="color:var(--amber)">BENCHMARK MIRROR:</span>
        <span>BTC BUY-AND-HOLD: <strong style="color:var(--green)">+1.42%</strong> &bull; YOU: <strong style="color:var(--green)">+2.31%</strong></span>
      </div>
    </div>

    <!-- Terminal Desk AI Trigger Banner -->
    <div style="padding:8px 10px;background:#0d1422;border:1px solid #20314a;display:flex;align-items:center;justify-content:space-between;cursor:pointer;" onclick="switchTab('ib')">
      <div style="display:flex;align-items:center;gap:8px;">
        <span class="ib-beacon"></span>
        <span style="font-size:11px;font-weight:800;color:var(--amber);">TERMINAL DESK AI ASSISTANT</span>
      </div>
      <span style="font-size:10px;color:var(--cyan);font-weight:700;">CHAT WITH DESK &rarr;</span>
    </div>

    <!-- Active Securities Blotter -->
    <div class="panel">
      <div class="panel-bar">
        <span><strong>LIVE SECURITIES SNAPSHOT</strong></span>
        <span style="color:var(--green)">STREAMING LIVE</span>
      </div>
      <div id="monQuotesBox"></div>
    </div>

    <!-- Financial Wire Headlines -->
    <div class="panel">
      <div class="panel-bar">
        <span><strong>FINANCIAL WIRE DISPATCH</strong></span>
        <span style="color:var(--cyan);cursor:pointer;" onclick="switchTab('top')">VIEW ALL &rarr;</span>
      </div>
      <div id="monNewsBox"></div>
    </div>
  </div>

  <!-- TAB: WATCHLIST VIEW -->
  <div class="tab-view" id="view-wl">
    <div class="panel">
      <div class="panel-bar">
        <span><strong>WATCHLIST MONITOR</strong></span>
        <span style="color:var(--green)">CUSTOM SECURITY BASKET</span>
      </div>
      <div style="display:flex;gap:4px;overflow-x:auto;padding:8px;">
        <button class="m-chip active" onclick="filterWlCategory(this, 'all')">My Watchlist</button>
        <button class="m-chip" onclick="filterWlCategory(this, 'crypto')">Crypto</button>
        <button class="m-chip" onclick="filterWlCategory(this, 'india')">India 🇮🇳</button>
        <button class="m-chip" onclick="filterWlCategory(this, 'tech')">Tech 🇺🇸</button>
      </div>
      <div id="wlQuotesBox"></div>
    </div>
  </div>

  <!-- TAB: PORTFOLIO & MARGIN BLOTTER VIEW -->
  <div class="tab-view" id="view-port">
    <!-- Simulation Guard -->
    <div style="padding:8px 10px;background:#0d121c;border:1px solid #1a2336;display:flex;justify-content:space-between;align-items:center;font-size:11px;">
      <span style="color:#cbd5e1;font-weight:700;">● SIMULATED PAPER TRADING &bull; LIVE BINANCE SPOT</span>
      <span style="color:var(--amber);font-weight:800;font-size:10px;padding:2px 6px;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);">1.0% RISK CAP</span>
    </div>

    <!-- Master Net Worth Card -->
    <div class="panel" style="border-color:var(--amber);padding:12px;background:linear-gradient(180deg, #0d121c 0%, #070a10 100%);">
      <div style="font-size:11px;color:var(--text-muted);font-weight:700;">TOTAL PORTFOLIO VALUE (NET WORTH)</div>
      <div style="display:flex;align-items:baseline;gap:8px;margin-top:2px;font-family:ui-monospace,monospace;">
        <div style="font-size:26px;font-weight:900;color:#fff;">$36,000.00</div>
        <div style="font-size:14px;font-weight:800;color:var(--amber);">≈ ₹30.00 Lakhs INR</div>
      </div>
      <div style="font-size:10px;color:var(--text-dim);margin-top:2px;font-family:ui-monospace,monospace;">1 USDT &asymp; 83.33 INR &bull; 8-Decimal Integer Ledger (Wei/Satoshi)</div>

      <!-- Quick Metrics Grid -->
      <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:6px;margin-top:10px;padding-top:8px;border-top:1px solid #1a2336;font-family:ui-monospace,monospace;">
        <div style="padding:6px;background:#080b12;border:1px solid #161f30;border-radius:4px;">
          <div style="font-size:9px;color:var(--text-muted)">AVAILABLE CASH</div>
          <div style="font-size:13px;font-weight:800;color:var(--green)">$3,400.00</div>
          <div style="font-size:9px;color:var(--text-dim)">9.4% Liquid</div>
        </div>
        <div style="padding:6px;background:#080b12;border:1px solid #161f30;border-radius:4px;">
          <div style="font-size:9px;color:var(--text-muted)">ALLOCATED MARGIN</div>
          <div style="font-size:13px;font-weight:800;color:#fff">$32,600.00</div>
          <div style="font-size:9px;color:var(--text-dim)">90.6% Invested</div>
        </div>
        <div style="padding:6px;background:#080b12;border:1px solid #161f30;border-radius:4px;">
          <div style="font-size:9px;color:var(--text-muted)">TODAY'S P&amp;L</div>
          <div style="font-size:13px;font-weight:800;color:var(--green)">+$830.00</div>
          <div style="font-size:9px;color:var(--green)">+2.31% Net</div>
        </div>
      </div>

      <!-- Asset Allocation Bar -->
      <div style="margin-top:10px;">
        <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text-muted);margin-bottom:4px;font-family:ui-monospace,monospace;">
          <span>Asset Allocation</span>
          <span>BTC 46.4% &bull; ETH 23.7% &bull; SOL 11.3% &bull; Cash 9.4%</span>
        </div>
        <div style="height:8px;width:100%;background:#161f30;border-radius:4px;overflow:hidden;display:flex;">
          <div style="width:46.4%;background:var(--amber);" title="BTC"></div>
          <div style="width:23.7%;background:#38bdf8;" title="ETH"></div>
          <div style="width:11.3%;background:#a855f7;" title="SOL"></div>
          <div style="width:9.4%;background:var(--green);" title="Cash"></div>
          <div style="width:9.2%;background:#64748b;" title="Other"></div>
        </div>
      </div>
    </div>

    <!-- Benchmark Mirror -->
    <div style="padding:8px 10px;background:#0a0e17;border:1px solid #1a2336;font-size:10px;display:flex;justify-content:space-between;align-items:center;font-family:ui-monospace,monospace;">
      <div>
        <span style="color:var(--amber);font-weight:700;">BUY-AND-HOLD BENCHMARK:</span>
        <span style="color:#fff;margin-left:4px;">BTC: <strong style="color:var(--green)">+1.42%</strong> &bull; Strategy: <strong style="color:var(--green)">+2.31%</strong></span>
      </div>
      <span style="color:var(--green);font-weight:800;padding:2px 4px;background:rgba(16,185,129,0.1);">OUTPERFORMING</span>
    </div>

    <!-- Sub-Accounts Blotter -->
    <div class="panel">
      <div class="panel-bar">
        <span><strong>SUB-ACCOUNTS BREAKDOWN</strong></span>
        <span>STATUS</span>
      </div>
      <div style="padding:8px;background:#0b0f17;border-bottom:1px solid #1c2436;display:flex;justify-content:space-between;align-items:center;font-family:ui-monospace,monospace;">
        <div>
          <div style="font-size:10px;color:var(--text-muted);font-weight:700">ACCOUNT #C782-9901 (INSTITUTIONAL MASTER MARGIN)</div>
          <div style="font-size:16px;font-weight:900;color:#fff;margin-top:2px;">$24,500.00</div>
          <div style="font-size:10px;font-weight:800;color:var(--amber);">≈ ₹20.41 Lakhs INR</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:12px;font-weight:900;color:var(--green)">+2.31%</div>
          <div style="font-size:9px;color:var(--text-dim);margin-top:2px;">MARGIN OK</div>
        </div>
      </div>
      <div style="padding:8px;background:#0b0f17;display:flex;justify-content:space-between;align-items:center;font-family:ui-monospace,monospace;">
        <div>
          <div style="font-size:10px;color:var(--text-muted);font-weight:700">ACCOUNT #D441-2044 (DERIVATIVES &amp; L/S HEDGE)</div>
          <div style="font-size:16px;font-weight:900;color:#fff;margin-top:2px;">$11,500.00</div>
          <div style="font-size:10px;font-weight:800;color:var(--amber);">≈ ₹9.58 Lakhs INR</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:12px;font-weight:900;color:var(--green)">+0.92%</div>
          <div style="font-size:9px;color:var(--text-dim);margin-top:2px;">MARGIN OK</div>
        </div>
      </div>
    </div>

    <!-- Active Positions Blotter -->
    <div class="panel">
      <div class="panel-bar">
        <span><strong>OPEN POSITIONS BLOTTER</strong></span>
        <span style="color:var(--green)">3 ACTIVE</span>
      </div>
      <div style="padding:8px 10px;border-bottom:1px solid #161f30;display:flex;justify-content:space-between;align-items:center;font-family:ui-monospace,monospace;">
        <div>
          <div style="display:flex;align-items:center;gap:6px;">
            <strong style="color:#fff;font-size:12px;">BTC/USDT</strong>
            <span style="padding:1px 4px;background:rgba(16,185,129,0.15);color:var(--green);font-size:9px;font-weight:700;">LONG 1x</span>
          </div>
          <div style="font-size:10px;color:var(--text-muted);margin-top:2px;">Size: 0.264 &bull; Entry: $62,450.00</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:12px;font-weight:800;color:var(--green)">+$220.31 (+1.33%)</div>
          <button onclick="playOrderFill();this.parentElement.parentElement.remove();" style="margin-top:2px;padding:2px 6px;background:#1a2336;border:1px solid #28354e;color:#fff;font-size:9px;cursor:pointer;">CLOSE</button>
        </div>
      </div>
      <div style="padding:8px 10px;border-bottom:1px solid #161f30;display:flex;justify-content:space-between;align-items:center;font-family:ui-monospace,monospace;">
        <div>
          <div style="display:flex;align-items:center;gap:6px;">
            <strong style="color:#fff;font-size:12px;">ETH/USDT</strong>
            <span style="padding:1px 4px;background:rgba(16,185,129,0.15);color:var(--green);font-size:9px;font-weight:700;">LONG 1x</span>
          </div>
          <div style="font-size:10px;color:var(--text-muted);margin-top:2px;">Size: 2.45 &bull; Entry: $3,420.00</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:12px;font-weight:800;color:var(--green)">+$171.99 (+2.05%)</div>
          <button onclick="playOrderFill();this.parentElement.parentElement.remove();" style="margin-top:2px;padding:2px 6px;background:#1a2336;border:1px solid #28354e;color:#fff;font-size:9px;cursor:pointer;">CLOSE</button>
        </div>
      </div>
      <div style="padding:8px 10px;display:flex;justify-content:space-between;align-items:center;font-family:ui-monospace,monospace;">
        <div>
          <div style="display:flex;align-items:center;gap:6px;">
            <strong style="color:#fff;font-size:12px;">SOL/USDT</strong>
            <span style="padding:1px 4px;background:rgba(16,185,129,0.15);color:var(--green);font-size:9px;font-weight:700;">LONG 1x</span>
          </div>
          <div style="font-size:10px;color:var(--text-muted);margin-top:2px;">Size: 26.5 &bull; Entry: $148.50</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:12px;font-weight:800;color:var(--green)">+$156.35 (+3.97%)</div>
          <button onclick="playOrderFill();this.parentElement.parentElement.remove();" style="margin-top:2px;padding:2px 6px;background:#1a2336;border:1px solid #28354e;color:#fff;font-size:9px;cursor:pointer;">CLOSE</button>
        </div>
      </div>
    </div>
  </div>

  <!-- TAB 2: <EMSX> EXECUTION MANAGEMENT SYSTEM -->
  <div class="tab-view" id="view-emsx">
    <!-- Command Prompt Input -->
    <div style="display:flex;align-items:center;background:#070a10;border:1px solid var(--amber);padding:6px 10px;">
      <span style="color:var(--amber);font-weight:900;font-size:12px;margin-right:8px;">WEI &gt;</span>
      <input type="text" id="emsxSearchInput" placeholder="ENTER TICKER OR SECURITY (E.G. BTC, NIFTY, AAPL)..." oninput="filterEmsxQuotes(this.value)" style="width:100%;background:transparent;border:none;outline:none;color:#fff;font-size:11px;font-weight:800;text-transform:uppercase;" />
    </div>

    <!-- Asset Class Mnemonic Filter Keys -->
    <div style="display:flex;gap:4px;overflow-x:auto;">
      <button class="m-chip active" onclick="filterEmsxCategory(this, 'all')">&lt;ALL MARKETS&gt;</button>
      <button class="m-chip" onclick="filterEmsxCategory(this, 'india')">&lt;INDIA EQ 🇮🇳&gt;</button>
      <button class="m-chip" onclick="filterEmsxCategory(this, 'tech')">&lt;GLOBAL TECH 🇺🇸&gt;</button>
      <button class="m-chip" onclick="filterEmsxCategory(this, 'crypto')">&lt;CRYPTO MAJORS&gt;</button>
      <button class="m-chip" onclick="filterEmsxCategory(this, 'commodities')">&lt;COMDTY 🟡&gt;</button>
    </div>

    <!-- Indices Tape -->
    <div class="panel">
      <div class="panel-bar">
        <span><strong>WEI INDICES</strong> GLOBAL BENCHMARKS</span>
        <span>REAL-TIME</span>
      </div>
      <div style="display:flex;gap:6px;overflow-x:auto;padding:8px;" id="emsxIndicesStrip"></div>
    </div>

    <!-- Master Execution Securities List -->
    <div class="panel">
      <div class="panel-bar">
        <span><strong>EMSX BLOTTER</strong> EXECUTION INSTRUMENTS</span>
        <span id="emsxCountTag" style="color:var(--cyan)">COUNT: 11</span>
      </div>
      <div id="emsxQuotesBox"></div>
    </div>
  </div>

  <!-- TAB 3: <TOP> REAL-TIME NEWS WIRE -->
  <div class="tab-view" id="view-top">
    <!-- Wire Filters -->
    <div style="display:flex;gap:4px;overflow-x:auto;">
      <button class="m-chip active" onclick="filterTopNews(this, 'ALL')">&lt;ALL WIRE&gt;</button>
      <button class="m-chip" onclick="filterTopNews(this, 'MACRO')">&lt;MACRO&gt;</button>
      <button class="m-chip" onclick="filterTopNews(this, 'EQUITIES')">&lt;EQUITIES&gt;</button>
      <button class="m-chip" onclick="filterTopNews(this, 'CRYPTO')">&lt;CRYPTO&gt;</button>
      <button class="m-chip" onclick="filterTopNews(this, 'COMDTY')">&lt;COMDTY&gt;</button>
    </div>

    <div class="panel">
      <div class="panel-bar">
        <span><strong>FINANCIAL WIRE</strong> REAL-TIME EDITORIAL DISPATCH</span>
        <span style="color:var(--green)">LIVE WIRE FEED</span>
      </div>
      <div id="topNewsBox"></div>
    </div>
  </div>

  <!-- TAB 4: <DESK> TERMINAL DESK AI MESSAGING -->
  <div class="tab-view" id="view-ib">
    <div class="panel" style="border-color:var(--amber);">
      <div class="panel-bar">
        <span style="display:flex;align-items:center;gap:6px;">
          <span class="ib-beacon"></span>
          <strong>TERMINAL DESK AI &lt;DESK &lt;GO&gt;&gt;</strong>
        </span>
        <span style="color:var(--cyan)">DESK BOT ARMED</span>
      </div>

      <!-- Active Channel Buttons -->
      <div style="display:flex;gap:4px;padding:6px;background:#0d121c;border-bottom:1px solid var(--panel-border);">
        <button class="m-chip active" onclick="switchIbChannel(this, 'helpdesk')">&lt;HELP DESK&gt;</button>
        <button class="m-chip" onclick="switchIbChannel(this, 'liquidity')">&lt;FLOWS #402&gt;</button>
        <button class="m-chip" onclick="switchIbChannel(this, 'risk')">&lt;RISK 1.0%&gt;</button>
      </div>

      <!-- Chat History -->
      <div class="ib-chat-stream" id="ibChatStream">
        <div class="msg-row msg-bot">
          <div class="msg-header">
            <span class="msg-sender">[CELSIUS DESK AI]</span>
            <span class="msg-time">10:48:10</span>
          </div>
          <div class="msg-body">
            Welcome to Celsius Terminal Desk AI. I am your institutional terminal assistant. Type <strong>QUOTE BTC</strong>, <strong>PORT STATUS</strong>, <strong>RISK CAP</strong>, or <strong>HELP FUNCTIONS</strong> to interact with the desk.
          </div>
        </div>

        <div class="msg-row msg-floor">
          <div class="msg-header">
            <span class="msg-sender">[OTC LIQUIDITY ROOM #402]</span>
            <span class="msg-time">10:47:33</span>
          </div>
          <div class="msg-body">
            BLOCK FILL: 25.00000000 BTC matched at $63,280.00 via dark liquidity pool. Fee drag: 0.10% spot. Ledger verified.
          </div>
        </div>
      </div>

      <!-- Command Chips -->
      <div style="display:flex;gap:4px;overflow-x:auto;padding:6px;background:#080b11;border-top:1px solid #141b26;">
        <button class="m-chip" onclick="sendIbPreset('QUOTE BTC')">QUOTE BTC</button>
        <button class="m-chip" onclick="sendIbPreset('QUOTE NIFTY')">QUOTE NIFTY</button>
        <button class="m-chip" onclick="sendIbPreset('PORT STATUS')">PORT STATUS</button>
        <button class="m-chip" onclick="sendIbPreset('RISK CAP')">RISK CAP</button>
        <button class="m-chip" onclick="sendIbPreset('HELP FUNCTIONS')">HELP</button>
      </div>

      <!-- Chat Input Prompt -->
      <div style="display:flex;align-items:center;background:#070a10;border-top:1px solid var(--panel-border);padding:6px 8px;">
        <span style="color:var(--amber);font-weight:900;font-size:12px;margin-right:6px;">DESK &gt;</span>
        <input type="text" id="ibMessageInput" placeholder="TYPE MESSAGE OR COMMAND TO DESK..." onkeydown="if(event.key==='Enter')sendIbMessage()" style="flex:1;background:transparent;border:none;outline:none;color:#fff;font-size:11px;font-weight:700;text-transform:uppercase;" />
        <button onclick="sendIbMessage()" style="padding:4px 10px;background:var(--amber);color:#000;font-weight:900;font-size:10px;border:none;cursor:pointer;">&lt;SEND&gt;</button>
      </div>
    </div>
  </div>

  <!-- TAB 5: <CMD> SYSTEM CONFIGURATION DESK -->
  <div class="tab-view" id="view-cmd">
    <!-- Operator Card -->
    <div class="panel">
      <div class="panel-bar">
        <span><strong>OPERATOR IDENTIFICATION</strong></span>
        <span style="color:var(--green)">PROFESSIONAL ACTIVE</span>
      </div>
      <div style="padding:10px;display:flex;justify-content:space-between;align-items:center;">
        <div>
          <div style="font-size:14px;font-weight:900;color:#fff;">BHASKAR SHARMA</div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">OPERATOR ID: BS-8841-TERMINAL &bull; INDIA 🇮🇳</div>
        </div>
        <div style="padding:3px 8px;background:var(--amber-dim);border:1px solid var(--amber);color:var(--amber);font-size:10px;font-weight:800;">
          VERIFIED TERMINAL
        </div>
      </div>
    </div>

    <!-- Functions List -->
    <div class="panel">
      <div class="panel-bar">
        <span><strong>SYSTEM FUNCTIONS</strong></span>
        <span>DISPATCH</span>
      </div>
      <div class="quote-row" onclick="openPortfoliosModal()">
        <span style="color:var(--amber);font-weight:900">&lt;PORT&gt; Portfolio &amp; Risk Blotter</span>
        <span style="color:var(--text-dim)">&rarr;</span>
      </div>
      <div class="quote-row" onclick="openAlertsModal()">
        <span style="color:var(--amber);font-weight:900">&lt;ALRT&gt; Volatility &amp; Drawdown Triggers</span>
        <span style="color:var(--text-dim)">&rarr;</span>
      </div>
      <div class="quote-row" onclick="switchTab('emsx')">
        <span style="color:var(--cyan);font-weight:900">&lt;EMSX&gt; Execution Management System</span>
        <span style="color:var(--text-dim)">&rarr;</span>
      </div>
      <div class="quote-row" onclick="switchTab('ib')">
        <span style="color:var(--green);font-weight:900">&lt;DESK&gt; Terminal Desk AI Assistant</span>
        <span style="color:var(--text-dim)">&rarr;</span>
      </div>
    </div>

    <!-- System Telemetry -->
    <div class="panel">
      <div class="panel-bar">
        <span><strong>TELEMETRY CONFIGURATION</strong></span>
        <span>STATUS</span>
      </div>
      <div class="quote-row">
        <span>Base Currency Valuation</span>
        <span style="color:var(--amber);font-weight:800">USD + INR PEGGED</span>
      </div>
      <div class="quote-row">
        <span>Binance Spot WebSocket</span>
        <span style="color:var(--green);font-weight:800">ONLINE (SUB-100MS)</span>
      </div>
      <div class="quote-row">
        <span>Biometric Hardware Enclave</span>
        <span style="color:var(--green);font-weight:800">FACE ID ARMED</span>
      </div>
      <div class="quote-row" onclick="window.location.reload()">
        <span style="color:var(--red);font-weight:800">&lt;RESET&gt; Reload Terminal Session</span>
        <span style="color:var(--red)">&circlearrowright;</span>
      </div>
    </div>

    <div style="text-align:center;font-size:10px;color:var(--text-dim);margin-top:10px;">
      CELSIUS TERMINAL ANYWHERE &bull; VERIFIED SECURE CLIENT
    </div>
  </div>

  <!-- Bottom 5 Bloomberg Function Keys -->
  <!-- Bottom 5 Primary Navigation Destinations -->
  <nav class="bottom-nav">
    <button class="nav-btn active" onclick="switchTab('mon')" id="btn-mon">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
      <span>Markets</span>
    </button>

    <button class="nav-btn" onclick="switchTab('wl')" id="btn-wl">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
      <span>Watchlist</span>
    </button>

    <button class="nav-btn" onclick="switchTab('port')" id="btn-port">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
      <span>Portfolio</span>
    </button>

    <button class="nav-btn" onclick="switchTab('top')" id="btn-top">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
      <span>News</span>
    </button>

    <button class="nav-btn" onclick="switchTab('cmd')" id="btn-cmd">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
      <span>More</span>
    </button>
  </nav>

  <!-- MODAL 1: <PORT <GO>> Institutional Blotter Modal -->
  <div class="modal-overlay" id="portfoliosModal" onclick="closeAllModals()">
    <div class="modal-box" onclick="event.stopPropagation()">
      <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--panel-border);padding-bottom:6px;">
        <span style="font-weight:900;color:var(--amber);font-size:12px;">PORT &lt;GO&gt; &mdash; MASTER PORTFOLIO BLOTTER</span>
        <button onclick="closeAllModals()" style="padding:2px 6px;background:#101520;border:1px solid #1a2436;color:#fff;font-size:10px;">&lt;ESC&gt;</button>
      </div>

      <div style="padding:6px;background:#0d121c;border:1px solid #1f2a3e;font-size:10px;display:flex;justify-content:space-between;">
        <span>RISK CAP INVARIANT: <strong style="color:var(--green)">1.0% MAX PER TRADE</strong></span>
        <span>DAILY VaR (99%): <strong style="color:var(--yellow)">2.15%</strong></span>
      </div>

      <div style="display:flex;flex-direction:column;gap:6px;">
        <div style="padding:8px;background:#0b0f17;border:1px solid #1c2436;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-size:10px;color:var(--text-muted);font-weight:700">ACCOUNT #C782-9901 (INSTITUTIONAL MASTER MARGIN)</div>
            <div style="font-size:17px;font-weight:900;color:#fff;margin-top:2px;">$24,500.00</div>
            <div style="font-size:10px;font-weight:800;color:var(--amber);">≈ ₹20.41 Lakhs INR</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:12px;font-weight:900;color:var(--green)">+2.31%</div>
            <div style="font-size:9px;color:var(--text-dim);margin-top:2px;">MARGIN OK</div>
          </div>
        </div>

        <div style="padding:8px;background:#0b0f17;border:1px solid #1c2436;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-size:10px;color:var(--text-muted);font-weight:700">ACCOUNT #D441-2044 (DERIVATIVES &amp; L/S HEDGE)</div>
            <div style="font-size:17px;font-weight:900;color:#fff;margin-top:2px;">$11,500.00</div>
            <div style="font-size:10px;font-weight:800;color:var(--amber);">≈ ₹9.58 Lakhs INR</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:12px;font-weight:900;color:var(--green)">+0.92%</div>
            <div style="font-size:9px;color:var(--text-dim);margin-top:2px;">MARGIN OK</div>
          </div>
        </div>
      </div>

      <button onclick="closeAllModals();switchTab('emsx');" style="padding:8px;background:var(--amber);color:#000;font-weight:900;font-size:11px;border:none;cursor:pointer;">
        &lt;EXECUTE INSTRUMENTS IN EMSX &lt;GO&gt;&gt;
      </button>
    </div>
  </div>

  <!-- MODAL 2: <GP <GO>> & <DES <GO>> Quote Detail Modal -->
  <div class="modal-overlay" id="quoteModal" onclick="closeAllModals()">
    <div class="modal-box" onclick="event.stopPropagation()">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1px solid var(--panel-border);padding-bottom:6px;">
        <div>
          <span style="font-size:10px;color:var(--cyan);font-weight:800" id="detailClass">&lt;Curncy&gt; SPOT</span>
          <h2 style="font-size:20px;font-weight:900;color:var(--amber)" id="detailSymbol">BTCUSD</h2>
          <div style="font-size:10px;color:var(--text-muted)" id="detailName">Bitcoin Spot</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:20px;font-weight:900;color:#fff" id="detailPrice">$63,284.50</div>
          <div style="font-size:11px;font-weight:800;color:var(--green)" id="detailChange">+412.30 (+0.66%)</div>
        </div>
      </div>

      <!-- Candlestick Graphic Box -->
      <div style="height:150px;background:#000000;border:1px solid var(--panel-border);padding:4px;display:flex;align-items:center;justify-content:center;">
        <svg id="detailChartSvg" width="100%" height="100%" viewBox="0 0 320 140" preserveAspectRatio="none">
          <line x1="0" y1="35" x2="320" y2="35" stroke="#101724" stroke-dasharray="2 2" />
          <line x1="0" y1="70" x2="320" y2="70" stroke="#101724" stroke-dasharray="2 2" />
          <line x1="0" y1="105" x2="320" y2="105" stroke="#101724" stroke-dasharray="2 2" />
          <g id="chartCandlesGroup"></g>
        </svg>
      </div>

      <!-- Quick Action Buttons -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
        <button onclick="executeQuickTrade('BUY')" style="padding:8px;background:var(--green);color:#000;font-weight:900;font-size:11px;border:none;cursor:pointer;">
          &lt;BUY / LONG &lt;GO&gt;&gt;
        </button>
        <button onclick="executeQuickTrade('SELL')" style="padding:8px;background:var(--red);color:#fff;font-weight:900;font-size:11px;border:none;cursor:pointer;">
          &lt;SELL / SHORT &lt;GO&gt;&gt;
        </button>
      </div>

      <!-- Key Data Blotter -->
      <div style="border:1px solid var(--panel-border);background:#05070a;padding:6px;font-size:11px;">
        <div style="display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid #141b26;">
          <span style="color:var(--text-muted)">OPEN:</span>
          <span id="statOpen" style="font-weight:800">$62,870.00</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid #141b26;">
          <span style="color:var(--text-muted)">SESSION RANGE:</span>
          <span id="statRange" style="font-weight:800">$62,450 — $63,890</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:3px 0;">
          <span style="color:var(--text-muted)">EXECUTION FEE:</span>
          <span style="color:var(--cyan);font-weight:800">0.10% SPOT FLAT</span>
        </div>
      </div>

      <button onclick="closeAllModals()" style="padding:6px;background:#101520;border:1px solid var(--panel-border);color:var(--text-muted);font-size:10px;">
        &lt;CLOSE &lt;ESC&gt;&gt;
      </button>
    </div>
  </div>

  <!-- MODAL 3: <SECF <GO>> Security Finder Master -->
  <div class="modal-overlay" id="searchModal" onclick="closeAllModals()">
    <div class="modal-box" onclick="event.stopPropagation()">
      <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--panel-border);padding-bottom:6px;">
        <span style="font-weight:900;color:var(--amber);font-size:12px;">SECURITY FINDER &lt;SECF &lt;GO&gt;&gt;</span>
        <button onclick="closeAllModals()" style="padding:2px 6px;background:#101520;border:1px solid #1a2436;color:#fff;font-size:10px;">&lt;ESC&gt;</button>
      </div>

      <div style="display:flex;align-items:center;background:#05070a;border:1px solid var(--amber);padding:6px 8px;">
        <span style="color:var(--amber);font-weight:900;font-size:11px;margin-right:6px;">SECF &gt;</span>
        <input type="text" id="secfQueryInput" placeholder="SEARCH TICKER, MNEMONIC OR FUNCTION..." oninput="runSecfSearch(this.value)" style="width:100%;background:transparent;border:none;outline:none;color:#fff;font-size:11px;font-weight:800;text-transform:uppercase;" />
      </div>

      <div id="secfResultsBox" style="display:flex;flex-direction:column;gap:4px;max-height:300px;overflow-y:auto;"></div>
    </div>
  </div>

  <!-- MODAL 4: <ALRT <GO>> Active Triggers Modal -->
  <div class="modal-overlay" id="alertsModal" onclick="closeAllModals()">
    <div class="modal-box" onclick="event.stopPropagation()">
      <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--panel-border);padding-bottom:6px;">
        <span style="font-weight:900;color:var(--amber);font-size:12px;">ALRT &lt;GO&gt; &mdash; VOLATILITY TRIGGERS</span>
        <button onclick="closeAllModals()" style="padding:2px 6px;background:#101520;border:1px solid #1a2436;color:#fff;font-size:10px;">&lt;ESC&gt;</button>
      </div>

      <div style="display:flex;flex-direction:column;gap:4px;font-size:11px;">
        <div style="padding:6px 8px;background:#0c1018;border:1px solid var(--panel-border);display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-weight:900;color:#fff;">BTCUSD &gt; $65,000.00</div>
            <div style="font-size:9px;color:var(--text-muted)">High volatility breakout trigger</div>
          </div>
          <span style="padding:2px 6px;background:rgba(0,255,102,0.1);color:var(--green);border:1px solid rgba(0,255,102,0.3);font-size:9px;font-weight:800">ARMED</span>
        </div>

        <div style="padding:6px 8px;background:#0c1018;border:1px solid var(--panel-border);display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-weight:900;color:#fff;">NIFTY 50 &gt; 25,000.00</div>
            <div style="font-size:9px;color:var(--text-muted)">All-time high resistance level</div>
          </div>
          <span style="padding:2px 6px;background:rgba(0,255,102,0.1);color:var(--green);border:1px solid rgba(0,255,102,0.3);font-size:9px;font-weight:800">ARMED</span>
        </div>

        <div style="padding:6px 8px;background:#0c1018;border:1px solid var(--panel-border);display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-weight:900;color:#fff;">GOLD (XAU) &gt; $2,700.00</div>
            <div style="font-size:9px;color:var(--text-muted)">Sovereign reserve breakout alert</div>
          </div>
          <span style="padding:2px 6px;background:rgba(0,255,102,0.1);color:var(--green);border:1px solid rgba(0,255,102,0.3);font-size:9px;font-weight:800">ARMED</span>
        </div>
      </div>

      <button onclick="closeAllModals()" style="padding:6px;background:#101520;border:1px solid var(--panel-border);color:#fff;font-size:10px;">
        &lt;DISMISS ALERTS &lt;ESC&gt;&gt;
      </button>
    </div>
  </div>

  <script>
    // Audio Synthesizer
    let audioCtx = null;
    function getAudioCtx() {
      if (!audioCtx && typeof window !== 'undefined') {
        const AudioClass = window.AudioContext || window.webkitAudioContext;
        if (AudioClass) audioCtx = new AudioClass();
      }
      if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
      return audioCtx;
    }
    function playTick() {
      try {
        const ctx = getAudioCtx(); if (!ctx) return;
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.type = 'triangle'; osc.frequency.setValueAtTime(1400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.02);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(); osc.stop(ctx.currentTime + 0.02);
      } catch(e) {}
    }
    function playOrderFilled() {
      try {
        const ctx = getAudioCtx(); if (!ctx) return;
        const osc1 = ctx.createOscillator(); const osc2 = ctx.createOscillator(); const gain = ctx.createGain();
        osc1.type = 'sine'; osc1.frequency.setValueAtTime(880, ctx.currentTime);
        osc2.type = 'sine'; osc2.frequency.setValueAtTime(1320, ctx.currentTime + 0.06);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
        osc1.connect(gain); osc2.connect(gain); gain.connect(ctx.destination);
        osc1.start(); osc1.stop(ctx.currentTime + 0.06);
        osc2.start(ctx.currentTime + 0.06); osc2.stop(ctx.currentTime + 0.22);
      } catch(e) {}
    }

    // Telemetry Clock
    setInterval(() => {
      const now = new Date();
      const str = now.toTimeString().split(' ')[0];
      const el = document.getElementById('topClock');
      if (el) el.textContent = str;
    }, 1000);

    // Master Securities Universe
    const masterQuotes = [
      { s: 'BTCUSD', n: 'Bitcoin Spot', p: 63284.50, c: 412.30, pct: 0.66, up: true, tag: '<Curncy>', cat: 'crypto', curr: '$' },
      { s: 'NIFTY', n: 'Nifty 50 Index 🇮🇳', p: 24612.30, c: -120.45, pct: -0.49, up: false, tag: '<Index>', cat: 'india', curr: '₹' },
      { s: 'SENSEX', n: 'BSE Sensex 🇮🇳', p: 80814.73, c: 177.20, pct: 0.22, up: true, tag: '<Index>', cat: 'india', curr: '₹' },
      { s: 'GOLD', n: 'Gold Spot Bullion 🟡', p: 2658.20, c: 22.40, pct: 0.85, up: true, tag: '<Comdty>', cat: 'commodities', curr: '$' },
      { s: 'ETHUSD', n: 'Ethereum Spot', p: 3490.20, c: 64.50, pct: 1.85, up: true, tag: '<Curncy>', cat: 'crypto', curr: '$' },
      { s: 'AAPL', n: 'Apple Inc. (Nasdaq)', p: 178.32, c: -1.21, pct: -0.67, up: false, tag: '<Equity>', cat: 'tech', curr: '$' },
      { s: 'TSLA', n: 'Tesla Inc. (Nasdaq)', p: 248.17, c: 3.45, pct: 1.41, up: true, tag: '<Equity>', cat: 'tech', curr: '$' },
      { s: 'NVDA', n: 'NVIDIA Corp.', p: 141.18, c: 2.91, pct: 2.10, up: true, tag: '<Equity>', cat: 'tech', curr: '$' },
      { s: 'RELIANCE', n: 'Reliance Industries 🇮🇳', p: 2984.50, c: 32.10, pct: 1.09, up: true, tag: '<Equity>', cat: 'india', curr: '₹' },
      { s: 'SOLUSD', n: 'Solana Spot', p: 154.40, c: 6.20, pct: 4.20, up: true, tag: '<Curncy>', cat: 'crypto', curr: '$' },
      { s: 'BRENT', n: 'Brent Crude Oil 🛢️', p: 78.40, c: -0.89, pct: -1.12, up: false, tag: '<Comdty>', cat: 'commodities', curr: '$' }
    ];

    const masterNews = [
      {
        id: 'news-1',
        time: '10:48:12',
        source: 'BN',
        cat: 'MACRO',
        title: 'Global markets hold firm as Federal Reserve commentary signals measured pacing toward neutrality',
        bullets: ['Core inflation trajectory aligns with 2% target.', 'Asian equity bourses register net foreign inflows.']
      },
      {
        id: 'news-2',
        time: '10:45:03',
        source: 'MUMBAI',
        cat: 'EQUITIES',
        title: 'India NIFTY 50 and Sensex trade near record territory backed by domestic mutual fund systematic inflows',
        bullets: ['DII net purchases cross ₹14,000 Cr in current clearing cycle.', 'Large-cap financials and energy stocks lead.']
      },
      {
        id: 'news-3',
        time: '10:32:45',
        source: 'CRYPTO',
        cat: 'CRYPTO',
        title: 'Bitcoin tests resistance above $63,500 as regulated US Spot ETF clearing absorbs spot liquidity',
        bullets: ['Net institutional inflows surpass $450M.', 'Derivative open interest reaches quarterly high.']
      },
      {
        id: 'news-4',
        time: '10:18:20',
        source: 'COMDTY',
        cat: 'COMDTY',
        title: 'Spot Gold bullion holds above $2,650 as central bank sovereign reserve diversification continues',
        bullets: ['Sovereign net bullion demand remains firm.', 'Physical premiums in Asian trading hubs persist.']
      }
    ];

    const masterIndices = [
      { title: 'NIFTY 50', value: '24,612.30', change: '-0.49%', isUp: false, region: 'NSE' },
      { title: 'SENSEX', value: '80,814.73', change: '+0.22%', isUp: true, region: 'BSE' },
      { title: 'NASDAQ', value: '18,291.62', change: '+0.48%', isUp: true, region: 'US' },
      { title: 'GOLD (XAU)', value: '$2,658.20', change: '+0.85%', isUp: true, region: 'SPOT' },
      { title: 'BRENT OIL', value: '$78.40', change: '-1.12%', isUp: false, region: 'CRUDE' },
    ];

    function renderQuotes(targetId, list) {
      const container = document.getElementById(targetId);
      if (!container) return;
      container.innerHTML = list.map(q => {
        const sign = q.up ? '+' : '';
        const chgColor = q.up ? 'var(--green)' : 'var(--red)';
        return \`
          <div class="quote-row" onclick="openQuoteDetail('\${q.s}')">
            <div class="q-left">
              <div>
                <span class="q-sym">\${q.s}</span>
                <span class="q-tag">\${q.tag}</span>
              </div>
              <span class="q-name">\${q.n}</span>
            </div>
            <div class="q-right">
              <span class="q-price">\${q.curr}\${q.p.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
              <span class="q-chg" style="color:\${chgColor}">\${sign}\${q.c.toFixed(2)} (\${sign}\${q.pct.toFixed(2)}%)</span>
            </div>
          </div>
        \`;
      }).join('');
    }

    function renderNews(targetId, list) {
      const container = document.getElementById(targetId);
      if (!container) return;
      container.innerHTML = list.map((item, idx) => \`
        <div style="padding:8px 10px;border-bottom:1px solid #141b26;cursor:pointer;" onclick="playTick()">
          <div style="display:flex;align-items:center;gap:6px;font-size:10px;color:var(--text-muted);margin-bottom:2px;">
            <strong style="color:var(--amber)">\${idx + 1})</strong>
            <span style="color:#fff;font-weight:700">\${item.time}</span>
            <span style="color:var(--cyan)">[\${item.source}]</span>
            <span style="color:var(--yellow)">***</span>
            <span style="margin-left:auto;font-size:9px;color:var(--text-dim)">\${item.cat}</span>
          </div>
          <div style="font-size:11px;font-weight:700;color:#fff;line-height:1.3;">\${item.title}</div>
          <div style="font-size:10px;color:#94a3b8;margin-top:4px;border-left:2px solid #1f2a3e;padding-left:6px;">
            &bull; \${item.bullets[0]}
          </div>
        </div>
      \`).join('');
    }

    function renderIndices(targetId) {
      const container = document.getElementById(targetId);
      if (!container) return;
      container.innerHTML = masterIndices.map(idx => \`
        <div style="background:#0c1018;border:1px solid var(--panel-border);padding:6px 8px;min-width:110px;flex-shrink:0;">
          <div style="display:flex;justify-content:space-between;font-size:9px;color:var(--text-muted);">
            <strong style="color:#fff">\${idx.title}</strong>
            <span style="color:var(--cyan)">\${idx.region}</span>
          </div>
          <div style="font-size:12px;font-weight:900;color:#fff;margin-top:2px;">\${idx.value}</div>
          <div style="font-size:10px;font-weight:800;color:\${idx.isUp ? 'var(--green)' : 'var(--red)'}">\${idx.change}</div>
        </div>
      \`).join('');
    }

    // Tab Switching
    function switchTab(tab) {
      playTick();
      document.querySelectorAll('.tab-view').forEach(v => v.classList.remove('active'));
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

      const view = document.getElementById('view-' + tab);
      if (view) view.classList.add('active');

      const btn = document.getElementById('btn-' + tab);
      if (btn) btn.classList.add('active');

      const headers = {
        mon: ['MARKETS LAUNCHPAD', 'REAL-TIME GLOBAL CROSS-ASSET MONITOR'],
        wl: ['WATCHLIST MONITOR', 'CUSTOM CURATED SECURITY BASKET'],
        port: ['PORTFOLIO & RISK BLOTTER', 'NAV, ASSET ALLOCATION & POSITIONS'],
        emsx: ['EXECUTION BLOTTER', 'WORLD EQUITY INDICES & SPOT INSTRUMENTS'],
        top: ['REAL-TIME NEWS WIRE', 'EDITORIAL DISPATCH & MACRO INTELLIGENCE'],
        ib: ['TERMINAL DESK AI', 'INSTITUTIONAL QUANTITATIVE ASSISTANT'],
        cmd: ['SYSTEM CONFIGURATION', 'OPERATOR PROFILE & RISK CONTROLS']
      };
      const [title, sub] = headers[tab] || ['CELSIUS TERMINAL', 'PROFESSIONAL FINANCIAL PLATFORM'];
      document.getElementById('screenTitle').textContent = title;
      document.getElementById('screenSubtitle').textContent = sub;
      window.scrollTo(0, 0);
    }

    // Instant Bloomberg Bot Engine
    function sendIbPreset(text) {
      const input = document.getElementById('ibMessageInput');
      if (input) {
        input.value = text;
        sendIbMessage();
      }
    }

    function sendIbMessage() {
      const input = document.getElementById('ibMessageInput');
      if (!input || !input.value.trim()) return;
      playTick();
      const text = input.value.trim();
      input.value = '';

      const stream = document.getElementById('ibChatStream');
      const nowStr = new Date().toTimeString().split(' ')[0];

      // Append User message
      const userMsg = document.createElement('div');
      userMsg.className = 'msg-row msg-user';
      userMsg.innerHTML = \`
        <div class="msg-header">
          <span class="msg-sender">[BHASKAR SHARMA]</span>
          <span class="msg-time">\${nowStr}</span>
        </div>
        <div class="msg-body">\${text}</div>
      \`;
      stream.appendChild(userMsg);
      stream.scrollTop = stream.scrollHeight;

      // Bot Response
      setTimeout(() => {
        playOrderFilled();
        const upper = text.toUpperCase();
        let botText = '';

        if (upper.includes('BTC') || upper.includes('QUOTE BTC')) {
          botText = 'QUOTE: BTCUSD Spot = $63,284.50 (+0.66%) | Bid: $63,280.00 / Ask: $63,289.00 | Fee: 0.10% | Status: Highly Liquid.';
        } else if (upper.includes('NIFTY') || upper.includes('QUOTE NIFTY')) {
          botText = 'QUOTE: NIFTY 50 Index = 24,612.30 (-0.49%) | NSE India Spot | Range: 24,590.20 — 24,745.10 | Status: Market Open.';
        } else if (upper.includes('PORT') || upper.includes('STATUS')) {
          botText = 'PORT BLOTTER: Account #C782-9901 NAV = $36,000.00 (≈ ₹30.00 Lakhs INR) | Day P&L: +$830 (+2.31%) | Margin Utilization: 32.4% | VaR: 2.15% (OK).';
        } else if (upper.includes('RISK')) {
          botText = 'RISK INVARIANT: Maximum 1.0% risk cap strictly enforced across every trade. Max loss limit locks at 5% daily drawdown. Server ledger append-only.';
        } else if (upper.includes('HELP')) {
          botText = 'FUNCTIONS: Markets | Watchlist | Portfolio | News | More | Terminal Desk AI.';
        } else {
          botText = \`ACK \${upper}: Desk order book received. Routing through internal matching engine. Ledger state confirmed.\`;
        }

        const botMsg = document.createElement('div');
        botMsg.className = 'msg-row msg-bot';
        botMsg.innerHTML = \`
          <div class="msg-header">
            <span class="msg-sender">[CELSIUS DESK AI]</span>
            <span class="msg-time">\${nowStr}</span>
          </div>
          <div class="msg-body">\${botText}</div>
        \`;
        stream.appendChild(botMsg);
        stream.scrollTop = stream.scrollHeight;
      }, 400);
    }

    function switchIbChannel(el, ch) {
      playTick();
      el.parentElement.querySelectorAll('.m-chip').forEach(c => c.classList.remove('active'));
      el.classList.add('active');
    }

    // Modals Handling
    function openQuoteDetail(symbol) {
      playTick();
      const q = masterQuotes.find(item => item.s === symbol) || masterQuotes[0];
      document.getElementById('detailSymbol').textContent = q.s;
      document.getElementById('detailName').textContent = q.n;
      document.getElementById('detailClass').textContent = q.tag + ' SPOT';
      document.getElementById('detailPrice').textContent = q.curr + q.p.toLocaleString('en-US', {minimumFractionDigits: 2});
      const sign = q.up ? '+' : '';
      const chgEl = document.getElementById('detailChange');
      chgEl.textContent = \`\${sign}\${q.c.toFixed(2)} (\${sign}\${q.pct.toFixed(2)}%)\`;
      chgEl.style.color = q.up ? 'var(--green)' : 'var(--red)';

      document.getElementById('statOpen').textContent = q.curr + (q.p * 0.995).toFixed(2);
      document.getElementById('statRange').textContent = \`\${q.curr}\${(q.p*0.988).toFixed(2)} — \${q.curr}\${(q.p*1.012).toFixed(2)}\`;

      // Draw Candlesticks
      const group = document.getElementById('chartCandlesGroup');
      let html = '';
      for (let i = 0; i < 16; i++) {
        const isUp = Math.random() > 0.45;
        const cColor = isUp ? 'var(--green)' : 'var(--red)';
        const cx = 12 + i * 18;
        const topY = 30 + Math.random() * 50;
        const hY = 8 + Math.random() * 30;
        html += \`
          <line x1="\${cx}" y1="\${topY - 10}" x2="\${cx}" y2="\${topY + hY + 10}" stroke="\${cColor}" stroke-width="1.2"/>
          <rect x="\${cx - 5}" y="\${topY}" width="10" height="\${hY}" fill="\${cColor}" />
        \`;
      }
      group.innerHTML = html;
      document.getElementById('quoteModal').classList.add('open');
    }

    function executeQuickTrade(side) {
      playOrderFilled();
      const sym = document.getElementById('detailSymbol').textContent;
      const price = document.getElementById('detailPrice').textContent;
      alert(\`ORDER FILLED: \${side} 1.00000000 \${sym} @ \${price} (0.10% FEE DEDUCTED). LEDGER HASH COMMITTED.\`);
    }

    function openSearchModal() {
      playTick();
      document.getElementById('searchModal').classList.add('open');
      const input = document.getElementById('secfQueryInput');
      if (input) {
        input.value = '';
        setTimeout(() => input.focus(), 100);
        runSecfSearch('');
      }
    }

    function runSecfSearch(query) {
      const q = query.toLowerCase().trim();
      const box = document.getElementById('secfResultsBox');
      if (!box) return;

      const matchedFns = [
        { c: 'IB', n: 'Instant Bloomberg Desk', d: 'Broker & institutional AI chat bot' },
        { c: 'MON', n: 'Monitors Launchpad', d: 'Master multi-asset monitor' },
        { c: 'EMSX', n: 'Execution Blotter', d: 'Order routing & paper trading' },
        { c: 'TOP', n: 'Top News Wire', d: 'First Word real-time wire dispatch' },
        { c: 'PORT', n: 'Portfolio Analytics', d: 'Holdings, NAV & VaR blotter' },
      ].filter(f => !q || f.c.toLowerCase().includes(q) || f.n.toLowerCase().includes(q));

      const matchedQuotes = masterQuotes.filter(item => !q || item.s.toLowerCase().includes(q) || item.n.toLowerCase().includes(q));

      let html = '';
      if (matchedFns.length > 0) {
        html += '<div style="font-size:9px;color:var(--amber);font-weight:900;margin:4px 0;">FUNCTIONS:</div>';
        html += matchedFns.map(f => \`
          <div class="quote-row" onclick="closeAllModals();handleFnCode('\${f.c}')">
            <span style="color:var(--amber);font-weight:900">&lt;\${f.c}&gt; \${f.n}</span>
            <span style="font-size:10px;color:var(--text-dim)">&lt;GO&gt;</span>
          </div>
        \`).join('');
      }

      if (matchedQuotes.length > 0) {
        html += '<div style="font-size:9px;color:var(--cyan);font-weight:900;margin:6px 0 4px;">SECURITIES:</div>';
        html += matchedQuotes.map(s => \`
          <div class="quote-row" onclick="closeAllModals();openQuoteDetail('\${s.s}')">
            <div>
              <span style="font-weight:900;color:#fff">\${s.s}</span>
              <span style="font-size:10px;color:var(--text-dim);margin-left:4px">\${s.n}</span>
            </div>
            <span style="font-weight:900;color:#fff">\${s.curr}\${s.p.toFixed(2)}</span>
          </div>
        \`).join('');
      }
      box.innerHTML = html;
    }

    function handleFnCode(code) {
      if (code === 'IB') switchTab('ib');
      else if (code === 'MON') switchTab('mon');
      else if (code === 'EMSX') switchTab('emsx');
      else if (code === 'TOP') switchTab('top');
      else if (code === 'PORT') openPortfoliosModal();
    }

    function openPortfoliosModal() {
      playTick();
      document.getElementById('portfoliosModal').classList.add('open');
    }

    function openAlertsModal() {
      playTick();
      document.getElementById('alertsModal').classList.add('open');
    }

    function closeAllModals() {
      playTick();
      document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
    }

    function filterEmsxQuotes(query) {
      const q = query.toLowerCase().trim();
      const filtered = masterQuotes.filter(item => item.s.toLowerCase().includes(q) || item.n.toLowerCase().includes(q));
      renderQuotes('emsxQuotesBox', filtered);
      document.getElementById('emsxCountTag').textContent = 'COUNT: ' + filtered.length;
    }

    function filterEmsxCategory(el, cat) {
      playTick();
      el.parentElement.querySelectorAll('.m-chip').forEach(c => c.classList.remove('active'));
      el.classList.add('active');
      const filtered = cat === 'all' ? masterQuotes : masterQuotes.filter(q => q.cat === cat);
      renderQuotes('emsxQuotesBox', filtered);
      document.getElementById('emsxCountTag').textContent = 'COUNT: ' + filtered.length;
    }

    function filterTopNews(el, cat) {
      playTick();
      el.parentElement.querySelectorAll('.m-chip').forEach(c => c.classList.remove('active'));
      el.classList.add('active');
      const filtered = cat === 'ALL' ? masterNews : masterNews.filter(n => n.cat.includes(cat));
      renderNews('topNewsBox', filtered);
    }

    function filterWlCategory(el, cat) {
      playTick();
      el.parentElement.querySelectorAll('.m-chip').forEach(c => c.classList.remove('active'));
      el.classList.add('active');
      const filtered = cat === 'all'
        ? masterQuotes.filter(q => ['BTCUSD', 'NIFTY', 'GOLD', 'NVDA', 'ETHUSD'].includes(q.s))
        : masterQuotes.filter(q => q.cat === cat);
      renderQuotes('wlQuotesBox', filtered);
    }

    // Initialize Initial Views
    renderQuotes('monQuotesBox', masterQuotes.slice(0, 6));
    renderQuotes('wlQuotesBox', masterQuotes.filter(q => ['BTCUSD', 'NIFTY', 'GOLD', 'NVDA', 'ETHUSD'].includes(q.s)));
    renderNews('monNewsBox', masterNews.slice(0, 2));
    renderQuotes('emsxQuotesBox', masterQuotes);
    renderIndices('emsxIndicesStrip');
    renderNews('topNewsBox', masterNews);

    // Live Binance WebSocket Feed
    try {
      const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker');
      ws.onmessage = (e) => {
        const d = JSON.parse(e.data);
        if (d && d.c) {
          const p = parseFloat(d.c);
          const chg = parseFloat(d.p);
          const pct = parseFloat(d.P);
          const btcItem = masterQuotes.find(q => q.s === 'BTCUSD');
          if (btcItem) {
            btcItem.p = p;
            btcItem.c = chg;
            btcItem.pct = pct;
            btcItem.up = pct >= 0;
            renderQuotes('monQuotesBox', masterQuotes.slice(0, 6));
          }
        }
      };
    } catch(err) {}
  </script>
</body>
</html>`;

const indexPath = path.join(distDir, 'index.html');
const iosIndexPath = path.join(iosPublicDir, 'index.html');

fs.writeFileSync(indexPath, mobileBloombergAnywhereHtml, 'utf8');
fs.writeFileSync(iosIndexPath, mobileBloombergAnywhereHtml, 'utf8');

console.log(`[prepare-mobile] Successfully built authentic Bloomberg Terminal Mobile App in ${indexPath} and ${iosIndexPath}`);
