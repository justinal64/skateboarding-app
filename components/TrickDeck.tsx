import React, { useCallback, useState } from 'react';
import { Dimensions, Text, View } from 'react-native';
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
import { Trick } from '@/types';
import { getTrickImage } from '@/utils/mockImages';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
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
              { translateX: interpolate(tX, [0, SCREEN_WIDTH], [-70, 0], 'clamp') }, // Increased offset
              { rotate: `${interpolate(tX, [0, SCREEN_WIDTH], [-6, 0], 'clamp')}deg` },
          ],
          opacity: interpolate(tX, [0, SCREEN_WIDTH], [0.8, 1], 'clamp'),
          zIndex: 10, // Positive but lower than top card (100)
      };
  });

  const nextNextCardStyle = useAnimatedStyle(() => {
      const tX = Math.abs(activeTranslationX.value);
       return {
          transform: [
              { scale: interpolate(tX, [0, SCREEN_WIDTH], [0.8, 0.9], 'clamp') },
              { translateX: interpolate(tX, [0, SCREEN_WIDTH], [-140, -70], 'clamp') }, // Increased offset
              { rotate: `${interpolate(tX, [0, SCREEN_WIDTH], [-10, -6], 'clamp')}deg` },
          ],
          opacity: interpolate(tX, [0, SCREEN_WIDTH], [0.5, 0.8], 'clamp'),
          zIndex: 5, // Positive but lower than next card
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
      <View className="flex-1 items-center justify-center">
        <Ionicons name="trophy-outline" size={64} color={COLORS.secondary} />
        <Text className="text-secondary text-xl font-bold mt-4">No more tricks in progress!</Text>
        <Text className="text-textDim text-sm mt-2">Go to &quot;All Tricks&quot; to add more.</Text>
      </View>
    );
  }

  // If we have tricks, render deck (currentTrick is guaranteed not null here)
  return (
    <GestureHandlerRootView className="flex-1 items-center justify-center -mt-10">
       <View className="items-center justify-center" style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}>
          {/* Background Card (2 steps behind) */}
          {nextNextTrick && (
            <Animated.View className="absolute" style={[{ width: CARD_WIDTH, height: CARD_HEIGHT }, nextNextCardStyle]}>
                 <NeonCard trick={nextNextTrick} isBackground />
            </Animated.View>
          )}

          {/* Next Card */}
          {nextTrick && (
             <Animated.View className="absolute" style={[{ width: CARD_WIDTH, height: CARD_HEIGHT }, nextCardStyle]}>
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
      <Animated.View className="absolute" style={[{ width: CARD_WIDTH, height: CARD_HEIGHT }, animatedStyle]}>
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
    });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translationX.value },
            { translateY: translationY.value },
            { rotate: `${rotation.value}deg` },
        ],
        zIndex: 1000, // Always on top
    }));

    return (
        <Animated.View className="absolute" style={[{ width: CARD_WIDTH, height: CARD_HEIGHT }, animatedStyle]}>
            <NeonCard trick={ghost.trick} />
        </Animated.View>
    );
}


// ------------------------------------------------------------------
// Visual Component & Styles
// ------------------------------------------------------------------


function NeonCard({ trick, isBackground = false }: { trick: Trick, isBackground?: boolean }) {
    const imageUrl = getTrickImage(trick.id);

    return (
        <View
            className={`flex-1 bg-[#1E1E1E] rounded-3xl overflow-hidden relative border border-white/10 ${isBackground ? 'opacity-80' : ''}`}
            // @ts-ignore
            style={{ boxShadow: '0px 4px 10px rgba(0,0,0,0.5)', elevation: 8 }}
        >
             <Image
                source={{ uri: imageUrl }}
                className="w-full h-full absolute"
                contentFit="cover"
                transition={300}
            />
            <LinearGradient
                colors={['transparent', 'rgba(13, 13, 37, 0.9)']}
                className="absolute left-0 right-0 bottom-0 h-3/5"
            />

            <View className="absolute bottom-5 left-4 right-4">
                <Text
                    className="text-[28px] font-bold text-text mb-1"
                    // @ts-ignore
                    style={{ textShadow: '0px 2px 6px rgba(0,0,0,0.5)' }}
                >{trick.name}</Text>
                 {!isBackground && (
                    <Text className="text-sm text-primary font-bold uppercase" numberOfLines={1}>
                        {trick.status === 'NOT_STARTED' ? trick.difficulty : trick.status.replace('_', ' ')}
                    </Text>
                 )}
            </View>

            {/* Status Indicator (if needed in future, but clean for now) */}
             {trick.status === 'COMPLETED' && !isBackground && (
                 <View className="absolute top-3 right-3">
                     <View className="w-8 h-8 border-2 border-success rounded-md items-center justify-center bg-black/50">
                        <Text className="text-success text-xl font-bold -mt-0.5">✓</Text>
                     </View>
                 </View>
            )}
        </View>
    );
}
