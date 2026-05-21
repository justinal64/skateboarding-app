import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: W, height: H } = Dimensions.get('window');

const CYAN = '#00FFFF';
const MAGENTA = '#FF00FF';
const GREEN = '#39FF14';
const ORANGE = '#FF8800';
const LIME = '#CCFF00';
const GRID_COLOR = '#00BBCC';

const LETTERS = [
  { letter: 'B', glow: CYAN },
  { letter: 'O', glow: MAGENTA },
  { letter: 'L', glow: GREEN },
  { letter: 'T', glow: ORANGE },
  { letter: 'S', glow: CYAN },
];

const STARS = [
  { top: 0.1, left: 0.28 },
  { top: 0.07, left: 0.72 },
  { top: 0.17, left: 0.14 },
  { top: 0.22, left: 0.88 },
  { top: 0.13, left: 0.55 },
];

const GRID_H_LINES = 9;
const GRID_V_LINES = 10;
const GRID_W = W * 5;
const GRID_FLOOR_H = H * 1.6;

export default function SplashScreen() {
  const insets = useSafeAreaInsets();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.15, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [pulseAnim]);

  return (
    <View style={styles.container}>
      {/* Deep purple radial glow behind logo */}
      <View style={styles.purpleGlow} />

      {/* Star dots */}
      {STARS.map((s, i) => (
        <View key={i} style={[styles.star, { top: s.top * H, left: s.left * W }]} />
      ))}

      {/* ── Logo section ── */}
      <View style={[styles.logoSection, { paddingTop: insets.top + 32 }]}>
        {/* BOLTS — each letter has its own glow colour */}
        <View style={styles.boltsRow}>
          {LETTERS.map(({ letter, glow }) => (
            <Text
              key={letter}
              style={[
                styles.boltsLetter,
                {
                  textShadowColor: glow,
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 28,
                },
              ]}
            >
              {letter}
            </Text>
          ))}
        </View>

        {/* Rainbow gradient underline */}
        <LinearGradient
          colors={[CYAN, '#8800FF', MAGENTA, GREEN, ORANGE]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.underline}
        />

        {/* TRACK • LEARN • GROW */}
        <View style={styles.taglineRow}>
          <Text style={[styles.tagWord, { color: CYAN }]}>TRACK</Text>
          <Text style={[styles.tagDot, { color: ORANGE }]}> • </Text>
          <Text style={[styles.tagWord, { color: LIME }]}>LEARN</Text>
          <Text style={[styles.tagDot, { color: ORANGE }]}> • </Text>
          <Text style={[styles.tagWord, { color: GREEN }]}>GROW</Text>
        </View>
      </View>

      {/* ── Teal sky glow band above horizon ── */}
      <LinearGradient
        colors={['transparent', 'rgba(0,60,80,0.6)', 'rgba(0,40,60,0.8)']}
        style={styles.skyBand}
      />

      {/* ── Horizon line ── */}
      <View
        style={[
          styles.horizonWrap,
          Platform.OS === 'ios' && {
            shadowColor: CYAN,
            shadowOffset: { width: 0, height: 0 },
            shadowRadius: 12,
            shadowOpacity: 1,
          },
        ]}
      >
        <LinearGradient
          colors={[MAGENTA, '#AA00FF', CYAN]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.horizonLine}
        />
      </View>

      {/* ── Retro grid + bottom content ── */}
      <View style={styles.gridSection}>
        {/* Perspective floor grid */}
        <View style={styles.gridClip} pointerEvents="none">
          <View style={styles.gridFloor}>
            {Array.from({ length: GRID_H_LINES }).map((_, i) => (
              <View
                key={`h${i}`}
                style={[
                  styles.gridLine,
                  styles.gridHLine,
                  { top: (i / (GRID_H_LINES - 1)) * GRID_FLOOR_H },
                ]}
              />
            ))}
            {Array.from({ length: GRID_V_LINES + 1 }).map((_, i) => (
              <View
                key={`v${i}`}
                style={[
                  styles.gridLine,
                  styles.gridVLine,
                  { left: (i / GRID_V_LINES) * GRID_W },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Fade grid near horizon */}
        <LinearGradient
          colors={['#050515', 'rgba(5,5,21,0.5)', 'transparent']}
          style={styles.gridTopFade}
          pointerEvents="none"
        />

        {/* Loading dashes + text + version — bottom of grid */}
        <View style={[styles.bottomContent, { paddingBottom: Math.max(insets.bottom + 6, 18) }]}>
          <View style={styles.dashRow}>
            {[CYAN, MAGENTA, GREEN, ORANGE].map((color, i) => (
              <View key={i} style={[styles.dash, { backgroundColor: color }]} />
            ))}
          </View>

          <View style={styles.loadingRow}>
            <Animated.View style={[styles.loadingDot, { opacity: pulseAnim }]} />
            <Text style={styles.loadingText}>WAXING THE LEDGE...</Text>
          </View>

          <Text style={styles.versionText}>v 1.0.0 · EST 2026</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07071A',
    overflow: 'hidden',
  },

  // Background glow
  purpleGlow: {
    position: 'absolute',
    width: W * 1.4,
    height: H * 0.68,
    top: -H * 0.12,
    left: W * -0.2,
    borderRadius: W * 0.7,
    backgroundColor: '#5500BB',
    opacity: 0.2,
  },

  star: {
    position: 'absolute',
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#FFFFFF',
    opacity: 0.55,
  },

  // Logo
  logoSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  boltsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  boltsLetter: {
    fontSize: 100,
    fontWeight: '900',
    fontStyle: 'italic',
    color: '#FFFFFF',
    includeFontPadding: false,
    lineHeight: 104,
  },
  underline: {
    width: W * 0.82,
    height: 2.5,
    borderRadius: 2,
    marginBottom: 10,
  },
  taglineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagWord: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 3,
  },
  tagDot: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Sky + horizon
  skyBand: {
    height: 60,
    marginTop: -20,
  },
  horizonWrap: {
    width: '100%',
  },
  horizonLine: {
    height: 2,
    width: '100%',
  },

  // Grid
  gridSection: {
    height: H * 0.44,
    overflow: 'hidden',
    backgroundColor: '#05050F',
  },
  gridClip: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  gridFloor: {
    position: 'absolute',
    width: GRID_W,
    height: GRID_FLOOR_H,
    left: -(GRID_W - W) / 2,
    top: -H * 0.55,
    transform: [{ perspective: 380 }, { rotateX: '62deg' }],
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: GRID_COLOR,
    opacity: 0.6,
  },
  gridHLine: {
    left: 0,
    width: GRID_W,
    height: StyleSheet.hairlineWidth,
  },
  gridVLine: {
    top: 0,
    height: GRID_FLOOR_H,
    width: StyleSheet.hairlineWidth,
  },
  gridTopFade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '38%',
  },

  // Bottom loading section
  bottomContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 10,
  },
  dashRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dash: {
    width: 44,
    height: 4,
    borderRadius: 2,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  loadingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: GREEN,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 3,
  },
  versionText: {
    color: '#44446A',
    fontSize: 10,
    letterSpacing: 2,
  },
});
