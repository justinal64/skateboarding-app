import React from 'react';
import { View } from 'react-native';

import TrickDirectory from '@/components/TrickDirectory';
import { useAuth } from '@/context/AuthContext';
import { useUserScore } from '@/hooks/useUserScore';
import { useTrickStore } from '@/store/trickStore';
import { Trick } from '@/types';

export default function CompletedScreen() {
  const { user } = useAuth();
  const tricks = useTrickStore((state) => state.tricks);
  const loading = useTrickStore((state) => state.loading);
  const updateTrickStatus = useTrickStore((state) => state.updateTrickStatus);
  const score = useUserScore();

  const completedTricks = tricks.filter((t) => t.status === 'COMPLETED');
  const subtitle = tricks.length > 0
    ? `${completedTricks.length} of ${tricks.length} mastered · ${score} XP`
    : undefined;

  const handleAddProcess = (trick: Trick) => {
    if (!user) return;
    updateTrickStatus(user.uid, trick.id, 'IN_PROGRESS');
  };

  return (
    <View className="flex-1 bg-background">
      <TrickDirectory
        tricks={completedTricks}
        onAddProcess={handleAddProcess}
        loading={loading}
        title="MASTERED"
        subtitle={subtitle}
        showSearch={false}
        showFilters={false}
        listLabel="COMPLETED"
        emptyMessage="No tricks mastered yet"
        emptySubtitle="Mark tricks as completed and they'll appear here"
      />
    </View>
  );
}
