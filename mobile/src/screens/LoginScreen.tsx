/**
 * @file LoginScreen.tsx — Login with biometric support (P5.3.2)
 */

import { runSecurityChecks } from '@/services/security';
import { useAuthStore } from '@/store/authStore';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, biometricLogin, loading, error, restoreSession } = useAuthStore();

  // Restore session and run security checks on mount
  useEffect(() => {
    restoreSession();
    const checks = runSecurityChecks();
    if (checks.critical.length > 0) {
      Alert.alert('Security Warning', checks.critical.join('\n'));
    }
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        <Text style={styles.title} accessibilityRole="header">Structured for Growth</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        {error && (
          <View style={styles.errorBox} accessibilityRole="alert">
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <Text nativeID="emailLabel" style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
          autoComplete="email"
          accessibilityLabelledBy="emailLabel"
          placeholder="you@example.com"
          returnKeyType="next"
        />

        <Text nativeID="passwordLabel" style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          textContentType="password"
          autoComplete="password"
          accessibilityLabelledBy="passwordLabel"
          placeholder="••••••••"
          returnKeyType="done"
          onSubmitEditing={() => login(email, password)}
        />

        <Pressable
          style={[styles.button, styles.primaryButton]}
          onPress={() => login(email, password)}
          disabled={loading || !email || !password}
          accessibilityRole="button"
          accessibilityLabel="Sign in"
          accessibilityState={{ disabled: loading || !email || !password }}
        >
          <Text style={styles.buttonText}>{loading ? 'Signing in…' : 'Sign In'}</Text>
        </Pressable>

        <Pressable
          style={[styles.button, styles.biometricButton]}
          onPress={biometricLogin}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel="Sign in with biometric authentication"
        >
          <Text style={styles.biometricText}>Use Face ID / Fingerprint</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  inner: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: '700', color: '#0f172a', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#64748b', textAlign: 'center', marginBottom: 32 },
  label: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 6, marginTop: 16 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: '#0f172a',
    minHeight: 48,
  },
  button: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
    minHeight: 48,
  },
  primaryButton: { backgroundColor: '#2563eb' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  biometricButton: { backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0' },
  biometricText: { color: '#2563eb', fontSize: 16, fontWeight: '600' },
  errorBox: { backgroundColor: '#fef2f2', padding: 12, borderRadius: 8, marginBottom: 8 },
  errorText: { color: '#991b1b', fontSize: 14 },
});
