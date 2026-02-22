import React, { memo, useCallback, useEffect, useState } from 'react';
import { Dimensions, Text, TouchableOpacity, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';

import NeonBadge from '@/components/NeonBadge';
import TrickCardContent from '@/components/TrickCardContent';
import TrickDetailModal from '@/components/TrickDetailModal';
import { COLORS } from '@/constants/AppTheme';
import { Trick } from '@/types';

const { width } = Dimensions.get('window');
const GAP = 12;
const MIN_ITEM_WIDTH = 150;

const availableListWidth = width - GAP * 2;
const numColumnsRaw = Math.floor((availableListWidth + GAP) / (MIN_ITEM_WIDTH + GAP));
const COLUMN_COUNT = Math.max(1, numColumnsRaw);
const ITEM_WIDTH = (availableListWidth - GAP * (COLUMN_COUNT - 1)) / COLUMN_COUNT;

type TrickGridProps = {
  tricks: Trick[];
  onAddProcess: (trick: Trick) => void;
  loading?: boolean;
  headerTitle?: string;
  allowCompletion?: boolean;
};

/** Memoized grid tile for a single trick. */
const TrickGridItem = memo(
  ({ item, onPress }: { item: Trick; onPress: (trick: Trick) => void }) => {
    const isCompleted = item.status === 'COMPLETED';
    const isLearning = item.status === 'IN_PROGRESS';

    return (
      <TouchableOpacity
        className="rounded-xl overflow-hidden relative"
        style={{
          width: ITEM_WIDTH,
          height: ITEM_WIDTH,
          marginBottom: GAP,
          backgroundColor: '#1E1E2A',
          borderWidth: 1,
          borderColor: isCompleted ? 'rgba(0, 255, 102, 0.4)' : 'rgba(255,255,255,0.08)',
        }}
        onPress={() => onPress(item)}
        activeOpacity={0.8}
      >
        <TrickCardContent trick={item} size={ITEM_WIDTH} />

        {/* Status Indicator */}
        {(isCompleted || isLearning) && (
          <View className="absolute top-2.5 right-2.5 z-20">
            {isCompleted ? (
              <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
            ) : (
              <View className="bg-black/60 rounded-full p-0.5">
                 <Ionicons name="time" size={18} color={COLORS.primary} />
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  },
);

export default function TrickGrid({
  tricks,
  onAddProcess,
  loading,
  headerTitle,
  allowCompletion = false,
}: TrickGridProps) {
  const [selectedTrick, setSelectedTrick] = useState<Trick | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Keep selectedTrick in sync when the tricks array updates (e.g. status change)
  useEffect(() => {
    if (selectedTrick) {
      const updatedTrick = tricks.find((t) => t.id === selectedTrick.id);
      if (updatedTrick && updatedTrick !== selectedTrick) {
        setSelectedTrick(updatedTrick);
      }
    }
  }, [tricks, selectedTrick]);

  const handlePress = useCallback((trick: Trick) => {
    setSelectedTrick(trick);
    setModalVisible(true);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: Trick }) => <TrickGridItem item={item} onPress={handlePress} />,
    [handlePress],
  );

  const keyExtractor = useCallback((item: Trick) => item.id, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-textDim">Loading tricks...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <FlashList
        data={tricks}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={COLUMN_COUNT}
        contentContainerStyle={{ padding: GAP, paddingTop: 0, paddingBottom: 40 }}
        {...({ estimatedItemSize: ITEM_WIDTH } as Record<string, unknown>)}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          headerTitle ? <NeonBadge title={headerTitle} /> : null
        }
      />

      <TrickDetailModal
        visible={modalVisible}
        trick={selectedTrick}
        onClose={() => setModalVisible(false)}
        onAddToInProgress={onAddProcess}
        allowCompletion={allowCompletion}
        onPrerequisitePress={(trickName) => {
          const target = tricks.find((t) => t.name === trickName);
          if (target) {
            setSelectedTrick(target);
          }
        }}
      />
    </View>
  );
}
