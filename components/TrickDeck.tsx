import React, { useCallback, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  // @ts-ignore
  type SharedValue
} from 'react-native-reanimated';


import { COLORS } from '@/constants/AppTheme';
import { Trick } from '@/context/TrickContext';
import { Ionicons } from '@expo/vector-icons';
// @ts-ignore
import { scheduleOnRN } from 'react-native-worklets';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = SCREEN_WIDTH * 0.56;
const CARD_HEIGHT = CARD_WIDTH * 1.5;

type TrickDeckProps = {
  tricks: Trick[];
  onTrickPress: (trick: Trick) => void;
};

type Ghost = {
    id: string; // unique ID for the ghost (trick.id + timestamp)
    trick: Trick;
    initialX: number;
    initialY: number;
    initialRotation: number;
    direction: 'left' | 'right';
};

export default function TrickDeck({ tricks, onTrickPress }: TrickDeckProps) {
  const [index, setIndex] = useState(0);
  const [ghosts, setGhosts] = useState<Ghost[]>([]);

  // Lifted SharedValue to coordinate background animations
  const activeTranslationX = useSharedValue(0);

  // Animated Styles for Background Cards (Moved UP to execute unconditionally)
  const nextCardStyle = useAnimatedStyle(() => {
      const tX = Math.abs(activeTranslationX.value);
      return {
          transform: [
              { scale: interpolate(tX, [0, SCREEN_WIDTH], [0.9, 1], 'clamp') },
              { translateX: interpolate(tX, [0, SCREEN_WIDTH], [-60, 0], 'clamp') },
              { rotate: `${interpolate(tX, [0, SCREEN_WIDTH], [-4, 0], 'clamp')}deg` },
          ],
          opacity: interpolate(tX, [0, SCREEN_WIDTH], [0.7, 1], 'clamp'),
      };
  });

  const nextNextCardStyle = useAnimatedStyle(() => {
      const tX = Math.abs(activeTranslationX.value);
       return {
          transform: [
              { scale: interpolate(tX, [0, SCREEN_WIDTH], [0.8, 0.9], 'clamp') },
              { translateX: interpolate(tX, [0, SCREEN_WIDTH], [-120, -60], 'clamp') },
              { rotate: `${interpolate(tX, [0, SCREEN_WIDTH], [-8, -4], 'clamp')}deg` },
          ],
          opacity: interpolate(tX, [0, SCREEN_WIDTH], [0.4, 0.7], 'clamp'),
      };
  });

  const removeGhost = useCallback((ghostId: string) => {
      setGhosts(prev => prev.filter(g => g.id !== ghostId));
  }, []);

  // Safe Derived State
  const hasTricks = tricks.length > 0;
  const currentIndex = hasTricks ? index % tricks.length : 0;
  const nextIndex = hasTricks ? (index + 1) % tricks.length : 0;
  const nextNextIndex = hasTricks ? (index + 2) % tricks.length : 0;

  const currentTrick = hasTricks ? tricks[currentIndex] : null;
  const nextTrick = hasTricks && tricks.length > 1 ? tricks[nextIndex] : null;
  const nextNextTrick = hasTricks && tricks.length > 2 ? tricks[nextNextIndex] : null;

  const handleNext = (direction: 'left' | 'right', offset: { x: number, y: number, rot: number }) => {
    if (!currentTrick) return;

    // 1. Create Ghost
    const newGhost: Ghost = {
        id: `${currentTrick.id}-${Date.now()}`,
        trick: currentTrick,
        initialX: offset.x,
        initialY: offset.y,
        initialRotation: offset.rot,
        direction
    };
    setGhosts(prev => [...prev, newGhost]);

    // 2. Immediate State Update
    setIndex(prev => prev + 1);

    // 3. Reset SharedValue for the NEW top card
    activeTranslationX.value = 0;
  };

  const handlePress = () => {
      if (currentTrick) onTrickPress(currentTrick);
  };

  // Condition check AFTER all hooks
  if (!hasTricks) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="trophy-outline" size={64} color={COLORS.secondary} />
        <Text style={styles.emptyText}>No more tricks in progress!</Text>
        <Text style={styles.emptySubText}>Go to "All Tricks" to add more.</Text>
      </View>
    );
  }

  // If we have tricks, render deck (currentTrick is guaranteed not null here)
  return (
    <GestureHandlerRootView style={styles.container}>
       <View style={styles.deckContainer}>
          {/* Background Card (2 steps behind) */}
          {nextNextTrick && (
            <Animated.View style={[styles.cardWrapper, styles.cardNextNext, nextNextCardStyle]}>
                 <NeonCard trick={nextNextTrick} isBackground />
            </Animated.View>
          )}

          {/* Next Card */}
          {nextTrick && (
             <Animated.View style={[styles.cardWrapper, styles.cardNext, nextCardStyle]}>
                 <NeonCard trick={nextTrick} isBackground />
             </Animated.View>
          )}

          {/* Top Card (Interactive) */}
          <SwipeableCard
            key={`${currentTrick!.id}-${index}`} // Fresh key ensures component resets completely
            trick={currentTrick!}
            sharedTranslationX={activeTranslationX} // Pass it down
            onSwipe={(dir, offset) => handleNext(dir, offset)}
            onPress={handlePress}
          />

          {/* Ghost Cards (Animating away) */}
          {ghosts.map(ghost => (
              <GhostCard key={ghost.id} ghost={ghost} onComplete={() => removeGhost(ghost.id)} />
          ))}
       </View>
    </GestureHandlerRootView>
  );
}

// ------------------------------------------------------------------
// Interactive Card
// ------------------------------------------------------------------
function SwipeableCard({
    trick,
    onSwipe,
    onPress,
    sharedTranslationX // Receive shared value
}: {
    trick: Trick;
    onSwipe: (dir: 'left' | 'right', offset: { x: number, y: number, rot: number }) => void,
    onPress: () => void,
    sharedTranslationX: SharedValue<number>
}) {
  const translationX = sharedTranslationX; // use the passed shared value
  const translationY = useSharedValue(0);
  const rotation = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translationX.value = event.translationX;
      translationY.value = event.translationY;
      rotation.value = interpolate(
        event.translationX,
        [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
        [-10, 0, 10],
        'clamp'
      );
    })
    .onEnd((event) => {
      if (Math.abs(event.translationX) > SCREEN_WIDTH * 0.3) {
        // Threshold Passed:
        // Instead of animating here, we just signal completion and pass current values.
        // We calculate what the rotation currently is (roughly)

        const direction = event.translationX > 0 ? 'right' : 'left';
        const currentOffset = {
            x: event.translationX,
            y: event.translationY,
            rot: 0 // We let the ghost calculate rotation based on X, or logic below
        };
        // Approximate rotation based on x for the ghost to pick up smoothly
        currentOffset.rot = (event.translationX / (SCREEN_WIDTH/2)) * 10;

        scheduleOnRN(onSwipe, direction, currentOffset);

        // We do NOT reset spring here because this component is about to be unmounted/replaced.
      } else {
        // Reset (Snap back)
        translationX.value = withSpring(0, { damping: 15, stiffness: 150 });
        translationY.value = withSpring(0);
        rotation.value = withSpring(0);
      }
    });

  const tapGesture = Gesture.Tap()
    .onEnd(() => {
        scheduleOnRN(onPress);
    });

  const composedGesture = Gesture.Race(panGesture, tapGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translationX.value },
      { translateY: translationY.value },
      { rotate: `${rotation.value}deg` },
    ],
    zIndex: 100,
  }));

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={[styles.cardWrapper, animatedStyle]}>
         <NeonCard trick={trick} />
      </Animated.View>
    </GestureDetector>
  );
}

// ------------------------------------------------------------------
// Ghost Card (Fire-and-forget animation)
// ------------------------------------------------------------------
function GhostCard({ ghost, onComplete }: { ghost: Ghost, onComplete: () => void }) {
    const translationX = useSharedValue(ghost.initialX);
    const translationY = useSharedValue(ghost.initialY);
    const rotation = useSharedValue(ghost.initialRotation);

    // Run animation on mount
    React.useEffect(() => {
        const targetX = ghost.direction === 'right' ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5;
        // Fast, no-wobble spring
        const springConfig = { damping: 40, stiffness: 400, mass: 1, overshootClamping: true };

        translationX.value = withSpring(targetX, springConfig, (finished) => {
            if (finished) {
                scheduleOnRN(onComplete);
            }
        });
        translationY.value = withSpring(ghost.initialY + (Math.random() * 100 - 50), springConfig); // Drift up/down
        rotation.value = withSpring(ghost.initialRotation + (ghost.direction === 'right' ? 90 : -90), springConfig); // Spin away
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translationX.value },
            { translateY: translationY.value },
            { rotate: `${rotation.value}deg` },
        ],
        zIndex: 1000, // Always on top
    }));

    return (
        <Animated.View style={[styles.cardWrapper, animatedStyle, { position: 'absolute' }]}>
            <NeonCard trick={ghost.trick} />
        </Animated.View>
    );
}


// ------------------------------------------------------------------
// Visual Component & Styles
// ------------------------------------------------------------------

function NeonCard({ trick, isBackground = false }: { trick: Trick, isBackground?: boolean }) {
    return (
        <View style={[styles.card, isBackground && styles.cardBackground]}>
            <View style={styles.innerBorder}>
                <View style={styles.iconContainer}>
                     <Ionicons name="flash" size={48} color={COLORS.secondary} />
                </View>
                <Text style={styles.trickName}>{trick.name}</Text>
                {!isBackground && <Text style={styles.trickDesc}>{trick.description}</Text>}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -40,
  },
  deckContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardWrapper: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  // Stack Styles - Fan to the LEFT (Increased offset)
  cardNext: {
     transform: [{ scale: 0.9 }, { translateX: -60 }, { rotate: '-4deg' }],
     opacity: 0.7,
     zIndex: -1,
  },
  cardNextNext: {
     transform: [{ scale: 0.8 }, { translateX: -120 }, { rotate: '-8deg' }],
     opacity: 0.4,
     zIndex: -2,
  },
  // Card Visuals
  card: {
    flex: 1,
    backgroundColor: 'rgba(13, 13, 37, 0.95)',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 8,
    padding: 4,
  },
  cardBackground: {
      shadowOpacity: 0.3,
      borderColor: 'rgba(0, 255, 255, 0.5)',
  },
  innerBorder: {
      flex: 1,
      borderWidth: 1,
      borderColor: 'rgba(0, 255, 255, 0.3)',
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
  },
  iconContainer: {
      marginBottom: 20,
  },
  trickName: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#fff',
      textAlign: 'center',
      marginBottom: 12,
  },
  trickDesc: {
      fontSize: 14,
      color: COLORS.textDim,
      textAlign: 'center',
      lineHeight: 20,
  },
  // Empty State
  emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
  },
  emptyText: {
      color: COLORS.secondary,
      fontSize: 20,
      fontWeight: 'bold',
      marginTop: 16,
  },
  emptySubText: {
      color: COLORS.textDim,
      fontSize: 14,
      marginTop: 8,
  },
});
