import React from 'react';
import { Image, View } from 'react-native';

const SPRITE_SHEET = require('@/assets/images/skate-sprites-multicolor.png');
const COLS = 6;
const ROWS = 5;

type SpriteIconProps = {
    index: number;
    size: number;
};

export default function SpriteIcon({ index, size }: SpriteIconProps) {
    // Ensure index is within bounds
    const safeIndex = Math.max(0, Math.min(index, COLS * ROWS - 1));

    const col = safeIndex % COLS;
    const row = Math.floor(safeIndex / COLS);

    // We using a view with overflow hidden to "crop" the image
    // The image will be scaled up so that one cell equals the 'size' prop

    const width = size;
    const height = size;

    return (
        <View style={{ width, height, overflow: 'hidden' }}>
            <Image
                source={SPRITE_SHEET}
                style={{
                    width: width * COLS,
                    height: height * ROWS,
                    position: 'absolute',
                    left: -col * width,
                    top: -row * height,
                }}
                resizeMode="stretch"
            />
        </View>
    );
}
