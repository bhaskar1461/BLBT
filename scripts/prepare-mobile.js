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

// Generate pristine Bloomberg Anywhere Mobile Experience in dist/index.html & ios/App/App/public/index.html
const mobileBloombergAnywhereHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
  <title>Bloomberg Anywhere — Professional</title>
  <link rel="icon" type="image/png" href="icon.png" />
  <style>
    :root {
      --bg: #000000;
      --card-bg: #0e1118;
      --card-border: #1b2230;
      --text: #ffffff;
      --text-muted: #8e95a5;
      --text-dim: #5c6475;
      --orange: #ff8800;
      --green: #00c176;
      --red: #ff4d4f;
      --blue: #2979ff;
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
    }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      overflow-x: hidden;
      padding-top: var(--safe-top);
      padding-bottom: calc(var(--safe-bottom) + 64px);
    }

    /* Pinned Top Terminal Header */
    .top-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: rgba(0, 0, 0, 0.95);
      backdrop-filter: blur(12px);
      position: sticky;
      top: 0;
      z-index: 100;
      border-bottom: 1px solid #181d28;
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-group {
      display: flex;
      flex-direction: column;
      line-height: 1.1;
    }
    .brand-title {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: -0.3px;
      color: #ffffff;
    }
    .brand-sub {
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 2px;
      color: var(--text-muted);
      text-transform: uppercase;
      margin-top: 1px;
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .icon-btn {
      background: none;
      border: none;
      color: #ffffff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      padding: 2px;
    }
    .notif-badge {
      position: absolute;
      top: -1px;
      right: -1px;
      width: 7px;
      height: 7px;
      background: var(--red);
      border-radius: 50%;
      box-shadow: 0 0 4px var(--red);
    }

    /* Bloomberg Function Shortcuts Bar (<GO>) */
    .fn-bar {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      background: #090c12;
      border-bottom: 1px solid #181f2b;
      overflow-x: auto;
      scrollbar-width: none;
    }
    .fn-bar::-webkit-scrollbar { display: none; }
    .fn-tag {
      font-family: monospace;
      font-size: 11px;
      font-weight: 900;
      background: rgba(255,136,0,0.18);
      color: var(--orange);
      border: 1px solid rgba(255,136,0,0.35);
      border-radius: 6px;
      padding: 3px 7px;
      white-space: nowrap;
      cursor: pointer;
    }
    .fn-btn {
      background: #141924;
      border: 1px solid #232b3d;
      color: #d1d5db;
      font-family: monospace;
      font-size: 11px;
      font-weight: 700;
      border-radius: 6px;
      padding: 4px 8px;
      white-space: nowrap;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .fn-btn:hover { border-color: var(--orange); color: #fff; }

    /* Market Sessions Pulse Strip */
    .pulse-strip {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px 16px;
      background: #05070a;
      border-bottom: 1px solid #131722;
      font-family: monospace;
      font-size: 10px;
    }
    .pulse-left {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--green);
    }
    .pulse-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--green);
      box-shadow: 0 0 6px var(--green);
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.85); }
    }
    .pulse-right {
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    /* Notification HUD */
    .hud-banner {
      display: none;
      position: fixed;
      top: calc(var(--safe-top) + 52px);
      left: 16px;
      right: 16px;
      background: #121824;
      border: 1px solid var(--orange);
      color: #fff;
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 700;
      z-index: 150;
      box-shadow: 0 4px 20px rgba(0,0,0,0.6);
      align-items: center;
      gap: 8px;
    }
    .hud-banner.active { display: flex; animation: slideDown 0.2s ease-out; }
    @keyframes slideDown { from { transform: translateY(-10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

    /* Profile Strip Card */
    .profile-card {
      margin: 14px 16px 4px;
      padding: 14px;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 14px;
      display: flex;
      align-items: center;
      gap: 14px;
      cursor: pointer;
    }
    .avatar-circle {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: #151a24;
      border: 2px solid #2b3547;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 19px;
      font-weight: 800;
      color: #ffffff;
      flex-shrink: 0;
    }
    .profile-details {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;
    }
    .profile-name-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .profile-name {
      font-size: 17px;
      font-weight: 700;
      color: #ffffff;
    }
    .status-indicator {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 11px;
      font-weight: 600;
      color: var(--green);
    }
    .status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--green);
      box-shadow: 0 0 6px var(--green);
    }
    .profile-role {
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 2px;
    }
    .profile-pill {
      display: inline-block;
      margin-top: 6px;
      font-size: 9px;
      font-weight: 800;
      font-family: monospace;
      color: var(--orange);
      background: rgba(255, 136, 0, 0.14);
      border: 1px solid rgba(255, 136, 0, 0.3);
      padding: 2px 7px;
      border-radius: 4px;
      width: fit-content;
      text-transform: uppercase;
    }

    /* Section Headers */
    .section-wrap {
      margin: 18px 16px 0;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .section-title {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1.5px;
      color: var(--text-muted);
      text-transform: uppercase;
    }
    .view-all-link {
      font-size: 12px;
      font-weight: 700;
      color: var(--orange);
      cursor: pointer;
    }

    /* Quotes & Watchlist Box */
    .watchlist-box {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 14px;
      overflow: hidden;
    }
    .quote-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 13px 14px;
      border-bottom: 1px solid rgba(24, 29, 40, 0.7);
      cursor: pointer;
      transition: background 0.15s;
    }
    .quote-row:last-child {
      border-bottom: none;
    }
    .quote-row:active {
      background: #151a24;
    }
    .quote-left {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 90px;
    }
    .quote-symbol {
      font-size: 15px;
      font-weight: 800;
      color: #ffffff;
      font-family: monospace;
    }
    .quote-name {
      font-size: 11px;
      color: var(--text-muted);
    }
    .quote-sparkline {
      width: 68px;
      height: 24px;
      flex-shrink: 0;
    }
    .quote-right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 3px;
    }
    .quote-price {
      font-size: 15px;
      font-weight: 800;
      font-family: monospace;
      color: #ffffff;
      letter-spacing: -0.2px;
    }
    .quote-pill {
      font-size: 11px;
      font-weight: 800;
      font-family: monospace;
      padding: 2px 7px;
      border-radius: 5px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .up-pill {
      background: rgba(0, 193, 118, 0.16);
      color: var(--green);
    }
    .down-pill {
      background: rgba(255, 77, 79, 0.16);
      color: var(--red);
    }

    /* Tab View Visibility */
    .tab-view {
      display: none;
      flex-direction: column;
      width: 100%;
    }
    .tab-view.active {
      display: flex;
    }

    /* Market Indices Strip */
    .indices-strip {
      display: flex;
      gap: 10px;
      overflow-x: auto;
      padding: 4px 16px 12px;
      scrollbar-width: none;
    }
    .indices-strip::-webkit-scrollbar { display: none; }
    .index-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 12px;
      min-width: 135px;
      flex-shrink: 0;
      cursor: pointer;
    }
    .index-card:active { border-color: var(--orange); }
    .index-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }
    .index-title {
      font-size: 11px;
      font-weight: 700;
      color: var(--text-muted);
    }
    .index-region {
      font-size: 9px;
      font-family: monospace;
      color: var(--text-dim);
    }
    .index-val {
      font-size: 15px;
      font-weight: 800;
      font-family: monospace;
      color: #ffffff;
    }
    .index-change {
      font-size: 11px;
      font-family: monospace;
      font-weight: 700;
      margin-top: 2px;
    }

    /* Search & Filter Bar */
    .search-input-wrap {
      margin: 14px 16px 4px;
      position: relative;
      display: flex;
      align-items: center;
    }
    .search-input {
      width: 100%;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 10px 14px 10px 38px;
      font-size: 14px;
      color: #fff;
      outline: none;
    }
    .search-input:focus { border-color: var(--orange); }
    .search-icon-pos {
      position: absolute;
      left: 12px;
      color: var(--text-muted);
      pointer-events: none;
    }

    /* Watchlist Category Pills */
    .capsule-bar {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding: 12px 16px 6px;
      scrollbar-width: none;
    }
    .capsule-bar::-webkit-scrollbar { display: none; }
    .capsule-btn {
      padding: 6px 14px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
      background: #141924;
      border: 1px solid #232b3d;
      color: var(--text-muted);
      cursor: pointer;
      white-space: nowrap;
    }
    .capsule-btn.active {
      background: var(--orange);
      color: #000000;
      border-color: var(--orange);
      box-shadow: 0 0 10px rgba(255,136,0,0.35);
    }

    /* Bottom 5-Tab Navigation Bar */
    .bottom-nav {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: calc(58px + var(--safe-bottom));
      padding-bottom: var(--safe-bottom);
      background: rgba(8, 10, 14, 0.96);
      backdrop-filter: blur(16px);
      border-top: 1px solid #181d28;
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
      transition: color 0.15s;
    }
    .nav-btn.active {
      color: var(--orange);
    }
    .nav-label {
      font-size: 10px;
      font-weight: 700;
    }

    /* Modals & Sheets */
    .modal-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.88);
      backdrop-filter: blur(8px);
      z-index: 200;
      align-items: flex-end;
      justify-content: center;
    }
    .modal-overlay.open {
      display: flex;
    }
    .sheet-box {
      width: 100%;
      max-width: 480px;
      background: #0e1118;
      border-top: 1px solid #242d3d;
      border-radius: 20px 20px 0 0;
      padding: 16px 18px calc(var(--safe-bottom) + 20px);
      max-height: 90vh;
      overflow-y: auto;
    }
    .sheet-handle {
      width: 38px;
      height: 4px;
      background: #3a455a;
      border-radius: 999px;
      margin: 0 auto 14px;
    }
    .btn-action {
      width: 100%;
      background: var(--orange);
      color: #000;
      border: none;
      border-radius: 12px;
      padding: 13px;
      font-weight: 800;
      font-size: 14px;
      cursor: pointer;
    }
    .timeframe-bar {
      display: flex;
      gap: 6px;
      justify-content: space-between;
      margin: 12px 0;
    }
    .tf-btn {
      flex: 1;
      padding: 6px 0;
      background: none;
      border: none;
      color: var(--text-muted);
      font-weight: 700;
      font-size: 12px;
      border-radius: 999px;
      cursor: pointer;
    }
    .tf-btn.active {
      background: var(--orange);
      color: #000000;
      box-shadow: 0 0 8px rgba(255,136,0,0.3);
    }
    .chart-toggle-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: 10px 0 6px;
      border-bottom: 1px solid #1a2230;
      padding-bottom: 8px;
    }
    .chart-mode-pill {
      background: #141924;
      border: 1px solid #242d3d;
      padding: 2px;
      border-radius: 8px;
      display: flex;
      gap: 4px;
    }
    .chart-mode-btn {
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: 11px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 6px;
      cursor: pointer;
    }
    .chart-mode-btn.active {
      background: var(--orange);
      color: #000;
    }
  </style>
</head>
<body>

  <!-- Top Notification HUD -->
  <div class="hud-banner" id="hudBanner">
    <span style="color:var(--orange)">⚡</span>
    <span id="hudText">Order executed successfully</span>
  </div>

  <!-- Pinned Top Header -->
  <header class="top-header">
    <div class="header-left">
      <div class="brand-group">
        <span class="brand-title" id="headerTitle">Overview</span>
        <span class="brand-sub">MARKET TERMINAL</span>
      </div>
    </div>

    <div class="header-actions">
      <!-- Search Button -->
      <button class="icon-btn" onclick="openSearchModal()" title="Search <SECF>">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </button>

      <!-- Notifications Bell -->
      <button class="icon-btn" onclick="openAlertsModal()" title="Alerts">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        <span class="notif-badge"></span>
      </button>
    </div>
  </header>

  <!-- Bloomberg Function Shortcuts Bar (<GO>) -->
  <div class="fn-bar">
    <div class="fn-tag" onclick="openSearchModal()">&lt;GO&gt;</div>
    <button class="fn-btn" onclick="handleFunctionCode('TOP')">&lt;TOP&gt; News</button>
    <button class="fn-btn" onclick="handleFunctionCode('WEI')">&lt;WEI&gt; Indices</button>
    <button class="fn-btn" onclick="handleFunctionCode('PORT')">&lt;PORT&gt; Holdings</button>
    <button class="fn-btn" onclick="handleFunctionCode('WL')">&lt;WL&gt; Watchlist</button>
    <button class="fn-btn" onclick="handleFunctionCode('GP')">&lt;GP&gt; Chart</button>
    <button class="fn-btn" onclick="handleFunctionCode('DES')">&lt;DES&gt; Key Data</button>
    <button class="fn-btn" onclick="handleFunctionCode('SECF')">&lt;SECF&gt; Search</button>
  </div>

  <!-- Market Sessions Pulse Strip -->
  <div class="pulse-strip">
    <div class="pulse-left">
      <span class="pulse-dot"></span>
      <span>NSE: OPEN</span>
      <span style="color:#4a5568">·</span>
      <span>NYSE: OPEN</span>
    </div>
    <div class="pulse-right">
      <span style="color:var(--orange)">⚡</span>
      <span>CRYPTO 24/7 SPOT</span>
    </div>
  </div>

  <!-- SCREEN 1: Home View (Overview) -->
  <div class="tab-view active" id="view-home">
    <!-- Profile Card (Bhaskar Sharma, BS) -->
    <section class="profile-card" onclick="switchTab('more')">
      <div class="avatar-circle">BS</div>
      <div class="profile-details">
        <div class="profile-name-row">
          <span class="profile-name">Bhaskar Sharma</span>
          <div class="status-indicator">
            <span class="status-dot"></span>
            <span>Active</span>
          </div>
        </div>
        <span class="profile-role">Individual Investor · India 🇮🇳</span>
        <span class="profile-pill">BLOOMBERG TERMINAL VERIFIED</span>
      </div>
    </section>

    <!-- Market Snapshot -->
    <section class="section-wrap">
      <div class="section-header">
        <span class="section-title">MARKET SNAPSHOT</span>
        <span class="view-all-link" onclick="switchTab('markets')">View All →</span>
      </div>

      <div class="watchlist-box" id="homeQuotesBox"></div>
    </section>

    <!-- Top News Headlines -->
    <section class="section-wrap">
      <div class="section-header">
        <span class="section-title">TOP STORIES &lt;TOP&gt;</span>
        <span class="view-all-link" onclick="switchTab('news')">More →</span>
      </div>

      <div class="watchlist-box" id="homeNewsBox"></div>
    </section>

    <!-- My Portfolios Preview -->
    <section class="section-wrap" style="margin-bottom: 24px;">
      <div class="section-header">
        <span class="section-title">PORTFOLIO SUMMARY &lt;PORT&gt;</span>
        <span class="view-all-link" onclick="openPortfoliosModal()">Detail →</span>
      </div>

      <div class="watchlist-box" style="padding: 14px;">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-size:12px;color:var(--text-muted)">Total Net Worth (NAV)</div>
            <div style="font-size:24px;font-weight:800;font-family:monospace;color:#fff;margin-top:2px">$617,530.00</div>
            <div style="font-size:12px;font-weight:700;font-family:monospace;color:var(--orange)">≈ ₹5.15 Cr INR</div>
          </div>
          <div style="text-align:right">
            <span class="quote-pill up-pill">+2.31% TODAY</span>
            <div style="font-size:10px;color:var(--text-dim);font-family:monospace;margin-top:4px">APPEND-ONLY LEDGER</div>
          </div>
        </div>
      </div>
    </section>
  </div>

  <!-- SCREEN 2: Markets View -->
  <div class="tab-view" id="view-markets">
    <div class="search-input-wrap">
      <svg class="search-icon-pos" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
      <input type="text" class="search-input" id="marketsSearchInput" placeholder="Search symbol, company or index..." oninput="filterMarkets(this.value)" />
    </div>

    <!-- Indices Strip -->
    <div class="indices-strip" id="indicesStrip"></div>

    <div class="capsule-bar" id="marketsAssetBar">
      <button class="capsule-btn active" onclick="filterMarketAsset(this, 'all')">All Markets</button>
      <button class="capsule-btn" onclick="filterMarketAsset(this, 'india')">India Equities 🇮🇳</button>
      <button class="capsule-btn" onclick="filterMarketAsset(this, 'tech')">Global Tech 🇺🇸</button>
      <button class="capsule-btn" onclick="filterMarketAsset(this, 'crypto')">Crypto Majors 🌐</button>
      <button class="capsule-btn" onclick="filterMarketAsset(this, 'commodities')">Commodities 🟡</button>
    </div>

    <div class="section-wrap" style="margin-top: 10px;">
      <div class="watchlist-box" id="allMarketsBox"></div>
    </div>
  </div>

  <!-- SCREEN 3: Watchlist View -->
  <div class="tab-view" id="view-watchlist">
    <div class="capsule-bar">
      <button class="capsule-btn active" onclick="filterWatchlistCategory(this, 'all')">My Watchlist</button>
      <button class="capsule-btn" onclick="filterWatchlistCategory(this, 'india')">India 🇮🇳</button>
      <button class="capsule-btn" onclick="filterWatchlistCategory(this, 'tech')">Tech 🇺🇸</button>
      <button class="capsule-btn" onclick="filterWatchlistCategory(this, 'crypto')">Crypto 🌐</button>
    </div>

    <div class="section-wrap" style="margin-top: 10px;">
      <div class="section-header">
        <span class="section-title" id="watchlistCategoryTitle">MY WATCHLIST (9)</span>
        <span style="font-size:10px;color:var(--green);font-family:monospace">● STREAMING LIVE</span>
      </div>

      <div class="watchlist-box" id="curatedWatchlistBox"></div>
    </div>
  </div>

  <!-- SCREEN 4: News View -->
  <div class="tab-view" id="view-news">
    <div class="capsule-bar" style="border-bottom: 1px solid #181d28;">
      <button class="capsule-btn active" onclick="switchNewsTab(this, 'for_you')">FOR YOU</button>
      <button class="capsule-btn" onclick="switchNewsTab(this, 'latest')">LATEST WIRE</button>
      <button class="capsule-btn" onclick="switchNewsTab(this, 'india')">INDIA DESK</button>
      <button class="capsule-btn" onclick="switchNewsTab(this, 'macro')">GLOBAL MACRO</button>
    </div>

    <div class="section-wrap" style="margin-top: 14px;">
      <div class="watchlist-box" id="allNewsBox"></div>
    </div>
  </div>

  <!-- SCREEN 5: More View -->
  <div class="tab-view" id="view-more">
    <section class="profile-card">
      <div class="avatar-circle">BS</div>
      <div class="profile-details">
        <span class="profile-name">Bhaskar Sharma</span>
        <span class="profile-role">Individual Investor · India 🇮🇳</span>
        <span class="profile-pill">BLOOMBERG ANYWHERE VERIFIED</span>
      </div>
    </section>

    <!-- Account Preferences -->
    <div class="section-wrap">
      <span class="section-title">DESK PREFERENCES</span>
      <div class="watchlist-box">
        <div class="quote-row" onclick="openPortfoliosModal()">
          <div class="quote-left">
            <span style="font-size:14px;font-weight:700;color:#fff">Portfolios &amp; Net Worth</span>
            <span style="font-size:11px;color:var(--text-muted)">Detailed holdings valuation</span>
          </div>
          <span style="color:var(--text-muted)">→</span>
        </div>

        <div class="quote-row" onclick="openAlertsModal()">
          <div class="quote-left">
            <span style="font-size:14px;font-weight:700;color:#fff">Price &amp; Volatility Alerts</span>
            <span style="font-size:11px;color:var(--text-muted)">3 active terminal triggers</span>
          </div>
          <span style="color:var(--text-muted)">→</span>
        </div>

        <div class="quote-row">
          <div class="quote-left">
            <span style="font-size:14px;font-weight:700;color:#fff">Base Currency</span>
            <span style="font-size:11px;color:var(--text-muted)">Dual USD ($) and INR (₹)</span>
          </div>
          <span style="font-size:11px;font-family:monospace;font-weight:700;color:var(--orange)">USD + INR</span>
        </div>

        <div class="quote-row">
          <div class="quote-left">
            <span style="font-size:14px;font-weight:700;color:#fff">Face ID Biometrics</span>
            <span style="font-size:11px;color:var(--text-muted)">Instant biometric unlock</span>
          </div>
          <span style="font-size:11px;font-family:monospace;font-weight:700;color:var(--green)">ENABLED</span>
        </div>
      </div>
    </div>

    <!-- Terminal Actions -->
    <div class="section-wrap">
      <span class="section-title">TERMINAL</span>
      <div class="watchlist-box">
        <div class="quote-row" onclick="switchTab('markets')">
          <div class="quote-left">
            <span style="font-size:14px;font-weight:700;color:#fff">Live Market Quotes &amp; Charts</span>
            <span style="font-size:11px;color:var(--text-muted)">Explore full instrument universe</span>
          </div>
          <span style="color:var(--orange);font-weight:bold">→</span>
        </div>

        <div class="quote-row" onclick="window.location.reload()">
          <div class="quote-left">
            <span style="font-size:14px;font-weight:700;color:var(--red)">Reset Terminal State</span>
            <span style="font-size:11px;color:var(--text-muted)">Clear cache and reload</span>
          </div>
          <span style="color:var(--red)">↻</span>
        </div>
      </div>
    </div>

    <div style="text-align:center;font-size:10px;font-family:monospace;color:var(--text-dim);margin:24px 0 10px">
      BLOOMBERG PROFESSIONAL · ANYWHERE iOS v3.2.0
    </div>
  </div>

  <!-- Bottom 5-Tab Navigation Bar -->
  <nav class="bottom-nav">
    <button class="nav-btn active" onclick="switchTab('home')" id="btn-home">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
      <span class="nav-label">Home</span>
    </button>

    <button class="nav-btn" onclick="switchTab('markets')" id="btn-markets">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"></line>
        <line x1="12" y1="20" x2="12" y2="4"></line>
        <line x1="6" y1="20" x2="6" y2="14"></line>
      </svg>
      <span class="nav-label">Markets</span>
    </button>

    <button class="nav-btn" onclick="switchTab('watchlist')" id="btn-watchlist">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>
      <span class="nav-label">Watchlist</span>
    </button>

    <button class="nav-btn" onclick="switchTab('news')" id="btn-news">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path>
        <path d="M18 14h-8"></path>
        <path d="M15 18h-5"></path>
        <path d="M10 6h8v4h-8V6Z"></path>
      </svg>
      <span class="nav-label">News</span>
    </button>

    <button class="nav-btn" onclick="switchTab('more')" id="btn-more">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="1.5"></circle>
        <circle cx="19" cy="12" r="1.5"></circle>
        <circle cx="5" cy="12" r="1.5"></circle>
      </svg>
      <span class="nav-label">More</span>
    </button>
  </nav>

  <!-- MODAL 1: Interactive Quote Detail Inspector with Candlesticks -->
  <div class="modal-overlay" id="quoteModal" onclick="closeAllModals(event)">
    <div class="sheet-box" onclick="event.stopPropagation()">
      <div class="sheet-handle"></div>

      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div>
          <span style="font-size:12px;color:var(--text-muted)" id="detailName">Apple Inc.</span>
          <h2 style="font-size:26px;font-weight:800;color:#fff" id="detailSymbol">AAPL</h2>
        </div>
        <div style="text-align:right">
          <div style="font-size:28px;font-weight:800;font-family:monospace;color:#fff" id="detailPrice">$178.32</div>
          <span class="quote-pill up-pill" id="detailPill">+3.45 +1.41%</span>
        </div>
      </div>

      <!-- Chart Display Toggle (Candles vs Line) -->
      <div class="chart-toggle-row">
        <div class="chart-mode-pill">
          <button class="chart-mode-btn active" id="btnModeCandles" onclick="setChartMode('candles')">🕯️ Candles</button>
          <button class="chart-mode-btn" id="btnModeLine" onclick="setChartMode('line')">📈 Line</button>
        </div>
        <span style="font-size:10px;font-family:monospace;color:var(--text-dim)" id="chartModeLabel">OHLC 15M SPOT</span>
      </div>

      <!-- Vector SVG Chart Canvas -->
      <div style="height:175px;background:#080a0e;border:1px solid #1a2230;border-radius:14px;display:flex;align-items:center;justify-content:center;margin:10px 0;padding:6px;overflow:hidden">
        <svg id="detailChartSvg" width="100%" height="100%" viewBox="0 0 320 150" preserveAspectRatio="none">
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#00c176" stop-opacity="0.25"/>
              <stop offset="100%" stop-color="#00c176" stop-opacity="0.0"/>
            </linearGradient>
          </defs>
          <g id="chartCandlesGroup"></g>
          <path id="chartArea" d="" fill="url(#chartGrad)"/>
          <path id="chartLine" d="" fill="none" stroke="#00c176" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
      </div>

      <!-- Timeframe Selector (1D..5Y) -->
      <div class="timeframe-bar">
        <button class="tf-btn active" onclick="selectTimeframe(this)">1D</button>
        <button class="tf-btn" onclick="selectTimeframe(this)">1W</button>
        <button class="tf-btn" onclick="selectTimeframe(this)">1M</button>
        <button class="tf-btn" onclick="selectTimeframe(this)">3M</button>
        <button class="tf-btn" onclick="selectTimeframe(this)">1Y</button>
        <button class="tf-btn" onclick="selectTimeframe(this)">5Y</button>
      </div>

      <!-- Quick Paper Trading Buttons -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:12px 0">
        <button class="btn-action" style="background:var(--green);color:#fff" onclick="executeQuickTrade('BUY')">BUY / LONG</button>
        <button class="btn-action" style="background:var(--red);color:#fff" onclick="executeQuickTrade('SELL')">SELL / SHORT</button>
      </div>

      <!-- KEY DATA Sheet -->
      <div style="margin-top:14px">
        <div style="font-size:11px;font-weight:800;letter-spacing:1px;color:var(--text-muted);text-transform:uppercase;margin-bottom:8px">KEY DATA &lt;DES&gt;</div>
        <div class="watchlist-box" style="padding:0 12px">
          <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #181d28;font-size:13px">
            <span style="color:var(--text-muted)">Open</span>
            <span style="font-family:monospace;font-weight:600" id="statOpen">$176.42</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #181d28;font-size:13px">
            <span style="color:var(--text-muted)">Previous Close</span>
            <span style="font-family:monospace;font-weight:600" id="statPrevClose">$179.53</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #181d28;font-size:13px">
            <span style="color:var(--text-muted)">Day Range</span>
            <span style="font-family:monospace;font-weight:600" id="statRange">$176.10 — $180.20</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:13px">
            <span style="color:var(--text-muted)">Volume</span>
            <span style="font-family:monospace;font-weight:600" id="statVolume">42.1M</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- MODAL 2: Security Finder <SECF> & Command Palette -->
  <div class="modal-overlay" id="searchModal" onclick="closeAllModals(event)">
    <div class="sheet-box" onclick="event.stopPropagation()">
      <div class="sheet-handle"></div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <h3 style="font-size:17px;font-weight:800;color:#fff;font-family:monospace">&lt;SECF&gt; Security Finder</h3>
        <span style="font-size:11px;font-family:monospace;color:var(--orange)">COMMAND DESK</span>
      </div>

      <input type="text" class="search-input" id="secfQueryInput" placeholder="Search ticker or function (e.g. BTC, TOP)..." oninput="runSecfSearch(this.value)" style="margin-bottom:12px" />

      <div style="max-height:360px;overflow-y:auto" id="secfResultsBox"></div>
    </div>
  </div>

  <!-- MODAL 3: In-Depth News Reader Modal -->
  <div class="modal-overlay" id="newsArticleModal" onclick="closeAllModals(event)">
    <div class="sheet-box" onclick="event.stopPropagation()">
      <div class="sheet-handle"></div>
      <span style="font-size:10px;font-family:monospace;font-weight:800;color:var(--orange)" id="artCategory">TERMINAL WIRE</span>
      <h2 style="font-size:20px;font-weight:800;line-height:1.25;margin:6px 0 10px;color:#fff" id="artTitle">News Title</h2>
      <div style="font-size:11px;color:var(--text-muted);margin-bottom:14px" id="artMeta">Bloomberg News Desk · 14m ago</div>

      <div style="background:#141924;border:1px solid #232b3d;border-radius:12px;padding:12px;margin-bottom:14px">
        <div style="font-size:11px;font-weight:800;letter-spacing:1px;color:var(--orange);margin-bottom:6px">KEY TAKEAWAYS</div>
        <ul style="font-size:12px;line-height:1.6;color:#d1d5db;padding-left:16px" id="artBullets"></ul>
      </div>

      <div style="font-size:13px;line-height:1.6;color:#e2e8f0;margin-bottom:16px" id="artBody"></div>

      <button class="btn-action" onclick="closeAllModals()">Done Reading</button>
    </div>
  </div>

  <!-- MODAL 4: Portfolios Breakdown Modal -->
  <div class="modal-overlay" id="portfoliosModal" onclick="closeAllModals(event)">
    <div class="sheet-box" onclick="event.stopPropagation()">
      <div class="sheet-handle"></div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
        <h3 style="font-size:17px;font-weight:800;color:#fff">My Portfolios &lt;PORT&gt;</h3>
        <span style="font-size:11px;font-weight:700;color:var(--green)">VERIFIED LEDGER</span>
      </div>

      <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:16px">
        <div style="background:#141924;border:1px solid #212b3d;border-radius:12px;padding:14px;display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-size:12px;color:var(--text-muted)">Main Portfolio</div>
            <div style="font-size:20px;font-weight:800;font-family:monospace;color:#fff;margin-top:2px">$489,325.89</div>
            <div style="font-size:12px;font-weight:700;font-family:monospace;color:var(--orange)">≈ ₹4.08 Cr INR</div>
          </div>
          <span class="quote-pill up-pill">+2.31%</span>
        </div>

        <div style="background:#141924;border:1px solid #212b3d;border-radius:12px;padding:14px;display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-size:12px;color:var(--text-muted)">Long Term F&amp;O</div>
            <div style="font-size:20px;font-weight:800;font-family:monospace;color:#fff;margin-top:2px">$128,204.11</div>
            <div style="font-size:12px;font-weight:700;font-family:monospace;color:var(--orange)">≈ ₹1.07 Cr INR</div>
          </div>
          <span class="quote-pill up-pill">+0.92%</span>
        </div>
      </div>

      <button class="btn-action" onclick="closeAllModals()">Back to Terminal</button>
    </div>
  </div>

  <!-- MODAL 5: Alerts Modal -->
  <div class="modal-overlay" id="alertsModal" onclick="closeAllModals(event)">
    <div class="sheet-box" onclick="event.stopPropagation()">
      <div class="sheet-handle"></div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
        <h3 style="font-size:17px;font-weight:800;color:#fff">Active Terminal Alerts</h3>
        <span style="font-size:10px;font-family:monospace;color:var(--orange)">LIVE TRIGGERS</span>
      </div>

      <div class="watchlist-box" style="margin-bottom:16px">
        <div class="quote-row">
          <div class="quote-left">
            <span style="font-size:13px;font-weight:700;color:#fff">BTCUSD &gt; $65,000</span>
            <span style="font-size:11px;color:var(--text-muted)">Volatility breakout trigger</span>
          </div>
          <span class="quote-pill up-pill">ACTIVE</span>
        </div>
        <div class="quote-row">
          <div class="quote-left">
            <span style="font-size:13px;font-weight:700;color:#fff">NIFTY 50 &gt; 25,000</span>
            <span style="font-size:11px;color:var(--text-muted)">Resistance ceiling alert</span>
          </div>
          <span class="quote-pill up-pill">ACTIVE</span>
        </div>
        <div class="quote-row">
          <div class="quote-left">
            <span style="font-size:13px;font-weight:700;color:#fff">GOLD &gt; $2,700</span>
            <span style="font-size:11px;color:var(--text-muted)">All-time high trigger</span>
          </div>
          <span class="quote-pill up-pill">ACTIVE</span>
        </div>
      </div>

      <button class="btn-action" onclick="closeAllModals()">Dismiss</button>
    </div>
  </div>

  <script>
    // Web Audio Synthesizer for Terminal Feedback
    let audioCtx = null;
    function getAudioCtx() {
      if (!audioCtx && typeof window !== 'undefined') {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) audioCtx = new AudioContextClass();
      }
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      return audioCtx;
    }

    function playTick() {
      try {
        const ctx = getAudioCtx();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.025);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.025);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.025);
      } catch(e) {}
    }

    function playOrderFilled() {
      try {
        const ctx = getAudioCtx();
        if (!ctx) return;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.type = 'sine'; osc1.frequency.setValueAtTime(880, ctx.currentTime);
        osc2.type = 'sine'; osc2.frequency.setValueAtTime(1320, ctx.currentTime + 0.07);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
        osc1.connect(gain); osc2.connect(gain); gain.connect(ctx.destination);
        osc1.start(); osc1.stop(ctx.currentTime + 0.07);
        osc2.start(ctx.currentTime + 0.07); osc2.stop(ctx.currentTime + 0.22);
      } catch(e) {}
    }

    function showHud(text) {
      const banner = document.getElementById('hudBanner');
      const hudText = document.getElementById('hudText');
      if (banner && hudText) {
        hudText.textContent = text;
        banner.classList.add('active');
        setTimeout(() => banner.classList.remove('active'), 3500);
      }
    }

    // Bloomberg Mnemonic Functions
    const bloombergFunctions = [
      { code: 'TOP', name: 'Top News Wire', desc: 'Real-time terminal headlines & analytical stories' },
      { code: 'WEI', name: 'World Equity Indices', desc: 'Global market benchmarks & asset classes' },
      { code: 'PORT', name: 'Portfolio & Risk', desc: 'Holdings, NAV valuation & asset allocation' },
      { code: 'WL', name: 'Watchlists & Desks', desc: 'Curated monitor for Equities, Crypto & FX' },
      { code: 'GP', name: 'Graph Price', desc: 'Candlestick & line technical chart inspector' },
      { code: 'DES', name: 'Description & Financials', desc: 'Security key data, range & volume' },
      { code: 'SECF', name: 'Security Finder', desc: 'Multi-asset search universe & cross-rates' },
    ];

    const sampleQuotes = [
      { s: 'AAPL', n: 'Apple Inc.', p: 178.32, c: -1.21, pct: -0.67, up: false, cat: 'tech', curr: '$' },
      { s: 'TSLA', n: 'Tesla Inc.', p: 248.17, c: 3.45, pct: 1.41, up: true, cat: 'tech', curr: '$' },
      { s: 'NIFTY', n: 'Nifty 50 Index 🇮🇳', p: 24612.30, c: -120.45, pct: -0.49, up: false, cat: 'india', curr: '₹' },
      { s: 'BTCUSD', n: 'Bitcoin Spot', p: 63284.50, c: 412.30, pct: 0.66, up: true, cat: 'crypto', curr: '$' },
      { s: 'NVDA', n: 'NVIDIA Corp.', p: 141.18, c: 2.91, pct: 2.10, up: true, cat: 'tech', curr: '$' },
      { s: 'SENSEX', n: 'BSE Sensex 🇮🇳', p: 80814.73, c: 177.20, pct: 0.22, up: true, cat: 'india', curr: '₹' },
      { s: 'GOLD', n: 'Gold Spot (XAU/USD) 🟡', p: 2658.20, c: 22.40, pct: 0.85, up: true, cat: 'commodities', curr: '$' },
      { s: 'ETHUSD', n: 'Ethereum Spot', p: 3490.20, c: 64.50, pct: 1.85, up: true, cat: 'crypto', curr: '$' },
      { s: 'RELIANCE', n: 'Reliance Industries 🇮🇳', p: 2984.50, c: 32.10, pct: 1.09, up: true, cat: 'india', curr: '₹' },
      { s: 'SOLUSD', n: 'Solana Spot', p: 154.40, c: 6.20, pct: 4.20, up: true, cat: 'crypto', curr: '$' },
      { s: 'BRENT', n: 'Brent Crude Oil 🛢️', p: 78.40, c: -0.89, pct: -1.12, up: false, cat: 'commodities', curr: '$' }
    ];

    const sampleNews = [
      {
        id: 'news-1',
        title: 'Markets steady as Fed comments fuel rate-cut expectations and reshape global liquidity',
        source: 'Market Desk',
        time: '14m ago',
        category: 'Macro',
        bullets: [
          'Federal Reserve officials indicate willingness to ease monetary policy as inflation cools.',
          'Global bond yields contract, providing relief to high-growth tech valuations.',
          'Asian markets, particularly Indian equities, absorb capital inflows amid domestic resilience.'
        ],
        body: 'Equities traded higher across global financial centers today as institutional desks digested remarks from Federal Reserve policymakers signaling potential rate adjustments. Trading volume remained concentrated in mega-cap technology and sovereign debt instruments.'
      },
      {
        id: 'news-2',
        title: 'India NIFTY & Sensex consolidate near record highs amid record mutual fund inflows',
        source: 'Mumbai Bureau',
        time: '32m ago',
        category: 'India',
        bullets: [
          'Domestic institutional investors (DIIs) deploy over ₹14,000 Cr into equity schemes.',
          'Banking and energy sectors lead the market advance led by Reliance and HDFC Bank.',
          'Derivatives rollover points to sustained bullish positioning into monthly expiry.'
        ],
        body: 'The benchmark Nifty 50 and S&P BSE Sensex hovered within striking distance of psychological milestones as persistent systematic investment plan (SIP) contributions counterbalanced intermittent foreign institutional outflows.'
      },
      {
        id: 'news-3',
        title: 'Bitcoin tests $64,000 as spot ETF accumulation accelerates across institutional desks',
        source: 'Digital Assets Desk',
        time: '1h ago',
        category: 'Crypto',
        bullets: [
          'Net inflows into US Spot Bitcoin ETFs top $450 million in single trading session.',
          'Derivative open interest across major exchanges reaches highest level in three months.',
          'Long-term holder supply remains illiquid, tightening available spot exchange balances.'
        ],
        body: 'Bitcoin consolidated firmly above key technical moving averages as institutional demand via regulated ETF vehicles absorbed spot market supply. Analysts note subdued realized volatility.'
      }
    ];

    const sampleIndices = [
      { title: 'NIFTY 50', value: '24,612.30', change: '-0.49%', isUp: false, region: '🇮🇳 NSE' },
      { title: 'SENSEX', value: '80,814.73', change: '+0.22%', isUp: true, region: '🇮🇳 BSE' },
      { title: 'BANKNIFTY', value: '51,320.10', change: '+0.34%', isUp: true, region: '🇮🇳 NSE' },
      { title: 'NASDAQ', value: '18,291.62', change: '+0.48%', isUp: true, region: '🇺🇸 US' },
      { title: 'S&P 500', value: '5,864.67', change: '+0.37%', isUp: true, region: '🇺🇸 US' },
      { title: 'GOLD (XAU)', value: '$2,658.20', change: '+0.85%', isUp: true, region: '🟡 SPOT' },
      { title: 'BRENT OIL', value: '$78.40', change: '-1.12%', isUp: false, region: '🛢️ CRUDE' },
    ];

    function renderQuotes(targetId, list) {
      const container = document.getElementById(targetId);
      if (!container) return;
      container.innerHTML = list.map(q => {
        const sign = q.up ? '+' : '';
        const pillClass = q.up ? 'up-pill' : 'down-pill';
        const stroke = q.up ? '#00c176' : '#ff4d4f';
        const pathD = q.up
          ? 'M2,18 L12,15 L24,16 L36,9 L48,11 L58,3'
          : 'M2,6 L12,10 L24,8 L36,16 L48,14 L58,21';
        return \`
          <div class="quote-row" onclick="openQuoteDetail('\${q.s}', '\${q.n}', \${q.p}, \${q.c}, \${q.pct}, \${q.up}, '\${q.curr}')">
            <div class="quote-left">
              <span class="quote-symbol">\${q.s} \${q.cat === 'india' ? '🇮🇳' : ''}</span>
              <span class="quote-name">\${q.n}</span>
            </div>
            <svg class="quote-sparkline" viewBox="0 0 60 24">
              <path d="\${pathD}" fill="none" stroke="\${stroke}" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
            <div class="quote-right">
              <span class="quote-price">\${q.curr}\${q.p.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}</span>
              <span class="quote-pill \${pillClass}">\${sign}\${q.c.toFixed(2)} \${sign}\${q.pct.toFixed(2)}%</span>
            </div>
          </div>
        \`;
      }).join('');
    }

    function renderIndices() {
      const container = document.getElementById('indicesStrip');
      if (!container) return;
      container.innerHTML = sampleIndices.map(idx => \`
        <div class="index-card" onclick="playTick()">
          <div class="index-top">
            <span class="index-title">\${idx.title}</span>
            <span class="index-region">\${idx.region}</span>
          </div>
          <div class="index-val">\${idx.value}</div>
          <div class="index-change" style="color:\${idx.isUp ? 'var(--green)' : 'var(--red)'}">\${idx.change}</div>
        </div>
      \`).join('');
    }

    function renderNews(targetId, list) {
      const container = document.getElementById(targetId);
      if (!container) return;
      container.innerHTML = list.map(item => \`
        <div class="quote-row" onclick="openNewsArticle('\${item.id}')" style="align-items:flex-start;gap:12px">
          <div style="flex:1">
            <div style="font-size:13px;font-weight:700;color:#fff;line-height:1.35">\${item.title}</div>
            <div style="display:flex;gap:6px;align-items:center;margin-top:6px">
              <span style="font-size:9px;font-weight:800;color:var(--orange);font-family:monospace">\${item.category.toUpperCase()}</span>
              <span style="font-size:11px;color:var(--text-muted)">\${item.source} · \${item.time}</span>
            </div>
          </div>
        </div>
      \`).join('');
    }

    // Initialize initial views
    renderQuotes('homeQuotesBox', sampleQuotes.slice(0, 5));
    renderQuotes('allMarketsBox', sampleQuotes);
    renderQuotes('curatedWatchlistBox', sampleQuotes);
    renderIndices();
    renderNews('homeNewsBox', sampleNews.slice(0, 2));
    renderNews('allNewsBox', sampleNews);

    function switchTab(tab) {
      playTick();
      document.querySelectorAll('.tab-view').forEach(v => v.classList.remove('active'));
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

      const view = document.getElementById('view-' + tab);
      if (view) view.classList.add('active');

      const btn = document.getElementById('btn-' + tab);
      if (btn) btn.classList.add('active');

      const titles = {
        home: 'Overview',
        markets: 'Markets',
        watchlist: 'Watchlists',
        news: 'News',
        more: 'More'
      };
      document.getElementById('headerTitle').textContent = titles[tab] || 'Overview';
      window.scrollTo(0, 0);
    }

    function handleFunctionCode(code) {
      playTick();
      switch (code) {
        case 'TOP': switchTab('news'); break;
        case 'WEI': switchTab('markets'); break;
        case 'PORT': openPortfoliosModal(); break;
        case 'WL': switchTab('watchlist'); break;
        case 'GP':
        case 'DES':
          openQuoteDetail('AAPL', 'Apple Inc.', 178.32, -1.21, -0.67, false);
          break;
        case 'SECF': openSearchModal(); break;
        default: switchTab('home'); break;
      }
    }

    function filterMarkets(query) {
      const q = query.toLowerCase().trim();
      const filtered = sampleQuotes.filter(item => item.s.toLowerCase().includes(q) || item.n.toLowerCase().includes(q));
      renderQuotes('allMarketsBox', filtered);
    }

    function filterMarketAsset(el, cat) {
      playTick();
      document.querySelectorAll('#marketsAssetBar .capsule-btn').forEach(b => b.classList.remove('active'));
      el.classList.add('active');
      const filtered = cat === 'all' ? sampleQuotes : sampleQuotes.filter(q => q.cat === cat);
      renderQuotes('allMarketsBox', filtered);
    }

    function filterWatchlistCategory(el, cat) {
      playTick();
      document.querySelectorAll('.capsule-bar .capsule-btn').forEach(b => b.classList.remove('active'));
      el.classList.add('active');
      const filtered = cat === 'all' ? sampleQuotes : sampleQuotes.filter(q => q.cat === cat);
      renderQuotes('curatedWatchlistBox', filtered);
      document.getElementById('watchlistCategoryTitle').textContent = el.textContent.toUpperCase() + ' (' + filtered.length + ')';
    }

    function switchNewsTab(el, tab) {
      playTick();
      el.parentElement.querySelectorAll('.capsule-btn').forEach(b => b.classList.remove('active'));
      el.classList.add('active');
    }

    function selectTimeframe(el) {
      playTick();
      el.parentElement.querySelectorAll('.tf-btn').forEach(b => b.classList.remove('active'));
      el.classList.add('active');
    }

    let currentDetailIsUp = true;
    let currentDetailPrice = 178.32;
    let currentDetailSymbol = 'AAPL';
    let currentDetailMode = 'candles';

    function setChartMode(mode) {
      playTick();
      currentDetailMode = mode;
      document.getElementById('btnModeCandles').classList.toggle('active', mode === 'candles');
      document.getElementById('btnModeLine').classList.toggle('active', mode === 'line');
      document.getElementById('chartModeLabel').textContent = mode === 'candles' ? 'OHLC 15M SPOT' : 'VECTOR AREA';
      drawDetailChart();
    }

    function drawDetailChart() {
      const candlesGroup = document.getElementById('chartCandlesGroup');
      const areaPath = document.getElementById('chartArea');
      const linePath = document.getElementById('chartLine');

      const stroke = currentDetailIsUp ? '#00c176' : '#ff4d4f';
      linePath.setAttribute('stroke', stroke);
      document.getElementById('chartGrad').children[0].setAttribute('stop-color', stroke);
      document.getElementById('chartGrad').children[1].setAttribute('stop-color', stroke);

      if (currentDetailMode === 'line') {
        candlesGroup.innerHTML = '';
        const dLine = currentDetailIsUp
          ? 'M10,120 L50,105 L90,110 L130,70 L170,85 L210,45 L250,60 L290,25 L310,35'
          : 'M10,35 L50,55 L90,45 L130,90 L170,80 L210,120 L250,110 L290,135 L310,140';
        linePath.setAttribute('d', dLine);
        areaPath.setAttribute('d', dLine + ' L310,150 L10,150 Z');
        linePath.style.display = 'block';
        areaPath.style.display = 'block';
      } else {
        linePath.style.display = 'none';
        areaPath.style.display = 'none';
        // Generate SVG Candlesticks
        let html = '';
        const count = 16;
        const candleW = 10;
        const candleGap = (320 - 24) / count;
        let cur = currentDetailPrice * (currentDetailIsUp ? 0.985 : 1.015);

        for (let i = 0; i < count; i++) {
          const isGreen = Math.random() > 0.45;
          const openY = 30 + Math.random() * 80;
          const closeY = openY + (isGreen ? -18 : 18);
          const highY = Math.min(openY, closeY) - (5 + Math.random() * 12);
          const lowY = Math.max(openY, closeY) + (5 + Math.random() * 12);
          const cx = 12 + i * candleGap + candleW / 2;
          const cColor = isGreen ? '#00c176' : '#ff4d4f';
          const topY = Math.min(openY, closeY);
          const hY = Math.max(Math.abs(closeY - openY), 3);

          html += \`
            <line x1="\${cx}" y1="\${highY}" x2="\${cx}" y2="\${lowY}" stroke="\${cColor}" stroke-width="1.2"/>
            <rect x="\${cx - candleW/2}" y="\${topY}" width="\${candleW}" height="\${hY}" fill="\${cColor}" rx="1"/>
          \`;
        }
        candlesGroup.innerHTML = html;
      }
    }

    function openQuoteDetail(symbol, name, price, change, percent, isUp, currency = '$') {
      playTick();
      currentDetailSymbol = symbol;
      currentDetailPrice = price;
      currentDetailIsUp = isUp;

      document.getElementById('detailSymbol').textContent = symbol;
      document.getElementById('detailName').textContent = name;
      document.getElementById('detailPrice').textContent = currency + price.toLocaleString('en-US', {minimumFractionDigits: 2});
      const pill = document.getElementById('detailPill');
      const sign = isUp ? '+' : '';
      pill.textContent = \`\${sign}\${change.toFixed(2)} \${sign}\${percent.toFixed(2)}%\`;
      pill.className = 'quote-pill ' + (isUp ? 'up-pill' : 'down-pill');

      document.getElementById('statOpen').textContent = currency + (price * 0.995).toFixed(2);
      document.getElementById('statPrevClose').textContent = currency + (price * (1 - percent/100)).toFixed(2);
      document.getElementById('statRange').textContent = \`\${currency}\${(price*0.988).toFixed(2)} — \${currency}\${(price*1.012).toFixed(2)}\`;

      drawDetailChart();
      document.getElementById('quoteModal').classList.add('open');
    }

    function executeQuickTrade(side) {
      playOrderFilled();
      const sym = document.getElementById('detailSymbol').textContent;
      showHud(\`Order Filled: \${side} 0.5 \${sym} @ \${document.getElementById('detailPrice').textContent} (0.10% fee)\`);
    }

    function openSearchModal() {
      playTick();
      document.getElementById('searchModal').classList.add('open');
      const input = document.getElementById('secfQueryInput');
      if (input) {
        input.value = '';
        setTimeout(() => input.focus(), 150);
        runSecfSearch('');
      }
    }

    function runSecfSearch(query) {
      const q = query.toLowerCase().trim();
      const container = document.getElementById('secfResultsBox');
      if (!container) return;

      const matchedFns = bloombergFunctions.filter(f => !q || f.code.toLowerCase().includes(q) || f.name.toLowerCase().includes(q));
      const matchedQuotes = sampleQuotes.filter(item => !q || item.s.toLowerCase().includes(q) || item.n.toLowerCase().includes(q));

      let html = '';
      if (matchedFns.length > 0) {
        html += '<div style="font-size:10px;font-family:monospace;font-weight:800;color:var(--text-muted);margin:8px 0 4px">BLOOMBERG FUNCTIONS</div>';
        html += matchedFns.map(f => \`
          <div class="quote-row" onclick="handleFunctionCode('\${f.code}');closeAllModals()" style="padding:10px 12px;background:#141924;border-radius:10px;margin-bottom:6px">
            <div>
              <span style="font-family:monospace;font-weight:800;color:var(--orange)">&lt;\${f.code}&gt;</span>
              <span style="font-size:13px;font-weight:700;color:#fff;margin-left:8px">\${f.name}</span>
              <div style="font-size:11px;color:var(--text-muted);margin-top:2px">\${f.desc}</div>
            </div>
            <span style="font-size:11px;color:var(--orange)">GO →</span>
          </div>
        \`).join('');
      }

      if (matchedQuotes.length > 0) {
        html += '<div style="font-size:10px;font-family:monospace;font-weight:800;color:var(--text-muted);margin:12px 0 4px">SECURITIES & COMMODITIES</div>';
        html += matchedQuotes.map(s => \`
          <div class="quote-row" onclick="openQuoteDetail('\${s.s}', '\${s.n}', \${s.p}, \${s.c}, \${s.pct}, \${s.up}, '\${s.curr}');closeAllModals()" style="padding:10px 12px;background:#141924;border-radius:10px;margin-bottom:6px">
            <div>
              <span style="font-family:monospace;font-weight:800;color:#fff">\${s.s}</span>
              <span style="font-size:11px;color:var(--text-muted);margin-left:6px">\${s.n}</span>
            </div>
            <span style="font-family:monospace;font-weight:700;color:#fff">\${s.curr}\${s.p.toFixed(2)}</span>
          </div>
        \`).join('');
      }

      container.innerHTML = html;
    }

    function openNewsArticle(id) {
      playTick();
      const item = sampleNews.find(n => n.id === id) || sampleNews[0];
      document.getElementById('artCategory').textContent = item.category.toUpperCase() + ' DESK';
      document.getElementById('artTitle').textContent = item.title;
      document.getElementById('artMeta').textContent = item.source + ' · ' + item.time;
      document.getElementById('artBullets').innerHTML = item.bullets.map(b => \`<li style="margin-bottom:4px">\${b}</li>\`).join('');
      document.getElementById('artBody').textContent = item.body;
      document.getElementById('newsArticleModal').classList.add('open');
    }

    function openPortfoliosModal() {
      playTick();
      document.getElementById('portfoliosModal').classList.add('open');
    }

    function openAlertsModal() {
      playTick();
      document.getElementById('alertsModal').classList.add('open');
    }

    function closeAllModals(e) {
      playTick();
      document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
    }

    try {
      localStorage.setItem('bloomberg_mobile_view', 'true');
    } catch(e) {}

    // Connect to real-time Binance WebSocket for live BTC ticker
    try {
      const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker');
      ws.onmessage = (e) => {
        const d = JSON.parse(e.data);
        if (d && d.c) {
          const p = parseFloat(d.c);
          const chg = parseFloat(d.p);
          const pct = parseFloat(d.P);
          const pEl = document.getElementById('liveBtcPrice');
          const pillEl = document.getElementById('liveBtcPill');
          if (pEl) pEl.textContent = '$' + p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          if (pillEl) {
            const isUp = pct >= 0;
            pillEl.textContent = (isUp ? '+' : '') + chg.toFixed(2) + ' ' + (isUp ? '+' : '') + pct.toFixed(2) + '%';
            pillEl.className = 'quote-pill ' + (isUp ? 'up-pill' : 'down-pill');
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

console.log(`[prepare-mobile] Successfully built pristine Bloomberg Anywhere Mobile App in ${indexPath} and ${iosIndexPath}`);
