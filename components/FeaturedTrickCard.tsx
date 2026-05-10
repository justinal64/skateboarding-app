import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import SpriteIcon from '@/components/SpriteIcon';
import { COLORS, neonGlow, textGlow } from '@/constants/AppTheme';
import { getTrickSpriteIndex } from '@/utils/trickIcons';
import { Trick } from '@/types';

const DIFFICULTY_COLOR: Record<string, string> = {
  Easy: COLORS.success,
  Intermediate: COLORS.secondary,
  Advanced: '#FF2D78',
};

type Props = {
  trick: Trick;
  onLogSession: (trick: Trick) => void;
  onLandedIt: (trick: Trick) => void;
};

export default function FeaturedTrickCard({ trick, onLogSession, onLandedIt }: Props) {
  const spriteIndex = getTrickSpriteIndex(trick);
  const diffColor = DIFFICULTY_COLOR[trick.difficulty] ?? COLORS.secondary;

  return (
    <View
      className="mx-4 mb-5 rounded-2xl border border-white/10 overflow-hidden"
      style={[{ backgroundColor: '#12122A' }, neonGlow('rgba(255,215,0,0.08)', 12)]}
    >
      {/* Top row: sprite + info */}
      <View className="flex-row gap-4 p-4">
        {/* Sprite */}
        <View
          className="rounded-xl overflow-hidden items-center justify-center"
          style={{ width: 100, height: 100, backgroundColor: '#1A1A35' }}
        >
          <SpriteIcon index={spriteIndex} size={84} />
        </View>

        {/* Info */}
        <View className="flex-1 justify-center">
          {/* NOW LEARNING badge */}
          <View className="flex-row items-center self-start bg-[#FFD700]/15 border border-[#FFD700]/40 rounded-full px-2.5 py-1 mb-2">
            <View className="w-1.5 h-1.5 rounded-full bg-[#FFD700] mr-1.5" />
            <Text className="text-[#FFD700] text-[10px] font-black tracking-widest uppercase">
              Now Learning
            </Text>
          </View>

          {/* Trick name */}
          <Text
            className="text-white font-black tracking-wide mb-1"
            style={[{ fontSize: 22 }, textGlow('#FFFFFF', 4)]}
            numberOfLines={1}
          >
            {trick.name.toUpperCase()}
          </Text>

          {/* Difficulty · Category */}
          <Text className="text-xs">
            <Text style={{ color: diffColor, fontWeight: '800' }}>{trick.difficulty}</Text>
            <Text className="text-textDim"> · {trick.category}</Text>
          </Text>

          {/* Points */}
          <Text
            className="text-[#FFD700] text-xs font-bold mt-1.5"
            style={textGlow('#FFD700', 4)}
          >
            +{trick.points} XP
          </Text>
        </View>
      </View>

      {/* Action buttons */}
      <View className="flex-row gap-3 px-4 pb-4">
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center rounded-xl py-3.5 gap-2"
          style={{ backgroundColor: '#FFD700' }}
          onPress={() => onLogSession(trick)}
          accessibilityLabel="Log a practice session"
          accessibilityRole="button"
        >
          <Ionicons name="play" size={13} color="#000" />
          <Text className="text-black font-black text-xs tracking-widest uppercase">
            Log Session
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center justify-center border border-[#FFD700]/60 rounded-xl py-3.5 px-5"
          onPress={() => onLandedIt(trick)}
          accessibilityLabel="Mark trick as landed"
          accessibilityRole="button"
        >
          <Text
            className="font-black text-xs tracking-widest uppercase"
            style={[{ color: '#FFD700' }, textGlow('#FFD700', 4)]}
          >
            I Landed It
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
