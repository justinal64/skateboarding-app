import { COLORS } from '@/constants/AppTheme';
import { Trick } from '@/types';
import { getTrickImage } from '@/utils/mockImages';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
};

export default function TrickGrid({ tricks, onAddProcess, loading, headerTitle }: TrickGridProps) {
  const [selectedTrick, setSelectedTrick] = useState<Trick | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handlePress = (trick: Trick) => {
    setSelectedTrick(trick);
    setModalVisible(true);
  };

  const renderItem = ({ item }: { item: Trick }) => {
    const imageUrl = getTrickImage(item.id);
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handlePress(item)}
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
  };

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
      <FlatList
        data={tricks}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={COLUMN_COUNT}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.columnWrapper}
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
    paddingTop: 100, // Space for header if transparent, or use SafeAreaView
    paddingBottom: 40,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: GAP,
  },
  card: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH * 1.2, // Rectangular portrait aspect
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1E1E1E',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
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
    backgroundColor: 'rgba(0,0,0,0.5)', // Added backing for visibility on images
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
      backgroundColor: 'rgba(0,0,0,0.6)', // Semi-transparent backing for legibility
      borderRadius: 12, // Circular backing
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
