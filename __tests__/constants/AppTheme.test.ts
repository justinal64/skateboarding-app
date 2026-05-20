import { neonGlow, textGlow } from '@/constants/AppTheme';

describe('textGlow', () => {
  it('returns the correct text shadow shape', () => {
    expect(textGlow('#FF00FF', 8)).toEqual({
      textShadowColor: '#FF00FF',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 8,
    });
  });

  it('uses 10 as the default radius', () => {
    expect(textGlow('#00FFFF').textShadowRadius).toBe(10);
  });
});

// jest-expo runs with Platform.OS = 'ios'
describe('neonGlow', () => {
  it('returns the correct iOS shadow shape', () => {
    expect(neonGlow('#FF00FF', 12)).toMatchObject({
      shadowColor: '#FF00FF',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 12,
    });
  });

  it('uses 10 as the default radius', () => {
    expect(neonGlow('#00FFFF').shadowRadius).toBe(10);
  });
});
