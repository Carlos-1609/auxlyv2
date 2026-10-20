import '@/global.css';

import { Stack, ThemeProvider } from 'expo-router';
import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppLoadingScreen } from '@/components/ui/app-loading-screen';
import { colors, navigationTheme } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/providers/auth-provider';

function AuthNavigator() {
  const { session, isLoading, isRecovering } = useAuth();
  if (isLoading) return <AppLoadingScreen />;
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="index" options={{ title: 'Auxly' }} />
      <Stack.Protected guard={!session}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={Boolean(session) && !isRecovering}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Screen name="auth/callback" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="reset-password" />
      <Stack.Screen name="theme" options={{ title: 'Auxly · Theme' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaProvider>
        <ThemeProvider value={navigationTheme}>
          <Head>
            <title>Auxly · Your shared soundtrack</title>
            <meta name="description" content="Different tastes. One great mix. A shared soundtrack for your circle." />
            <meta name="theme-color" content={colors.background} />
          </Head>
          <StatusBar style="light" />
          <AuthProvider>
            <AuthNavigator />
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
