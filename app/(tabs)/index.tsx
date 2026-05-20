import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';

import AddTrickModal from '@/components/AddTrickModal';
import TrickDirectory from '@/components/TrickDirectory';
import { COLORS } from '@/constants/AppTheme';
import { useAuth } from '@/context/AuthContext';
import { useSessionStore } from '@/store/sessionStore';
import { useTrickStore } from '@/store/trickStore';
import { Trick } from '@/types';

export default function AllTricksScreen() {
  const { user } = useAuth();
  const tricks = useTrickStore((state) => state.tricks);
  const loading = useTrickStore((state) => state.loading);
  const updateTrickStatus = useTrickStore((state) => state.updateTrickStatus);
  const addTrick = useTrickStore((state) => state.addTrick);
  const logSession = useSessionStore((state) => state.logSession);

  const [modalVisible, setModalVisible] = useState(false);

  const handleAddProcess = (trick: Trick) => {
    if (!user) return;
    if (trick.status === 'NOT_STARTED') {
      updateTrickStatus(user.uid, trick.id, 'IN_PROGRESS');
    }
  };

  const handleComplete = (trick: Trick) => {
    if (!user) return;
    updateTrickStatus(user.uid, trick.id, 'COMPLETED');
  };

  const handleLogSession = async (trick: Trick, attempts: number, note: string) => {
    if (!user) return;
    await logSession(user.uid, trick.id, trick.name, attempts, note);
  };

  return (
    <View className="flex-1 bg-background">
      <TrickDirectory
        tricks={tricks}
        onAddProcess={handleAddProcess}
        onComplete={handleComplete}
        onLogSession={handleLogSession}
        loading={loading}
        title="TRICK LIBRARY"
        showFeaturedCard={false}
        listLabel="ALL TRICKS"
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-secondary items-center justify-center shadow-lg z-20"
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={32} color={COLORS.background} />
      </TouchableOpacity>

      {/* Add Trick Modal */}
      <AddTrickModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAddTrick={(trick) => (user ? addTrick(user.uid, trick) : Promise.reject('No User'))}
      />
    </View>
  );
}
