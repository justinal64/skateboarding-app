import { ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useEffect } from 'react';
import 'react-native-reanimated';
import '../global.css';

import { NeonTheme } from '@/constants/AppTheme';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { useTrickStore } from '@/store/trickStore';

async function updateStreak(userId: string) {
  const profileRef = doc(db, 'user_profiles', userId);
  const profileSnap = await getDoc(profileRef);
  const today = new Date().toISOString().split('T')[0];

  if (!profileSnap.exists()) {
    await setDoc(profileRef, { lastLogin: today, streakCount: 1 });
    return;
  }

  const { lastLogin, streakCount = 0 } = profileSnap.data();
  if (lastLogin === today) return;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const newStreak = lastLogin === yesterdayStr ? streakCount + 1 : 1;
  await setDoc(profileRef, { lastLogin: today, streakCount: newStreak }, { merge: true });
}

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const fetchTricks = useTrickStore((state) => state.fetchTricks);

  useEffect(() => {
    if (!loading) {
      fetchTricks(user?.uid);
      if (user) {
        updateStreak(user.uid).catch(console.error);
      }
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
