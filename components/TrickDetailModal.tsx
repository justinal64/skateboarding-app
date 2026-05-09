import React from 'react';
import { Linking, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import TrickCardContent from '@/components/TrickCardContent';
import { COLORS, neonGlow, textGlow } from '@/constants/AppTheme';
import { useTrickStore } from '@/store/trickStore';
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
  const allTricks = useTrickStore((state) => state.tricks);

  if (!trick) return null;

  const unmetPrereqs = trick.prerequisites.filter((name) => {
    const prereq = allTricks.find((t) => t.name === name);
    return !prereq || prereq.status !== 'COMPLETED';
  });
  const hasUnmetPrereqs = trick.status === 'NOT_STARTED' && unmetPrereqs.length > 0;

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
                accessibilityLabel="Close"
                accessibilityRole="button"
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
                    {trick.prerequisites.map((prereqName, i) => {
                      const prereqTrick = allTricks.find((t) => t.name === prereqName);
                      const prereqStatus = prereqTrick?.status ?? 'NOT_STARTED';
                      const isCompleted = prereqStatus === 'COMPLETED';
                      const isInProgress = prereqStatus === 'IN_PROGRESS';
                      return (
                        <TouchableOpacity
                          key={i}
                          className={`px-2.5 py-1.5 rounded-full border flex-row items-center ${
                            isCompleted
                              ? 'bg-success/10 border-success'
                              : isInProgress
                                ? 'bg-primary/10 border-primary'
                                : 'bg-white/5 border-white/20'
                          }`}
                          onPress={() => onPrerequisitePress?.(prereqName)}
                        >
                          <Text
                            className={`font-bold text-xs ${
                              isCompleted ? 'text-success' : isInProgress ? 'text-primary' : 'text-textDim'
                            }`}
                          >
                            {prereqName}
                          </Text>
                          <Ionicons
                            name={isCompleted ? 'checkmark-circle' : isInProgress ? 'time' : 'lock-closed'}
                            size={12}
                            color={isCompleted ? COLORS.success : isInProgress ? COLORS.primary : COLORS.textDim}
                            style={{ marginLeft: 4 }}
                          />
                        </TouchableOpacity>
                      );
                    })}
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

              {/* Action Buttons */}
              <View className="w-full gap-3">
                {trick.status === 'NOT_STARTED' && (
                  <>
                    <TouchableOpacity
                      className="w-full shadow-lg"
                      style={[neonGlow('rgba(255, 0, 255, 0.5)', 10), hasUnmetPrereqs && { opacity: 0.4 }]}
                      disabled={hasUnmetPrereqs}
                      onPress={() => onAddToInProgress(trick)}
                      accessibilityLabel="Start Learning"
                      accessibilityRole="button"
                      accessibilityState={{ disabled: hasUnmetPrereqs }}
                    >
                      <LinearGradient
                        colors={[COLORS.primary, COLORS.secondary]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        className="px-4 py-5 rounded-xl items-center justify-center border border-white/20"
                      >
                        <Text className="text-white text-base font-bold uppercase tracking-widest">
                          Start Learning
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                    {hasUnmetPrereqs && (
                      <Text className="text-textDim text-xs text-center">
                        Complete prerequisites above to unlock
                      </Text>
                    )}
                  </>
                )}

                {trick.status === 'IN_PROGRESS' && allowCompletion && (
                  <TouchableOpacity
                    className="w-full shadow-lg"
                    style={neonGlow('rgba(0, 255, 102, 0.5)', 10)}
                    onPress={() => onAddToInProgress(trick)}
                    accessibilityLabel="Mark as Completed"
                    accessibilityRole="button"
                  >
                    <LinearGradient
                      colors={[COLORS.success, '#00CC66']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      className="px-4 py-5 rounded-xl items-center justify-center border border-white/20"
                    >
                      <Text className="text-white text-base font-bold uppercase tracking-widest">
                        Mark as Completed
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}

                {trick.status === 'IN_PROGRESS' && onRemoveFromProgress && (
                  <TouchableOpacity
                    className="w-full py-3 items-center justify-center"
                    onPress={() => onRemoveFromProgress(trick)}
                    accessibilityLabel="Remove from in progress"
                    accessibilityRole="button"
                  >
                    <Text className="text-textDim text-sm font-bold uppercase tracking-wider">
                      No Longer Learning
                    </Text>
                  </TouchableOpacity>
                )}

                {trick.status === 'COMPLETED' && (
                  <View className="flex-row items-center justify-center gap-2.5 p-4 bg-white/5 rounded-2xl border border-white/10">
                    <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
                    <Text className="text-text text-base font-semibold">
                      You've mastered this trick!
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
