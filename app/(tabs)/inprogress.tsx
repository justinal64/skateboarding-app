import TrickDeck from '@/components/TrickDeck';
import TrickDetailModal from '@/components/TrickDetailModal';
import { COLORS } from '@/constants/AppTheme';
import { useTricks } from '@/context/TrickContext';
import { Trick } from '@/types';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

export default function InProgressScreen() {
  const { tricks, updateTrickStatus } = useTricks();
  const inProgressTricks = tricks.filter(t => t.status === 'IN_PROGRESS');

  const [selectedTrick, setSelectedTrick] = useState<Trick | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleTrickPress = (trick: Trick) => {
      setSelectedTrick(trick);
      setModalVisible(true);
  };

  const handleModalAction = (trick: Trick) => {
      // In this context (In Progress), the primary action is to COMPLETE it.
      if (trick.status === 'IN_PROGRESS') {
          updateTrickStatus(trick.id, 'COMPLETED');
          setModalVisible(false);
      }
  };

  return (
    <View style={styles.container}>
      <TrickDeck
        tricks={inProgressTricks}
        onTrickPress={handleTrickPress}
      />

      <TrickDetailModal
        visible={modalVisible}
        trick={selectedTrick}
        onClose={() => setModalVisible(false)}
        onAddToInProgress={handleModalAction}
        allowCompletion={true}
        onPrerequisitePress={(trickName) => {
             // Optional: If you want to navigate to another trick from here
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
    }
});
