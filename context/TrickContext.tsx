import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  Timestamp,
  where,
} from 'firebase/firestore';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import { db } from '@/lib/firebase';
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
      const tricksCollection = collection(db, 'tricks');
      const tricksSnapshot = await getDocs(tricksCollection);
      const tricksData = tricksSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      // 2. Get user's tricks (in progress or completed)
      const userTricksCollection = collection(db, 'user_tricks');
      const userTricksQuery = query(userTricksCollection, where('user_id', '==', user.uid));
      const userTricksSnapshot = await getDocs(userTricksQuery);
      const userTricksData = userTricksSnapshot.docs.map((doc) => doc.data());

      // Map of ID -> Row
      const userTrickMap = new Map(userTricksData?.map((ut) => [ut.trick_id, ut]));

      // 3. Merge data
      const mergedTricks: Trick[] = tricksData.map((trick) => {
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
        } as Trick;
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
    setTricks((prev) => prev.map((t) => (t.id === trickId ? { ...t, status: newStatus } : t)));

    try {
      const userTrickDoc = doc(db, 'user_tricks', `${user.uid}_${trickId}`);

      if (newStatus === 'NOT_STARTED') {
        // Delete row
        await deleteDoc(userTrickDoc);
      } else if (newStatus === 'IN_PROGRESS') {
        // Upsert with null completed_at
        await setDoc(userTrickDoc, {
          user_id: user.uid,
          trick_id: trickId,
          completed_at: null,
        });
      } else if (newStatus === 'COMPLETED') {
        // Upsert with current timestamp
        await setDoc(userTrickDoc, {
          user_id: user.uid,
          trick_id: trickId,
          completed_at: Timestamp.now(),
        });
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
    <TrickContext.Provider
      value={{ tricks, refreshTricks: fetchTricks, updateTrickStatus, loading }}
    >
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
