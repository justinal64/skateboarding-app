import React, { useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import NeonBadge from '@/components/NeonBadge';
import TrickGrid from '@/components/TrickGrid';
import { COLORS, neonGlow, textGlow } from '@/constants/AppTheme';
import { Trick, TrickCategory } from '@/types';

const CATEGORIES: (TrickCategory | 'All')[] = ['All', 'Basics', 'Flip', 'Grind', 'Slide', 'Transition'];

const SORT_OPTIONS = [
  { label: 'Name (A-Z)', value: 'name_asc' },
  { label: 'Points (High-Low)', value: 'points_desc' },
  { label: 'Points (Low-High)', value: 'points_asc' },
  { label: 'Difficulty (Easy-Adv)', value: 'difficulty_asc' },
] as const;

const DIFFICULTY_ORDER: Record<string, number> = {
  Easy: 1,
  Intermediate: 2,
  Advanced: 3,
};

type TrickDirectoryProps = {
  tricks: Trick[];
  onAddProcess: (trick: Trick) => void;
  onRemoveFromProgress?: (trick: Trick) => void | Promise<void>;
  loading?: boolean;
  title?: string;
  subtitle?: string;
  allowCompletion?: boolean;
};

export default function TrickDirectory({
  tricks,
  onAddProcess,
  onRemoveFromProgress,
  loading,
  title = 'TRICK LIBRARY',
  subtitle,
  allowCompletion = false,
}: TrickDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TrickCategory | 'All'>('All');
  const [sortOption, setSortOption] = useState('name_asc');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const filteredTricks = useMemo(() => {
    let result = [...tricks];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((t) => t.name.toLowerCase().includes(q));
    }

    if (selectedCategory !== 'All') {
      result = result.filter((t) => t.category === selectedCategory);
    }

    result.sort((a, b) => {
      switch (sortOption) {
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'points_desc':
          return b.points - a.points;
        case 'points_asc':
          return a.points - b.points;
        case 'difficulty_asc':
          return (DIFFICULTY_ORDER[a.difficulty] ?? 0) - (DIFFICULTY_ORDER[b.difficulty] ?? 0);
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
        <NeonBadge title={title} subtitle={subtitle} />

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
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingRight: 16 }}
          >
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                className={`px-3.5 py-2 rounded-full border ${
                  selectedCategory === cat
                    ? 'bg-primary/15 border-primary'
                    : 'bg-white/5 border-white/10'
                }`}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text
                  className={`text-[13px] ${
                    selectedCategory === cat
                      ? 'text-primary font-bold'
                      : 'text-textDim font-semibold'
                  }`}
                  style={selectedCategory === cat ? textGlow(COLORS.primary, 5) : undefined}
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

        {/* Sort Menu */}
        {showSortMenu && (
          <View
            className="absolute top-[180px] right-4 w-[200px] bg-[#1E1E30] rounded-2xl border border-secondary p-3 z-50 shadow-xl"
            style={neonGlow('rgba(0,0,0,0.5)', 12)}
          >
            <Text className="text-textDim text-xs font-bold mb-2 uppercase">
              Sort By:
            </Text>
            {SORT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                className={`flex-row items-center justify-between py-2.5 px-3 rounded-lg ${
                  sortOption === opt.value ? 'bg-secondary' : ''
                }`}
                onPress={() => {
                  setSortOption(opt.value);
                  setShowSortMenu(false);
                }}
              >
                <Text
                  className={`text-sm ${
                    sortOption === opt.value
                      ? 'text-background font-bold'
                      : 'text-text'
                  }`}
                >
                  {opt.label}
                </Text>
                {sortOption === opt.value && (
                  <Ionicons name="checkmark" size={16} color={COLORS.background} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <TrickGrid
        tricks={filteredTricks}
        onAddProcess={onAddProcess}
        onRemoveFromProgress={onRemoveFromProgress}
        loading={loading}
        allowCompletion={allowCompletion}
      />
    </View>
  );
}
