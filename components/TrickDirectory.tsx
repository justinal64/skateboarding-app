import TrickGrid from '@/components/TrickGrid';
import { COLORS } from '@/constants/AppTheme';
import { Trick } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

const CATEGORIES: (any | 'All')[] = ['All', 'Basics', 'Flip', 'Grind', 'Slide', 'Transition'];
const SORT_OPTIONS = [
    { label: 'Name (A-Z)', value: 'name_asc' },
    { label: 'Points (High-Low)', value: 'points_desc' },
    { label: 'Points (Low-High)', value: 'points_asc' },
    { label: 'Difficulty (Easy-Adv)', value: 'difficulty_asc' },
];

type TrickDirectoryProps = {
    tricks: Trick[];
    onAddProcess: (trick: Trick) => void;
    loading?: boolean;
    title?: string;
    subtitle?: string;
    allowCompletion?: boolean;
};

export default function TrickDirectory({ tricks, onAddProcess, loading, title = "TRICK LIBRARY", subtitle, allowCompletion = false }: TrickDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<any | 'All'>('All');
  const [sortOption, setSortOption] = useState<string>('name_asc');
  const [showSortMenu, setShowSortMenu] = useState(false);

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
                 return (diffOrder[a.difficulty as keyof typeof diffOrder] || 0) - (diffOrder[b.difficulty as keyof typeof diffOrder] || 0);
             default:
                 return 0;
         }
     });

     return result;
  }, [tricks, searchQuery, selectedCategory, sortOption]);

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
                    >{title}</Text>
                </View>
                {subtitle && <Text className="text-textDim text-sm font-medium tracking-[0.5px]">{subtitle}</Text>}
            </View>

            {/* Search Bar */}
            <View className="flex-row items-center bg-[#1E1E30] rounded-xl px-3 py-2.5 mb-4 border border-white/10">
                <Ionicons name="search" size={20} color={COLORS.secondary} className="mr-2" />
                <TextInput
                    className="flex-1 text-text text-base font-medium"
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
            <View className="flex-row items-center gap-3">
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 16 }}>
                    {CATEGORIES.map(cat => (
                        <TouchableOpacity
                            key={cat}
                            className={`px-3.5 py-2 rounded-full border ${selectedCategory === cat ? 'bg-primary/15 border-primary' : 'bg-white/5 border-white/10'}`}
                            onPress={() => setSelectedCategory(cat)}
                        >
                            <Text
                                className={`text-[13px] ${selectedCategory === cat ? 'text-primary font-bold' : 'text-textDim font-semibold'}`}
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
                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 items-center justify-center"
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
                    <Text className="text-textDim text-xs font-bold mb-2 uppercase">Sort By:</Text>
                    {SORT_OPTIONS.map(opt => (
                        <TouchableOpacity
                            key={opt.value}
                            className={`flex-row items-center justify-between py-2.5 px-3 rounded-lg ${sortOption === opt.value ? 'bg-secondary' : ''}`}
                            onPress={() => {
                                setSortOption(opt.value);
                                setShowSortMenu(false);
                            }}
                        >
                            <Text
                                className={`text-sm ${sortOption === opt.value ? 'text-background font-bold' : 'text-text'}`}
                            >
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
            onAddProcess={onAddProcess}
            loading={loading}
            allowCompletion={allowCompletion}
        />
    </View>
  );
}
