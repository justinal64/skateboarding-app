import { COLORS } from '@/constants/AppTheme';
import { Trick } from '@/types';
import { getTrickSpriteIndex } from '@/utils/trickIcons';
import React from 'react';
import { Text, View } from 'react-native';
import SpriteIcon from './SpriteIcon';

type TrickCardContentProps = {
    trick: Trick;
    size: number;
    showName?: boolean;
};

export default function TrickCardContent({ trick, size, showName = true }: TrickCardContentProps) {
    const spriteIndex = getTrickSpriteIndex(trick);

    // Calculate dimensions relative to size
    // For sprite sheet, we want the icon to likely fill a good portion of the circle
    const circleSize = size * 0.7; // Slightly larger circle for better visibility
    const iconSize = circleSize * 0.7; // Icon size within circle

    // Determine colors based on difficulty or fixed neon theme
    const isPink = trick.name.length % 2 === 0; // Simple localized randomization for variety
    const borderColor = isPink ? COLORS.primary : COLORS.secondary;

    return (
        <View className="flex-1 items-center justify-center p-2">
            {/* Main Circle Container */}
            <View
                style={{
                    width: circleSize,
                    height: circleSize,
                    borderRadius: circleSize / 2,
                    borderWidth: 2,
                    borderColor: borderColor,
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: borderColor,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.8,
                    shadowRadius: 10,
                    elevation: 5,
                    backgroundColor: 'rgba(0,0,0,0.3)', // Slight background to pop
                    overflow: 'hidden' // Clip the sprite if it overflows (shouldn't)
                }}
            >
                {/* Inner Icon */}
                <SpriteIcon
                    index={spriteIndex}
                    size={iconSize}
                />
            </View>

            {/* Trick Name */}
            {showName && (
                <Text
                    className="text-white font-bold text-center mt-3 uppercase"
                    numberOfLines={2}
                    style={{
                        fontSize: size * 0.1,
                        textShadowColor: borderColor,
                        textShadowOffset: { width: 0, height: 0 },
                        textShadowRadius: 10
                    }}
                >
                    {trick.name}
                </Text>
            )}
        </View>
    );
}
