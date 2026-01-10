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
import { Trick, TrickStatus } from '@/types';
import { useAuth } from './AuthContext';

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
    setLoading(true);
    try {
      // 1. Get Static Tricks (Metadata)
      const tricksCollection = collection(db, 'tricks');
      const tricksSnapshot = await getDocs(tricksCollection);
      const tricksData = tricksSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as any[]; // Temporary cast, will map to Trick interface

      // 2. Get User Progress (if logged in)
      let userTricksMap = new Map();
      if (user) {
        const userTricksCollection = collection(db, 'user_tricks');
        const userTricksQuery = query(userTricksCollection, where('userId', '==', user.uid));
        const userTricksSnapshot = await getDocs(userTricksQuery);
        userTricksSnapshot.docs.forEach((doc) => {
          const data = doc.data();
          userTricksMap.set(data.trickId, data);
        });
      }

      // 3. Merge Flow
      const mergedTricks: Trick[] = tricksData.map((trickMeta) => {
        const userProgress = userTricksMap.get(trickMeta.id);

        let status: TrickStatus = 'NOT_STARTED';
        if (userProgress) {
            status = userProgress.status;
        }

        return {
          ...trickMeta,
          // Ensure we have defaults if fields are missing in DB
          category: trickMeta.category || 'Basics',
          difficulty: trickMeta.difficulty || 'Easy',
          points: trickMeta.points || 10,
          status,
        } as Trick;
      });

      // Sort by difficulty/category if needed? For now, just merged.
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
      // ID Convention: userId_trickId
      const progressDocId = `${user.uid}_${trickId}`;
      const userTrickDoc = doc(db, 'user_tricks', progressDocId);

      if (newStatus === 'NOT_STARTED') {
        // Option A: Delete the record
        // Option B: Archive it (keep history).
        // User asked for "attempts" which implies history.
        // But for "Status" reset, deleting is cleaner, or set status to NOT_STARTED.
        // Let's delete for now to keep it simple, unless we want to keep "attempts".
        // Use case: User un-checks a box.
        await deleteDoc(userTrickDoc);
      } else {
        const now = Timestamp.now();

        // Prepare data payload
        const payload: any = {
           userId: user.uid,
           trickId: trickId,
           status: newStatus,
        };

        if (newStatus === 'IN_PROGRESS') {
            // If it was already in progress or completed, we might want to preserve original startedAt?
            // For simplicity, we upsert.
            // setDoc with { merge: true } allows preserving other fields like 'attempts'
            payload.startedAt = now;
            payload.masteredAt = null;
        } else if (newStatus === 'COMPLETED') {
            payload.masteredAt = now;
        }

        await setDoc(userTrickDoc, payload, { merge: true });
      }
    } catch (error) {
      console.error('Error updating trick:', error);
      fetchTricks(); // Revert on error
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchTricks();
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
