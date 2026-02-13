import { COLORS } from '@/constants/AppTheme';
import { Trick } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import React, { memo, useCallback, useState } from 'react';
import { Dimensions, Text, TouchableOpacity, View } from 'react-native';
import TrickCardContent from './TrickCardContent';
import TrickDetailModal from './TrickDetailModal';

const { width } = Dimensions.get('window');
const GAP = 12;
const MIN_ITEM_WIDTH = 150;

// Calculate max columns that fit
// Content has padding GAP (12) on both sides. width - 24.
const availableListWidth = width - (GAP * 2);
const numColumnsRaw = Math.floor((availableListWidth + GAP) / (MIN_ITEM_WIDTH + GAP));
const COLUMN_COUNT = Math.max(1, numColumnsRaw);

// Calculate exact item width to fill the space
// Total Width = (ItemWidth * Cols) + (Gap * (Cols - 1))
// ItemWidth * Cols = Total Width - (Gap * (Cols - 1))
// ItemWidth = (Total Width - (Gap * (Cols - 1))) / Cols
const ITEM_WIDTH = (availableListWidth - (GAP * (COLUMN_COUNT - 1))) / COLUMN_COUNT;

type TrickGridProps = {
  tricks: Trick[];
  onAddProcess: (trick: Trick) => void;
  loading?: boolean;
  headerTitle?: string;
  allowCompletion?: boolean;
};

// Memoized Grid Item
const TrickGridItem = memo(({ item, onPress }: { item: Trick, onPress: (trick: Trick) => void }) => {
    return (
      <TouchableOpacity
        className="rounded-xl overflow-hidden bg-[#1E1E1E] relative border border-white/10"
        style={{ width: ITEM_WIDTH, height: ITEM_WIDTH, marginBottom: GAP }}
        onPress={() => onPress(item)}
        activeOpacity={0.8}
      >
        <View className="flex-1 w-full h-full bg-[#1E1E1E]">
            <TrickCardContent trick={item} size={ITEM_WIDTH} />
        </View>

        {/* Status Indicator */}
        {item.status !== 'NOT_STARTED' && (
            <View className="absolute top-2 right-2 bg-black/60 rounded-xl p-0.5">
                {item.status === 'COMPLETED' ? (
                     <View className="w-6 h-6 border-2 border-success rounded items-center justify-center bg-black/50">
                        <Text className="text-success text-base font-bold -mt-0.5">✓</Text>
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

  // Keep selectedTrick in sync with tricks prop updates
  React.useEffect(() => {
    if (selectedTrick) {
        const updatedTrick = tricks.find(t => t.id === selectedTrick.id);
        if (updatedTrick && updatedTrick !== selectedTrick) {
            setSelectedTrick(updatedTrick);
        }
    }
  }, [tricks]);

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
        // @ts-ignore
        estimatedItemSize={ITEM_WIDTH}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
            headerTitle ? (
                <View className="items-center mb-6 mt-2">
                    <View
                        className="border-2 border-secondary rounded-xl py-2 px-6 bg-black/60"
                        // @ts-ignore
                        style={{ boxShadow: `0px 0px 10px ${COLORS.secondary}` }}
                    >
                        <Text
                            className="text-[#CCFFFF] text-base font-bold uppercase tracking-[1.5px]"
                             // @ts-ignore
                            style={{ textShadow: `0px 0px 10px ${COLORS.secondary}` }}
                        >{headerTitle}</Text>
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
