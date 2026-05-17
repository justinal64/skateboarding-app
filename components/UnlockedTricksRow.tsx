import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

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

const DIFFICULTY_ORDER: Record<string, number> = { Easy: 1, Intermediate: 2, Advanced: 3 };

const CARD_W = 88;
const CARD_H = 112;

type Props = {
  tricks: Trick[];
  onPress: (trick: Trick) => void;
};

export default function UnlockedTricksRow({ tricks, onPress }: Props) {
  const unlocked = tricks
    .filter((t) => {
      if (t.status !== 'NOT_STARTED') return false;
      if (t.prerequisites.length === 0) return false;
      return t.prerequisites.every((prereqName) => {
        const prereq = tricks.find((p) => p.name === prereqName);
        return prereq?.status === 'COMPLETED';
      });
    })
    .sort((a, b) => (DIFFICULTY_ORDER[a.difficulty] ?? 0) - (DIFFICULTY_ORDER[b.difficulty] ?? 0));

  if (unlocked.length === 0) return null;

  return (
    <View className="mb-4">
      {/* Section header */}
      <View className="flex-row items-center gap-2 px-4 mb-3">
        <Ionicons name="lock-open" size={13} color="#FFD700" />
        <Text
          className="text-[#FFD700] font-black text-xs tracking-widest uppercase"
          style={textGlow('#FFD700', 4)}
        >
          Newly Unlocked
        </Text>
        <View className="flex-1 h-px bg-[#FFD700]/20" />
        <Text className="text-textDim text-[10px] font-bold">
          {unlocked.length} trick{unlocked.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
      >
        {unlocked.map((trick) => {
          const spriteIndex = getTrickSpriteIndex(trick);
          const diffColor = DIFFICULTY_COLOR[trick.difficulty] ?? COLORS.secondary;

          return (
            <TouchableOpacity
              key={trick.id}
              onPress={() => onPress(trick)}
              activeOpacity={0.8}
              style={[
                {
                  width: CARD_W,
                  height: CARD_H,
                  backgroundColor: '#1A1A35',
                  borderWidth: 1,
                  borderColor: 'rgba(255,215,0,0.25)',
                  borderRadius: 14,
                  overflow: 'hidden',
                  alignItems: 'center',
                  paddingTop: 12,
                  paddingBottom: 10,
                  paddingHorizontal: 8,
                },
                neonGlow('rgba(255,215,0,0.12)', 8),
              ]}
              accessibilityLabel={`${trick.name}, newly unlocked`}
              accessibilityHint="Opens trick details"
              accessibilityRole="button"
            >
              {/* Star badge */}
              <View className="absolute top-2 right-2">
                <Ionicons name="star" size={10} color="#FFD700" />
              </View>

              {/* Sprite */}
              <View className="items-center justify-center mb-2" style={{ height: 52 }}>
                <SpriteIcon index={spriteIndex} size={46} />
              </View>

              {/* Name */}
              <Text
                className="text-white font-black text-[10px] tracking-wide text-center uppercase leading-tight mb-2"
                numberOfLines={2}
              >
                {trick.name}
              </Text>

              {/* Difficulty */}
              <View className="flex-row items-center gap-1">
                <View
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: diffColor }}
                />
                <Text className="text-[9px] font-bold" style={{ color: diffColor }}>
                  {trick.difficulty}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
