import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import AddTrickModal from '@/components/AddTrickModal';
import TrickGrid from '@/components/TrickGrid';
import { COLORS } from '@/constants/AppTheme';
import { useAuth } from '@/context/AuthContext';
import { useTrickStore } from '@/store/trickStore';
import { Trick, TrickCategory } from '@/types';

const CATEGORIES: (TrickCategory | 'All')[] = ['All', 'Flip', 'Grind', 'Slide', 'Transition'];
const SORT_OPTIONS = [
    { label: 'Name (A-Z)', value: 'name_asc' },
    { label: 'Points (High-Low)', value: 'points_desc' },
    { label: 'Points (Low-High)', value: 'points_asc' },
    { label: 'Difficulty (Easy-Adv)', value: 'difficulty_asc' },
];

export default function AllTricksScreen() {
  const { user } = useAuth();
  const tricks = useTrickStore((state) => state.tricks);
  const loading = useTrickStore((state) => state.loading);
  const updateTrickStatus = useTrickStore((state) => state.updateTrickStatus);
  const addTrick = useTrickStore((state) => state.addTrick);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TrickCategory | 'All'>('All');
  const [sortOption, setSortOption] = useState<string>('name_asc');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const handleAddProcess = (trick: Trick) => {
    if (!user) return;
    if (trick.status === 'NOT_STARTED') {
        updateTrickStatus(user.uid, trick.id, 'IN_PROGRESS');
    }
  };

  const filteredTricks = useMemo(() => {
     let result = [...tricks];

     // 1. Text Search
     if (searchQuery) {
         const q = searchQuery.toLowerCase();
         result = result.filter(t => t.name.toLowerCase().includes(q));
     }

     // 2. Category Filter
     if (selectedCategory !== 'All') {
         result = result.filter(t => t.category === selectedCategory);
     }

     // 3. Sorting
     result.sort((a, b) => {
         switch (sortOption) {
             case 'name_asc':
                 return a.name.localeCompare(b.name);
             case 'points_desc':
                 return b.points - a.points;
             case 'points_asc':
                 return a.points - b.points;
             case 'difficulty_asc':
                 const diffOrder = { 'Easy': 1, 'Intermediate': 2, 'Advanced': 3 };
                 return diffOrder[a.difficulty] - diffOrder[b.difficulty];
             default:
                 return 0;
         }
     });

     return result;
  }, [tricks, searchQuery, selectedCategory, sortOption]);

  const activeSortLabel = SORT_OPTIONS.find(o => o.value === sortOption)?.label;

  return (
    <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
            <View style={styles.titleRow}>
                <View style={styles.neonTitleContainer}>
                    <Text style={styles.neonTitle}>TRICK LIBRARY</Text>
                </View>
                <Text style={styles.subtitle}>Select a trick to start learning</Text>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={COLORS.secondary} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search tricks..."
                    placeholderTextColor={COLORS.textDim}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                     <TouchableOpacity onPress={() => setSearchQuery('')}>
                         <Ionicons name="close-circle" size={20} color={COLORS.textDim} />
                     </TouchableOpacity>
                )}
            </View>

            {/* Filters Row */}
            <View style={styles.filtersRow}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
                    {CATEGORIES.map(cat => (
                        <TouchableOpacity
                            key={cat}
                            style={[
                                styles.categoryChip,
                                selectedCategory === cat && styles.categoryChipActive
                            ]}
                            onPress={() => setSelectedCategory(cat)}
                        >
                            <Text style={[
                                styles.categoryText,
                                selectedCategory === cat && styles.categoryTextActive
                            ]}>
                                {cat}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Sort Button */}
                <TouchableOpacity
                    style={styles.sortButton}
                    onPress={() => setShowSortMenu(!showSortMenu)}
                >
                    <Ionicons name="filter" size={18} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            {/* Sort Menu (Simple Toggle View for now) */}
            {showSortMenu && (
                <View style={styles.sortMenu}>
                    <Text style={styles.sortMenuTitle}>Sort By:</Text>
                    {SORT_OPTIONS.map(opt => (
                        <TouchableOpacity
                            key={opt.value}
                            style={[
                                styles.sortOption,
                                sortOption === opt.value && styles.sortOptionActive
                            ]}
                            onPress={() => {
                                setSortOption(opt.value);
                                setShowSortMenu(false);
                            }}
                        >
                            <Text style={[
                                styles.sortOptionText,
                                sortOption === opt.value && styles.sortOptionTextActive
                            ]}>
                                {opt.label}
                            </Text>
                            {sortOption === opt.value && <Ionicons name="checkmark" size={16} color={COLORS.background} />}
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>

        <TrickGrid
            tricks={filteredTricks}
            onAddProcess={handleAddProcess}
            loading={loading}
            // Remove internal header since we have a custom one now
        />

        {/* Floating Action Button */}
        <TouchableOpacity
            style={styles.fab}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.8}
        >
            <Ionicons name="add" size={32} color={COLORS.background} />
        </TouchableOpacity>

        {/* Add Trick Modal */}
        <AddTrickModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            onAddTrick={(trick) => user ? addTrick(user.uid, trick) : Promise.reject('No User')}
        />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      backgroundColor: COLORS.background,
  },
  header: {
      paddingTop: 60, // Safe Area
      paddingBottom: 20,
      paddingHorizontal: 16,
      backgroundColor: COLORS.background,
      zIndex: 10,
  },
  titleRow: {
      alignItems: 'center',
      marginBottom: 20,
  },
  neonTitleContainer: {
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 16,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.4)',
    marginBottom: 8,
  },
  neonTitle: {
    color: '#CCFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
    textShadowColor: COLORS.secondary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    color: COLORS.textDim,
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#1E1E30',
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
      marginBottom: 16,
  },
  searchIcon: {
      marginRight: 8,
  },
  searchInput: {
      flex: 1,
      color: COLORS.text,
      fontSize: 16,
  },
  filtersRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
  },
  categoryScroll: {
      gap: 8,
      paddingRight: 16,
  },
  categoryChip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.05)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
  },
  categoryChipActive: {
      backgroundColor: 'rgba(255, 0, 255, 0.15)',
      borderColor: COLORS.primary,
  },
  categoryText: {
      color: COLORS.textDim,
      fontWeight: '600',
      fontSize: 13,
  },
  categoryTextActive: {
      color: COLORS.primary,
      fontWeight: 'bold',
      textShadowColor: COLORS.primary,
      textShadowRadius: 5,
  },
  sortButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.05)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
      alignItems: 'center',
      justifyContent: 'center',
  },
  sortMenu: {
      position: 'absolute',
      top: 180, // Adjust based on header height
      right: 16,
      width: 200,
      backgroundColor: '#1E1E30',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: COLORS.secondary,
      padding: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 12,
      elevation: 10,
      zIndex: 100,
  },
  sortMenuTitle: {
      color: COLORS.textDim,
      fontSize: 12,
      fontWeight: 'bold',
      marginBottom: 8,
      textTransform: 'uppercase',
  },
  sortOption: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 8,
  },
  sortOptionActive: {
      backgroundColor: COLORS.secondary,
  },
  sortOptionText: {
      color: COLORS.text,
      fontSize: 14,
  },
  sortOptionTextActive: {
      color: COLORS.background,
      fontWeight: 'bold',
  },
  fab: {
      position: 'absolute',
      bottom: 24,
      right: 24,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: COLORS.secondary,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: COLORS.secondary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 8,
      zIndex: 20,
  },
});
