import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import TrickDetailModal from '@/components/TrickDetailModal';
import TrickGrid from '@/components/TrickGrid';
import { COLORS } from '@/constants/AppTheme';
import { useAuth } from '@/context/AuthContext';
import { useTrickStore } from '@/store/trickStore';
import { Trick } from '@/types';

export default function InProgressScreen() {
  const { user } = useAuth();
  const tricks = useTrickStore((state) => state.tricks);
  const loading = useTrickStore((state) => state.loading);
  const updateTrickStatus = useTrickStore((state) => state.updateTrickStatus);

  const [selectedTrick, setSelectedTrick] = useState<Trick | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const inProgressTricks = tricks.filter(t => t.status === 'IN_PROGRESS');

  const handleUpdateStatus = (trick: Trick) => {
    if (!user) return;
    // Tapping on grid item here usually opens modal, but `onAddProcess` prop in Grid
    // is often used for quick action.
    // In "In Progress", main action might be completing?
    // But Grid usually opens detailed view on press.
    // The `onAddProcess` in Grid is for the "plus" or status action?
    // Let's assume onAddProcess here means "Mark Complete".
    updateTrickStatus(user.uid, trick.id, 'COMPLETED');
  };

  return (
    <View style={styles.container}>
        <View style={styles.header}>
             <View style={styles.neonHeader}>
                <Text style={styles.headerTitle}>IN PROGRESS</Text>
            </View>
            <Text style={styles.subTitle}>Keep pushing!</Text>
        </View>

        <TrickGrid
            tricks={inProgressTricks}
            onAddProcess={handleUpdateStatus}
            loading={loading}
            allowCompletion={true}
        />

         <TrickDetailModal
            visible={modalVisible}
            trick={selectedTrick}
            onClose={() => setModalVisible(false)}
            onAddToInProgress={(trick) => {
                if(user) updateTrickStatus(user.uid, trick.id, 'IN_PROGRESS');
            }}
            allowCompletion={true}
            onPrerequisitePress={(trickName) => {
                const target = tricks.find(t => t.name === trickName);
                if (target) {
                    setSelectedTrick(target);
                }
            }}
        />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      backgroundColor: COLORS.background,
      paddingTop: 60,
  },
  header: {
      alignItems: 'center',
      marginBottom: 20,
  },
  neonHeader: {
    borderWidth: 2,
    borderColor: COLORS.primary, // Different color for distinction
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.4)',
    marginBottom: 8,
  },
  headerTitle: {
      color: COLORS.primary,
      fontSize: 16,
      fontWeight: '900',
      letterSpacing: 2,
      textShadowColor: COLORS.primary,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 10,
  },
  subTitle: {
      color: COLORS.textDim,
      fontSize: 14,
  },
});
