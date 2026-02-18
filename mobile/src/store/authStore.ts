/**
 * @file authStore.ts — Authentication state (P5.3.2)
 *
 * Uses Zustand for state management and expo-secure-store
 * for keeping tokens in the device's secure enclave (Keychain/Keystore).
 * Biometric unlock is gated behind expo-local-authentication.
 */

import { api } from '@/services/api';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

/* ─── types ───────────────────────────────────────────────────── */

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  /** The logged-in user, or null if unauthenticated */
  user: User | null;
  /** JWT access token */
  token: string | null;
  /** Whether the user is currently authenticated */
  isAuthenticated: boolean;
  /** Loading flag for auth operations */
  loading: boolean;
  /** Error message from the last auth attempt */
  error: string | null;

  /** Authenticate with email + password */
  login: (email: string, password: string) => Promise<void>;
  /** Authenticate using biometric (fingerprint / Face ID) */
  biometricLogin: () => Promise<void>;
  /** Log the user out and wipe secure storage */
  logout: () => Promise<void>;
  /** Restore a session from secure storage on app launch */
  restoreSession: () => Promise<void>;
}

/* ─── constants ───────────────────────────────────────────────── */

const TOKEN_KEY = 'sfg_auth_token';
const USER_KEY = 'sfg_auth_user';

/* ─── store ───────────────────────────────────────────────────── */

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const data = await api.post('/api/auth/login', { email, password });

      // Persist in secure storage
      await SecureStore.setItemAsync(TOKEN_KEY, data.token);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(data.user));

      set({ user: data.user, token: data.token, isAuthenticated: true, loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Login failed', loading: false });
    }
  },

  biometricLogin: async () => {
    set({ loading: true, error: null });
    try {
      // Check hardware support
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !enrolled) {
        set({ error: 'Biometric authentication is not available on this device.', loading: false });
        return;
      }

      // Prompt for biometric
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access Structured for Growth',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (!result.success) {
        set({ error: 'Biometric authentication cancelled.', loading: false });
        return;
      }

      // If biometric passes, try to restore stored token
      const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
      const storedUser = await SecureStore.getItemAsync(USER_KEY);

      if (storedToken && storedUser) {
        const user = JSON.parse(storedUser);
        set({ user, token: storedToken, isAuthenticated: true, loading: false });
      } else {
        set({ error: 'No saved session. Please log in with email and password first.', loading: false });
      }
    } catch (err: any) {
      set({ error: err.message || 'Biometric login failed', loading: false });
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  restoreSession: async () => {
    try {
      const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
      const storedUser = await SecureStore.getItemAsync(USER_KEY);

      if (storedToken && storedUser) {
        const user = JSON.parse(storedUser);
        set({ user, token: storedToken, isAuthenticated: true });
      }
    } catch {
      // Silent failure on restore — user will just see login screen
    }
  },
}));
