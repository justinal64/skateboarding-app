import TrickDirectory from '@/components/TrickDirectory';
import { COLORS } from '@/constants/AppTheme';
import { useTricks } from '@/context/TrickContext';
import { Trick } from '@/types';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function CompletedScreen() {
  const { tricks, updateTrickStatus, loading } = useTricks();
  const completedTricks = tricks.filter(t => t.status === 'COMPLETED');

  const handleAddProcess = (trick: Trick) => {
      // Logic: If they want to "re-learn" it? Or maybe un-complete?
      // For now, let's allow them to move it back to IN_PROGRESS if they want to practice more.
      updateTrickStatus(trick.id, 'IN_PROGRESS');
  };

  return (
    <View style={styles.container}>
        <TrickDirectory
            tricks={completedTricks}
            onAddProcess={handleAddProcess}
            loading={loading}
            title="COMPLETED"
            subtitle="Look at all you've achieved!"
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
