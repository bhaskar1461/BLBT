# Phase 8 — Real Trading Integration & Threat Model Specification

> **⚠️ ARCHITECTURAL DESIGN SPECIFICATION ONLY**  
> In accordance with user guidelines and safety discipline, **no live real-trading order execution code is built** until explicit user review and written approval is granted.

---

## 1. Executive Summary & Core Philosophy

Real trading introduces counterparty, financial, legal, and cryptographic liability. Unlike paper trading where mistakes cost zero dollars, in real trading:
- Users connect their actual capital.
- A compromised key can drain funds or execute malicious market orders.
- A failed cron or order loop can result in real slippage and financial loss.

### The Non-Custodial "BYO-Keys" Model
Celsius Network operates strictly on the **Bring-Your-Own-Keys (BYO-Keys)** architecture:
1. **Zero Fund Custody**: Celsius Network never holds, deposits, or withdraws user funds. All assets reside in the user's personal Binance Spot account.
2. **Mandatory Withdrawal Restriction**: API keys **MUST NOT** have the `Withdrawal` permission enabled on Binance. Keys attempting to register with withdrawal capabilities are strictly rejected during onboarding.
3. **Encrypted at Rest**: API Keys and API Secrets are encrypted using authenticated **AES-256-GCM** before touching persistent storage.
4. **Dark Deployment via Feature Flags**: Real trading is gated behind the `real_trading` feature flag, initially disabled for all accounts, enabled only for vetted beta users.
5. **Instant Global Kill Switch**: Administrators can terminate all real execution instantly from the `/admin` console.

---

## 2. Cryptographic Architecture: Key Storage & Encryption

### 2.1 Encryption Scheme (AES-256-GCM)
Plaintext Binance API keys and secrets must **never** be logged, cached in plaintext, sent to client browsers, or stored unencrypted in Supabase.

```
                    Plaintext Key / Secret
                              │
                              ▼
┌───────────────────────────────────────────────────────────────┐
│ Server-Side Encryption (crypto.createCipheriv)                │
│ - Algorithm: AES-256-GCM (Authenticated Encryption)          │
│ - Master Secret: BINANCE_KEY_ENCRYPTION_SECRET (from env)    │
│ - IV: 12-byte cryptographically secure random buffer (crypto)  │
│ - Output: Encrypted Ciphertext + 16-byte Auth Tag + IV        │
└───────────────────────────────────────────────────────────────┘
                              │
                              ▼
        Stored in `user_exchange_keys` Table
        (iv, encrypted_key, key_tag, encrypted_secret, secret_tag)
```

### 2.2 Database Schema: `user_exchange_keys`
```sql
CREATE TABLE IF NOT EXISTS user_exchange_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exchange VARCHAR(32) NOT NULL DEFAULT 'binance',
  label VARCHAR(64) NOT NULL DEFAULT 'Main Binance Account',
  
  -- Encrypted credentials (Hex or Base64 encoded)
  encrypted_api_key TEXT NOT NULL,
  api_key_iv VARCHAR(32) NOT NULL,
  api_key_tag VARCHAR(32) NOT NULL,
  
  encrypted_api_secret TEXT NOT NULL,
  api_secret_iv VARCHAR(32) NOT NULL,
  api_secret_tag VARCHAR(32) NOT NULL,
  
  -- Permissions and status verified against Binance /api/v3/account
  permissions JSONB NOT NULL DEFAULT '{"canTrade": false, "canWithdraw": false, "canDeposit": false, "readOnly": true}'::jsonb,
  is_valid BOOLEAN NOT NULL DEFAULT false,
  trading_enabled BOOLEAN NOT NULL DEFAULT false, -- User must explicitly toggle ON
  
  last_validated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT unique_user_exchange UNIQUE(user_id, exchange)
);

-- RLS Enforcement
ALTER TABLE user_exchange_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own exchange key status (no secrets exposed)"
  ON user_exchange_keys
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own exchange keys"
  ON user_exchange_keys
  FOR ALL
  USING (auth.uid() = user_id);
```

---

## 3. Key Connection & Validation Lifecycle

### Step 1: Client Submission
1. Trader opens Settings -> "Connect Binance API".
2. UI displays unambiguous instructions:
   - *"Log into Binance -> API Management -> Create API Key"*.
   - *"Check 'Enable Reading' and 'Enable Spot & Margin Trading'"*.
   - *"DO NOT enable 'Enable Withdrawals' (our servers will reject it immediately)"*.
   - *"Recommended: Restrict access to trusted IP addresses"*.
3. Trader inputs `API Key` and `API Secret`.
4. Client sends payload over HTTPS POST `/api/exchange/connect`.

### Step 2: Server-Side Decryption & Read-Only Handshake
1. Server generates ephemeral AES-256-GCM cipher and encrypts the key & secret.
2. Before persisting, server executes an authoritative Binance read-only test call:
   ```
   GET https://api.binance.com/api/v3/account
   Headers: X-MBX-APIKEY: <decrypted_key>
   Query: timestamp=<epoch>&signature=<hmac_sha256(secret)>
   ```
3. Server evaluates Binance response:
   - **Invalid Signature / Bad Key (HTTP 401)**: Return error *"Invalid Binance API Key or Secret"*.
   - **Withdrawal Permission Enabled (`canWithdraw: true`)**: **STRICT REJECTION**.
     - Error: *"Security Violation: This API key has withdrawal permissions enabled. For your fund safety, Celsius only accepts keys with withdrawals strictly disabled. Please regenerate on Binance."*
   - **Trading Permissions Missing (`canTrade: false`)**:
     - Key is accepted as **Read-Only Mode**.
     - Real order placement is blocked until trader enables spot trading on Binance.
4. Write record to `user_exchange_keys` with `is_valid = true`.
5. Write immutable entry to `audit_logs` (`action: 'EXCHANGE_KEY_CONNECTED'`).

---

## 4. Real Order Execution Architecture

When `real_trading` feature flag is enabled for the account:

```
[Trader Submits Order: POST /api/trade/order]
                      │
                      ▼
 ┌────────────────────────────────────────────────────────┐
 │ 1. Auth & Status Verification                          │
 │ - User authenticated via Supabase JWT                  │
 │ - Status NOT frozen or suspended                       │
 │ - Feature flag `real_trading` == true                  │
 └────────────────────────────────────────────────────────┘
                      │
                      ▼
 ┌────────────────────────────────────────────────────────┐
 │ 2. Mode Inspection                                     │
 │ - Mode == 'real' (explicit user selection)            │
 │ - Retrieve `user_exchange_keys` row                    │
 │ - Check `trading_enabled == true`                      │
 │ - Check `permissions.canTrade == true`                 │
 └────────────────────────────────────────────────────────┘
                      │
                      ▼
 ┌────────────────────────────────────────────────────────┐
 │ 3. Confirmation Guard                                  │
 │ - Explicit `confirmRealMoney: true` header/payload    │
 │ - Green vs Orange terminal visual differentiation      │
 └────────────────────────────────────────────────────────┘
                      │
                      ▼
 ┌────────────────────────────────────────────────────────┐
 │ 4. Decrypt Secret & Sign Binance Payload               │
 │ - AES-256-GCM decrypt with process.env key             │
 │ - HMAC-SHA256 signature generation                     │
 │ - Dispatch to Binance: POST /api/v3/order              │
 └────────────────────────────────────────────────────────┘
                      │
                      ▼
 ┌────────────────────────────────────────────────────────┐
 │ 5. Audit Logging & Reconciliation                      │
 │ - Append to `real_transactions` immutable table        │
 │ - Binance Order ID stored as authoritative source      │
 │ - Realized P&L reconciled against Binance fills        │
 └────────────────────────────────────────────────────────┘
```

---

## 5. Comprehensive Threat Model

| Threat | Likelihood | Impact | Architectural Mitigation |
| :--- | :---: | :---: | :--- |
| **Database Compromise (SQL Dump / Supabase Leak)** | Low | Critical | **AES-256-GCM Encryption**: DB dumps only contain high-entropy ciphertext, tags, and IVs. The master decryption secret exists solely in ephemeral server memory / Vercel secrets. |
| **Server-Side Rogue Order Execution (CSRF / Replay)** | Low | Critical | **Strict Request Signing & RLS**: Orders require fresh bearer token + user verification. Every order triggers server audit log with IP, user agent, and timestamp. |
| **Withdrawal / Fund Draining Exploit** | Medium | Fatal | **Binance Architecture Guard**: Keys with `canWithdraw: true` are blocked at registration. Even if the server were completely hijacked, an attacker cannot withdraw funds through trading keys. |
| **Price Slippage / Extreme Market Volatility** | Medium | High | **Limit Order Priority & Slippage Bounds**: Real market orders enforce maximum slippage bounds (0.5% max deviance from Binance ticker). |
| **Stale / Zombie Cron Triggering Orders** | Low | High | **Server-Side Timeouts & Kill Switch**: Orders specify `timeInForce: GTC / IOC`. Emergency admin kill switch instantly cancels pending orders and disables execution engine. |
| **Accidental Real Money Execution (Fat Finger)** | High | High | **Distinct UI Treatment**: Orange header banner (`⚠️ REAL TRADING MODE — REAL CAPITAL AT RISK`), mandatory modal confirmation with typed amount. |

---

## 6. Phased Implementation Roadmap

- [x] **Prompt 1 (Completed)**: Architecture, BYO-keys workflow, encryption specification, and threat model (`/docs/REAL_TRADING.md`).
- [ ] **Prompt 2 (Pending User Approval)**: Key connection settings UI + AES-256-GCM server encryption + read-only Binance validation endpoint (zero trade execution).
- [ ] **Prompt 3 (Pending User Approval)**: Order execution dispatch to Binance Spot gated behind `real_trading` feature flag, explicit confirmation dialog, and Orange vs Green mode UI.
- [ ] **Prompt 4 (Pending User Approval)**: Live Binance positions & fills sync, trade history from Binance records, and Admin Global Real Trading Kill Switch.

> **Status:** Waiting for user authorization before building Phase 8 Step 2.
