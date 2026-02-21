import React, { useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { COLORS, neonGlow } from '@/constants/AppTheme';
import { TrickCategory, TrickDifficulty, TrickMeta } from '@/types';

type AddTrickModalProps = {
  visible: boolean;
  onClose: () => void;
  onAddTrick: (trick: Omit<TrickMeta, 'id'>) => Promise<void>;
};

const DIFFICULTIES: TrickDifficulty[] = ['Easy', 'Intermediate', 'Advanced'];
const CATEGORIES: TrickCategory[] = ['Basics', 'Flip', 'Grind', 'Slide', 'Transition'];

export default function AddTrickModal({ visible, onClose, onAddTrick }: AddTrickModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<TrickDifficulty>('Easy');
  const [category, setCategory] = useState<TrickCategory>('Basics');
  const [points, setPoints] = useState('10');
  const [videoUrl, setVideoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const resetForm = () => {
    setName('');
    setDescription('');
    setDifficulty('Easy');
    setCategory('Basics');
    setPoints('10');
    setVideoUrl('');
    setError('');
  };

  const handleSubmit = async () => {
    if (!name || !description) {
      setError('Name and description are required.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await onAddTrick({
        name,
        description,
        difficulty,
        category,
        points: parseInt(points, 10) || 10,
        video_url: videoUrl,
        imageUrl: '',
        prerequisites: [],
      });
      resetForm();
      onClose();
    } catch {
      setError('Failed to add trick. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/80 justify-end">
        <View className="bg-[#1E1E1E] rounded-t-3xl h-[90%] p-5 border-t border-secondary">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-5">
            <Text className="text-2xl font-bold text-text">New Trick</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.textDim} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
            {error ? (
              <Text className="text-red-500 mb-2.5 text-sm">{error}</Text>
            ) : null}

            <Text className="text-textDim text-sm font-semibold mb-2 mt-3">Trick Name</Text>
            <TextInput
              className="bg-white/5 rounded-xl border border-white/10 p-3 text-text text-base"
              placeholder="e.g. Kickflip"
              placeholderTextColor={COLORS.textDim}
              value={name}
              onChangeText={setName}
            />

            <Text className="text-textDim text-sm font-semibold mb-2 mt-3">Description</Text>
            <TextInput
              className="bg-white/5 rounded-xl border border-white/10 p-3 text-text text-base h-[100px] align-top"
              placeholder="How do you do it?"
              placeholderTextColor={COLORS.textDim}
              value={description}
              onChangeText={setDescription}
              multiline
            />

            <Text className="text-textDim text-sm font-semibold mb-2 mt-3">Difficulty</Text>
            <View className="flex-row flex-wrap gap-2">
              {DIFFICULTIES.map((diff) => (
                <TouchableOpacity
                  key={diff}
                  className={`px-4 py-2 rounded-xl border ${
                    difficulty === diff
                      ? 'bg-[rgba(0,255,255,0.15)] border-secondary'
                      : 'bg-white/5 border-white/10'
                  }`}
                  onPress={() => setDifficulty(diff)}
                >
                  <Text
                    className={`text-sm ${
                      difficulty === diff
                        ? 'text-secondary font-bold'
                        : 'text-textDim font-medium'
                    }`}
                  >
                    {diff}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text className="text-textDim text-sm font-semibold mb-2 mt-3">Category</Text>
            <View className="flex-row flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  className={`px-4 py-2 rounded-xl border ${
                    category === cat
                      ? 'bg-[rgba(0,255,255,0.15)] border-secondary'
                      : 'bg-white/5 border-white/10'
                  }`}
                  onPress={() => setCategory(cat)}
                >
                  <Text
                    className={`text-sm ${
                      category === cat
                        ? 'text-secondary font-bold'
                        : 'text-textDim font-medium'
                    }`}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text className="text-textDim text-sm font-semibold mb-2 mt-3">Points</Text>
            <TextInput
              className="bg-white/5 rounded-xl border border-white/10 p-3 text-text text-base"
              placeholder="10"
              placeholderTextColor={COLORS.textDim}
              value={points}
              onChangeText={setPoints}
              keyboardType="numeric"
            />

            <Text className="text-textDim text-sm font-semibold mb-2 mt-3">
              Video URL (Optional)
            </Text>
            <TextInput
              className="bg-white/5 rounded-xl border border-white/10 p-3 text-text text-base"
              placeholder="https://..."
              placeholderTextColor={COLORS.textDim}
              value={videoUrl}
              onChangeText={setVideoUrl}
              autoCapitalize="none"
            />
          </ScrollView>

          {/* Footer Buttons */}
          <View className="flex-row gap-3 pt-4 border-t border-white/10">
            <TouchableOpacity
              className="flex-1 py-3.5 rounded-xl bg-white/5 items-center"
              onPress={onClose}
            >
              <Text className="text-textDim font-bold text-base">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-[2] py-3.5 rounded-xl bg-secondary items-center ${
                submitting ? 'opacity-70' : ''
              }`}
              style={neonGlow(COLORS.secondary, 10)}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color={COLORS.background} />
              ) : (
                <Text className="text-background font-bold text-base">
                  Add Trick
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
