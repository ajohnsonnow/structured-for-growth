/**
 * @file App.tsx — Root component for the Structured for Growth mobile app.
 *
 * Navigation structure:
 *   BottomTabs → Dashboard | Templates | Compliance | Settings
 *   Each tab has its own stack navigator for drill-down screens.
 */

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Screens
import { ComplianceScreen } from '@/screens/ComplianceScreen';
import { DashboardScreen } from '@/screens/DashboardScreen';
import { DocumentCaptureScreen } from '@/screens/DocumentCaptureScreen';
import { LoginScreen } from '@/screens/LoginScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { TemplateDetailScreen } from '@/screens/TemplateDetailScreen';
import { TemplatesScreen } from '@/screens/TemplatesScreen';

// Auth
import { registerPushNotifications } from '@/services/notifications';
import { useAuthStore } from '@/store/authStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
    },
  },
});

/* ─── Navigation Stacks ───────────────────────────────────────── */

const Tab = createBottomTabNavigator();
const DashboardStack = createNativeStackNavigator();
const TemplatesStack = createNativeStackNavigator();
const ComplianceStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();

function DashboardNav() {
  return (
    <DashboardStack.Navigator screenOptions={{ headerShown: true }}>
      <DashboardStack.Screen name="DashboardHome" component={DashboardScreen} options={{ title: 'Dashboard' }} />
    </DashboardStack.Navigator>
  );
}

function TemplatesNav() {
  return (
    <TemplatesStack.Navigator>
      <TemplatesStack.Screen name="TemplatesList" component={TemplatesScreen} options={{ title: 'Templates' }} />
      <TemplatesStack.Screen name="TemplateDetail" component={TemplateDetailScreen} options={{ title: 'Template' }} />
      <TemplatesStack.Screen name="DocumentCapture" component={DocumentCaptureScreen} options={{ title: 'Scan Document' }} />
    </TemplatesStack.Navigator>
  );
}

function ComplianceNav() {
  return (
    <ComplianceStack.Navigator>
      <ComplianceStack.Screen name="ComplianceHome" component={ComplianceScreen} options={{ title: 'Compliance' }} />
    </ComplianceStack.Navigator>
  );
}

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
    </AuthStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#64748b',
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        tabBarStyle: { paddingBottom: 4, height: 56 },
        tabBarItemStyle: { minHeight: 48 },
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardNav} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Templates" component={TemplatesNav} />
      <Tab.Screen name="Compliance" component={ComplianceNav} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

/* ─── Root App ────────────────────────────────────────────────── */

export default function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      registerPushNotifications().catch(console.warn);
    }
  }, [isAuthenticated]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer>
            {isAuthenticated ? <MainTabs /> : <AuthNavigator />}
          </NavigationContainer>
          <StatusBar style="auto" />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
