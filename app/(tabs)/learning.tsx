import TrickDirectory from '@/components/TrickDirectory';
import { COLORS } from '@/constants/AppTheme';
import { Trick, useTricks } from '@/context/TrickContext';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function LearningScreen() {
  const { tricks, updateTrickStatus, loading } = useTricks();

  // Filter for IN_PROGRESS and COMPLETED? Or just IN_PROGRESS?
  // User said "only show tricks makes as in progress".
  // Assuming strict IN_PROGRESS.
  // If the user wants to see "what I'm learning", usually that implies in progress.
  const inProgressTricks = tricks.filter(t => t.status === 'IN_PROGRESS');

  const handleAddProcess = (trick: Trick) => {
    if (trick.status === 'IN_PROGRESS') {
        updateTrickStatus(trick.id, 'COMPLETED');
    } else if (trick.status === 'NOT_STARTED') {
        updateTrickStatus(trick.id, 'IN_PROGRESS');
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
