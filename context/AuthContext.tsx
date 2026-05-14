import { auth, db } from '@/lib/firebase';
import { EmailAuthProvider, reauthenticateWithCredential, User } from 'firebase/auth';
import { collection, deleteDoc, doc, getDocs, query, where, writeBatch } from 'firebase/firestore';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    await auth.signOut();
  };

  const deleteAccount = async (password: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser?.email) throw new Error('No authenticated user');

    const credential = EmailAuthProvider.credential(currentUser.email, password);
    await reauthenticateWithCredential(currentUser, credential);

    const uid = currentUser.uid;
    const CHUNK = 400;

    const [userTricksSnap, sessionsSnap] = await Promise.all([
      getDocs(query(collection(db, 'user_tricks'), where('userId', '==', uid))),
      getDocs(query(collection(db, 'sessions'), where('userId', '==', uid))),
    ]);

    const allDocs = [...userTricksSnap.docs, ...sessionsSnap.docs];
    for (let i = 0; i < allDocs.length; i += CHUNK) {
      const batch = writeBatch(db);
      allDocs.slice(i, i + CHUNK).forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }

    await deleteDoc(doc(db, 'user_profiles', uid));
    await currentUser.delete();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
