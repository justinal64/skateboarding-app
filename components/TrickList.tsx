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
const TrickCard = memo(({ item, onPress }: { item: Trick; onPress: (trick: Trick) => void }) => (
  <Pressable onPress={() => onPress(item)}>
    <View
        className={`bg-card rounded-xl p-4 mb-4 border flex-row items-center ${item.status === 'IN_PROGRESS' ? 'border-primary' : 'border-secondary'}`}
        // @ts-ignore
        style={{ boxShadow: item.status === 'IN_PROGRESS' ? `0px 0px 5px ${COLORS.primary}` : `0px 0px 5px rgba(0, 255, 255, 0.3)` }}
    >
        <View
            className={`w-2 h-2 rounded-full ${item.status === 'COMPLETED' ? 'bg-success' : item.status === 'IN_PROGRESS' ? 'bg-primary' : 'bg-secondary'}`}
            // @ts-ignore
            style={{ boxShadow: `0px 0px 4px ${item.status === 'COMPLETED' ? COLORS.success : item.status === 'IN_PROGRESS' ? COLORS.primary : COLORS.secondary}` }}
        />
        <View className="flex-1 ml-3">
            <Text
                className="text-lg font-bold text-text mb-1"
                // @ts-ignore
                style={{ textShadow: `0px 0px 5px ${COLORS.secondary}` }}
            >{item.name}</Text>
            <Text className="text-sm text-textDim">{item.description}</Text>
        </View>

        {item.status === 'COMPLETED' && (
            <View className="w-6 h-6 border-2 border-success rounded items-center justify-center ml-2">
               <Text className="text-success text-base font-bold -mt-0.5">✓</Text>
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
                    style={{ textShadow: `0px 0px 10px ${COLORS.secondary}` }}
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
