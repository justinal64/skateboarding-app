import AsyncStorage from '@react-native-async-storage/async-storage';
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
import { getFunctions, httpsCallable } from 'firebase/functions';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { db } from '@/lib/firebase';
import { Trick, TrickMeta, TrickStatus } from '@/types';

/** Shape of the user_tricks Firestore document payload. */
type UserTrickPayload = {
  userId: string;
  trickId: string;
  status: TrickStatus;
  updatedAt: Timestamp;
  startedAt?: Timestamp | null;
  masteredAt?: Timestamp | null;
};

/** Response shape from the getTricks cloud function. */
type GetTricksResponse = {
  tricks: TrickMeta[];
};

type TrickStore = {
  tricks: Trick[];
  loading: boolean;

  fetchTricks: (userId?: string) => Promise<void>;
  updateTrickStatus: (userId: string, trickId: string, status: TrickStatus) => Promise<void>;
  addTrick: (userId: string, trick: Omit<TrickMeta, 'id'>) => Promise<void>;
  setLoading: (loading: boolean) => void;
};

export const useTrickStore = create<TrickStore>()(
  persist(
    (set, get) => ({
      tricks: [],
      loading: false,

      setLoading: (loading) => set({ loading }),

      fetchTricks: async (userId?: string) => {
        set({ loading: true });
        try {
          const functions = getFunctions();
          const getTricks = httpsCallable<void, GetTricksResponse>(functions, 'getTricks');

          const result = await getTricks();
          const tricksData: TrickMeta[] = result.data.tricks;

          // Build user progress lookup
          const userTricksMap = new Map<string, { status: TrickStatus }>();
          if (userId) {
            const userTricksCollection = collection(db, 'user_tricks');
            const userTricksQuery = query(userTricksCollection, where('userId', '==', userId));
            const userTricksSnapshot = await getDocs(userTricksQuery);
            userTricksSnapshot.docs.forEach((document) => {
              const data = document.data();
              userTricksMap.set(data.trickId, data as { status: TrickStatus });
            });
          }

          // Merge trick metadata with user progress
          const mergedTricks: Trick[] = tricksData.map((trickMeta) => {
            const userProgress = userTricksMap.get(trickMeta.id ?? '');
            return {
              ...trickMeta,
              id: trickMeta.id ?? '',
              category: trickMeta.category || 'Basics',
              difficulty: trickMeta.difficulty || 'Easy',
              points: trickMeta.points || 10,
              status: userProgress?.status ?? 'NOT_STARTED',
              imageUrl: trickMeta.imageUrl || '',
              video_url: trickMeta.video_url || '',
              prerequisites: trickMeta.prerequisites || [],
            };
          });

          set({ tricks: mergedTricks });
        } catch (error) {
          console.error('Error fetching tricks:', error);
        } finally {
          set({ loading: false });
        }
      },

      updateTrickStatus: async (userId: string, trickId: string, newStatus: TrickStatus) => {
        // Optimistic update
        set((state) => ({
          tricks: state.tricks.map((t) =>
            t.id === trickId ? { ...t, status: newStatus } : t,
          ),
        }));

        try {
          const progressDocId = `${userId}_${trickId}`;
          const userTrickDoc = doc(db, 'user_tricks', progressDocId);

          if (newStatus === 'NOT_STARTED') {
            await deleteDoc(userTrickDoc);
          } else {
            const now = Timestamp.now();
            const payload: UserTrickPayload = {
              userId,
              trickId,
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
          // Revert by re-fetching
          get().fetchTricks(userId);
        }
      },

      addTrick: async (userId: string, trickData: Omit<TrickMeta, 'id'>) => {
        try {
          const functions = getFunctions();
          const addTrickFn = httpsCallable(functions, 'addTrick');

          await addTrickFn({
            ...trickData,
            prerequisite_ids: trickData.prerequisites,
          });

          await get().fetchTricks(userId);
        } catch (error) {
          console.error('Error adding trick:', error);
          throw error;
        }
      },
    }),
    {
      name: 'trick-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ tricks: state.tricks }),
    },
  ),
);
