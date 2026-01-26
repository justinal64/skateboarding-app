import React, { useState } from 'react';
import { Text, View } from 'react-native';

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
    <View className="flex-1 bg-background pt-[60px]">
        <View className="items-center mb-5">
             <View
                className="border-2 border-primary rounded-xl py-1.5 px-4 bg-black/40 mb-2"
                // @ts-ignore
                style={{ boxShadow: `0px 0px 8px ${COLORS.primary}` }}
             >
                <Text
                    className="text-primary text-base font-black tracking-widest"
                    // @ts-ignore
                    style={{ textShadow: `0px 0px 10px ${COLORS.primary}` }}
                >IN PROGRESS</Text>
            </View>
            <Text className="text-textDim text-sm">Keep pushing!</Text>
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
