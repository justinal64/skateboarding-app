import { COLORS } from '@/constants/AppTheme';
import { Trick } from '@/types';
import { getTrickImage } from '@/utils/mockImages';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo, useCallback, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import TrickDetailModal from './TrickDetailModal';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const GAP = 12;
const ITEM_WIDTH = (width - (GAP * (COLUMN_COUNT + 1))) / COLUMN_COUNT;

type TrickGridProps = {
  tricks: Trick[];
  onAddProcess: (trick: Trick) => void;
  loading?: boolean;
  headerTitle?: string;
  allowCompletion?: boolean;
};

// Memoized Grid Item
const TrickGridItem = memo(({ item, onPress }: { item: Trick, onPress: (trick: Trick) => void }) => {
    const imageUrl = getTrickImage(item.id);
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => onPress(item)}
        activeOpacity={0.8}
      >
        <Image
            source={{ uri: imageUrl }}
            style={styles.backgroundImage}
            contentFit="cover"
            transition={300}
        />
        <LinearGradient
            colors={['transparent', 'rgba(13, 13, 37, 0.9)']}
            style={styles.gradient}
        />
        <View style={styles.textContainer}>
            <Text style={styles.trickName}>{item.name}</Text>
            <Text style={styles.trickStatus} numberOfLines={1}>
                {item.status === 'NOT_STARTED' ? item.difficulty : item.status.replace('_', ' ')}
            </Text>
        </View>

        {/* Status Indicator */}
        {item.status !== 'NOT_STARTED' && (
            <View style={styles.statusIconContainer}>
                {item.status === 'COMPLETED' ? (
                     <View style={styles.checkIcon}>
                        <Text style={styles.checkText}>✓</Text>
                     </View>
                ) : (
                     <Ionicons name="time" size={20} color={COLORS.primary} />
                )}
            </View>
        )}
      </TouchableOpacity>
    );
});

export default function TrickGrid({ tricks, onAddProcess, loading, headerTitle, allowCompletion = false }: TrickGridProps) {
  const [selectedTrick, setSelectedTrick] = useState<Trick | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handlePress = useCallback((trick: Trick) => {
    setSelectedTrick(trick);
    setModalVisible(true);
  }, []);

  const renderItem = useCallback(({ item }: { item: Trick }) => (
    <TrickGridItem item={item} onPress={handlePress} />
  ), [handlePress]);

  const keyExtractor = useCallback((item: Trick) => item.id, []);

  if (loading) {
      // Basic Loading State
      return (
          <View style={styles.center}>
              <Text style={{ color: COLORS.textDim }}>Loading tricks...</Text>
          </View>
      );
  }

  return (
    <View style={styles.container}>
      <FlashList
        data={tricks}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={COLUMN_COUNT}
        contentContainerStyle={styles.listContainer}
        // @ts-ignore
        estimatedItemSize={ITEM_WIDTH}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
            headerTitle ? (
                <View style={styles.headerContainer}>
                    <View style={styles.neonHeader}>
                        <Text style={styles.neonHeaderText}>{headerTitle}</Text>
                    </View>
                </View>
            ) : null
        }
      />

      <TrickDetailModal
        visible={modalVisible}
        trick={selectedTrick}
        onClose={() => setModalVisible(false)}
        onAddToInProgress={onAddProcess}
        allowCompletion={allowCompletion}
        onPrerequisitePress={(trickName) => {
            const target = tricks.find(t => t.name === trickName);
            if (target) {
                setSelectedTrick(target);
            }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      backgroundColor: COLORS.background,
  },
  listContainer: {
    padding: GAP,
    paddingTop: 0,
    paddingBottom: 40,
  },
  // FlashList doesn't need columnWrapperStyle for spacing if we handle it in the item or content container,
  // but for a grid with gaps, FlashList usually handles it better if we don't use columnWrapperStyle.
  // However, specifically for gaps:
  // We can use ItemSeparatorComponent or internal padding.
  // But since we have a fixed width calculation, let's keep it simple.
  // Note: FlashList doesn't support columnWrapperStyle.
  // We should handle spacing differently?
  // Actually, FlashList docs recommend no columnWrapperStyle.
  // Let's rely on the item sizing.
  // If we had columnWrapperStyle: { justify: space-between }, we need to simulate that.
  // Since we calculated ITEM_WIDTH, let's just ensure we have correct look.
  // FlashList with numColumns lays out items in row major.
  // We might want to remove columnWrapperStyle prop and rely on the item width + internal margin ??
  // Or better, just use the width calculation we have.
  // The original had `justifyContent: 'space-between'` in columnWrapper.
  // To achieve space-between with FlashList, we might need a wrapper logic or just fixed margins.
  // Example: add marginRight to odd items?
  // For now, let's stick to the styling we had but remove columnWrapperStyle usage if FlashList warns or fails.
  // Wait, FlashList DOES NOT support columnWrapperStyle.
  // So I removed it from the JSX props.
  // Now I need to ensure the layout looks right.
  // The items are width: ITEM_WIDTH.
  // If we want a gap between columns, we need to ensure the container isn't too wide or the items have margin.
  // One way:
  // odd index items get right margin?
  // Or just set the item width slightly smaller?
  // Current logic: ITEM_WIDTH = (width - 3*GAP)/2.
  // This assumes: GAP [Item] GAP [Item] GAP. Or [Item] GAP [Item] ?
  // (width - (GAP * (COLUMN_COUNT + 1))) / COLUMN_COUNT -> (W - 3*12)/2.
  // This implies 3 gaps. Outer left, middle, outer right.
  // So we probably want ContentContainer paddingHorizontal = GAP.
  // And we want the first item in a row to have marginRight = GAP.
  // This is tricky in flat renderItem.
  // A simpler approach for now is to just wrap the content in a View with padding?
  // Actually, `contentContainerStyle` has `padding: GAP`. So that handles top/left/right/bottom/
  // Wait, `padding: GAP` means 12px all around.
  // So usable width is W - 24.
  // We have 2 items.
  // If we want a gap in between, we need W - 24 - 12 (middle gap) = W - 36.
  // divided by 2 = (W - 36)/2.
  // My formula was `(width - (12 * 3)) / 2`.
  // So `width - 36 / 2`.
  // So the item width is correct for [Gap Item Gap Item Gap].
  // But FlashList will stack them next to each other.
  // [Item][Item]
  // Total width of items = 2 * (W-36)/2 = W - 36.
  // Available width = W - 24.
  // Extra space = 12.
  // FlashList will put them next to each other.
  // We need to force them apart.
  // Since we can't use `columnWrapperStyle={{justifyContent: 'space-between'}}`.
  // We must handle it.
  // I will add a `marginRight` to the card if it's the first column.
  // Actually, FlashList's `renderItem` provides `index`.
  // But standard practice for masonry/grid in FlashList is often just fixed width and let it flow?
  // No, we want precise 2 columns.
  // Let's modify the styles to just work.
  // I'll add `marginRight: GAP` to the card style, but ONLY for the first item in the row.
  // `index % 2 === 0` -> marginRight: GAP.
  // This is efficient enough.
  // wait, Memoized item needs `index` passed to it to know.
  // Or I can just make the item width slightly smaller and use `justifyContent: space-between` on a container? No FlashList doesn't have rows.
  // I will modify `renderItem` to accept `index` and pass `isOdd` or something.
  // Wait, passing index to memo component updates it every time list changes order? No, index is stable mostly.
  // Let's create `GridItem` that takes `index` prop.
  card: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH, // Square aspect ratio.
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1E1E1E',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: GAP, // Ensure vertical gap
  },
  backgroundImage: {
      width: '100%',
      height: '100%',
  },
  gradient: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: '60%',
  },
  textContainer: {
      position: 'absolute',
      bottom: 12,
      left: 12,
      right: 12,
  },
  trickName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: COLORS.text,
      textShadowColor: 'rgba(0,0,0,0.5)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 4,
  },
  trickStatus: {
      fontSize: 10,
      color: COLORS.primary,
      fontWeight: 'bold',
      marginTop: 4,
      textTransform: 'uppercase',
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: COLORS.success,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  checkText: {
    color: COLORS.success,
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: -2,
  },
  statusIconContainer: {
      position: 'absolute',
      top: 8,
      right: 8,
      backgroundColor: 'rgba(0,0,0,0.6)',
      borderRadius: 12,
      padding: 2,
  },
  center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
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
    backgroundColor: 'rgba(0,0,0,0.6)',
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
});
