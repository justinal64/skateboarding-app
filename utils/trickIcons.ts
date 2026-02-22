import { Trick } from '@/types';

// Sprite Sheet Mapping (6x5 Grid):
// Row 1: 0:Ollie, 1:Kickflip, 2:Heelflip, 3:360 Flip, 4:50-50, 5:Noseslide
// Row 2: 6:Manual, 7:Nollie, 8:Varial Flip, 9:Hardflip, 10:Boardslide, 11:Tailslide
// Row 3: 12:FS 180, 13:BS 180, 14:Pop Shove-it, 15:Crooks, 16:Smith, 17:5-0
// Row 4: 18:Indy Grab, 19:Melon Grab, 20:Impossible, 21:Casper, 22:Bluntslide, 23:Noseblunt
// Row 5: 24:360 Kickflip, 25:Darkslide, 26:Fingerflip, 27:Primo Slide, 28:Boneless, 29:Strawberry Milkshake

export const getTrickSpriteIndex = (trick: Trick): number => {
    const name = trick.name.toLowerCase();
    const category = trick.category;

    // Specific Trick Matches
    if (name.includes('ollie') && !name.includes('nollie')) return 0;
    if (name.includes('kickflip') && !name.includes('360')) return 1;
    if (name.includes('heelflip')) return 2;
    if ((name.includes('360') || name.includes('tre')) && name.includes('flip')) return 3;
    if (name.includes('50-50')) return 4;
    if (name.includes('noseslide')) return 5;
    if (name.includes('manual')) return 6;
    if (name.includes('nollie')) return 7;
    if (name.includes('varial')) return 8;
    if (name.includes('hardflip')) return 9;
    if (name.includes('boardslide')) return 10;
    if (name.includes('tailslide')) return 11;
    if (name.includes('fs 180') || name.includes('frontside 180')) return 12;
    if (name.includes('bs 180') || name.includes('backside 180')) return 13;
    if (name.includes('shove-it') || name.includes('shuvit')) return 14;
    if (name.includes('crook')) return 15;
    if (name.includes('smith')) return 16;
    if (name.includes('5-0')) return 17;
    if (name.includes('indy')) return 18;
    if (name.includes('melon')) return 19;
    if (name.includes('impossible')) return 20;
    if (name.includes('casper')) return 21;
    if (name.includes('blunt') && !name.includes('nose')) return 22;
    if (name.includes('noseblunt')) return 23;
    if (name.includes('darkslide')) return 25;
    if (name.includes('fingerflip')) return 26;
    if (name.includes('primo')) return 27;
    if (name.includes('boneless')) return 28;
    if (name.includes('strawberry')) return 29;

    // Fallbacks by Category
    switch (category) {
        case 'Grind':
            return 4; // 50-50
        case 'Slide':
            return 10; // Boardslide
        case 'Flip':
            return 1; // Kickflip
        case 'Transition':
            return 18; // Indy Grab
        case 'Basics':
        default:
            return 0; // Ollie
    }
};
