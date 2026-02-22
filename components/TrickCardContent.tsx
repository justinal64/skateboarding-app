import React from 'react';
import { Text, View } from 'react-native';

import { Trick } from '@/types';
import SpriteIcon from './SpriteIcon';

type TrickCardContentProps = {
    trick: Trick;
    size: number;
    showName?: boolean;
};

export default function TrickCardContent({ trick, size, showName = true }: TrickCardContentProps) {
    const spriteIndex = require('@/utils/trickIcons').getTrickSpriteIndex(trick);

    // Let the icon breathe more — we remove the hard circular border
    const iconSize = size * 0.75;

    // Dynamic coloring based on trick difficulty for a varied, premium feel
    const isAdvanced = trick.difficulty === 'Advanced';
    const isIntermediate = trick.difficulty === 'Intermediate';

    const themeColor = isAdvanced
      ? '#ff2d78'  // Pink
      : isIntermediate
        ? '#00e5cc' // Teal
        : '#39ff14'; // Lime

    return (
        <View className="flex-1 w-full h-full relative p-3 pb-4">
            {/* Top-left Information Badge */}
            <View className="absolute top-2 left-2 flex-row z-10">
                <View
                  className="px-2 py-1 rounded border bg-black/50"
                  style={{ borderColor: themeColor + '60' }}
                >
                    <Text className="text-[10px] font-black uppercase text-white/90">
                        {trick.points} PTS
                    </Text>
                </View>
            </View>

            {/* Central Sprite Container */}
            <View className="flex-1 items-center justify-center pt-2">
                {/* The Sprite Icon */}
                <SpriteIcon
                    index={spriteIndex}
                    size={iconSize}
                />
            </View>

            {/* Bold, Clean Footer Text */}
            {showName && (
                <View className="mt-auto px-1">
                    <Text
                        className="text-white font-black uppercase tracking-wide leading-tight"
                        numberOfLines={2}
                        style={{ fontSize: Math.max(12, size * 0.11) }}
                    >
                        {trick.name}
                    </Text>
                </View>
            )}
        </View>
    );
}
