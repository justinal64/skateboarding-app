import React from 'react';
import { StyleSheet, View } from 'react-native';

import TrickDirectory from '@/components/TrickDirectory';
import { COLORS } from '@/constants/AppTheme';
import { useAuth } from '@/context/AuthContext';
import { useTrickStore } from '@/store/trickStore';
import { Trick } from '@/types';

export default function LearningScreen() {
  const { user } = useAuth();
  const tricks = useTrickStore((state) => state.tricks);
  const loading = useTrickStore((state) => state.loading);
  const updateTrickStatus = useTrickStore((state) => state.updateTrickStatus);

  // Filter for IN_PROGRESS and COMPLETED? Or just IN_PROGRESS?
  // User said "only show tricks makes as in progress".
  // Assuming strict IN_PROGRESS.
  // If the user wants to see "what I'm learning", usually that implies in progress.
  const inProgressTricks = tricks.filter(t => t.status === 'IN_PROGRESS');

  const handleAddProcess = (trick: Trick) => {
    if (!user) return; // Should likely show login modal, but for now safe guard
    if (trick.status === 'IN_PROGRESS') {
        updateTrickStatus(user.uid, trick.id, 'COMPLETED');
    } else if (trick.status === 'NOT_STARTED') {
        updateTrickStatus(user.uid, trick.id, 'IN_PROGRESS');
    }
  };

  return (
    <View style={styles.container}>
        <TrickDirectory
            tricks={inProgressTricks}
            onAddProcess={handleAddProcess}
            loading={loading}
            title="Learning"
            subtitle="Keep pushing your limits!"
            allowCompletion={true}
        />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      backgroundColor: COLORS.background,
  },
});
