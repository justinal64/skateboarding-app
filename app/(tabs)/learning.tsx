import React from 'react';
import { View } from 'react-native';

import TrickDirectory from '@/components/TrickDirectory';
import { useAuth } from '@/context/AuthContext';
import { useSessionStore } from '@/store/sessionStore';
import { useTrickStore } from '@/store/trickStore';
import { Trick } from '@/types';

export default function LearningScreen() {
  const { user } = useAuth();
  const tricks = useTrickStore((state) => state.tricks);
  const loading = useTrickStore((state) => state.loading);
  const updateTrickStatus = useTrickStore((state) => state.updateTrickStatus);
  const logSession = useSessionStore((state) => state.logSession);

  const inProgressTricks = tricks.filter((t) => t.status === 'IN_PROGRESS');

  const handleAddProcess = (trick: Trick) => {
    if (!user) return;
    if (trick.status === 'IN_PROGRESS') {
      updateTrickStatus(user.uid, trick.id, 'COMPLETED');
    } else if (trick.status === 'NOT_STARTED') {
      updateTrickStatus(user.uid, trick.id, 'IN_PROGRESS');
    }
  };

  const handleLogSession = async (trick: Trick, attempts: number, note: string) => {
    if (!user) return;
    await logSession(user.uid, trick.id, trick.name, attempts, note);
  };

  const handleRemoveFromProgress = (trick: Trick) => {
    if (!user) return;
    if (trick.status === 'IN_PROGRESS') {
      updateTrickStatus(user.uid, trick.id, 'NOT_STARTED');
    }
  };

  const handleComplete = (trick: Trick) => {
    if (!user) return;
    updateTrickStatus(user.uid, trick.id, 'COMPLETED');
  };

  return (
    <View className="flex-1 bg-background">
      <TrickDirectory
        tricks={inProgressTricks}
        onAddProcess={handleAddProcess}
        onRemoveFromProgress={handleRemoveFromProgress}
        onLogSession={handleLogSession}
        onComplete={handleComplete}
        loading={loading}
        title="Learning"
        allowCompletion={true}
        showSearch={false}
        showFilters={false}
        showFeaturedCard={true}
        listLabel="IN PROGRESS"
        emptyMessage="Nothing in progress yet"
        emptySubtitle="Go to the Trick Library and tap a trick to start learning"
      />
    </View>
  );
}
