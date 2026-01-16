import {
    addDoc,
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
import { Trick, TrickMeta, TrickStatus } from '@/types';
import { useAuth } from './AuthContext';

type TrickContextType = {
  tricks: Trick[];
  refreshTricks: () => Promise<void>;
  updateTrickStatus: (trickId: string, status: TrickStatus) => Promise<void>;
  addTrick: (trick: Omit<TrickMeta, 'id'>) => Promise<void>;
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
      // 1. Get Static / Public Tricks
      const tricksCollection = collection(db, 'tricks');

      // Parallel Queries:
      // A. Public Tricks (isPublic == true)
      // B. My Private Tricks (ownerId == myUid)
      const publicQuery = query(tricksCollection, where('isPublic', '==', true));
      const myTricksQuery = user
        ? query(tricksCollection, where('ownerId', '==', user.uid))
        : null;

      const [publicSnapshot, myTricksSnapshot] = await Promise.all([
          getDocs(publicQuery),
          myTricksQuery ? getDocs(myTricksQuery) : Promise.resolve({ docs: [] })
      ]);

      // Merge Docs (Dedup by ID if overlap, though shouldn't fetch same doc twice ideally)
      const trickDocsMap = new Map();

      publicSnapshot.docs.forEach(doc => {
          trickDocsMap.set(doc.id, { id: doc.id, ...doc.data() });
      });

      // User tricks override public ones if ID collision (unlikely but safe)
      if (myTricksSnapshot && 'docs' in myTricksSnapshot) {
           myTricksSnapshot.docs.forEach(doc => {
              trickDocsMap.set(doc.id, { id: doc.id, ...doc.data() });
           });
      }

      const tricksData = Array.from(trickDocsMap.values());

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
      // 3. Merge Flow & Filter
      const mergedTricks: Trick[] = tricksData
        .map((trickMeta) => {
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
           updatedAt: now,
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

  const addTrick = async (trickData: Omit<TrickMeta, 'id'>) => {
      try {
          if (!user) throw new Error("Must be logged in to add a trick");

          const tricksCollection = collection(db, 'tricks');
          // Add ownerId to the saved data
          const dataWithOwnership = {
              ...trickData,
              ownerId: user.uid
          };

          await addDoc(tricksCollection, dataWithOwnership);

          // Optimistic update or just refresh
          await fetchTricks();
      } catch (error) {
          console.error("Error adding trick: ", error);
          throw error;
      }
  };

  // Initial fetch
  useEffect(() => {
    fetchTricks();
  }, [user]);

  return (
    <TrickContext.Provider
      value={{ tricks, refreshTricks: fetchTricks, updateTrickStatus, addTrick, loading }}
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
