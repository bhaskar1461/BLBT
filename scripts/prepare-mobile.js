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

// Generate the exact Bloomberg Anywhere Mobile Experience in dist/index.html
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
      --card-bg: #12151c;
      --card-border: #1e2430;
      --text: #ffffff;
      --text-muted: #8b929e;
      --text-dim: #5c6370;
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
      padding-bottom: calc(var(--safe-bottom) + 60px);
    }

    /* 1. Top Bloomberg Anywhere Header */
    .top-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: var(--bg);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .back-btn {
      background: none;
      border: none;
      color: #fff;
      font-size: 20px;
      cursor: pointer;
      display: flex;
      align-items: center;
      padding: 4px;
    }
    .brand-group {
      display: flex;
      flex-direction: column;
    }
    .brand-bloomberg {
      font-size: 19px;
      font-weight: 800;
      letter-spacing: -0.3px;
      color: #ffffff;
      line-height: 1.1;
    }
    .brand-anywhere {
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 2.2px;
      color: #a0a6b5;
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
    }
    .notif-badge {
      position: absolute;
      top: -2px;
      right: -2px;
      width: 7px;
      height: 7px;
      background: var(--red);
      border-radius: 50%;
    }

    /* 2. Profile Summary Card */
    .profile-card {
      padding: 14px 16px 16px;
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .avatar-circle {
      width: 58px;
      height: 58px;
      border-radius: 50%;
      background: #181d26;
      border: 2px solid #2e384d;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: 0.5px;
      shrink: 0;
      cursor: pointer;
    }
    .profile-details {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
    }
    .profile-name {
      font-size: 18px;
      font-weight: 700;
      color: #ffffff;
    }
    .profile-role {
      font-size: 13px;
      color: var(--text-muted);
    }
    .profile-tags {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 2px;
    }
    .user-pill {
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.6px;
      text-transform: uppercase;
      padding: 3px 8px;
      border-radius: 4px;
      background: #181d28;
      border: 1px solid #2a3346;
      color: #d1d5db;
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
      box-shadow: 0 0 6px rgba(0, 193, 118, 0.6);
    }

    /* 3. Navigation Underline Tabs */
    .nav-tabs {
      display: flex;
      align-items: center;
      padding: 0 16px;
      border-bottom: 1px solid #1a202c;
      gap: 20px;
      overflow-x: auto;
      scrollbar-width: none;
    }
    .nav-tabs::-webkit-scrollbar { display: none; }
    .nav-tab-item {
      padding: 10px 2px;
      font-size: 13px;
      font-weight: 600;
      color: var(--text-muted);
      cursor: pointer;
      position: relative;
      white-space: nowrap;
      transition: color 0.15s;
    }
    .nav-tab-item.active {
      color: #ffffff;
    }
    .nav-tab-item.active::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 0;
      right: 0;
      height: 2.5px;
      background: var(--orange);
      border-radius: 2px 2px 0 0;
    }

    /* Common Section Styles */
    .section-wrap {
      padding: 16px 16px 8px;
    }
    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
    }
    .section-title {
      font-size: 14px;
      font-weight: 700;
      color: #ffffff;
    }
    .section-sub {
      font-size: 12px;
      font-weight: 400;
      color: var(--text-muted);
      margin-left: 4px;
    }
    .view-all-link {
      font-size: 12px;
      font-weight: 600;
      color: var(--blue);
      text-decoration: none;
      cursor: pointer;
    }

    /* 4. Market Snapshot / Watchlist Card */
    .watchlist-box {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      overflow: hidden;
    }
    .watchlist-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 14px;
      border-bottom: 1px solid #1a202c;
      cursor: pointer;
      transition: background 0.1s;
    }
    .watchlist-row:last-child {
      border-bottom: none;
    }
    .watchlist-row:active {
      background: #1a212d;
    }
    .instrument-left {
      display: flex;
      flex-direction: column;
      gap: 2px;
      width: 105px;
    }
    .inst-symbol {
      font-size: 14px;
      font-weight: 700;
      color: #ffffff;
    }
    .inst-name {
      font-size: 11px;
      color: var(--text-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .inst-chart {
      width: 80px;
      height: 26px;
    }
    .inst-quote {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 2px;
      min-width: 95px;
    }
    .inst-price {
      font-size: 14px;
      font-weight: 700;
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", monospace;
      color: #ffffff;
    }
    .inst-change {
      font-size: 11px;
      font-weight: 600;
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", monospace;
    }
    .up { color: var(--green); }
    .down { color: var(--red); }

    /* 5. My Portfolios Cards */
    .portfolios-scroll {
      display: flex;
      gap: 12px;
      overflow-x: auto;
      scrollbar-width: none;
      padding-bottom: 4px;
    }
    .portfolios-scroll::-webkit-scrollbar { display: none; }
    .portfolio-card {
      flex: 0 0 calc(60% - 6px);
      min-width: 190px;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 14px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      cursor: pointer;
      transition: border-color 0.15s;
    }
    .portfolio-card:active {
      border-color: var(--orange);
    }
    .port-name {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-muted);
      margin-bottom: 6px;
    }
    .port-val {
      font-size: 20px;
      font-weight: 800;
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", monospace;
      color: #ffffff;
      letter-spacing: -0.3px;
    }
    .port-inr {
      font-size: 11px;
      font-weight: 600;
      color: var(--orange);
      margin-top: 1px;
    }
    .port-meta-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 10px;
    }
    .port-gain {
      font-size: 11px;
      font-weight: 700;
      color: var(--green);
    }
    .port-sparkline {
      width: 70px;
      height: 24px;
    }

    /* 6. Recent News Section */
    .news-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 12px;
      display: flex;
      gap: 12px;
      cursor: pointer;
      margin-bottom: 10px;
      transition: background 0.1s;
    }
    .news-card:active {
      background: #1a212d;
    }
    .news-thumb {
      width: 72px;
      height: 60px;
      border-radius: 8px;
      object-fit: cover;
      background: #1f2735;
      shrink: 0;
    }
    .news-content {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      flex: 1;
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
      font-size: 10px;
      color: var(--text-muted);
      margin-top: 4px;
    }

    /* 7. Bottom Navigation Bar */
    .bottom-nav {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: calc(56px + var(--safe-bottom));
      padding-bottom: var(--safe-bottom);
      background: #080a0e;
      border-top: 1px solid #1a202c;
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
    }
    .nav-btn.active {
      color: var(--orange);
    }
    .nav-label {
      font-size: 10px;
      font-weight: 600;
    }

    /* Modal Styling */
    .modal-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.85);
      z-index: 200;
      align-items: flex-end;
      justify-content: center;
    }
    .modal-overlay.open { display: flex; }
    .sheet-box {
      width: 100%;
      max-width: 480px;
      background: #121620;
      border-top: 1px solid #2a3346;
      border-radius: 16px 16px 0 0;
      padding: 18px 18px calc(var(--safe-bottom) + 18px);
      max-height: 85vh;
      overflow-y: auto;
    }
    .sheet-handle {
      width: 36px;
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
      border-radius: 8px;
      padding: 12px;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
      margin-top: 12px;
    }
  </style>
</head>
<body>

  <!-- 1. Top Header -->
  <header class="top-header">
    <div class="header-left">
      <button class="back-btn" onclick="openMoreModal()" title="Menu">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      <div class="brand-group">
        <span class="brand-bloomberg">Bloomberg</span>
        <span class="brand-anywhere">ANYWHERE</span>
      </div>
    </div>

    <div class="header-actions">
      <!-- Search -->
      <button class="icon-btn" onclick="openSearchModal()" title="Search">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </button>

      <!-- Notifications Bell with Red Dot -->
      <button class="icon-btn" onclick="openAlertsModal()" title="Alerts">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        <span class="notif-badge"></span>
      </button>

      <!-- Hamburger Menu -->
      <button class="icon-btn" onclick="openMoreModal()" title="More Options">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
    </div>
  </header>

  <!-- 2. Profile Card -->
  <section class="profile-card" onclick="openProfileModal()">
    <div class="avatar-circle">BS</div>
    <div class="profile-details">
      <div class="profile-name">Bhaskar Sharma</div>
      <div class="profile-role">Individual Investor</div>
      <div class="profile-tags">
        <span class="user-pill">BLOOMBERG ANYWHERE USER</span>
        <div class="status-indicator">
          <span class="status-dot"></span>
          <span>Active</span>
        </div>
      </div>
    </div>
  </section>

  <!-- 3. Navigation Underline Tabs -->
  <nav class="nav-tabs">
    <div class="nav-tab-item active" onclick="switchTab('overview')">Overview</div>
    <div class="nav-tab-item" onclick="switchTab('watchlists')">Watchlists</div>
    <div class="nav-tab-item" onclick="switchTab('portfolios')">Portfolios</div>
    <div class="nav-tab-item" onclick="switchTab('alerts')">Alerts</div>
    <div class="nav-tab-item" onclick="openMoreModal()">Settings</div>
  </nav>

  <!-- Tab Content: Overview (Default) -->
  <main id="overviewSection">
    <!-- 4. Market Snapshot / Watchlist -->
    <section class="section-wrap">
      <div class="section-header">
        <div class="section-title">
          Market Snapshot <span class="section-sub">(My Watchlist)</span>
        </div>
        <a class="view-all-link" onclick="switchTab('watchlists')">View All</a>
      </div>

      <div class="watchlist-box" id="watchlistRows">
        <!-- AAPL -->
        <div class="watchlist-row" onclick="openChartModal('AAPL', 'Apple Inc', 178.32, -0.67)">
          <div class="instrument-left">
            <span class="inst-symbol">AAPL</span>
            <span class="inst-name">Apple Inc</span>
          </div>
          <!-- Red mini chart -->
          <svg class="inst-chart" viewBox="0 0 80 26">
            <path d="M0,8 Q20,6 35,14 T60,18 T80,22" fill="none" stroke="#ff4d4f" stroke-width="1.8" stroke-linecap="round" />
          </svg>
          <div class="inst-quote">
            <span class="inst-price">178.32</span>
            <span class="inst-change down">-1.21 (-0.67%)</span>
          </div>
        </div>

        <!-- TSLA -->
        <div class="watchlist-row" onclick="openChartModal('TSLA', 'Tesla Inc', 248.17, 1.41)">
          <div class="instrument-left">
            <span class="inst-symbol">TSLA</span>
            <span class="inst-name">Tesla Inc</span>
          </div>
          <!-- Green mini chart -->
          <svg class="inst-chart" viewBox="0 0 80 26">
            <path d="M0,20 Q20,18 40,11 T60,14 T80,4" fill="none" stroke="#00c176" stroke-width="1.8" stroke-linecap="round" />
          </svg>
          <div class="inst-quote">
            <span class="inst-price">248.17</span>
            <span class="inst-change up">+3.45 (+1.41%)</span>
          </div>
        </div>

        <!-- NIFTY 50 (Indian Market) -->
        <div class="watchlist-row" onclick="openChartModal('NIFTY', 'Nifty 50', 24612.30, -0.49)">
          <div class="instrument-left">
            <span class="inst-symbol">NIFTY</span>
            <span class="inst-name">Nifty 50 🇮🇳</span>
          </div>
          <!-- Red mini chart -->
          <svg class="inst-chart" viewBox="0 0 80 26">
            <path d="M0,6 Q20,12 38,10 T60,20 T80,23" fill="none" stroke="#ff4d4f" stroke-width="1.8" stroke-linecap="round" />
          </svg>
          <div class="inst-quote">
            <span class="inst-price">24,612.30</span>
            <span class="inst-change down">-120.45 (-0.49%)</span>
          </div>
        </div>

        <!-- BTCUSD -->
        <div class="watchlist-row" onclick="openChartModal('BTCUSDT', 'Bitcoin', 63284.50, 0.66)">
          <div class="instrument-left">
            <span class="inst-symbol">BTCUSD</span>
            <span class="inst-name">Bitcoin</span>
          </div>
          <!-- Green mini chart -->
          <svg class="inst-chart" viewBox="0 0 80 26">
            <path d="M0,18 Q20,15 35,10 T55,14 T80,3" fill="none" stroke="#00c176" stroke-width="1.8" stroke-linecap="round" />
          </svg>
          <div class="inst-quote">
            <span class="inst-price" id="btcLivePrice">63,284.50</span>
            <span class="inst-change up" id="btcLiveChg">+412.30 (+0.66%)</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 5. My Portfolios -->
    <section class="section-wrap">
      <div class="section-header">
        <span class="section-title">My Portfolios</span>
        <a class="view-all-link" onclick="switchTab('portfolios')">View All</a>
      </div>

      <div class="portfolios-scroll">
        <!-- Main Portfolio Card -->
        <div class="portfolio-card" onclick="openPortfolioDetail('main')">
          <div>
            <div class="port-name">Main Portfolio</div>
            <div class="port-val">$617,530.00</div>
            <div class="port-inr">≈ ₹5.15 Cr INR</div>
          </div>
          <div class="port-meta-row">
            <span class="port-gain">+2.31% (Today)</span>
            <svg class="port-sparkline" viewBox="0 0 70 24">
              <path d="M0,18 Q18,14 35,8 T55,10 T70,3" fill="none" stroke="#00c176" stroke-width="2" stroke-linecap="round" />
            </svg>
          </div>
        </div>

        <!-- Long Term Portfolio Card -->
        <div class="portfolio-card" onclick="openPortfolioDetail('longterm')">
          <div>
            <div class="port-name">Long Term F&O</div>
            <div class="port-val">$128,204.11</div>
            <div class="port-inr">≈ ₹1.07 Cr INR</div>
          </div>
          <div class="port-meta-row">
            <span class="port-gain">+0.92% (Today)</span>
            <svg class="port-sparkline" viewBox="0 0 70 24">
              <path d="M0,16 Q18,17 35,11 T55,13 T70,5" fill="none" stroke="#00c176" stroke-width="2" stroke-linecap="round" />
            </svg>
          </div>
        </div>
      </div>
    </section>

    <!-- 6. Recent News -->
    <section class="section-wrap">
      <div class="section-header">
        <span class="section-title">Recent News</span>
        <a class="view-all-link" onclick="switchTab('news')">View All</a>
      </div>

      <div class="news-card" onclick="openNewsArticle('fed')">
        <svg class="news-thumb" viewBox="0 0 72 60">
          <rect width="72" height="60" fill="#18202d"/>
          <path d="M12,50 L25,20 L40,32 L60,14" stroke="#ff8800" stroke-width="2.5" fill="none"/>
        </svg>
        <div class="news-content">
          <div class="news-headline">Markets steady as Fed comments fuel rate cut expectations</div>
          <div class="news-meta">Bloomberg · 2h ago</div>
        </div>
      </div>

      <div class="news-card" onclick="openNewsArticle('rbi')">
        <svg class="news-thumb" viewBox="0 0 72 60">
          <rect width="72" height="60" fill="#18202d"/>
          <circle cx="36" cy="30" r="16" fill="#232e42"/>
          <path d="M26,30 L46,30 M36,20 L36,40" stroke="#00c176" stroke-width="2"/>
        </svg>
        <div class="news-content">
          <div class="news-headline">RBI signals durable liquidity support as Indian GDP projections remain robust</div>
          <div class="news-meta">Bloomberg Markets · 3h ago</div>
        </div>
      </div>
    </section>
  </main>

  <!-- 7. Bottom Navigation Bar -->
  <nav class="bottom-nav">
    <button class="nav-btn active" onclick="switchTab('overview')">
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
      <span class="nav-label">Home</span>
    </button>

    <button class="nav-btn" onclick="switchTab('markets')">
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"></line>
        <line x1="12" y1="20" x2="12" y2="4"></line>
        <line x1="6" y1="20" x2="6" y2="14"></line>
      </svg>
      <span class="nav-label">Markets</span>
    </button>

    <button class="nav-btn" onclick="switchTab('watchlists')">
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>
      <span class="nav-label">Watchlist</span>
    </button>

    <button class="nav-btn" onclick="switchTab('news')">
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path>
        <path d="M18 14h-8"></path>
        <path d="M15 18h-5"></path>
        <path d="M10 6h8v4h-8V6Z"></path>
      </svg>
      <span class="nav-label">News</span>
    </button>

    <button class="nav-btn" onclick="openMoreModal()">
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="1"></circle>
        <circle cx="19" cy="12" r="1"></circle>
        <circle cx="5" cy="12" r="1"></circle>
      </svg>
      <span class="nav-label">More</span>
    </button>
  </nav>

  <!-- Modals -->
  <!-- 8. More Options Sheet -->
  <div class="modal-overlay" id="moreModal" onclick="closeAllModals(event)">
    <div class="sheet-box" onclick="event.stopPropagation()">
      <div class="sheet-handle"></div>
      <h3 style="font-size:16px;font-weight:700;margin-bottom:14px;color:#fff">Bloomberg Anywhere Options</h3>
      
      <div style="display:flex;flex-direction:column;gap:8px">
        <div style="padding:12px;background:#181d28;border-radius:8px;display:flex;justify-content:space-between;align-items:center;cursor:pointer" onclick="openProfileModal()">
          <div>
            <div style="font-weight:700;color:#fff">Account Settings</div>
            <div style="font-size:11px;color:var(--text-muted)">Bhaskar Sharma · Individual Investor</div>
          </div>
          <span style="color:var(--orange)">→</span>
        </div>

        <div style="padding:12px;background:#181d28;border-radius:8px;display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-weight:700;color:#fff">Subscription Details</div>
            <div style="font-size:11px;color:var(--green)">Bloomberg Anywhere License: Active</div>
          </div>
          <span style="font-size:10px;padding:3px 6px;background:rgba(0,193,118,0.15);color:var(--green);border-radius:4px">Verified</span>
        </div>

        <div style="padding:12px;background:#181d28;border-radius:8px;display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-weight:700;color:#fff">Base Currency Preference</div>
            <div style="font-size:11px;color:var(--text-muted)">Dual Valuation: USD + INR (₹83.33)</div>
          </div>
          <span style="color:var(--orange);font-weight:700">₹ INR / $</span>
        </div>

        <button class="btn-action" onclick="launchLiveTerminal()">Launch Full Bloomberg Pro Terminal</button>
        <button class="btn-action" style="background:#222834;color:#fff;margin-top:6px" onclick="closeAllModals()">Close</button>
      </div>
    </div>
  </div>

  <!-- Instrument Chart / Trading Modal -->
  <div class="modal-overlay" id="chartModal" onclick="closeAllModals(event)">
    <div class="sheet-box" onclick="event.stopPropagation()">
      <div class="sheet-handle"></div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <div>
          <h2 id="modalSymbol" style="font-size:18px;font-weight:800;color:#fff">AAPL</h2>
          <div id="modalName" style="font-size:12px;color:var(--text-muted)">Apple Inc</div>
        </div>
        <div style="text-align:right">
          <div id="modalPrice" style="font-size:20px;font-weight:800;font-family:monospace;color:#fff">$178.32</div>
          <div id="modalChange" style="font-size:12px;font-weight:700;color:var(--red)">-0.67%</div>
        </div>
      </div>

      <div style="height:140px;background:#0b0e14;border:1px solid #1a2230;border-radius:8px;display:flex;align-items:center;justify-content:center;margin:12px 0">
        <svg width="90%" height="90" viewBox="0 0 280 80">
          <path d="M0,50 Q40,30 80,45 T160,20 T240,35 T280,10" fill="none" stroke="#ff8800" stroke-width="2.5"/>
        </svg>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px">
        <button class="btn-action" style="background:var(--green);color:#fff;margin-top:0" onclick="alert('Order submitted for ' + document.getElementById('modalSymbol').textContent)">BUY / LONG</button>
        <button class="btn-action" style="background:var(--red);color:#fff;margin-top:0" onclick="alert('Order submitted for ' + document.getElementById('modalSymbol').textContent)">SELL / SHORT</button>
      </div>
    </div>
  </div>

  <script>
    // Tab Switching
    function switchTab(tab) {
      document.querySelectorAll('.nav-tab-item').forEach(el => {
        el.classList.toggle('active', el.textContent.toLowerCase() === tab.toLowerCase());
      });
      document.querySelectorAll('.nav-btn').forEach(btn => {
        const lbl = btn.querySelector('.nav-label')?.textContent.toLowerCase();
        btn.classList.toggle('active', lbl === tab.toLowerCase() || (tab === 'overview' && lbl === 'home'));
      });
    }

    // Modal Handlers
    function openMoreModal() {
      document.getElementById('moreModal').classList.add('open');
    }
    function openProfileModal() {
      openMoreModal();
    }
    function openSearchModal() {
      const q = prompt('Search Tickers, Equities, Indices or Crypto:');
      if (q) openChartModal(q.toUpperCase(), q.toUpperCase(), 100.0, 1.5);
    }
    function openAlertsModal() {
      alert('Bloomberg Anywhere Notifications: 2 active price alerts on BTCUSD & NIFTY 50.');
    }
    function openPortfolioDetail(id) {
      window.location.href = 'https://blbt-auhi.vercel.app/u/Bhaskar1461';
    }
    function openNewsArticle(id) {
      alert('Bloomberg News: Live terminal reporting. Read full macro coverage.');
    }
    function openChartModal(symbol, name, price, change) {
      document.getElementById('modalSymbol').textContent = symbol;
      document.getElementById('modalName').textContent = name;
      document.getElementById('modalPrice').textContent = '$' + price.toLocaleString();
      const chgEl = document.getElementById('modalChange');
      chgEl.textContent = (change >= 0 ? '+' : '') + change + '%';
      chgEl.className = change >= 0 ? 'up' : 'down';
      document.getElementById('chartModal').classList.add('open');
    }
    function closeAllModals(e) {
      document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
    }
    function launchLiveTerminal() {
      window.location.href = 'https://blbt-auhi.vercel.app';
    }

    // Connect to real-time Binance feed for live BTC ticker
    try {
      const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker');
      ws.onmessage = (e) => {
        const d = JSON.parse(e.data);
        if (d && d.c) {
          const p = parseFloat(d.c);
          const chg = parseFloat(d.P);
          const pEl = document.getElementById('btcLivePrice');
          const cEl = document.getElementById('btcLiveChg');
          if (pEl) pEl.textContent = p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          if (cEl) {
            cEl.textContent = (chg >= 0 ? '+' : '') + chg.toFixed(2) + '%';
            cEl.className = 'inst-change ' + (chg >= 0 ? 'up' : 'down');
          }
        }
      };
    } catch(err) {}
  </script>
</body>
</html>`;

fs.writeFileSync(indexPath, mobileBloombergAnywhereHtml, 'utf8');
console.log(`[prepare-mobile] Successfully built pixel-perfect Bloomberg Anywhere Mobile App in ${indexPath}`);
