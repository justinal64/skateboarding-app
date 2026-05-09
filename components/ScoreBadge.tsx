import React from 'react';
import { Text, View } from 'react-native';

import { COLORS, neonGlow, textGlow } from '@/constants/AppTheme';
import { useTrickStore } from '@/store/trickStore';

/**
 * A neon-themed badge that calculates and displays the user's total score based on completed tricks.
 */
export default function ScoreBadge() {
  const tricks = useTrickStore((state) => state.tricks);

  // Calculate total score dynamically from completed tricks
  const totalScore = tricks.reduce((sum, trick) => {
    if (trick.status === 'COMPLETED') {
        // Fallback to 10 points if a trick lacks a defined point value
        return sum + (trick.points ?? 10);
    }
    return sum;
  }, 0);

  if (totalScore === 0) return null; // Only show if user has started earning points

  return (
    <View
      className="flex-row items-center border border-success/30 rounded-full py-1.5 px-3 bg-black/50"
      style={neonGlow('rgba(0, 255, 102, 0.15)', 8)}
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
