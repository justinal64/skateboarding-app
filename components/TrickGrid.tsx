import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';

import FeaturedTrickCard from '@/components/FeaturedTrickCard';
import LogSessionModal from '@/components/LogSessionModal';
import TrickDetailModal from '@/components/TrickDetailModal';
import TrickListItem from '@/components/TrickListItem';
import UnlockedTricksRow from '@/components/UnlockedTricksRow';
import { COLORS, textGlow } from '@/constants/AppTheme';
import { Trick } from '@/types';

const DIFFICULTY_ORDER: Record<string, number> = { Easy: 1, Intermediate: 2, Advanced: 3 };
const DIFFICULTY_COLOR: Record<string, string> = {
  Easy: COLORS.success,
  Intermediate: COLORS.secondary,
  Advanced: '#FF2D78',
};

type DividerItem = { __isDivider: true; difficulty: string; count: number };
type ListItem = Trick | DividerItem;

function isDivider(item: ListItem): item is DividerItem {
  return '__isDivider' in item;
}

type TrickGridProps = {
  tricks: Trick[];
  onAddProcess: (trick: Trick) => void;
  onRemoveFromProgress?: (trick: Trick) => void | Promise<void>;
  onComplete?: (trick: Trick) => void;
  onLogSession?: (trick: Trick, attempts: number, note: string) => Promise<void>;
  loading?: boolean;
  allowCompletion?: boolean;
  emptyMessage?: string;
  emptySubtitle?: string;
  showFeaturedCard?: boolean;
  listLabel?: string;
};

function isLocked(trick: Trick, allTricks: Trick[]): boolean {
  if (trick.status !== 'NOT_STARTED') return false;
  if (trick.prerequisites.length === 0) return false;
  return trick.prerequisites.some((prereqName) => {
    const prereq = allTricks.find((t) => t.name === prereqName);
    return !prereq || prereq.status !== 'COMPLETED';
  });
}

function getLockedByName(trick: Trick, allTricks: Trick[]): string | undefined {
  const unmet = trick.prerequisites.find((prereqName) => {
    const prereq = allTricks.find((t) => t.name === prereqName);
    return !prereq || prereq.status !== 'COMPLETED';
  });
  return unmet;
}

function buildSectionedData(tricks: Trick[]): ListItem[] {
  const sorted = [...tricks].sort(
    (a, b) => (DIFFICULTY_ORDER[a.difficulty] ?? 0) - (DIFFICULTY_ORDER[b.difficulty] ?? 0),
  );
  const result: ListItem[] = [];
  let currentDiff = '';
  sorted.forEach((trick) => {
    if (trick.difficulty !== currentDiff) {
      const count = sorted.filter((t) => t.difficulty === trick.difficulty).length;
      result.push({ __isDivider: true, difficulty: trick.difficulty, count });
      currentDiff = trick.difficulty;
    }
    result.push(trick);
  });
  return result;
}

export default function TrickGrid({
  tricks,
  onAddProcess,
  onRemoveFromProgress,
  onComplete,
  onLogSession,
  loading,
  allowCompletion = false,
  emptyMessage = 'No tricks found',
  emptySubtitle,
  showFeaturedCard = true,
  listLabel = 'UP NEXT',
}: TrickGridProps) {
  const [selectedTrick, setSelectedTrick] = useState<Trick | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [logSessionTrick, setLogSessionTrick] = useState<Trick | null>(null);
  const [logSessionVisible, setLogSessionVisible] = useState(false);

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

  const handleOpenLogSession = useCallback((trick: Trick) => {
    setLogSessionTrick(trick);
    setLogSessionVisible(true);
  }, []);

  const handleLandedIt = useCallback(
    (trick: Trick) => {
      onComplete?.(trick);
    },
    [onComplete],
  );

  const featuredTrick = showFeaturedCard
    ? (tricks
        .filter((t) => t.status === 'IN_PROGRESS')
        .sort(
          (a, b) => (DIFFICULTY_ORDER[a.difficulty] ?? 0) - (DIFFICULTY_ORDER[b.difficulty] ?? 0),
        )[0] ?? null)
    : null;

  const listTricks = featuredTrick ? tricks.filter((t) => t.id !== featuredTrick.id) : tricks;
  const sectionedData = buildSectionedData(listTricks);

  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => {
      if (isDivider(item)) {
        const color = DIFFICULTY_COLOR[item.difficulty] ?? COLORS.secondary;
        return (
          <View className="flex-row items-center gap-3 px-4 pt-5 pb-2">
            <Text
              className="text-[10px] font-black tracking-widest uppercase"
              style={[{ color }, textGlow(color, 4)]}
            >
              {item.difficulty}
            </Text>
            <Text className="text-textDim text-[10px] font-bold" style={{ opacity: 0.5 }}>
              · {item.count}
            </Text>
            <View className="flex-1 h-px" style={{ backgroundColor: `${color}33` }} />
          </View>
        );
      }
      const trick = item as Trick;
      const locked = isLocked(trick, tricks);
      const lockedByName = locked ? getLockedByName(trick, tricks) : undefined;
      return (
        <TrickListItem
          trick={trick}
          index={sectionedData.filter((i) => !isDivider(i)).indexOf(trick) + 1}
          onPress={handlePress}
          isLocked={locked}
          lockedByName={lockedByName}
        />
      );
    },
    [handlePress, tricks, sectionedData],
  );

  const keyExtractor = useCallback((item: ListItem) => {
    if (isDivider(item)) return `divider-${item.difficulty}`;
    return (item as Trick).id;
  }, []);

  const getItemType = useCallback((item: ListItem) => {
    return isDivider(item) ? 'divider' : 'trick';
  }, []);

  const ListHeader = (
    <View>
      {showFeaturedCard && featuredTrick && (
        <FeaturedTrickCard
          trick={featuredTrick}
          onLogSession={handleOpenLogSession}
          onLandedIt={handleLandedIt}
        />
      )}
      <UnlockedTricksRow tricks={tricks} onPress={handlePress} />
      {sectionedData.length > 0 && (
        <View className="flex-row items-center gap-3 px-4 pt-2 pb-1">
          <Text
            className="text-secondary font-black text-xs tracking-widest uppercase"
            style={textGlow(COLORS.secondary, 4)}
          >
            {listLabel}
          </Text>
          <View className="flex-1 h-px bg-secondary/30" />
        </View>
      )}
    </View>
  );

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
        data={sectionedData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemType={getItemType}
        {...({ estimatedItemSize: 60 } as Record<string, unknown>)}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          !featuredTrick ? (
            <View className="flex-1 items-center justify-center py-24 px-8">
              <Ionicons
                name="flash-outline"
                size={56}
                color={COLORS.textDim}
                style={{ opacity: 0.35 }}
              />
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
          if (target) setSelectedTrick(target);
        }}
      />

      <LogSessionModal
        visible={logSessionVisible}
        trick={logSessionTrick}
        onClose={() => setLogSessionVisible(false)}
        onSave={async (attempts, note) => {
          if (onLogSession && logSessionTrick) {
            await onLogSession(logSessionTrick, attempts, note);
          }
          setLogSessionVisible(false);
        }}
      />
    </View>
  );
}
