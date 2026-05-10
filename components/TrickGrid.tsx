import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';

import FeaturedTrickCard from '@/components/FeaturedTrickCard';
import TrickDetailModal from '@/components/TrickDetailModal';
import TrickListItem from '@/components/TrickListItem';
import { COLORS } from '@/constants/AppTheme';
import { Trick } from '@/types';

type TrickGridProps = {
  tricks: Trick[];
  onAddProcess: (trick: Trick) => void;
  onRemoveFromProgress?: (trick: Trick) => void | Promise<void>;
  onComplete?: (trick: Trick) => void;
  loading?: boolean;
  allowCompletion?: boolean;
  emptyMessage?: string;
  emptySubtitle?: string;
};

export default function TrickGrid({
  tricks,
  onAddProcess,
  onRemoveFromProgress,
  onComplete,
  loading,
  allowCompletion = false,
  emptyMessage = 'No tricks found',
  emptySubtitle,
}: TrickGridProps) {
  const [selectedTrick, setSelectedTrick] = useState<Trick | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

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

  const handleLandedIt = useCallback(
    (trick: Trick) => {
      onComplete?.(trick);
    },
    [onComplete],
  );

  const featuredTrick = tricks.find((t) => t.status === 'IN_PROGRESS') ?? null;
  const listTricks = featuredTrick ? tricks.filter((t) => t.id !== featuredTrick.id) : tricks;

  const renderItem = useCallback(
    ({ item, index }: { item: Trick; index: number }) => (
      <TrickListItem trick={item} index={index + 1} onPress={handlePress} />
    ),
    [handlePress],
  );

  const keyExtractor = useCallback((item: Trick) => item.id, []);

  const ListHeader = featuredTrick ? (
    <View>
      <FeaturedTrickCard
        trick={featuredTrick}
        onLogSession={handlePress}
        onLandedIt={handleLandedIt}
      />
      {listTricks.length > 0 && (
        <View className="flex-row items-center gap-3 px-4 mb-3">
          <Text className="text-secondary font-black text-xs tracking-widest uppercase">
            Up Next
          </Text>
          <View className="flex-1 h-px bg-secondary/30" />
        </View>
      )}
    </View>
  ) : null;

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
        data={listTricks}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        {...({ estimatedItemSize: 65 } as Record<string, unknown>)}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          !featuredTrick ? (
            <View className="flex-1 items-center justify-center py-24 px-8">
              <Ionicons name="flash-outline" size={56} color={COLORS.textDim} style={{ opacity: 0.35 }} />
              <Text className="text-textDim text-base font-bold mt-5 text-center tracking-wide">
                {emptyMessage}
              </Text>
              {emptySubtitle && (
                <Text className="text-textDim/60 text-sm mt-2 text-center leading-5">
                  {emptySubtitle}
                </Text>
              )}
            </View>
          ) : null
        }
      />

      <TrickDetailModal
        visible={modalVisible}
        trick={selectedTrick}
        onClose={() => setModalVisible(false)}
        onAddToInProgress={async (trick) => {
          if (trick.status === 'NOT_STARTED' && trick.prerequisites.length > 0) {
            const unmet = trick.prerequisites.filter((name) => {
              const prereq = tricks.find((t) => t.name === name);
              return !prereq || prereq.status !== 'COMPLETED';
            });
            if (unmet.length > 0) {
              Alert.alert(
                'Prerequisites Needed',
                `Complete these tricks first:\n${unmet.map((n) => `• ${n}`).join('\n')}`,
              );
              return;
            }
          }
          await onAddProcess(trick);
          setModalVisible(false);
        }}
        onRemoveFromProgress={
          onRemoveFromProgress
            ? async (trick) => {
                await onRemoveFromProgress(trick);
                setModalVisible(false);
              }
            : undefined
        }
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
