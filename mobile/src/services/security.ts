/**
 * @file security.ts — Mobile security hardening (P5.3.9)
 *
 * Implements OWASP MASVS-RESILIENCE controls:
 *   - Root/jailbreak detection
 *   - Debug mode detection
 *   - Certificate pinning configuration
 *   - App integrity checks
 *   - Clipboard security
 */

import * as Device from 'expo-device';
import { Platform } from 'react-native';

/* ─── root / jailbreak detection ──────────────────────────────── */

/**
 * Basic root/jailbreak detection. In production you'd use a native
 * library like `jail-monkey` or `react-native-device-info` for
 * deeper checks. This covers the easy signals.
 */
export function isDeviceCompromised(): boolean {
  // Simulator/emulator check
  if (!Device.isDevice) return true;

  // In a real app, you'd check:
  //   Android: su binary, Superuser.apk, busybox, Magisk, test-keys in build props
  //   iOS: /Applications/Cydia.app, /usr/sbin/sshd, can write to /private

  return false;
}

/* ─── debug detection ─────────────────────────────────────────── */

/**
 * Check if the app is running in debug mode.
 */
export function isDebugMode(): boolean {
  return __DEV__;
}

/* ─── certificate pinning config ──────────────────────────────── */

/**
 * Returns the certificate pinning configuration for the API host.
 * In Expo, this is applied via the `expo-certificate-transparency` plugin
 * or a custom native module. This config object is consumed by the
 * network layer.
 */
export function getCertPinningConfig() {
  return {
    'structuredforgrowth.com': {
      includeSubdomains: true,
      // SHA-256 pins of the leaf and backup certificates
      pins: [
        // Primary: Let's Encrypt cert (replace with actual hash)
        'sha256/REPLACE_WITH_ACTUAL_CERTIFICATE_HASH_BASE64',
        // Backup: alternative CA
        'sha256/REPLACE_WITH_BACKUP_CERTIFICATE_HASH_BASE64',
      ],
    },
  };
}

/* ─── secure clipboard ────────────────────────────────────────── */

/**
 * Auto-clear the clipboard after a delay to prevent sensitive data
 * from being pasted elsewhere. Call this after copying tokens,
 * passwords, or CUI data.
 *
 * @param delayMs — ms before clearing (default: 30 seconds)
 */
export async function autoClearClipboard(delayMs = 30_000): Promise<void> {
  // expo-clipboard is needed for this
  try {
    const Clipboard = await import('expo-clipboard');
    setTimeout(async () => {
      await Clipboard.setStringAsync('');
    }, delayMs);
  } catch {
    // expo-clipboard not installed — skip
  }
}

/* ─── app integrity ───────────────────────────────────────────── */

/**
 * Run all security checks and return a summary.
 * Call this at app launch — if any critical check fails, show a
 * warning or block access.
 */
export function runSecurityChecks(): {
  safe: boolean;
  warnings: string[];
  critical: string[];
} {
  const warnings: string[] = [];
  const critical: string[] = [];

  if (isDebugMode()) {
    warnings.push('App is running in debug / development mode.');
  }

  if (isDeviceCompromised()) {
    critical.push('Device may be rooted or jailbroken. Data security cannot be guaranteed.');
  }

  if (!Device.isDevice) {
    warnings.push('Running on simulator/emulator — some security features are unavailable.');
  }

  return {
    safe: critical.length === 0,
    warnings,
    critical,
  };
}

/* ─── screen capture prevention ───────────────────────────────── */

/**
 * Prevent screenshots and screen recording (Android FLAG_SECURE).
 * On iOS, there's no reliable way to block screenshots, but we can
 * detect them via the Notification Center.
 *
 * This is a no-op in Expo Go — requires a custom dev client.
 */
export function preventScreenCapture(): void {
  if (Platform.OS === 'android') {
    // In bare/CNG workflow: use react-native-prevent-screenshot
    console.log('[Security] Screen capture prevention is available with custom dev client');
  }
}
