import { ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { NeonTheme } from '@/constants/AppTheme';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { TrickProvider } from '@/context/TrickContext';

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // Simple check: if no user, and not on login/register, go to login

    // Check if on login, register, or verify-email
    const isLoginPage = segments[0] === 'login';
    const isRegisterPage = segments[0] === 'register';
    const isVerifyPage = segments[0] === 'verify-email';
    const isPublicPage = isLoginPage || isRegisterPage;

    if (!user && !isPublicPage) {
      // Not logged in -> Go to login
      router.replace('/login');
    } else if (user && !user.emailVerified && !isVerifyPage) {
       // Logged in BUT not verified -> Go to verify email
       router.replace('/verify-email');
    } else if (user && user.emailVerified && (isPublicPage || isVerifyPage)) {
      // Logged in AND verified -> Go to home (if currently on auth/verify pages)
      router.replace('/');
    }
  }, [user, loading, segments, router]);

  return (
    <ThemeProvider value={NeonTheme}>
      <TrickProvider>
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
      </TrickProvider>
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
