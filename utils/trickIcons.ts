import { Trick } from '@/types';

// Sprite Sheet Mapping (4x4 Grid):
// Row 1: 0:Board, 1:Kickflip, 2:Ollie, 3:Broken
// Row 2: 4:Rail, 5:Ramp, 6:Coping, 7:Crossed
// Row 3: 8:Shuvit, 9:Manual, 10:Air, 11:Cam
// Row 4: 12:Trophy, 13:Timer, 14:Sparkle, 15:Logo

export const getTrickSpriteIndex = (trick: Trick): number => {
    const name = trick.name.toLowerCase();
    const category = trick.category;

    // Specific Tricks
    if (name.includes('kickflip') || name.includes('heelflip') || name.includes('varial')) {
        return 1; // Rotation arrows
    }
    if (name.includes('shuvit') || name.includes('shove-it') || name.includes('360')) {
        return 8; // Circular rotation
    }
    if (name.includes('ollie') && !name.includes('nollie')) {
        return 2; // Shoe prints
    }
    if (name.includes('manual')) {
        return 9; // Manual
    }
    if (name.includes('air') || name.includes('grab')) {
        return 10; // Big air arc
    }

    // Categories
    switch (category) {
        case 'Grind':
        case 'Slide':
            return 4; // Rail
        case 'Transition':
            return 5; // Ramp
        case 'Flip':
            return 1; // Rotation
        case 'Basics':
        default:
            return 0; // Generic Board
    }
};
