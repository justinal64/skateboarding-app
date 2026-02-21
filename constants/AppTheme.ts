import { DefaultTheme, Theme } from '@react-navigation/native';
import { Platform, TextStyle, ViewStyle } from 'react-native';

export const COLORS = {
  background: '#0D0D25', // Deep Dark Blue
  card: '#1A1A3A',       // Dark Blue/Purple for cards
  primary: '#FF00FF',    // Neon Pink
  secondary: '#00FFFF',  // Electric Cyan
  text: '#FFFFFF',       // White
  textDim: '#E0E0FF',    // Light Blue-ish Grey
  border: '#2A2A4A',     // Dark Border
  success: '#00FF00',    // Neon Green (optional extra)
};

/**
 * Creates a cross-platform neon glow shadow style for View components.
 * Uses native shadow props on iOS and elevation on Android.
 */
export const neonGlow = (color: string, radius = 10): ViewStyle => ({
  ...Platform.select({
    ios: {
      shadowColor: color,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: radius,
    },
    android: {
      elevation: Math.min(radius, 24),
    },
    default: {},
  }),
});

/**
 * Creates a cross-platform text shadow / glow style for Text components.
 */
export const textGlow = (color: string, radius = 10): TextStyle => ({
  textShadowColor: color,
  textShadowOffset: { width: 0, height: 0 },
  textShadowRadius: radius,
});

export const SHADOWS = {
  small: {
    ...neonGlow('rgba(0,0,0,0.25)', 4),
  } as ViewStyle,
  medium: {
    ...neonGlow('rgba(0,0,0,0.35)', 8),
  } as ViewStyle,
};

export const NeonTheme: Theme = {
  dark: true,
  colors: {
    primary: COLORS.primary,
    background: COLORS.background,
    card: COLORS.card,
    text: COLORS.text,
    border: COLORS.border,
    notification: COLORS.primary,
  },
  fonts: DefaultTheme.fonts,
};
