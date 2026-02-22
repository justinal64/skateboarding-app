import React from 'react';
import { View } from 'react-native';

import TrickDirectory from '@/components/TrickDirectory';
import { useAuth } from '@/context/AuthContext';
import { useTrickStore } from '@/store/trickStore';
import { Trick } from '@/types';

export default function LearningScreen() {
  const { user } = useAuth();
  const tricks = useTrickStore((state) => state.tricks);
  const loading = useTrickStore((state) => state.loading);
  const updateTrickStatus = useTrickStore((state) => state.updateTrickStatus);

  const inProgressTricks = tricks.filter((t) => t.status === 'IN_PROGRESS');

  const handleAddProcess = (trick: Trick) => {
    if (!user) return;
    if (trick.status === 'IN_PROGRESS') {
      updateTrickStatus(user.uid, trick.id, 'COMPLETED');
    } else if (trick.status === 'NOT_STARTED') {
      updateTrickStatus(user.uid, trick.id, 'IN_PROGRESS');
    }
  };

  const handleRemoveFromProgress = (trick: Trick) => {
    if (!user) return;
    if (trick.status === 'IN_PROGRESS') {
      updateTrickStatus(user.uid, trick.id, 'NOT_STARTED');
    }
  };

  return (
    <View className="flex-1 bg-background">
      <TrickDirectory
        tricks={inProgressTricks}
        onAddProcess={handleAddProcess}
        onRemoveFromProgress={handleRemoveFromProgress}
        loading={loading}
        title="Learning"
        subtitle="Keep pushing your limits!"
        allowCompletion={true}
      />
    </View>
  );
}
