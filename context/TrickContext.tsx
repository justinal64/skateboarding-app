import { supabase } from '@/lib/supabase';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

export type TrickStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export type Trick = {
  id: string;
  name: string;
  description: string;
  status: TrickStatus;
};

type TrickContextType = {
  tricks: Trick[];
  refreshTricks: () => Promise<void>;
  updateTrickStatus: (trickId: string, status: TrickStatus) => Promise<void>;
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

      // 2. Get user's tricks (in progress or completed)
      const { data: userTricksData, error: userTricksError } = await supabase
        .from('user_tricks')
        .select('trick_id, completed_at')
        .eq('user_id', user.id);

      if (userTricksError) throw userTricksError;

      // Map of ID -> Row
      const userTrickMap = new Map(userTricksData?.map(ut => [ut.trick_id, ut]));

      // 3. Merge data
      const mergedTricks: Trick[] = tricksData.map(trick => {
        const userTrick = userTrickMap.get(trick.id);
        let status: TrickStatus = 'NOT_STARTED';

        if (userTrick) {
            if (userTrick.completed_at) {
                status = 'COMPLETED';
            } else {
                status = 'IN_PROGRESS';
            }
        }

        return {
          ...trick,
          status,
        };
      });

      setTricks(mergedTricks);
    } catch (error) {
      console.error('Error fetching tricks:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTrickStatus = async (trickId: string, newStatus: TrickStatus) => {
    if (!user) return;

    // Optimistic Update
    setTricks(prev => prev.map(t => t.id === trickId ? { ...t, status: newStatus } : t));

    try {
      if (newStatus === 'NOT_STARTED') {
        // Delete row
        const { error } = await supabase
          .from('user_tricks')
          .delete()
          .eq('user_id', user.id)
          .eq('trick_id', trickId);
        if (error) throw error;
      } else if (newStatus === 'IN_PROGRESS') {
        // Upsert with null completed_at
        const { error } = await supabase
          .from('user_tricks')
          .upsert({
              user_id: user.id,
              trick_id: trickId,
              completed_at: null
          }, { onConflict: 'user_id, trick_id' });
        if (error) throw error;
      } else if (newStatus === 'COMPLETED') {
        // Upsert with current timestamp
        const { error } = await supabase
          .from('user_tricks')
          .upsert({
              user_id: user.id,
              trick_id: trickId,
              completed_at: new Date().toISOString()
          }, { onConflict: 'user_id, trick_id' });
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error updating trick:', error);
      fetchTricks(); // Revert
    }
  };

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchTricks();
    } else {
        setTricks([]);
    }
  }, [user]);

  return (
    <TrickContext.Provider value={{ tricks, refreshTricks: fetchTricks, updateTrickStatus, loading }}>
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
