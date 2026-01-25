import AsyncStorage from '@react-native-async-storage/async-storage';
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
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { db } from '@/lib/firebase';
import { Trick, TrickMeta, TrickStatus } from '@/types';

type TrickStore = {
  tricks: Trick[];
  loading: boolean;

  // Actions
  fetchTricks: (userId?: string) => Promise<void>;
  updateTrickStatus: (userId: string, trickId: string, status: TrickStatus) => Promise<void>;
  addTrick: (userId: string, trick: Omit<TrickMeta, 'id'>) => Promise<void>;
  setLoading: (loading: boolean) => void;
};

export const useTrickStore = create<TrickStore>()(
  persist(
    (set, get) => ({
      tricks: [],
      loading: false, // Default to false so UI doesn't hang if fetch isn't called immediately

      setLoading: (loading) => set({ loading }),

      fetchTricks: async (userId?: string) => {
        // If no user, we might want to just clear tricks or fetch public only?
        // With current logic, we need to be careful not to hang on loading.
        set({ loading: true });
        try {
          // 1. Get Static / Public Tricks
          const tricksCollection = collection(db, 'tricks');

          const publicQuery = query(tricksCollection, where('isPublic', '==', true));
          const myTricksQuery = userId
            ? query(tricksCollection, where('ownerId', '==', userId))
            : null;

          const [publicSnapshot, myTricksSnapshot] = await Promise.all([
              getDocs(publicQuery),
              myTricksQuery ? getDocs(myTricksQuery) : Promise.resolve({ docs: [] })
          ]);

          const trickDocsMap = new Map();

          publicSnapshot.docs.forEach(doc => {
              trickDocsMap.set(doc.id, { id: doc.id, ...doc.data() });
          });

          if (myTricksSnapshot && 'docs' in myTricksSnapshot) {
               myTricksSnapshot.docs.forEach(doc => {
                  trickDocsMap.set(doc.id, { id: doc.id, ...doc.data() });
               });
          }

          const tricksData = Array.from(trickDocsMap.values());

          // 2. Get User Progress (if logged in)
          const userTricksMap = new Map();
          if (userId) {
            const userTricksCollection = collection(db, 'user_tricks');
            const userTricksQuery = query(userTricksCollection, where('userId', '==', userId));
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
              category: trickMeta.category || 'Basics',
              difficulty: trickMeta.difficulty || 'Easy',
              points: trickMeta.points || 10,
              status,
              imageUrl: trickMeta.imageUrl || '',
              video_url: trickMeta.video_url || '',
              prerequisites: trickMeta.prerequisites || [],
            } as Trick;
          });

          set({ tricks: mergedTricks });
        } catch (error) {
          console.error('Error fetching tricks:', error);
        } finally {
          set({ loading: false });
        }
      },

      updateTrickStatus: async (userId: string, trickId: string, newStatus: TrickStatus) => {
        // Optimistic Update
        set((state) => ({
          tricks: state.tricks.map((t) => (t.id === trickId ? { ...t, status: newStatus } : t))
        }));

        try {
          const progressDocId = `${userId}_${trickId}`;
          const userTrickDoc = doc(db, 'user_tricks', progressDocId);

          if (newStatus === 'NOT_STARTED') {
            await deleteDoc(userTrickDoc);
          } else {
            const now = Timestamp.now();
            const payload: any = {
               userId: userId,
               trickId: trickId,
               status: newStatus,
               updatedAt: now,
            };

            if (newStatus === 'IN_PROGRESS') {
                payload.startedAt = now;
                payload.masteredAt = null;
            } else if (newStatus === 'COMPLETED') {
                payload.masteredAt = now;
            }

            await setDoc(userTrickDoc, payload, { merge: true });
          }
        } catch (error) {
          console.error('Error updating trick:', error);
          // Revert logic could go here, or just re-fetch
          get().fetchTricks(userId);
        }
      },

      addTrick: async (userId: string, trickData: Omit<TrickMeta, 'id'>) => {
          try {
              const tricksCollection = collection(db, 'tricks');
              const dataWithOwnership = {
                  ...trickData,
                  ownerId: userId
              };

              await addDoc(tricksCollection, dataWithOwnership);
              await get().fetchTricks(userId);
          } catch (error) {
              console.error("Error adding trick: ", error);
              throw error;
          }
      },
    }),
    {
      name: 'trick-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ tricks: state.tricks }), // Only persist tricks
    }
  )
);
