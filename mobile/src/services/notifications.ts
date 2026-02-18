/**
 * @file notifications.ts — Push notification setup (P5.3.6)
 *
 * Handles APNs (iOS) and FCM (Android) push notification registration
 * via Expo Notifications. Sends the device push token to the backend
 * so the server can deliver targeted notifications.
 */

import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { api } from './api';

/* ─── configure default notification behaviour ────────────────── */

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/* ─── registration ────────────────────────────────────────────── */

/**
 * Request push permission, fetch the Expo push token, and register
 * it with the backend. Safe to call multiple times — idempotent on
 * the server side.
 *
 * @returns The Expo push token string, or null if unavailable.
 */
export async function registerPushNotifications(): Promise<string | null> {
  // Push only works on physical devices
  if (!Device.isDevice) {
    console.log('[Push] Not a physical device — skipping registration');
    return null;
  }

  // Check existing permission
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Ask for permission if not yet granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('[Push] Permission not granted');
    return null;
  }

  // Android-specific: create notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2563eb',
    });
  }

  // Fetch the push token
  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId,
  });

  const pushToken = tokenData.data;
  console.log(`[Push] Token: ${pushToken}`);

  // Register with backend
  try {
    await api.post('/api/notifications/register-device', {
      token: pushToken,
      platform: Platform.OS,
      deviceName: Device.deviceName || 'Unknown',
    });
  } catch (err) {
    console.warn('[Push] Failed to register token with backend:', err);
  }

  return pushToken;
}

/* ─── listeners ───────────────────────────────────────────────── */

/**
 * Subscribe to incoming notifications while app is foregrounded.
 * @param callback Handler function
 * @returns Subscription object — call `.remove()` to unsubscribe.
 */
export function onNotificationReceived(
  callback: (notification: Notifications.Notification) => void,
) {
  return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Subscribe to notification tap/interaction events.
 * @param callback Handler function
 * @returns Subscription object — call `.remove()` to unsubscribe.
 */
export function onNotificationTapped(
  callback: (response: Notifications.NotificationResponse) => void,
) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Get the notification that was used to open the app (cold start).
 */
export async function getInitialNotification() {
  return Notifications.getLastNotificationResponseAsync();
}
