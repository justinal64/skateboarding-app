import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import React, { memo, useCallback } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS } from '@/constants/AppTheme';
import { Trick } from '@/types';

type TrickListProps = {
  tricks: Trick[];
  onTrickPress: (trick: Trick) => void;
  loading: boolean;
  headerTitle?: string;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
};

// Memoized Card Component to prevent unnecessary re-renders
const TrickCard = memo(({ item, onPress }: { item: Trick; onPress: (trick: Trick) => void }) => (
  <Pressable onPress={() => onPress(item)}>
    <View style={[
        styles.card,
        item.status === 'COMPLETED' && styles.cardCompleted,
        item.status === 'IN_PROGRESS' && styles.cardInProgress
    ]}>
        <View style={[
            styles.glowDot,
            item.status === 'COMPLETED' && styles.glowDotCompleted,
            item.status === 'IN_PROGRESS' && styles.glowDotInProgress
        ]} />
        <View style={styles.textContainer}>
            <Text style={styles.trickName}>{item.name}</Text>
            <Text style={styles.trickDesc}>{item.description}</Text>
        </View>

        {item.status === 'COMPLETED' && (
            <View style={styles.checkIcon}>
               <Text style={styles.checkText}>✓</Text>
            </View>
        )}
        {item.status === 'IN_PROGRESS' && (
             <Ionicons name="time-outline" size={24} color={COLORS.secondary} style={{ marginLeft: 8 }} />
        )}
    </View>
  </Pressable>
));

export default function TrickList({ tricks, onTrickPress, loading, headerTitle, ListHeaderComponent }: TrickListProps) {
  const insets = useSafeAreaInsets();

  const handleTrickPress = useCallback((trick: Trick) => {
    onTrickPress(trick);
  }, [onTrickPress]);

  const renderItem = useCallback(({ item }: { item: Trick }) => (
    <TrickCard item={item} onPress={handleTrickPress} />
  ), [handleTrickPress]);

  const keyExtractor = useCallback((item: Trick) => item.id, []);

  if (loading && tricks.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>LOADING TRICKS...</Text>
      </View>
    );
  }

  const DefaultHeader = () => (
     headerTitle ? (
        <View style={styles.headerContainer}>
            <View style={styles.neonHeader}>
                <Text style={styles.neonHeaderText}>{headerTitle}</Text>
            </View>
        </View>
     ) : null
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <FlashList
        data={tricks}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={ListHeaderComponent || (headerTitle ? DefaultHeader : null)}
        renderItem={renderItem}
        // @ts-ignore
        estimatedItemSize={120}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  neonHeader: {
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 24,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
    backgroundColor: 'transparent',
  },
  neonHeaderText: {
    color: '#CCFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    textShadowColor: COLORS.secondary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.primary,
    marginTop: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.secondary,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardCompleted: {
    // Keep consistent with rest of app (no background change request was reverted, but user said "Move it to done").
    // The previous request said "When an item is checked just add the checkbox, but thats all that should happen".
    // So I will remove the background styling I was about to add.
  },
  cardInProgress: {
    // Subtle distinction? Maybe border color?
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  trickName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
    textShadowColor: COLORS.secondary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  trickDesc: {
    fontSize: 14,
    color: COLORS.textDim,
  },
  glowDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.secondary,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  glowDotCompleted: {
     backgroundColor: COLORS.success,
     shadowColor: COLORS.success,
  },
  glowDotInProgress: {
      backgroundColor: COLORS.primary,
      shadowColor: COLORS.primary,
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: COLORS.success,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  checkText: {
    color: COLORS.success,
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: -2,
  },
});
