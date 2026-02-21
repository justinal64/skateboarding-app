import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';

import AddTrickModal from '@/components/AddTrickModal';
import TrickDirectory from '@/components/TrickDirectory';
import { COLORS } from '@/constants/AppTheme';
import { useAuth } from '@/context/AuthContext';
import { useTrickStore } from '@/store/trickStore';
import { Trick } from '@/types';

export default function AllTricksScreen() {
  const { user } = useAuth();
  const tricks = useTrickStore((state) => state.tricks);
  const loading = useTrickStore((state) => state.loading);
  const updateTrickStatus = useTrickStore((state) => state.updateTrickStatus);
  const addTrick = useTrickStore((state) => state.addTrick);

  const [modalVisible, setModalVisible] = useState(false);

  const handleAddProcess = (trick: Trick) => {
    if (!user) return;
    if (trick.status === 'NOT_STARTED') {
      updateTrickStatus(user.uid, trick.id, 'IN_PROGRESS');
    }
  };

  return (
    <View className="flex-1 bg-background">
      <TrickDirectory
        tricks={tricks}
        onAddProcess={handleAddProcess}
        loading={loading}
        title="TRICK LIBRARY"
        subtitle="Select a trick to start learning"
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
        onAddTrick={(trick) =>
          user ? addTrick(user.uid, trick) : Promise.reject('No User')
        }
      />
    </View>
  );
}
