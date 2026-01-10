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
    shadowColor: COLORS.secondary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.secondary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.35,
    shadowRadius: 5.84,
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
