import TrickList from '@/components/TrickList';
import { Trick, useTricks } from '@/context/TrickContext';

export default function CompletedScreen() {
  const { tricks, updateTrickStatus, loading } = useTricks();
  const completedTricks = tricks.filter(t => t.status === 'COMPLETED');

  const handlePress = (trick: Trick) => {
      // Logic: Move back to "All Tricks" (Not Started)
      updateTrickStatus(trick.id, 'NOT_STARTED');
  };

  return (
    <TrickList
      tricks={completedTricks}
      onTrickPress={handlePress}
      loading={loading}
      headerTitle="COMPLETED"
    />
  );
}
