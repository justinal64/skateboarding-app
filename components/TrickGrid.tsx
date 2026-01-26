import { COLORS } from '@/constants/AppTheme';
import { Trick } from '@/types';
import { getTrickImage } from '@/utils/mockImages';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo, useCallback, useState } from 'react';
import { Dimensions, Text, TouchableOpacity, View } from 'react-native';
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
        className="rounded-xl overflow-hidden bg-[#1E1E1E] relative border border-white/10"
        style={{ width: ITEM_WIDTH, height: ITEM_WIDTH, marginBottom: GAP }}
        onPress={() => onPress(item)}
        activeOpacity={0.8}
      >
        <Image
            source={{ uri: imageUrl }}
            className="w-full h-full"
            contentFit="cover"
            transition={300}
        />
        <LinearGradient
            colors={['transparent', 'rgba(13, 13, 37, 0.9)']}
            className="absolute left-0 right-0 bottom-0 h-3/5"
        />
        <View className="absolute bottom-3 left-3 right-3">
            <Text
                className="text-lg font-bold text-text"
                style={{ textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 }}
            >{item.name}</Text>
            <Text className="text-[10px] text-primary font-bold mt-1 uppercase" numberOfLines={1}>
                {item.status === 'NOT_STARTED' ? item.difficulty : item.status.replace('_', ' ')}
            </Text>
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
