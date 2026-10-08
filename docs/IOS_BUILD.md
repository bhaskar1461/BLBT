# Celsius Terminal — iOS Mobile Build & Sideloadly Deployment Guide

This document explains the end-to-end architecture and instructions for building and running **Celsius Terminal** on iOS using **Capacitor** and **GitHub Actions**, with signing and installation handled locally on Windows via **Sideloadly**.

---

## 🎯 Architecture Overview & The Separation of Concerns

It is critical to distinguish between the three distinct stages of running an app on your physical iPhone:

1. **Building an IPA (Cloud — GitHub Actions macOS Runner):**
   - Compiles the React / Next.js web application.
   - Synchronizes Capacitor assets with the native Xcode project (`ios/App/App.xcodeproj`).
   - Uses `xcodebuild` without code signing (`CODE_SIGNING_ALLOWED=NO CODE_SIGN_IDENTITY=""`) to compile the `.app` bundle.
   - Packages the binary into a standard `Payload/App.app` archive structure named `CelsiusTerminal-unsigned.ipa`.
   - **No Apple ID, passwords, p12 certificates, or provisioning profiles are ever uploaded to GitHub.**

2. **Signing an IPA (Local — Windows PC via Sideloadly):**
   - Sideloadly uses your free or paid Apple ID locally on your Windows machine to request a short-lived development provisioning profile from Apple's signing server.
   - Sideloadly re-signs the unsigned IPA on your computer using Apple's official ad-hoc/developer mechanisms.

3. **Installing an IPA (Local — iPhone via USB/Wi-Fi):**
   - Sideloadly transfers and installs the signed application directly onto your connected iPhone.
   - **GitHub Actions cannot and does not install apps onto physical devices.**

```
┌──────────────────────────────────────┐
│  React / Next.js Application         │
│  (Existing codebase, zero UI rewrites)│
└──────────────────┬───────────────────┘
                   │ npx cap sync ios
                   ▼
┌──────────────────────────────────────┐
│  Capacitor Native iOS Shell (ios/)   │
│  Bundle ID: network.celsius.terminal │
└──────────────────┬───────────────────┘
                   │ git push to GitHub
                   ▼
┌──────────────────────────────────────┐
│  GitHub Actions (macos-latest)       │
│  xcodebuild (unsigned) → .ipa artifact│
└──────────────────┬───────────────────┘
                   │ Download IPA to Windows PC
                   ▼
┌──────────────────────────────────────┐
│  Sideloadly on Windows               │
│  Sign with Apple ID & install        │
└──────────────────┬───────────────────┘
                   │ USB / Wi-Fi Sync
                   ▼
┌──────────────────────────────────────┐
│  Physical iPhone Device              │
└──────────────────────────────────────┘
```

---

## 1. How Capacitor Was Added to the Project

1. **Dependencies installed**:
   - `@capacitor/core`: Runtime bridge between JavaScript and native iOS.
   - `@capacitor/ios`: Native iOS platform runtime and Xcode project scaffolding.
   - `@capacitor/cli` (devDependency): Tooling for platform management and asset synchronization.

2. **Configuration (`capacitor.config.ts`)**:
   - **App Name**: `Celsius Terminal`
   - **Bundle Identifier**: `network.celsius.terminal` (Reverse DNS notation matching the platform domain `celsius.network`).
   - **Web Asset Directory (`webDir`)**: `dist`
   - **Remote Server URL support**:
     ```ts
     const serverUrl = process.env.CAPACITOR_SERVER_URL;
     // When set, WKWebView loads the live backend (e.g., https://celsius.network)
     // When omitted, WKWebView loads the standalone bundled assets in dist/
     ```
   - **iOS Specific Options**:
     - `contentInset: 'always'`: Ensures content respects iPhone Safe Areas (Dynamic Island, notch, home indicator).
     - `preferredContentMode: 'mobile'`: Enforces mobile viewport rendering.
     - `scheme: 'CelsiusTerminal'`: Custom URL scheme for deep linking.

3. **Postbuild Mobile Asset Prep (`scripts/prepare-mobile.js`)**:
   - Automatically executed after `npm run build`.
   - Populates `dist/` with production web assets and a native mobile fallback shell so `npx cap sync ios` always executes with 0 warnings.

---

## 2. How to Run the Web Application Locally

The existing Next.js web application continues working with zero changes to its workflow:

```bash
# Start local development server (http://localhost:3000)
npm run dev

# Run automated verification tests
node scripts/run_all_verifications.js
```

---

## 3. How to Build the React Application

To compile the production Next.js build and generate the mobile assets:

```bash
npm run build
```

This executes:
1. `next build`: Generates optimized Next.js production output.
2. `postbuild` (`node scripts/prepare-mobile.js`): Copies distribution assets and prepares `dist/`.

---

## 4. How to Synchronize Capacitor

Whenever you make frontend changes and want to update the native iOS project files:

```bash
# Combined build & sync command:
npm run cap:sync

# Or manually:
npm run build
npx cap sync ios
```

This copies the latest bundled assets from `dist/` into `ios/App/App/public/` and updates native plugin configurations.

---

## 5. How to Run / Open the iOS Project

### If you are on a Mac:
```bash
npx cap open ios
```
This opens `ios/App/App.xcodeproj` in Xcode where you can run it on the iOS Simulator.

### If you are on Windows (Your Current Setup):
You do not need a Mac or Xcode installed locally. You commit your code and let **GitHub Actions** build the unsigned IPA.

---

## 6. How to Trigger GitHub Actions

The workflow is located at `.github/workflows/ios.yml`.

### Step-by-Step Instructions:

1. Push your changes to your GitHub repository:
   ```bash
   git add .
   git commit -m "feat(mobile): add Capacitor iOS project and GitHub Actions build"
   git push origin master
   ```

2. Open your repository on GitHub in your browser.
3. Click on the **Actions** tab at the top.
4. In the left sidebar, click on **Build iOS IPA (Unsigned)**.
5. Click the **Run workflow** dropdown button on the right.
6. *(Optional)* In the **Remote Server URL** input:
   - Leave it empty to use the bundled offline/local assets.
   - OR enter your deployed live URL (e.g. `https://celsius.network` or your Vercel deployment URL) to have the native iOS app connect to your live backend.
7. Click the green **Run workflow** button.

---

## 7. Where to Download the IPA

1. In the **Actions** tab, click on the workflow run that just started (named `Build iOS IPA (Unsigned)`).
2. Wait for the `build-ios` job to finish (typically 3–5 minutes on `macos-latest`).
3. Scroll down to the **Artifacts** section at the bottom of the summary page.
4. Click on **CelsiusTerminal-iOS-IPA**.
5. Your browser will download a zip archive (`CelsiusTerminal-iOS-IPA.zip`).
6. Unzip the downloaded file to extract `CelsiusTerminal-unsigned.ipa`.

---

## 8. How to Install and Sign Using Sideloadly on Windows

### Prerequisites:
1. **Download & Install Sideloadly**: [sideloadly.io](https://sideloadly.io/) (available for 64-bit Windows).
2. **Install iTunes & iCloud (Non-Microsoft Store versions)**:
   - Sideloadly requires Apple's native driver libraries.
   - Download the official standalone installers from Apple (links provided on Sideloadly's website), not the Windows Store versions.
3. Connect your iPhone to your Windows PC via USB cable.
4. Unlock your iPhone and tap **"Trust This Computer"** if prompted.

### Installation Steps in Sideloadly:
1. Launch **Sideloadly** on your Windows PC.
2. In the top **iDevice** dropdown, ensure your connected iPhone is selected.
3. Under **Apple ID**, enter your standard Apple ID email address (e.g. `yourname@gmail.com` or `yourname@icloud.com`).
4. Drag and drop `CelsiusTerminal-unsigned.ipa` into the large IPA icon box on the left of Sideloadly.
5. Click **Start**.
6. When prompted, enter your Apple ID password:
   - *Note*: Sideloadly communicates directly with Apple's developer authentication servers to generate a free 7-day development certificate. If you have Two-Factor Authentication (2FA) enabled, enter the verification code that appears on your iPhone.
7. Sideloadly will unpack the IPA, sign every binary with your personal Apple ID, and install the app onto your iPhone.
8. Status will show `Done.`

### First-Time Trust on iPhone:
Before opening the newly installed app on your iPhone:
1. Go to **Settings** → **General** → **VPN & Device Management** (or **Profiles & Device Management**).
2. Under **Developer App**, tap your Apple ID email.
3. Tap **Trust "[Your Apple ID]"** and confirm.
4. *(On iOS 16+)*: Go to **Settings** → **Privacy & Security** → scroll to bottom → enable **Developer Mode** (device will reboot).
5. Open **Celsius Terminal** from your home screen.

---

## 9. Limitations of Free Apple ID Signing

Using a personal (free) Apple ID with Sideloadly has specific Apple-enforced restrictions:

| Restriction | Free Apple ID | Paid Apple Developer Program ($99/yr) |
|---|---|---|
| **Certificate Expiration** | 7 Days (requires re-signing weekly) | 365 Days (1 Year) |
| **Active Sideloaded Apps** | Maximum 3 apps at any given time | Unlimited development apps |
| **App IDs per 7 days** | Maximum 10 App IDs per week | Unlimited App IDs |
| **Push Notifications (APNs)** | Not supported without paid entitlement | Fully supported |
| **Sideloadly Automatic Refresh** | Supported via Wi-Fi sync when on same network | Supported |

> [!TIP]
> **Automatic Refresh with Sideloadly**: Keep Sideloadly running on your Windows PC and check "Wi-Fi Sideloading" in Sideloadly settings. Whenever your iPhone is on the same local Wi-Fi network as your PC, Sideloadly can automatically refresh the 7-day certificate without plugging in a cable.

---

## 10. Limitations of the GitHub Actions Build

1. **Unsigned Binary Only**:
   - The IPA produced by GitHub Actions does not contain a signature profile. Attempting to install it directly via iTunes or raw Apple Configurator without Sideloadly will fail with an error like `The application could not be verified`. Sideloadly is specifically built to sign unsigned IPAs.
2. **macOS Runner Minutes**:
   - GitHub Actions provides generous free monthly minutes on public and private repositories. Keep in mind macOS runners consume minutes at a 10x multiplier compared to Linux runners. Trigger the workflow manually via `workflow_dispatch` when you are ready to test a new build.

---

## 11. Troubleshooting Common Build & Signing Failures

### Issue: "Unable to find web assets directory: dist"
- **Cause**: Capacitor sync was executed before running `npm run build`.
- **Solution**: Always run `npm run build` first or use `npm run cap:sync`, which runs `npm run build` automatically.

### Issue: Sideloadly shows "Error: Guru Meditation ... Apple ID credentials incorrect"
- **Cause**: Incorrect Apple ID password or 2FA session expired.
- **Solution**: If you use an app-specific password, note that Sideloadly requires your primary Apple ID password with 2FA prompt, not an app-specific password.

### Issue: "Untrusted Developer" when launching app on iPhone
- **Cause**: iOS security sandbox requires manual approval of development certificates.
- **Solution**: Open **Settings** → **General** → **VPN & Device Management** → select your email → tap **Trust**.

### Issue: "Failed to verify code signature" in Sideloadly
- **Cause**: Corrupted download or partial zip extraction of the artifact.
- **Solution**: Ensure you fully unzip the downloaded `CelsiusTerminal-iOS-IPA.zip` before selecting the `.ipa` file in Sideloadly.

### Issue: App shows white screen or connection failure on iPhone
- **Cause**: If configured with `CAPACITOR_SERVER_URL=http://localhost:3000`, the iPhone cannot reach your computer's `localhost`.
- **Solution**: When testing remote connections, supply a public URL (e.g. `https://celsius.network`) or your PC's local LAN IP (e.g. `http://192.168.1.50:3000`). For local LAN IPs, ensure both devices are on the same Wi-Fi network.
