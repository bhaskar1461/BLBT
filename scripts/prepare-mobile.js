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

// Ensure dist/index.html exists
const indexPath = path.join(distDir, 'index.html');
if (!fs.existsSync(indexPath)) {
  const defaultHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
    <title>Celsius Terminal</title>
    <style>
      :root {
        --bg: #0b0e14;
        --card: #121721;
        --border: #1e2638;
        --accent: #00f090;
        --text: #e1e7f0;
        --text-muted: #8492a6;
      }
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        -webkit-user-select: none;
        user-select: none;
      }
      body {
        background-color: var(--bg);
        color: var(--text);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 24px;
        padding-top: env(safe-area-inset-top, 24px);
        padding-bottom: env(safe-area-inset-bottom, 24px);
      }
      .card {
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 16px;
        padding: 32px 24px;
        max-width: 420px;
        width: 100%;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      }
      .logo {
        width: 56px;
        height: 56px;
        margin: 0 auto 16px auto;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 12px;
        background: rgba(0, 240, 144, 0.1);
        border: 1px solid rgba(0, 240, 144, 0.3);
      }
      .logo svg {
        width: 32px;
        height: 32px;
        stroke: var(--accent);
      }
      h1 {
        font-size: 20px;
        font-weight: 700;
        letter-spacing: -0.02em;
        margin-bottom: 8px;
      }
      p {
        color: var(--text-muted);
        font-size: 14px;
        line-height: 1.5;
        margin-bottom: 24px;
      }
      .status-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        font-family: monospace;
        padding: 4px 10px;
        border-radius: 999px;
        background: rgba(0, 240, 144, 0.1);
        color: var(--accent);
        margin-bottom: 20px;
      }
      .dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--accent);
      }
      .btn {
        display: block;
        width: 100%;
        padding: 12px;
        border-radius: 8px;
        background: var(--accent);
        color: #0b0e14;
        font-weight: 600;
        font-size: 14px;
        border: none;
        cursor: pointer;
        transition: opacity 0.2s;
      }
      .btn:active {
        opacity: 0.8;
      }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="logo">
        <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
        </svg>
      </div>
      <h1>CELSIUS TERMINAL</h1>
      <div class="status-pill">
        <span class="dot"></span>
        <span>MOBILE RUNTIME READY</span>
      </div>
      <p id="msg">Connecting to live market servers...</p>
      <button class="btn" onclick="window.location.reload()">Reconnect</button>
    </div>
  </body>
</html>`;
  fs.writeFileSync(indexPath, defaultHtml, 'utf-8');
  console.log('[prepare-mobile] Created default mobile shell in dist/index.html');
}

console.log('[prepare-mobile] Mobile distribution assets ready in dist/');
