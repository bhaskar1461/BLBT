import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Celsius Terminal - Capacitor iOS Configuration
 * 
 * Supports both standalone local asset bundling (dist/) and live connection
 * to the deployed Celsius Network server (CAPACITOR_SERVER_URL).
 */
const serverUrl = process.env.CAPACITOR_SERVER_URL || 'https://blbt-auhi.vercel.app';

const config: CapacitorConfig = {
  appId: 'network.celsius.terminal',
  appName: 'Bloomberg Professional',
  webDir: 'dist',
  server: {
    url: serverUrl,
    cleartext: serverUrl.startsWith('http://'),
    allowNavigation: ['*'],
  },
  ios: {
    contentInset: 'always',
    preferredContentMode: 'mobile',
    scheme: 'CelsiusTerminal',
    allowsLinkPreview: false,
  },
};

export default config;
