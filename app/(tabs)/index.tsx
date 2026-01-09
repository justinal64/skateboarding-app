import TrickList from '@/components/TrickList';
import { Trick, useTricks } from '@/context/TrickContext';

export default function AllTricksScreen() {
  const { tricks, updateTrickStatus, loading } = useTricks();

  const handlePress = (trick: Trick) => {
    // Logic: Click on All Tricks -> Move to In Progress (if Not Started)
    // If it's already In Progress or Completed, maybe just leave it or cycle?
    // User request: "When I'm on the all tricks screen and click an item it moves to done (corrected: in progress)"

    if (trick.status === 'NOT_STARTED') {
        updateTrickStatus(trick.id, 'IN_PROGRESS');
    }
    // If already in progress or completed, do nothing? Or maybe move to completed?
    // For now, implementing the requested flow: click -> moves to In Progress.
  };

  return (
    <TrickList
      tricks={tricks}
      onTrickPress={handlePress}
      loading={loading}
      headerTitle="ALL TRICKS"
    />
  );
}
