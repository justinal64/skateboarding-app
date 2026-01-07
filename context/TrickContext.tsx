import { createContext, ReactNode, useContext, useState } from 'react';

export type Trick = {
  id: string;
  name: string;
  description: string;
};

type TrickContextType = {
  tricks: Trick[];
  addTrick: (trick: Omit<Trick, 'id'>) => void;
};

const TrickContext = createContext<TrickContextType | undefined>(undefined);

const INITIAL_TRICKS: Trick[] = [
  { id: '1', name: 'Kickflip', description: 'A basic flip trick where the board spins 360 degrees along its axis.' },
  { id: '2', name: 'Heelflip', description: 'Similar to a kickflip, but the board spins in the opposite direction.' },
  { id: '3', name: 'Ollie', description: 'The foundation of all street skating. Jumping with the board.' },
];

export function TrickProvider({ children }: { children: ReactNode }) {
  const [tricks, setTricks] = useState<Trick[]>(INITIAL_TRICKS);

  const addTrick = (trick: Omit<Trick, 'id'>) => {
    const newTrick = {
      ...trick,
      id: Date.now().toString(),
    };
    setTricks((prev) => [...prev, newTrick]);
  };

  return (
    <TrickContext.Provider value={{ tricks, addTrick }}>
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
