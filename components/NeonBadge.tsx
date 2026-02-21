import React from 'react';
import { Text, View } from 'react-native';

import { COLORS, neonGlow, textGlow } from '@/constants/AppTheme';

type NeonBadgeProps = {
  title: string;
  subtitle?: string;
};

/**
 * Reusable neon-styled title badge used as screen headers.
 * Replaces the duplicated "border-2 border-secondary + boxShadow + textShadow" pattern.
 */
export default function NeonBadge({ title, subtitle }: NeonBadgeProps) {
  return (
    <View className="items-center mb-5">
      <View
        className="border-2 border-secondary rounded-xl py-1.5 px-4 bg-black/40 mb-2"
        style={neonGlow(COLORS.secondary, 8)}
      >
        <Text
          className="text-[#CCFFFF] text-base font-black tracking-widest"
          style={textGlow(COLORS.secondary, 10)}
        >
          {title}
        </Text>
      </View>
      {subtitle && (
        <Text className="text-textDim text-sm font-medium tracking-[0.5px]">
          {subtitle}
        </Text>
      )}
    </View>
  );
}
