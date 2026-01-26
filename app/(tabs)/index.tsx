import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

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
    <View className="flex-1 bg-background">
        {/* Header Section */}
        <View className="pt-[60px] pb-5 px-4 bg-background z-10">
            <View className="items-center mb-5">
                <View
                    className="border-2 border-secondary rounded-xl py-1.5 px-4 bg-black/40 mb-2"
                    // @ts-ignore
                    style={{ boxShadow: `0px 0px 8px ${COLORS.secondary}` }}
                >
                    <Text
                        className="text-[#CCFFFF] text-base font-black tracking-widest"
                        // @ts-ignore
                        style={{ textShadow: `0px 0px 10px ${COLORS.secondary}` }}
                    >TRICK LIBRARY</Text>
                </View>
                <Text className="text-textDim text-sm">Select a trick to start learning</Text>
            </View>

            {/* Search Bar */}
            <View className="flex-row items-center bg-card rounded-xl px-4 py-3 mb-5 border border-border">
                <Ionicons name="search" size={20} color={COLORS.secondary} className="mr-2" />
                <TextInput
                    className="flex-1 text-white text-base"
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
            <View className="flex-row items-center mb-5">
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 16 }}>
                    {CATEGORIES.map(cat => (
                        <TouchableOpacity
                            key={cat}
                            className={`px-4 py-2 rounded-full border mr-2 ${selectedCategory === cat ? 'bg-secondary/15 border-secondary' : 'bg-white/5 border-white/10'}`}
                            onPress={() => setSelectedCategory(cat)}
                        >
                            <Text
                                className={`font-medium ${selectedCategory === cat ? 'text-secondary font-bold' : 'text-textDim'}`}
                                // @ts-ignore
                                style={selectedCategory === cat ? { textShadow: `0px 0px 5px ${COLORS.primary}` } : {}}
                            >
                                {cat}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Sort Button */}
                <TouchableOpacity
                    className="w-10 h-10 rounded-full bg-card items-center justify-center border border-border ml-2"
                    onPress={() => setShowSortMenu(!showSortMenu)}
                >
                    <Ionicons name="filter" size={18} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            {/* Sort Menu (Simple Toggle View for now) */}
            {showSortMenu && (
                <View
                    className="absolute top-[180px] right-4 w-[200px] bg-[#1E1E30] rounded-2xl border border-secondary p-3 z-50 shadow-xl"
                    // @ts-ignore
                    style={{ boxShadow: '0px 4px 12px rgba(0,0,0,0.5)' }}
                >
                    <Text className="text-textDim text-sm font-bold mb-2 ml-1">Sort By:</Text>
                    {SORT_OPTIONS.map(opt => (
                        <TouchableOpacity
                            key={opt.value}
                            className={`flex-row items-center justify-between py-3 px-2 rounded-lg ${sortOption === opt.value ? 'bg-white/5' : ''}`}
                            onPress={() => {
                                setSortOption(opt.value);
                                setShowSortMenu(false);
                            }}
                        >
                            <Text className={`${sortOption === opt.value ? 'text-white font-bold' : 'text-textDim'}`}>
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
            className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-secondary items-center justify-center shadow-lg z-20"
            // @ts-ignore
            style={{ boxShadow: `0px 4px 8px rgba(0,0,0,0.5)` }}
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
