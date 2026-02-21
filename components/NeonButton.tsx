import React from 'react';
import { Pressable, Text } from 'react-native';

import { COLORS, neonGlow } from '@/constants/AppTheme';

type NeonButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
};

/**
 * Reusable neon-glowing button used across auth screens and modals.
 * Replaces the duplicated "bg-primary + boxShadow + border-white" pattern.
 */
export default function NeonButton({
  label,
  onPress,
  disabled = false,
  variant = 'primary',
}: NeonButtonProps) {
  const bgColor = variant === 'primary' ? COLORS.primary : COLORS.secondary;
  const glowColor =
    variant === 'primary' ? 'rgba(255, 0, 255, 0.5)' : 'rgba(0, 255, 255, 0.5)';

  return (
    <Pressable
      className={`p-[18px] rounded-[30px] items-center mt-6 border border-white shadow-lg ${
        disabled ? 'opacity-70' : ''
      }`}
      style={[{ backgroundColor: bgColor }, neonGlow(glowColor, 10)]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text className="text-white text-lg font-bold tracking-widest">
        {label}
      </Text>
    </Pressable>
  );
}
