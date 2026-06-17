import React, { useEffect, useRef, useState } from 'react';
import { Linking, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';

import ConfettiOverlay from '@/components/ConfettiOverlay';
import TrickCardContent from '@/components/TrickCardContent';
import { COLORS, neonGlow, textGlow } from '@/constants/AppTheme';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { useTrickStore } from '@/store/trickStore';
import { Session, Trick } from '@/types';

const NOTE_MAX = 500;

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
  const insets = useSafeAreaInsets();
  const allTricks = useTrickStore((state) => state.tricks);
  const saveNote = useTrickStore((state) => state.saveNote);
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);
  const noteSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!visible || !trick || !user) {
      setSessions([]);
      setShowConfetti(false);
      setNoteText('');
      setNoteSaved(false);
      return;
    }
    setNoteText(trick.note ?? '');
    setLoadingSessions(true);
    getDocs(
      query(
        collection(db, 'sessions'),
        where('trickId', '==', trick.id),
        where('userId', '==', user.uid),
        orderBy('date', 'desc'),
      ),
    )
      .then((snap) => setSessions(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Session)))
      .finally(() => setLoadingSessions(false));
  }, [visible, trick, user]);

  if (!trick) return null;

  const unmetPrereqs = trick.prerequisites.filter((name) => {
    const prereq = allTricks.find((t) => t.name === name);
    return !prereq || prereq.status !== 'COMPLETED';
  });
  const hasUnmetPrereqs = trick.status === 'NOT_STARTED' && unmetPrereqs.length > 0;

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/70">
        {/* Backdrop */}
        <TouchableOpacity className="absolute inset-0" activeOpacity={1} onPress={onClose} />

        <View
          className="bg-[#0D0D25] rounded-t-[30px] w-full h-[85%] overflow-hidden border border-secondary/20"
          style={neonGlow('rgba(0, 255, 255, 0.25)', 16)}
        >
          <ConfettiOverlay visible={showConfetti} />
          <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
            {/* Header Image */}
            <View className="relative w-full h-[300px] bg-[#0D0D25] items-center justify-center">
              <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.5 }}>
                <TrickCardContent trick={trick} size={300} showName={false} />
              </View>
              <LinearGradient colors={['transparent', '#0D0D25']} className="absolute inset-0" />
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
                              isCompleted
                                ? 'text-success'
                                : isInProgress
                                  ? 'text-primary'
                                  : 'text-textDim'
                            }`}
                          >
                            {prereqName}
                          </Text>
                          <Ionicons
                            name={
                              isCompleted
                                ? 'checkmark-circle'
                                : isInProgress
                                  ? 'time'
                                  : 'lock-closed'
                            }
                            size={12}
                            color={
                              isCompleted
                                ? COLORS.success
                                : isInProgress
                                  ? COLORS.primary
                                  : COLORS.textDim
                            }
                            style={{ marginLeft: 4 }}
                          />
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              <Text className="text-base text-text leading-6 mb-6">{trick.description}</Text>

              {/* Personal Notes */}
              {trick.status !== 'NOT_STARTED' && (
                <View className="mb-6">
                  <View className="flex-row items-center gap-2 mb-3">
                    <Ionicons name="pencil-outline" size={14} color={COLORS.textDim} />
                    <Text className="text-textDim text-xs font-black uppercase tracking-widest">
                      My Notes
                    </Text>
                    {noteSaved && (
                      <View className="flex-row items-center gap-1 ml-auto">
                        <Ionicons name="checkmark" size={11} color={COLORS.success} />
                        <Text className="text-success text-[10px] font-bold">Saved</Text>
                      </View>
                    )}
                  </View>
                  <TextInput
                    value={noteText}
                    onChangeText={(text) => {
                      if (text.length <= NOTE_MAX) setNoteText(text);
                    }}
                    onBlur={() => {
                      if (!user || !trick) return;
                      if (noteSaveTimer.current) clearTimeout(noteSaveTimer.current);
                      saveNote(user.uid, trick.id, noteText.trim());
                      setNoteSaved(true);
                      noteSaveTimer.current = setTimeout(() => setNoteSaved(false), 2000);
                    }}
                    placeholder="Add a personal note… (e.g. 'lean back more')"
                    placeholderTextColor={COLORS.textDim + '60'}
                    multiline
                    numberOfLines={4}
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.04)',
                      borderWidth: 1,
                      borderColor: 'rgba(255,255,255,0.08)',
                      borderRadius: 12,
                      padding: 14,
                      color: COLORS.text,
                      fontSize: 14,
                      lineHeight: 20,
                      textAlignVertical: 'top',
                      minHeight: 90,
                    }}
                  />
                  {noteText.length > NOTE_MAX * 0.85 && (
                    <Text className="text-textDim/50 text-[10px] text-right mt-1">
                      {noteText.length}/{NOTE_MAX}
                    </Text>
                  )}
                </View>
              )}

              {/* Session History */}
              {trick.status !== 'NOT_STARTED' && (
                <View className="mb-6">
                  <View className="flex-row items-center gap-2 mb-3">
                    <Ionicons name="time-outline" size={14} color={COLORS.textDim} />
                    <Text className="text-textDim text-xs font-black uppercase tracking-widest">
                      Session History
                    </Text>
                    {sessions.length > 0 && (
                      <Text className="text-textDim/50 text-xs font-bold ml-auto">
                        {sessions.length} session{sessions.length !== 1 ? 's' : ''}
                      </Text>
                    )}
                  </View>

                  {loadingSessions ? (
                    <Text className="text-textDim/50 text-sm text-center py-4">Loading…</Text>
                  ) : sessions.length === 0 ? (
                    <View className="bg-white/5 rounded-xl px-4 py-5 items-center border border-white/5">
                      <Text className="text-textDim/60 text-sm text-center">
                        No sessions logged yet
                      </Text>
                    </View>
                  ) : (
                    <View className="gap-2">
                      {sessions.map((session) => {
                        const dateStr = session.date
                          .toDate()
                          .toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          });
                        return (
                          <View
                            key={session.id}
                            className="bg-white/5 rounded-xl px-4 py-3 border border-white/5"
                          >
                            <View className="flex-row items-center justify-between mb-1">
                              <Text className="text-textDim text-xs font-bold">{dateStr}</Text>
                              <View className="flex-row items-center gap-1">
                                <Ionicons
                                  name="refresh-outline"
                                  size={11}
                                  color={COLORS.secondary}
                                />
                                <Text className="text-secondary text-xs font-black">
                                  {session.attempts} attempt{session.attempts !== 1 ? 's' : ''}
                                </Text>
                              </View>
                            </View>
                            {session.note ? (
                              <Text className="text-text/70 text-sm leading-5">{session.note}</Text>
                            ) : null}
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>
              )}

              {/* Video Link */}
              {trick.video_url && (
                <TouchableOpacity
                  className="flex-row items-center gap-2 bg-red-500/10 self-start px-4 py-2.5 rounded-full mb-6 border border-red-500/30"
                  onPress={() => Linking.openURL(trick.video_url)}
                >
                  <Ionicons name="logo-youtube" size={20} color="#FF0000" />
                  <Text className="text-[#FF9999] font-bold text-sm">Watch Tutorial</Text>
                </TouchableOpacity>
              )}

              {/* Action Buttons */}
              <View className="w-full gap-3">
                {trick.status === 'NOT_STARTED' && (
                  <>
                    <TouchableOpacity
                      className="w-full shadow-lg"
                      style={[
                        neonGlow('rgba(255, 0, 255, 0.5)', 10),
                        hasUnmetPrereqs && { opacity: 0.4 },
                      ]}
                      disabled={hasUnmetPrereqs}
                      onPress={() => onAddToInProgress(trick)}
                      accessibilityLabel="Start Learning"
                      accessibilityRole="button"
                      accessibilityState={{ disabled: hasUnmetPrereqs }}
                      testID="start-learning-button"
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
                    onPress={() => {
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                      setShowConfetti(true);
                      setTimeout(() => setShowConfetti(false), 2800);
                      onAddToInProgress(trick);
                    }}
                    accessibilityLabel="Mark as Completed"
                    accessibilityRole="button"
                    testID="mark-completed-button"
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
                      {"You've mastered this trick!"}
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
