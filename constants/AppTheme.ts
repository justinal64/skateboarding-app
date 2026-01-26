import { DefaultTheme, Theme } from '@react-navigation/native';

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

export const SHADOWS = {
  small: {
    boxShadow: `0px 2px 3.84px rgba(0,0,0,0.25)`,
    elevation: 2,
  },
  medium: {
    boxShadow: `0px 4px 5.84px rgba(0,0,0,0.35)`,
    elevation: 8,
  },
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
