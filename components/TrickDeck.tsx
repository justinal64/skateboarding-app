import React, { useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { COLORS } from '@/constants/AppTheme';
import { Trick } from '@/context/TrickContext';
import { Ionicons } from '@expo/vector-icons';

const SCREEN_WIDTH = Dimensions.get('window').width;
// Smaller Cards: Reduced by another 20% (0.7 * 0.8 = 0.56)
const CARD_WIDTH = SCREEN_WIDTH * 0.56;
const CARD_HEIGHT = CARD_WIDTH * 1.5;

type TrickDeckProps = {
  tricks: Trick[];
  onTrickPress: (trick: Trick) => void;
};

export default function TrickDeck({ tricks, onTrickPress }: TrickDeckProps) {
  const [index, setIndex] = useState(0);

  if (tricks.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="trophy-outline" size={64} color={COLORS.secondary} />
        <Text style={styles.emptyText}>No more tricks in progress!</Text>
        <Text style={styles.emptySubText}>Go to "All Tricks" to add more.</Text>
      </View>
    );
  }

  // Circular Indexing
  const currentIndex = index % tricks.length;
  const nextIndex = (index + 1) % tricks.length;
  const nextNextIndex = (index + 2) % tricks.length;

  const currentTrick = tricks[currentIndex];
  // Only show next cards if we have more than 1 trick
  const nextTrick = tricks.length > 1 ? tricks[nextIndex] : null;
  const nextNextTrick = tricks.length > 2 ? tricks[nextNextIndex] : null;

  const handleNext = (direction: 'left' | 'right') => {
    // Just increment index to cycle
    setIndex(prev => prev + 1);
  };

  const handlePress = () => {
      onTrickPress(currentTrick);
  };

  return (
    <GestureHandlerRootView style={styles.container}>
       <View style={styles.deckContainer}>
          {/* Background Card (2 steps behind) */}
          {nextNextTrick && (
            <View style={[styles.cardWrapper, styles.cardNextNext]}>
                 <NeonCard trick={nextNextTrick} isBackground />
            </View>
          )}

          {/* Next Card */}
          {nextTrick && (
             <View style={[styles.cardWrapper, styles.cardNext]}>
                 <NeonCard trick={nextTrick} isBackground />
             </View>
          )}

          {/* Top Card (Animated) */}
          <SwipeableCard
            key={`${currentTrick.id}-${index}`} // Unique key ensures fresh animation state per index increment
            trick={currentTrick}
            onSwipe={(dir) => handleNext(dir)}
            onPress={handlePress}
          />
       </View>
    </GestureHandlerRootView>
  );
}

function SwipeableCard({ trick, onSwipe, onPress }: { trick: Trick; onSwipe: (dir: 'left' | 'right') => void, onPress: () => void }) {
  const translationX = useSharedValue(0);
  const translationY = useSharedValue(0);
  const rotation = useSharedValue(0);

  // Pan Gesture for Swiping
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translationX.value = event.translationX;
      translationY.value = event.translationY;
      rotation.value = interpolate(
        event.translationX,
        [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
        [-10, 0, 10],
        Extrapolate.CLAMP
      );
    })
    .onEnd((event) => {
      if (Math.abs(event.translationX) > SCREEN_WIDTH * 0.3) {
        // Swipe away to cycle
        const direction = event.translationX > 0 ? 'right' : 'left';

        translationX.value = withTiming(direction === 'right' ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5, {}, () => {
            runOnJS(onSwipe)(direction);
        });
      } else {
        // Reset
        translationX.value = withSpring(0);
        translationY.value = withSpring(0);
        rotation.value = withSpring(0);
      }
    });

  // Tap Gesture for Selecting
  const tapGesture = Gesture.Tap()
    .onEnd(() => {
        runOnJS(onPress)();
    });

  // Race: If we drag effectively, Pan wins. If we tap quickly without dragging valid distance, Tap wins?
  // actually standard approach is usually one or the other active.
  // compose() runs them simultaneously. Race() means only one activates.
  // Since we want both swiping and tapping, we can try Simultaneous or Race.
  // Given Pan usually swallows taps if not careful, we might rely on the fact that Pan needs movement.
  // A simple Tap gesture separate from Pan often works best if configured to not conflict.
  // Let's use `Race` but generally standard TouchableOpacity inside might be buggy with Pan on top.
  // Using Gesture.Race(panGesture, tapGesture) implies if Pan activates (move), Tap fails.

  const composedGesture = Gesture.Race(panGesture, tapGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translationX.value },
      { translateY: translationY.value },
      { rotate: `${rotation.value}deg` },
    ],
    zIndex: 100, // Top card
  }));

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={[styles.cardWrapper, animatedStyle]}>
         <NeonCard trick={trick} />
         {/* No overlays needed for cycling mode since we aren't "deciding" anything */}
      </Animated.View>
    </GestureDetector>
  );
}

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
    // offset up slightly so the stack fits well
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
  // Stack Styles - Fan to the LEFT
  cardNext: {
     transform: [{ scale: 0.9 }, { translateX: -40 }, { rotate: '-4deg' }],
     opacity: 0.7,
     zIndex: -1,
  },
  cardNextNext: {
     transform: [{ scale: 0.8 }, { translateX: -80 }, { rotate: '-8deg' }],
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
      fontSize: 24, // Smaller font
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
