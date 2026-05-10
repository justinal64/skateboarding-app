import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import SpriteIcon from '@/components/SpriteIcon';
import { COLORS } from '@/constants/AppTheme';
import { getTrickSpriteIndex } from '@/utils/trickIcons';
import { Trick } from '@/types';

const DIFFICULTY_COLOR: Record<string, string> = {
  Easy: COLORS.success,
  Intermediate: COLORS.secondary,
  Advanced: '#FF2D78',
};

type Props = {
  trick: Trick;
  index: number;
  onPress: (trick: Trick) => void;
};

export default function TrickListItem({ trick, index, onPress }: Props) {
  const spriteIndex = getTrickSpriteIndex(trick);
  const isCompleted = trick.status === 'COMPLETED';
  const isInProgress = trick.status === 'IN_PROGRESS';
  const diffColor = DIFFICULTY_COLOR[trick.difficulty] ?? COLORS.secondary;

  return (
    <TouchableOpacity
      className="flex-row items-center px-4 py-3"
      style={{ borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' }}
      onPress={() => onPress(trick)}
      activeOpacity={0.7}
      accessibilityLabel={`${trick.name}, ${isCompleted ? 'completed' : isInProgress ? 'in progress' : 'not started'}`}
      accessibilityHint="Opens trick details"
      accessibilityRole="button"
    >
      {/* Row number */}
      <Text className="text-textDim text-xs font-bold w-7 text-right mr-3" style={{ opacity: 0.5 }}>
        {String(index).padStart(2, '0')}
      </Text>

      {/* Sprite */}
      <View
        className="rounded-full overflow-hidden mr-3 items-center justify-center"
        style={{ width: 42, height: 42, backgroundColor: '#1A1A35' }}
      >
        <SpriteIcon index={spriteIndex} size={36} />
      </View>

      {/* Name + meta */}
      <View className="flex-1">
        <Text
          className="text-white font-black text-sm tracking-wide mb-0.5"
          numberOfLines={1}
        >
          {trick.name.toUpperCase()}
        </Text>
        <Text className="text-xs">
          <Text style={{ color: diffColor, fontWeight: '800' }}>{trick.difficulty}</Text>
          <Text className="text-textDim"> · {trick.category}</Text>
        </Text>
      </View>

      {/* Points + status */}
      <View className="flex-row items-center gap-1 ml-3">
        <Text
          className="font-black text-sm"
          style={{ color: isCompleted ? COLORS.success : '#FFFFFF' }}
        >
          +{trick.points}
        </Text>
        {isCompleted ? (
          <Ionicons name="checkmark" size={16} color={COLORS.success} />
        ) : isInProgress ? (
          <Ionicons name="time-outline" size={16} color={COLORS.primary} />
        ) : (
          <Ionicons name="chevron-forward" size={16} color={COLORS.textDim} style={{ opacity: 0.5 }} />
        )}
      </View>
    </TouchableOpacity>
  );
}
