import { ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { NeonTheme } from '@/constants/AppTheme';
import { AuthProvider, useAuth } from '@/context/AuthContext';

import { useTrickStore } from '@/store/trickStore';

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const fetchTricks = useTrickStore((state) => state.fetchTricks);

  useEffect(() => {
    // Sync store with auth
    if (!loading) {
       fetchTricks(user?.uid);
    }
  }, [user, loading, fetchTricks]);

  useEffect(() => {
    if (loading) return;

    // ... existing auth redirect logic
    const isLoginPage = segments[0] === 'login';
    const isRegisterPage = segments[0] === 'register';
    const isVerifyPage = segments[0] === 'verify-email';
    const isPublicPage = isLoginPage || isRegisterPage;

    if (!user && !isPublicPage) {
      router.replace('/login');
    } else if (user && !user.emailVerified && !isVerifyPage) {
       router.replace('/verify-email');
    } else if (user && user.emailVerified && (isPublicPage || isVerifyPage)) {
      router.replace('/');
    }
  }, [user, loading, segments, router]);

  return (
    <ThemeProvider value={NeonTheme}>
        <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: NeonTheme.colors.card,
          },
          headerTintColor: NeonTheme.colors.text,
          headerTitleStyle: {
            fontWeight: 'bold',
            color: NeonTheme.colors.primary,
          },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="add" options={{ title: 'ADD TRICK', presentation: 'modal' }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="verify-email" options={{ headerShown: false }} />
      </Stack>
        <StatusBar style="light" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
