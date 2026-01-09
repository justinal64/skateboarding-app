import TrickList from '@/components/TrickList';
import { Trick, useTricks } from '@/context/TrickContext';

export default function InProgressScreen() {
  const { tricks, updateTrickStatus, loading } = useTricks();
  const inProgressTricks = tricks.filter(t => t.status === 'IN_PROGRESS');

  const handlePress = (trick: Trick) => {
      // Logic: Click on In Progress page -> move to Done
      updateTrickStatus(trick.id, 'COMPLETED');
  };

  return (
    <TrickList
      tricks={inProgressTricks}
      onTrickPress={handlePress}
      loading={loading}
      headerTitle="IN PROGRESS"
    />
  );
}
