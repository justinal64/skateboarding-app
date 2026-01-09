import TrickDeck from '@/components/TrickDeck';
import { COLORS } from '@/constants/AppTheme';
import { Trick, useTricks } from '@/context/TrickContext';
import { StyleSheet, View } from 'react-native';

export default function InProgressScreen() {
  const { tricks, updateTrickStatus } = useTricks();
  const inProgressTricks = tricks.filter(t => t.status === 'IN_PROGRESS');

  const handleTrickPress = (trick: Trick) => {
      // Tap -> Completed!
      updateTrickStatus(trick.id, 'COMPLETED');
  };

  return (
    <View style={styles.container}>
      <TrickDeck
        tricks={inProgressTricks}
        onTrickPress={handleTrickPress}
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
