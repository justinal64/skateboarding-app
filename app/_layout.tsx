import { ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { COLORS, NeonTheme } from '@/constants/AppTheme';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { TrickProvider } from '@/context/TrickContext';

function RootLayoutNav() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // Simple check: if no session, and not on login/register, go to login

    // Check if on login or register
    const isLoginPage = segments[0] === 'login';
    const isRegisterPage = segments[0] === 'register';
    const isPublicPage = isLoginPage || isRegisterPage;

    if (!session && !isPublicPage) {
      // Redirect to login
      router.replace('/login');
    } else if (session && isPublicPage) {
      // Redirect to home if logged in and trying to access auth pages
      router.replace('/');
    }
  }, [session, loading, segments]);

  return (
    <ThemeProvider value={NeonTheme}>
      <TrickProvider>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: COLORS.background,
            },
            headerTintColor: COLORS.secondary,
            headerTitleStyle: {
              fontWeight: 'bold',
              color: COLORS.secondary,
            },
            contentStyle: {
              backgroundColor: COLORS.background,
            },
          }}
        >
          <Stack.Screen name="index" options={{ title: 'SKATE LOG' }} />
          <Stack.Screen name="add" options={{ title: 'ADD TRICK' }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ headerShown: false }} />
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
