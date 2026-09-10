import type { CapacitorConfig } from '@capacitor/cli';
import os from 'os';

/**
 * Resolves the primary local LAN IPv4 address of the host machine.
 * This ensures physical Android devices connected to the same Wi-Fi
 * can reach the Next.js development server instead of failing on 'localhost'.
 */
function resolveLocalLanIp(): string | null {
  try {
    const interfaces = os.networkInterfaces();

    // 1. Prioritize Wi-Fi / WLAN interfaces
    for (const name of Object.keys(interfaces)) {
      const lower = name.toLowerCase();
      if (lower.includes('wi-fi') || lower.includes('wlan') || lower.includes('wireless')) {
        for (const iface of interfaces[name] || []) {
          if (iface.family === 'IPv4' && !iface.internal) {
            return iface.address;
          }
        }
      }
    }

    // 2. Physical Ethernet interfaces (excluding virtual adapters like WSL/Hyper-V/Tailscale)
    for (const name of Object.keys(interfaces)) {
      const lower = name.toLowerCase();
      if (
        lower.includes('vethernet') ||
        lower.includes('wsl') ||
        lower.includes('virtual') ||
        lower.includes('tailscale') ||
        lower.includes('docker')
      ) {
        continue;
      }
      if (lower.includes('ethernet') || lower.includes('eth')) {
        for (const iface of interfaces[name] || []) {
          if (iface.family === 'IPv4' && !iface.internal) {
            return iface.address;
          }
        }
      }
    }

    // 3. Fallback to any non-internal private IPv4 address (192.168.* or 10.*)
    for (const name of Object.keys(interfaces)) {
      const lower = name.toLowerCase();
      if (
        lower.includes('vethernet') ||
        lower.includes('wsl') ||
        lower.includes('virtual') ||
        lower.includes('tailscale')
      ) {
        continue;
      }
      for (const iface of interfaces[name] || []) {
        if (iface.family === 'IPv4' && !iface.internal) {
          if (iface.address.startsWith('192.168.') || iface.address.startsWith('10.')) {
            return iface.address;
          }
        }
      }
    }
  } catch {
    // Fallback gracefully on OS error
  }
  return null;
}

const isProductionRelease =
  process.env.CAPACITOR_RELEASE === 'true' ||
  process.env.NODE_ENV === 'production';

function getEffectiveServerConfig() {
  // 1. Explicit server URL override (e.g. deployed cloud instance, staging, or ngrok tunnel)
  if (process.env.CAPACITOR_SERVER_URL) {
    const url = process.env.CAPACITOR_SERVER_URL.trim();
    return {
      url,
      cleartext: url.startsWith('http://'),
    };
  }

  // 2. Production / Release mode: serve bundled offline web assets from 'out' directory
  if (isProductionRelease) {
    return undefined;
  }

  // 3. Development mode: dynamically connect to dev machine via LAN IP
  const lanIp = resolveLocalLanIp();
  const devPort = process.env.PORT || '3005';
  const host = lanIp || '10.0.2.2'; // 10.0.2.2 is Android Emulator alias for host machine loopback

  return {
    url: `http://${host}:${devPort}`,
    cleartext: true,
  };
}

const serverConfig = getEffectiveServerConfig();

const config: CapacitorConfig = {
  appId: 'com.dsatracker.app',
  appName: 'DSA Tracker',
  webDir: 'out',
  ...(serverConfig ? { server: serverConfig } : {}),
  android: {
    allowMixedContent: true,
  },
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#090d16',
    },
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: '#090d16',
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
  },
};

export default config;
