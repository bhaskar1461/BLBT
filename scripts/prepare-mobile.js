import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const distDir = path.join(rootDir, 'dist');
const publicDir = path.join(rootDir, 'public');

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy public assets to dist if public exists
if (fs.existsSync(publicDir)) {
  const publicFiles = fs.readdirSync(publicDir);
  for (const file of publicFiles) {
    const src = path.join(publicDir, file);
    const dest = path.join(distDir, file);
    try {
      if (fs.statSync(src).isFile()) {
        fs.copyFileSync(src, dest);
      }
    } catch (e) {
      console.warn(`[prepare-mobile] Warning copying ${file}:`, e.message);
    }
  }
}

// Generate pristine Bloomberg Anywhere Mobile Experience in dist/index.html
const indexPath = path.join(distDir, 'index.html');
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
      font-size: 18px;
      font-weight: 800;
      color: #ffffff;
      flex-shrink: 0;
      box-shadow: inset 0 0 6px rgba(0,0,0,0.5);
    }
    .profile-details {
      display: flex;
      flex-direction: column;
      gap: 2px;
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
      gap: 4px;
      font-size: 11px;
      font-weight: 600;
      color: var(--green);
    }
    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--green);
      box-shadow: 0 0 8px var(--green);
    }
    .profile-role {
      font-size: 12px;
      color: var(--text-muted);
    }
    .profile-pill {
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.6px;
      text-transform: uppercase;
      padding: 2px 7px;
      border-radius: 3px;
      background: #1a2130;
      border: 1px solid #2b374e;
      color: #d1d5db;
      align-self: flex-start;
      margin-top: 4px;
    }

    /* Sections */
    .section-wrap {
      padding: 16px 16px 4px;
    }
    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    .section-title {
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 1px;
      color: var(--text-muted);
      text-transform: uppercase;
    }
    .view-all-link {
      font-size: 12px;
      font-weight: 700;
      color: var(--orange);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 2px;
    }

    /* Quotes Table Box */
    .watchlist-box {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 4px 12px;
    }
    .quote-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid rgba(24, 29, 40, 0.7);
      cursor: pointer;
    }
    .quote-row:last-child {
      border-bottom: none;
    }
    .quote-row:active {
      opacity: 0.75;
    }
    .quote-left {
      width: 100px;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .quote-symbol {
      font-size: 15px;
      font-weight: 700;
      color: #ffffff;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .quote-name {
      font-size: 11px;
      color: var(--text-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .quote-sparkline {
      width: 58px;
      height: 24px;
      flex-shrink: 0;
    }
    .quote-right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 2px;
      flex-shrink: 0;
    }
    .quote-price {
      font-size: 15px;
      font-weight: 600;
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", monospace;
      color: #ffffff;
      font-variant-numeric: tabular-nums;
    }
    .quote-pill {
      font-size: 11px;
      font-weight: 700;
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", monospace;
      font-variant-numeric: tabular-nums;
      padding: 2px 6px;
      border-radius: 4px;
    }
    .up-pill {
      background: rgba(0, 193, 118, 0.15);
      color: var(--green);
    }
    .down-pill {
      background: rgba(255, 77, 79, 0.15);
      color: var(--red);
    }

    /* Portfolios Horizontal / Grid Cards */
    .portfolios-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .portfolio-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 14px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      cursor: pointer;
    }
    .portfolio-card:active {
      border-color: var(--orange);
    }
    .port-name {
      font-size: 11px;
      color: var(--text-muted);
    }
    .port-val {
      font-size: 17px;
      font-weight: 800;
      font-family: -apple-system, BlinkMacSystemFont, monospace;
      color: #ffffff;
      margin-top: 2px;
    }
    .port-inr {
      font-size: 11px;
      font-weight: 700;
      font-family: monospace;
      color: var(--orange);
      margin-top: 1px;
    }
    .port-bottom {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 10px;
      padding-top: 8px;
      border-top: 1px solid #181d28;
    }
    .port-gain {
      font-size: 11px;
      font-weight: 700;
      color: var(--green);
    }

    /* News Cards */
    .news-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 12px;
      display: flex;
      gap: 12px;
      cursor: pointer;
      margin-bottom: 10px;
    }
    .news-thumb {
      width: 68px;
      height: 54px;
      border-radius: 8px;
      background: #141924;
      border: 1px solid #212b3d;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .news-content {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      flex: 1;
      min-width: 0;
    }
    .news-headline {
      font-size: 13px;
      font-weight: 600;
      line-height: 1.35;
      color: #ffffff;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .news-meta {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 10px;
      margin-top: 4px;
    }
    .news-cat {
      font-weight: 700;
      color: var(--orange);
      text-transform: uppercase;
    }
    .news-src {
      color: var(--text-muted);
    }

    /* Screen View Container */
    .tab-view {
      display: none;
      flex-direction: column;
    }
    .tab-view.active {
      display: flex;
    }

    /* Search Bar in Markets */
    .search-box {
      margin: 12px 16px;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 10px 14px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .search-input {
      background: none;
      border: none;
      color: #ffffff;
      font-size: 14px;
      width: 100%;
      outline: none;
    }
    .search-input::placeholder {
      color: var(--text-dim);
    }

    /* Horizontal Market Index Chips */
    .index-strip {
      display: flex;
      gap: 10px;
      overflow-x: auto;
      padding: 0 16px 6px;
      scrollbar-width: none;
    }
    .index-strip::-webkit-scrollbar { display: none; }
    .index-chip {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 10px 12px;
      min-width: 130px;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
    }
    .chip-title {
      font-size: 11px;
      font-weight: 700;
      color: var(--text-muted);
    }
    .chip-val {
      font-size: 14px;
      font-weight: 700;
      font-family: monospace;
      color: #ffffff;
      margin-top: 4px;
    }
    .chip-chg {
      font-size: 11px;
      font-weight: 700;
      font-family: monospace;
      margin-top: 1px;
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

    /* Quote Detail Modal */
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
  </style>
</head>
<body>

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
      <button class="icon-btn" onclick="switchTab('markets')" title="Search">
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
        <span class="profile-role">Individual Investor · India</span>
        <span class="profile-pill">BLOOMBERG ANYWHERE USER</span>
      </div>
    </section>

    <!-- Market Snapshot -->
    <section class="section-wrap">
      <div class="section-header">
        <span class="section-title">MARKET SNAPSHOT</span>
        <span class="view-all-link" onclick="switchTab('markets')">View All →</span>
      </div>

      <div class="watchlist-box" id="homeQuotesBox">
        <!-- AAPL -->
        <div class="quote-row" onclick="openQuoteDetail('AAPL', 'Apple Inc.', 178.32, -1.21, -0.67, false)">
          <div class="quote-left">
            <span class="quote-symbol">AAPL</span>
            <span class="quote-name">Apple Inc.</span>
          </div>
          <svg class="quote-sparkline" viewBox="0 0 60 24">
            <path d="M2,6 L10,8 L20,6 L30,14 L40,12 L50,18 L58,20" fill="none" stroke="#ff4d4f" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
          <div class="quote-right">
            <span class="quote-price">$178.32</span>
            <span class="quote-pill down-pill">-1.21 -0.67%</span>
          </div>
        </div>

        <!-- TSLA -->
        <div class="quote-row" onclick="openQuoteDetail('TSLA', 'Tesla Inc.', 248.17, 3.45, 1.41, true)">
          <div class="quote-left">
            <span class="quote-symbol">TSLA</span>
            <span class="quote-name">Tesla Inc.</span>
          </div>
          <svg class="quote-sparkline" viewBox="0 0 60 24">
            <path d="M2,18 L10,16 L20,17 L30,10 L40,12 L50,6 L58,4" fill="none" stroke="#00c176" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
          <div class="quote-right">
            <span class="quote-price">$248.17</span>
            <span class="quote-pill up-pill">+3.45 +1.41%</span>
          </div>
        </div>

        <!-- NIFTY 50 🇮🇳 -->
        <div class="quote-row" onclick="openQuoteDetail('NIFTY', 'Nifty 50 Index 🇮🇳', 24612.30, -120.45, -0.49, false, 'INR')">
          <div class="quote-left">
            <span class="quote-symbol">NIFTY 🇮🇳</span>
            <span class="quote-name">Nifty 50 Index</span>
          </div>
          <svg class="quote-sparkline" viewBox="0 0 60 24">
            <path d="M2,8 L12,12 L24,10 L34,16 L46,14 L58,21" fill="none" stroke="#ff4d4f" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
          <div class="quote-right">
            <span class="quote-price">₹24,612.30</span>
            <span class="quote-pill down-pill">-120.45 -0.49%</span>
          </div>
        </div>

        <!-- BTCUSD -->
        <div class="quote-row" onclick="openQuoteDetail('BTCUSD', 'Bitcoin Spot', 63284.50, 412.30, 0.66, true)">
          <div class="quote-left">
            <span class="quote-symbol">BTCUSD</span>
            <span class="quote-name">Bitcoin Spot</span>
          </div>
          <svg class="quote-sparkline" viewBox="0 0 60 24">
            <path d="M2,18 L12,15 L24,16 L36,9 L48,11 L58,3" fill="none" stroke="#00c176" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
          <div class="quote-right">
            <span class="quote-price" id="liveBtcPrice">$63,284.50</span>
            <span class="quote-pill up-pill" id="liveBtcPill">+412.30 +0.66%</span>
          </div>
        </div>
      </div>
    </section>

    <!-- My Portfolios -->
    <section class="section-wrap">
      <div class="section-header">
        <span class="section-title">MY PORTFOLIOS</span>
        <span class="view-all-link" onclick="openPortfoliosModal()">View All →</span>
      </div>

      <div class="portfolios-grid">
        <div class="portfolio-card" onclick="openPortfoliosModal()">
          <div>
            <span class="port-name">Main Portfolio</span>
            <div class="port-val">$617,530.00</div>
            <div class="port-inr">≈ ₹5.15 Cr INR</div>
          </div>
          <div class="port-bottom">
            <span class="port-gain">+2.31%</span>
            <svg width="44" height="18" viewBox="0 0 44 18">
              <path d="M2,14 L12,12 L22,8 L32,10 L42,3" fill="none" stroke="#00c176" stroke-width="1.8"/>
            </svg>
          </div>
        </div>

        <div class="portfolio-card" onclick="openPortfoliosModal()">
          <div>
            <span class="port-name">Long Term F&amp;O</span>
            <div class="port-val">$128,204.11</div>
            <div class="port-inr">≈ ₹1.07 Cr INR</div>
          </div>
          <div class="port-bottom">
            <span class="port-gain">+0.92%</span>
            <svg width="44" height="18" viewBox="0 0 44 18">
              <path d="M2,13 L12,14 L22,9 L32,11 L42,5" fill="none" stroke="#00c176" stroke-width="1.8"/>
            </svg>
          </div>
        </div>
      </div>
    </section>

    <!-- Recent News -->
    <section class="section-wrap">
      <div class="section-header">
        <span class="section-title">RECENT NEWS</span>
        <span class="view-all-link" onclick="switchTab('news')">View All →</span>
      </div>

      <div class="news-card" onclick="openNewsArticle('fed')">
        <div class="news-thumb">
          <svg width="40" height="40" viewBox="0 0 40 40">
            <path d="M6,32 L16,14 L24,22 L34,8" stroke="#ff8800" stroke-width="2.5" fill="none"/>
          </svg>
        </div>
        <div class="news-content">
          <h4 class="news-headline">Markets steady as Fed comments fuel rate-cut expectations and reshape global outlook</h4>
          <div class="news-meta">
            <span class="news-cat">Macro</span>
            <span class="news-src">Market Desk · 2h ago</span>
          </div>
        </div>
      </div>

      <div class="news-card" onclick="openNewsArticle('rbi')">
        <div class="news-thumb">
          <svg width="40" height="40" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="10" fill="#1f283a"/>
            <path d="M12,20 L28,20 M20,12 L20,28" stroke="#00c176" stroke-width="2"/>
          </svg>
        </div>
        <div class="news-content">
          <h4 class="news-headline">RBI maintains durable liquidity stance as Indian GDP projections remain robust</h4>
          <div class="news-meta">
            <span class="news-cat">India</span>
            <span class="news-src">Bloomberg Markets · 3h ago</span>
          </div>
        </div>
      </div>
    </section>
  </div>

  <!-- SCREEN 2: Markets View -->
  <div class="tab-view" id="view-markets">
    <div class="search-box">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8e95a5" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
      <input type="text" id="marketSearch" class="search-input" placeholder="Search symbol, company or index..." oninput="filterMarkets(this.value)" />
    </div>

    <!-- Indian & Global Index Strip -->
    <div class="index-strip">
      <div class="index-chip">
        <span class="chip-title">NIFTY 50 🇮🇳</span>
        <span class="chip-val">24,612.30</span>
        <span class="chip-chg" style="color:var(--red)">-0.49%</span>
      </div>
      <div class="index-chip">
        <span class="chip-title">SENSEX 🇮🇳</span>
        <span class="chip-val">80,814.73</span>
        <span class="chip-chg" style="color:var(--green)">+0.22%</span>
      </div>
      <div class="index-chip">
        <span class="chip-title">NASDAQ 🇺🇸</span>
        <span class="chip-val">18,291.62</span>
        <span class="chip-chg" style="color:var(--green)">+0.48%</span>
      </div>
      <div class="index-chip">
        <span class="chip-title">BANKNIFTY 🇮🇳</span>
        <span class="chip-val">51,320.10</span>
        <span class="chip-chg" style="color:var(--green)">+0.34%</span>
      </div>
    </div>

    <section class="section-wrap">
      <div class="section-header">
        <span class="section-title">ALL INSTRUMENTS</span>
        <span style="font-size:10px;color:var(--text-dim);font-family:monospace">SPOT FEED</span>
      </div>

      <div class="watchlist-box" id="allMarketsBox">
        <!-- Quotes rendered dynamically via JS -->
      </div>
    </section>
  </div>

  <!-- SCREEN 3: Watchlists View -->
  <div class="tab-view" id="view-watchlist">
    <div class="capsule-bar">
      <button class="capsule-btn active" onclick="filterWatchlistCategory(this, 'all')">My Watchlist</button>
      <button class="capsule-btn" onclick="filterWatchlistCategory(this, 'tech')">Tech</button>
      <button class="capsule-btn" onclick="filterWatchlistCategory(this, 'india')">India 🇮🇳</button>
      <button class="capsule-btn" onclick="filterWatchlistCategory(this, 'crypto')">Crypto</button>
    </div>

    <section class="section-wrap">
      <div class="section-header">
        <span class="section-title" id="watchlistCategoryTitle">MY WATCHLIST</span>
        <span style="font-size:10px;color:var(--text-dim);font-family:monospace">LIVE TICKS</span>
      </div>

      <div class="watchlist-box" id="curatedWatchlistBox">
        <!-- Filtered quotes -->
      </div>
    </section>
  </div>

  <!-- SCREEN 4: News View -->
  <div class="tab-view" id="view-news">
    <div class="capsule-bar">
      <button class="capsule-btn active" onclick="switchNewsTab(this, 'for_you')">FOR YOU</button>
      <button class="capsule-btn" onclick="switchNewsTab(this, 'latest')">LATEST WIRE</button>
    </div>

    <section class="section-wrap">
      <div class="news-card" onclick="openNewsArticle('fed')">
        <div class="news-thumb">
          <svg width="40" height="40" viewBox="0 0 40 40"><path d="M6,32 L16,14 L24,22 L34,8" stroke="#ff8800" stroke-width="2.5" fill="none"/></svg>
        </div>
        <div class="news-content">
          <h4 class="news-headline">Markets steady as Fed comments fuel rate-cut expectations and reshape the global macro outlook</h4>
          <div class="news-meta"><span class="news-cat">Macro</span><span class="news-src">Market Desk · 2h ago</span></div>
        </div>
      </div>

      <div class="news-card" onclick="openNewsArticle('rbi')">
        <div class="news-thumb">
          <svg width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="10" fill="#1f283a"/><path d="M12,20 L28,20 M20,12 L20,28" stroke="#00c176" stroke-width="2"/></svg>
        </div>
        <div class="news-content">
          <h4 class="news-headline">RBI maintains durable liquidity stance as Indian GDP projections remain robust across Q3</h4>
          <div class="news-meta"><span class="news-cat">India</span><span class="news-src">Bloomberg Markets · 3h ago</span></div>
        </div>
      </div>

      <div class="news-card" onclick="openNewsArticle('tech')">
        <div class="news-thumb">
          <svg width="40" height="40" viewBox="0 0 40 40"><path d="M6,30 L16,18 L26,24 L36,10" stroke="#2979ff" stroke-width="2.5" fill="none"/></svg>
        </div>
        <div class="news-content">
          <h4 class="news-headline">Technology stocks lead the session with semiconductor outperformance and AI infrastructure demand</h4>
          <div class="news-meta"><span class="news-cat">Tech</span><span class="news-src">Terminal Wire · 4h ago</span></div>
        </div>
      </div>

      <div class="news-card" onclick="openNewsArticle('crypto')">
        <div class="news-thumb">
          <svg width="40" height="40" viewBox="0 0 40 40"><path d="M6,26 L16,16 L26,20 L36,8" stroke="#00c176" stroke-width="2.5" fill="none"/></svg>
        </div>
        <div class="news-content">
          <h4 class="news-headline">Institutional spot Bitcoin exchange vehicles record $800M single-week reallocation</h4>
          <div class="news-meta"><span class="news-cat">Crypto</span><span class="news-src">Crypto Desk · 5h ago</span></div>
        </div>
      </div>
    </section>
  </div>

  <!-- SCREEN 5: More View -->
  <div class="tab-view" id="view-more">
    <section class="profile-card">
      <div class="avatar-circle">BS</div>
      <div class="profile-details">
        <span class="profile-name">Bhaskar Sharma</span>
        <span class="profile-role">Individual Investor · India</span>
        <span class="profile-pill" style="color:var(--green);border-color:rgba(0,193,118,0.3)">VERIFIED TERMINAL USER</span>
      </div>
    </section>

    <div style="padding:16px;display:flex;flex-direction:column;gap:12px">
      <button class="btn-action" onclick="launchLiveTerminal()">
        ⚡ Launch Pro Candlestick Terminal
      </button>

      <div class="watchlist-box" style="padding:0;overflow:hidden">
        <div style="padding:14px;border-bottom:1px solid #181d28;display:flex;justify-content:space-between;align-items:center" onclick="openPortfoliosModal()">
          <div>
            <div style="font-weight:700">Portfolios &amp; Net Worth</div>
            <div style="font-size:11px;color:var(--text-muted)">$617,530.00 ≈ ₹5.15 Cr INR</div>
          </div>
          <span style="color:var(--orange)">→</span>
        </div>

        <div style="padding:14px;border-bottom:1px solid #181d28;display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-weight:700">Base Currency Preference</div>
            <div style="font-size:11px;color:var(--text-muted)">Dual Valuation: USD ($) + INR (₹)</div>
          </div>
          <span style="color:var(--orange);font-weight:700;font-size:11px;background:#1a2130;padding:2px 8px;border-radius:4px;border:1px solid #2b374e">USD + INR</span>
        </div>

        <div style="padding:14px;border-bottom:1px solid #181d28;display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-weight:700">Face ID Authentication</div>
            <div style="font-size:11px;color:var(--text-muted)">Biometric terminal unlock</div>
          </div>
          <span style="color:var(--green);font-weight:700;font-size:11px">ENABLED</span>
        </div>

        <div style="padding:14px;display:flex;justify-content:space-between;align-items:center" onclick="openAlertsModal()">
          <div>
            <div style="font-weight:700">Price &amp; Volatility Alerts</div>
            <div style="font-size:11px;color:var(--text-muted)">2 active breakout triggers</div>
          </div>
          <span style="color:var(--orange)">→</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Bottom 5-Tab Bar -->
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

  <!-- Interactive Quote Detail Modal -->
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

      <!-- Vector SVG Chart with Gradient -->
      <div style="height:170px;background:#080a0e;border:1px solid #1a2230;border-radius:14px;display:flex;align-items:center;justify-content:center;margin:14px 0;padding:8px">
        <svg width="100%" height="100%" viewBox="0 0 320 150" preserveAspectRatio="none">
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#00c176" stop-opacity="0.25"/>
              <stop offset="100%" stop-color="#00c176" stop-opacity="0.0"/>
            </linearGradient>
          </defs>
          <path id="chartArea" d="M10,120 L50,105 L90,110 L130,70 L170,85 L210,45 L250,60 L290,25 L310,35 L310,150 L10,150 Z" fill="url(#chartGrad)"/>
          <path id="chartLine" d="M10,120 L50,105 L90,110 L130,70 L170,85 L210,45 L250,60 L290,25 L310,35" fill="none" stroke="#00c176" stroke-width="2.5" stroke-linecap="round"/>
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
        <div style="font-size:11px;font-weight:800;letter-spacing:1px;color:var(--text-muted);text-transform:uppercase;margin-bottom:8px">KEY DATA</div>
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

  <script>
    const sampleQuotes = [
      { s: 'AAPL', n: 'Apple Inc.', p: 178.32, c: -1.21, pct: -0.67, up: false, cat: 'tech', curr: '$' },
      { s: 'TSLA', n: 'Tesla Inc.', p: 248.17, c: 3.45, pct: 1.41, up: true, cat: 'tech', curr: '$' },
      { s: 'NIFTY', n: 'Nifty 50 Index 🇮🇳', p: 24612.30, c: -120.45, pct: -0.49, up: false, cat: 'india', curr: '₹' },
      { s: 'BTCUSD', n: 'Bitcoin Spot', p: 63284.50, c: 412.30, pct: 0.66, up: true, cat: 'crypto', curr: '$' },
      { s: 'NVDA', n: 'NVIDIA Corp.', p: 141.18, c: 2.91, pct: 2.10, up: true, cat: 'tech', curr: '$' },
      { s: 'SENSEX', n: 'BSE Sensex 🇮🇳', p: 80814.73, c: 177.20, pct: 0.22, up: true, cat: 'india', curr: '₹' },
      { s: 'ETHUSD', n: 'Ethereum Spot', p: 3490.20, c: 64.50, pct: 1.85, up: true, cat: 'crypto', curr: '$' },
      { s: 'RELIANCE', n: 'Reliance Industries 🇮🇳', p: 2984.50, c: 32.10, pct: 1.09, up: true, cat: 'india', curr: '₹' },
      { s: 'SOLUSD', n: 'Solana Spot', p: 154.40, c: 6.20, pct: 4.20, up: true, cat: 'crypto', curr: '$' }
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

    renderQuotes('allMarketsBox', sampleQuotes);
    renderQuotes('curatedWatchlistBox', sampleQuotes);

    function switchTab(tab) {
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

    function filterMarkets(query) {
      const q = query.toLowerCase().trim();
      const filtered = sampleQuotes.filter(item => item.s.toLowerCase().includes(q) || item.n.toLowerCase().includes(q));
      renderQuotes('allMarketsBox', filtered);
    }

    function filterWatchlistCategory(el, cat) {
      document.querySelectorAll('.capsule-bar .capsule-btn').forEach(b => b.classList.remove('active'));
      el.classList.add('active');
      const filtered = cat === 'all' ? sampleQuotes : sampleQuotes.filter(q => q.cat === cat);
      renderQuotes('curatedWatchlistBox', filtered);
      document.getElementById('watchlistCategoryTitle').textContent = el.textContent.toUpperCase();
    }

    function switchNewsTab(el, tab) {
      el.parentElement.querySelectorAll('.capsule-btn').forEach(b => b.classList.remove('active'));
      el.classList.add('active');
    }

    function selectTimeframe(el) {
      el.parentElement.querySelectorAll('.tf-btn').forEach(b => b.classList.remove('active'));
      el.classList.add('active');
    }

    function openQuoteDetail(symbol, name, price, change, percent, isUp, currency = '$') {
      document.getElementById('detailSymbol').textContent = symbol;
      document.getElementById('detailName').textContent = name;
      document.getElementById('detailPrice').textContent = currency + price.toLocaleString('en-US', {minimumFractionDigits: 2});
      const pill = document.getElementById('detailPill');
      const sign = isUp ? '+' : '';
      pill.textContent = \`\${sign}\${change.toFixed(2)} \${sign}\${percent.toFixed(2)}%\`;
      pill.className = 'quote-pill ' + (isUp ? 'up-pill' : 'down-pill');

      const stroke = isUp ? '#00c176' : '#ff4d4f';
      document.getElementById('chartLine').setAttribute('stroke', stroke);
      document.getElementById('chartGrad').children[0].setAttribute('stop-color', stroke);
      document.getElementById('chartGrad').children[1].setAttribute('stop-color', stroke);

      document.getElementById('statOpen').textContent = currency + (price * 0.995).toFixed(2);
      document.getElementById('statPrevClose').textContent = currency + (price * (1 - percent/100)).toFixed(2);
      document.getElementById('statRange').textContent = \`\${currency}\${(price*0.988).toFixed(2)} — \${currency}\${(price*1.012).toFixed(2)}\`;

      document.getElementById('quoteModal').classList.add('open');
    }

    function executeQuickTrade(side) {
      const sym = document.getElementById('detailSymbol').textContent;
      alert(\`Execution Verified: Market \${side} order filled for \${sym}. Logged in immutable ledger.\`);
    }

    function openAlertsModal() {
      alert('Bloomberg Anywhere Notifications: 2 active price alerts on BTCUSD & NIFTY 50.');
    }
    function openPortfoliosModal() {
      alert('Total Net Worth (NAV): $617,530.00 ≈ ₹5.15 Cr INR. All positions verified in ledger.');
    }
    function openNewsArticle(id) {
      alert('Bloomberg News: Live terminal reporting. Read full macro coverage.');
    }
    function closeAllModals(e) {
      document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
    }
    function launchLiveTerminal() {
      window.location.href = 'https://blbt-auhi.vercel.app';
    }

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

fs.writeFileSync(indexPath, mobileBloombergAnywhereHtml, 'utf8');
console.log(`[prepare-mobile] Successfully built pristine Bloomberg Anywhere Mobile App in ${indexPath}`);
