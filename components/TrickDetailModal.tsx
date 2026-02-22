import React from 'react';
import { Linking, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import TrickCardContent from '@/components/TrickCardContent';
import { COLORS, neonGlow, textGlow } from '@/constants/AppTheme';
import { Trick } from '@/types';

type TrickDetailModalProps = {
  visible: boolean;
  onClose: () => void;
  trick: Trick | null;
  onAddToInProgress: (trick: Trick) => void;
  onRemoveFromProgress?: (trick: Trick) => void;
  onPrerequisitePress?: (trickName: string) => void;
  allowCompletion?: boolean;
};

export default function TrickDetailModal({
  visible,
  onClose,
  trick,
  onAddToInProgress,
  onRemoveFromProgress,
  onPrerequisitePress,
  allowCompletion = false,
}: TrickDetailModalProps) {
  if (!trick) return null;

  const isActionable =
    trick.status === 'NOT_STARTED' ||
    (trick.status === 'IN_PROGRESS' && allowCompletion);

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/70">
        {/* Backdrop */}
        <TouchableOpacity
          className="absolute inset-0"
          activeOpacity={1}
          onPress={onClose}
        />

        <View
          className="bg-[#0D0D25] rounded-t-[30px] w-full h-[85%] overflow-hidden border border-secondary/20"
          style={neonGlow('rgba(0, 255, 255, 0.25)', 16)}
        >
          <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
            {/* Header Image */}
            <View className="relative w-full h-[300px] bg-[#0D0D25] items-center justify-center">
              <View className="opacity-50">
                <TrickCardContent trick={trick} size={300} showName={false} />
              </View>
              <LinearGradient
                colors={['transparent', '#0D0D25']}
                className="absolute inset-0"
              />
              <TouchableOpacity
                className="absolute top-4 right-4 bg-black/30 rounded-full p-1"
                onPress={onClose}
              >
                <Ionicons name="close-circle" size={32} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View className="px-6 -mt-10">
              <Text
                className="text-3xl font-black text-text mb-3"
                style={textGlow(COLORS.secondary, 10)}
              >
                {trick.name}
              </Text>

              {/* Status Chips */}
              <View className="flex-row flex-wrap gap-2 mb-6">
                <View
                  className={`px-3 py-1.5 rounded-full border bg-white/5 ${
                    trick.status === 'IN_PROGRESS'
                      ? 'border-primary'
                      : trick.status === 'COMPLETED'
                        ? 'border-success'
                        : 'border-white/10'
                  }`}
                >
                  <Text
                    className={`text-xs font-bold uppercase tracking-wider ${
                      trick.status === 'IN_PROGRESS'
                        ? 'text-primary'
                        : trick.status === 'COMPLETED'
                          ? 'text-success'
                          : 'text-textDim'
                    }`}
                  >
                    {trick.status.replace('_', ' ')}
                  </Text>
                </View>
                <View className="px-3 py-1.5 rounded-full border border-white/10 bg-white/5">
                  <Text className="text-xs font-bold uppercase tracking-wider text-textDim">
                    {trick.difficulty}
                  </Text>
                </View>
                <View className="px-3 py-1.5 rounded-full border border-white/10 bg-white/5">
                  <Text className="text-xs font-bold uppercase tracking-wider text-textDim">
                    {trick.points} PTS
                  </Text>
                </View>
              </View>

              {/* Prerequisites */}
              {trick.prerequisites.length > 0 && (
                <View className="mb-4">
                  <Text className="text-textDim text-sm font-bold uppercase mb-2">
                    Prerequisites:
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {trick.prerequisites.map((p, i) => (
                      <TouchableOpacity
                        key={i}
                        className="bg-primary/10 px-2.5 py-1.5 rounded-full border border-primary flex-row items-center"
                        onPress={() => onPrerequisitePress?.(p)}
                      >
                        <Text className="text-primary font-bold text-xs">{p}</Text>
                        <Ionicons
                          name="link"
                          size={12}
                          color={COLORS.primary}
                          style={{ marginLeft: 4 }}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              <Text className="text-base text-text leading-6 mb-6">
                {trick.description}
              </Text>

              {/* Video Link */}
              {trick.video_url && (
                <TouchableOpacity
                  className="flex-row items-center gap-2 bg-red-500/10 self-start px-4 py-2.5 rounded-full mb-6 border border-red-500/30"
                  onPress={() => Linking.openURL(trick.video_url)}
                >
                  <Ionicons name="logo-youtube" size={20} color="#FF0000" />
                  <Text className="text-[#FF9999] font-bold text-sm">
                    Watch Tutorial
                  </Text>
                </TouchableOpacity>
              )}

              {/* Action Button */}
              {isActionable ? (
                <View className="w-full gap-3">
                  <TouchableOpacity
                    className="w-full shadow-lg"
                    style={neonGlow('rgba(255, 0, 255, 0.5)', 10)}
                    onPress={() => onAddToInProgress(trick)}
                  >
                    <LinearGradient
                      colors={
                        trick.status === 'IN_PROGRESS'
                          ? [COLORS.success, '#00CC66']
                          : [COLORS.primary, COLORS.secondary]
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      className="px-4 py-5 rounded-xl items-center justify-center border border-white/20"
                    >
                      <Text className="text-white text-base font-bold uppercase tracking-widest">
                        {trick.status === 'IN_PROGRESS'
                          ? 'Mark as Completed'
                          : 'Start Learning'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  {trick.status === 'IN_PROGRESS' && onRemoveFromProgress && (
                    <TouchableOpacity
                      className="w-full py-3 items-center justify-center"
                      onPress={() => onRemoveFromProgress(trick)}
                    >
                      <Text className="text-textDim text-sm font-bold uppercase tracking-wider">
                        No Longer Learning
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <View className="flex-row items-center justify-center gap-2.5 p-4 bg-white/5 rounded-2xl border border-white/10">
                  <Ionicons
                    name={
                      trick.status === 'COMPLETED' ? 'checkmark-circle' : 'time'
                    }
                    size={24}
                    color={
                      trick.status === 'COMPLETED' ? COLORS.success : COLORS.primary
                    }
                  />
                  <Text className="text-text text-base font-semibold">
                    {trick.status === 'COMPLETED'
                      ? "You've mastered this trick!"
                      : 'Currently in progress'}
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
