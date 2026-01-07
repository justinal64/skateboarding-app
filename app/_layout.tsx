import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { COLORS, NeonTheme } from '@/constants/AppTheme';
import { TrickProvider } from '@/context/TrickContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

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
        </Stack>
        <StatusBar style="light" />
      </TrickProvider>
    </ThemeProvider>
  );
}
