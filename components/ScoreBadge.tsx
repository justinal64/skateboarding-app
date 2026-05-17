import React from 'react';
import { Text, View } from 'react-native';

import { COLORS, neonGlow, textGlow } from '@/constants/AppTheme';
import { useUserScore } from '@/hooks/useUserScore';

export default function ScoreBadge() {
  const totalScore = useUserScore();

  if (totalScore === 0) return null; // Only show if user has started earning points

  return (
    <View
      className="flex-row items-center border border-success/40 rounded-full py-1.5 px-3 bg-success/10"
      style={neonGlow('rgba(0, 255, 102, 0.2)', 8)}
    >
      <Text
        className="text-success font-black tracking-wider text-sm mr-1"
        style={textGlow(COLORS.success, 8)}
      >
        {totalScore}
      </Text>
      <Text className="text-white/70 font-bold text-xs">
        PTS
      </Text>
    </View>
  );
}
