import React, { useEffect, useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const COLORS = [
  '#FF2D78',
  '#00FFFF',
  '#FF00FF',
  '#FFD700',
  '#00FF88',
  '#FF6B35',
  '#A855F7',
  '#FFFFFF',
];
const PARTICLE_COUNT = 50;

type ParticleConfig = {
  id: number;
  startX: number;
  driftX: number;
  color: string;
  size: number;
  borderRadius: number;
  duration: number;
  delay: number;
  rotations: number;
};

function makeParticles(): ParticleConfig[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    startX: Math.random() * SCREEN_W,
    driftX: (Math.random() - 0.5) * 220,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: 6 + Math.random() * 8,
    borderRadius: Math.random() > 0.5 ? 50 : 2,
    duration: 1800 + Math.random() * 800,
    delay: Math.random() * 350,
    rotations: 360 + Math.random() * 720,
  }));
}

function Particle({ config, active }: { config: ParticleConfig; active: boolean }) {
  const progress = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (active) {
      progress.value = withDelay(
        config.delay,
        withTiming(1, { duration: config.duration, easing: Easing.out(Easing.quad) }),
      );
      opacity.value = withDelay(
        config.delay,
        withSequence(
          withTiming(1, { duration: 120 }),
          withDelay(config.duration - 480, withTiming(0, { duration: 360 })),
        ),
      );
    } else {
      progress.value = 0;
      opacity.value = 0;
    }
  }, [active, config.delay, config.duration, opacity, progress]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: config.startX + config.driftX * progress.value },
      { translateY: -20 + (SCREEN_H + 80) * progress.value },
      { rotate: `${config.rotations * progress.value}deg` },
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          width: config.size,
          height: config.size,
          backgroundColor: config.color,
          borderRadius: config.borderRadius,
        },
        style,
      ]}
    />
  );
}

export default function ConfettiOverlay({ visible }: { visible: boolean }) {
  const particles = useMemo(() => makeParticles(), []);

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {particles.map((config) => (
        <Particle key={config.id} config={config} active={visible} />
      ))}
    </View>
  );
}
