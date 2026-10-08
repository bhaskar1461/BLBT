import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Celsius Terminal - Capacitor iOS Configuration
 * 
 * Supports both standalone local asset bundling (dist/) and live connection
 * to the deployed Celsius Network server (CAPACITOR_SERVER_URL).
 */
const serverUrl = process.env.CAPACITOR_SERVER_URL;

const config: CapacitorConfig = {
  appId: 'network.celsius.terminal',
  appName: 'Celsius Terminal',
  webDir: 'dist',
  server: serverUrl
    ? {
        url: serverUrl,
        cleartext: serverUrl.startsWith('http://'),
        allowNavigation: ['*'],
      }
    : undefined,
  ios: {
    contentInset: 'always',
    preferredContentMode: 'mobile',
    scheme: 'CelsiusTerminal',
    allowsLinkPreview: false,
  },
};

export default config;
