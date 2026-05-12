import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { create } from 'zustand';

import { db } from '@/lib/firebase';

type SessionStore = {
  logSession: (
    userId: string,
    trickId: string,
    trickName: string,
    attempts: number,
    note: string,
  ) => Promise<void>;
};

export const useSessionStore = create<SessionStore>()(() => ({
  logSession: async (userId, trickId, trickName, attempts, note) => {
    await addDoc(collection(db, 'sessions'), {
      userId,
      trickId,
      trickName,
      attempts,
      note: note.trim(),
      date: Timestamp.now(),
    });
  },
}));
