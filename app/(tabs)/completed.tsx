import React from 'react';
import { StyleSheet, View } from 'react-native';

import TrickDirectory from '@/components/TrickDirectory';
import { COLORS } from '@/constants/AppTheme';
import { useAuth } from '@/context/AuthContext';
import { useTrickStore } from '@/store/trickStore';
import { Trick } from '@/types';

export default function CompletedScreen() {
  const { user } = useAuth();
  const tricks = useTrickStore((state) => state.tricks);
  const loading = useTrickStore((state) => state.loading);
  const updateTrickStatus = useTrickStore((state) => state.updateTrickStatus);

  const completedTricks = tricks.filter(t => t.status === 'COMPLETED');

  const handleAddProcess = (trick: Trick) => {
      if (!user) return;
      // Logic: If they want to "re-learn" it? Or maybe un-complete?
      // For now, let's allow them to move it back to IN_PROGRESS if they want to practice more.
      updateTrickStatus(user.uid, trick.id, 'IN_PROGRESS');
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
