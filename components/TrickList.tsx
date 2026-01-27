import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import React, { memo, useCallback } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
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
import { getTrickImage } from '@/utils/mockImages';
import { Image } from 'expo-image';

const TrickCard = memo(({ item, onPress }: { item: Trick; onPress: (trick: Trick) => void }) => {
    const imageUrl = item.imageUrl || getTrickImage(item.id);

    return (
      <Pressable onPress={() => onPress(item)}>
        <View
            className={`bg-card rounded-xl overflow-hidden mb-4 border ${item.status === 'IN_PROGRESS' ? 'border-primary' : 'border-secondary'}`}
            // @ts-ignore
            style={{ boxShadow: item.status === 'IN_PROGRESS' ? `0px 0px 5px ${COLORS.primary}` : `0px 0px 5px rgba(0, 255, 255, 0.3)` }}
        >
            <View className="flex-row">
                 {/* Image Section */}
                 <View className="w-24 h-24 bg-black/50">
                     <Image
                        source={{ uri: imageUrl }}
                        style={{ width: '100%', height: '100%' }}
                        contentFit="cover"
                        transition={300}
                     />
                 </View>

                 {/* Content Section */}
                 <View className="flex-1 p-3 justify-center">
                    <View className="flex-row items-center justify-between mb-1">
                        <Text
                            className="text-lg font-bold text-text"
                            // @ts-ignore
                            style={{ textShadow: { width: 0, height: 0, color: COLORS.secondary, radius: 5 } }}
                            numberOfLines={1}
                        >{item.name}</Text>
                        {/* Status Icon */}
                         {item.status === 'COMPLETED' && (
                            <View className="w-5 h-5 border border-success rounded items-center justify-center bg-success/20">
                               <Text className="text-success text-xs font-bold">✓</Text>
                            </View>
                        )}
                        {item.status === 'IN_PROGRESS' && (
                             <Ionicons name="time" size={18} color={COLORS.primary} />
                        )}
                    </View>

                    <Text className="text-xs text-textDim mb-1" numberOfLines={2}>{item.description}</Text>

                    <View className="flex-row items-center gap-2 mt-1">
                        <View className={`w-2 h-2 rounded-full ${item.status === 'COMPLETED' ? 'bg-success' : item.status === 'IN_PROGRESS' ? 'bg-primary' : 'bg-secondary'}`} />
                        <Text className="text-[10px] text-textDim uppercase font-bold">{item.difficulty}</Text>
                    </View>
                 </View>
            </View>
        </View>
      </Pressable>
    );
});

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
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text className="text-primary mt-4 font-bold tracking-widest">LOADING TRICKS...</Text>
      </View>
    );
  }

  const DefaultHeader = () => (
     headerTitle ? (
        <View className="items-center mb-6 mt-2">
            <View
                className="border-2 border-secondary rounded-xl py-2 px-6 bg-transparent"
                // @ts-ignore
                style={{ boxShadow: `0px 0px 10px ${COLORS.secondary}` }}
            >
                <Text
                    className="text-[#CCFFFF] text-base font-bold uppercase tracking-[1.5px]"
                    // @ts-ignore
                    style={{ textShadow: { width: 0, height: 0, color: COLORS.secondary, radius: 10 } }}
                >{headerTitle}</Text>
            </View>
        </View>
     ) : null
  );

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <FlashList
        data={tricks}
        keyExtractor={keyExtractor}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        ListHeaderComponent={ListHeaderComponent || (headerTitle ? DefaultHeader : null)}
        renderItem={renderItem}
        // @ts-ignore
        estimatedItemSize={120}
      />
    </View>
  );
}
