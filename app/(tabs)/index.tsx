import TrickGrid from '@/components/TrickGrid';
import { Trick, useTricks } from '@/context/TrickContext';

export default function AllTricksScreen() {
  const { tricks, updateTrickStatus, loading } = useTricks();

  const handleAddProcess = (trick: Trick) => {
    // Logic: Click in Modal -> Start Learning
    if (trick.status === 'NOT_STARTED') {
        updateTrickStatus(trick.id, 'IN_PROGRESS');
    }
  };

  return (
    <TrickGrid
      tricks={tricks}
      onAddProcess={handleAddProcess}
      loading={loading}
      headerTitle="ALL TRICKS"
    />
  );
}
