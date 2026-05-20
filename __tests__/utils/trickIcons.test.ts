import { getTrickSpriteIndex } from '@/utils/trickIcons';
import { Trick } from '@/types';

function makeTrick(name: string, category: Trick['category'] = 'Basics'): Trick {
  return {
    id: '1',
    name,
    description: '',
    imageUrl: '',
    video_url: '',
    difficulty: 'Easy',
    category,
    points: 10,
    prerequisites: [],
    status: 'NOT_STARTED',
  };
}

describe('getTrickSpriteIndex', () => {
  it('returns 0 for Ollie', () => {
    expect(getTrickSpriteIndex(makeTrick('Ollie'))).toBe(0);
  });

  it('returns 1 for Kickflip', () => {
    expect(getTrickSpriteIndex(makeTrick('Kickflip'))).toBe(1);
  });

  it('returns 7 for Nollie (not confused with Ollie)', () => {
    expect(getTrickSpriteIndex(makeTrick('Nollie'))).toBe(7);
  });

  it('returns 3 for 360 Flip', () => {
    expect(getTrickSpriteIndex(makeTrick('360 Flip'))).toBe(3);
  });

  it('returns 23 for Noseblunt (not 22 Bluntslide)', () => {
    expect(getTrickSpriteIndex(makeTrick('Noseblunt'))).toBe(23);
  });

  it('returns Grind category fallback (4) for unknown grind trick', () => {
    expect(getTrickSpriteIndex(makeTrick('Unknown Grind', 'Grind'))).toBe(4);
  });

  it('returns Flip category fallback (1) for unknown flip trick', () => {
    expect(getTrickSpriteIndex(makeTrick('Unknown Flip', 'Flip'))).toBe(1);
  });

  it('returns default fallback (0) for unknown Basics trick', () => {
    expect(getTrickSpriteIndex(makeTrick('Unknown', 'Basics'))).toBe(0);
  });

  it('handles case-insensitive matching', () => {
    expect(getTrickSpriteIndex(makeTrick('KICKFLIP'))).toBe(1);
    expect(getTrickSpriteIndex(makeTrick('kickflip'))).toBe(1);
  });

  it('returns Slide category fallback (10) for unknown slide trick', () => {
    expect(getTrickSpriteIndex(makeTrick('Unknown Slide', 'Slide'))).toBe(10);
  });

  it('returns Transition category fallback (18) for unknown transition trick', () => {
    expect(getTrickSpriteIndex(makeTrick('Unknown Transition', 'Transition'))).toBe(18);
  });
});
