import React, { useEffect, useState } from 'react';
import { Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { COLORS, neonGlow, textGlow } from '@/constants/AppTheme';
import { Trick } from '@/types';

type Props = {
  visible: boolean;
  trick: Trick | null;
  onClose: () => void;
  onSave: (attempts: number, note: string) => Promise<void>;
};

export default function LogSessionModal({ visible, trick, onClose, onSave }: Props) {
  const [attempts, setAttempts] = useState(1);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  // Reset form each time the modal opens
  useEffect(() => {
    if (visible) {
      setAttempts(1);
      setNote('');
    }
  }, [visible]);

  if (!trick) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(attempts, note);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/70">
        <TouchableOpacity className="absolute inset-0" activeOpacity={1} onPress={onClose} />

        <View
          className="bg-[#0D0D25] rounded-t-[30px] w-full overflow-hidden border border-secondary/20 px-6 pt-6 pb-10"
          style={neonGlow('rgba(0, 255, 255, 0.25)', 16)}
        >
          {/* Header */}
          <View className="flex-row justify-between items-start mb-8">
            <View className="flex-1 mr-4">
              <Text className="text-textDim text-[10px] font-black uppercase tracking-widest mb-1">
                Log Session
              </Text>
              <Text
                className="text-white font-black text-2xl tracking-wide"
                style={textGlow('#FFFFFF', 4)}
                numberOfLines={1}
              >
                {trick.name.toUpperCase()}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              accessibilityLabel="Close"
              accessibilityRole="button"
            >
              <Ionicons name="close-circle" size={28} color={COLORS.textDim} />
            </TouchableOpacity>
          </View>

          {/* Attempts stepper */}
          <Text className="text-textDim text-[10px] font-black uppercase tracking-widest mb-4">
            Attempts
          </Text>
          <View className="flex-row items-center mb-8 gap-5">
            <TouchableOpacity
              className="w-12 h-12 rounded-full border border-white/20 items-center justify-center bg-white/5"
              onPress={() => setAttempts(Math.max(1, attempts - 1))}
              accessibilityLabel="Decrease attempts"
              accessibilityRole="button"
            >
              <Ionicons name="remove" size={22} color={COLORS.text} />
            </TouchableOpacity>

            <Text
              className="text-white font-black text-5xl w-20 text-center"
              style={textGlow('#FFFFFF', 6)}
            >
              {attempts}
            </Text>

            <TouchableOpacity
              className="w-12 h-12 rounded-full border border-white/20 items-center justify-center bg-white/5"
              onPress={() => setAttempts(attempts + 1)}
              accessibilityLabel="Increase attempts"
              accessibilityRole="button"
            >
              <Ionicons name="add" size={22} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          {/* Note */}
          <Text className="text-textDim text-[10px] font-black uppercase tracking-widest mb-3">
            Notes (optional)
          </Text>
          <TextInput
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-text text-sm mb-8"
            placeholder="What worked? What didn't?"
            placeholderTextColor={COLORS.textDim}
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            returnKeyType="done"
            blurOnSubmit
          />

          {/* Save */}
          <TouchableOpacity
            disabled={saving}
            onPress={handleSave}
            style={[neonGlow('rgba(0, 255, 255, 0.4)', 10), saving && { opacity: 0.5 }]}
            accessibilityLabel="Save session"
            accessibilityRole="button"
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="py-5 rounded-xl items-center justify-center border border-white/20"
            >
              <Text className="text-white text-base font-bold uppercase tracking-widest">
                {saving ? 'Saving…' : 'Save Session'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
