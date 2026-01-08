import { supabase } from '@/lib/supabase';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

export type Trick = {
  id: string;
  name: string;
  description: string;
  completed?: boolean;
};

type TrickContextType = {
  tricks: Trick[];
  refreshTricks: () => Promise<void>;
  toggleTrickCompletion: (trickId: string, currentStatus: boolean) => Promise<void>;
  loading: boolean;
};

const TrickContext = createContext<TrickContextType | undefined>(undefined);

export function TrickProvider({ children }: { children: ReactNode }) {
  const [tricks, setTricks] = useState<Trick[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchTricks = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // 1. Get all tricks
      const { data: tricksData, error: tricksError } = await supabase
        .from('tricks')
        .select('*')
        .order('created_at', { ascending: true });

      if (tricksError) throw tricksError;

      // 2. Get user's completed tricks
      const { data: userTricksData, error: userTricksError } = await supabase
        .from('user_tricks')
        .select('trick_id')
        .eq('user_id', user.id);

      if (userTricksError) throw userTricksError;

      const completedTrickIds = new Set(userTricksData?.map(ut => ut.trick_id));

      // 3. Merge data
      const mergedTricks = tricksData.map(trick => ({
        ...trick,
        completed: completedTrickIds.has(trick.id),
      }));

      setTricks(mergedTricks);
    } catch (error) {
      console.error('Error fetching tricks:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTrickCompletion = async (trickId: string, isCompleted: boolean) => {
    if (!user) return;

    // Optimistic Update
    setTricks(prev => prev.map(t => t.id === trickId ? { ...t, completed: !isCompleted } : t));

    try {
      if (isCompleted) {
        // Remove from user_tricks
        const { error } = await supabase
          .from('user_tricks')
          .delete()
          .eq('user_id', user.id)
          .eq('trick_id', trickId);

        if (error) throw error;
      } else {
        // Add to user_tricks
        const { error } = await supabase
          .from('user_tricks')
          .insert({ user_id: user.id, trick_id: trickId });

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error toggling trick:', error);
      // Revert on error
      fetchTricks();
    }
  };

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchTricks();
    } else {
        setTricks([]); // Clear if no user
    }
  }, [user]);

  // Remove addTrick logic as we are now using a static DB list for now
  // If we wanted to add tricks we would insert into 'tricks' table

  return (
    <TrickContext.Provider value={{ tricks, refreshTricks: fetchTricks, toggleTrickCompletion, loading }}>
      {children}
    </TrickContext.Provider>
  );
}

export function useTricks() {
  const context = useContext(TrickContext);
  if (context === undefined) {
    throw new Error('useTricks must be used within a TrickProvider');
  }
  return context;
}
