import { act, renderHook } from '@testing-library/react-native';
import * as firestore from 'firebase/firestore';
import * as functions from 'firebase/functions';

import { useTrickStore } from '@/store/trickStore';
import { Trick } from '@/types';

jest.mock('@/lib/firebase', () => ({ db: {}, auth: {} }));

jest.mock('firebase/functions', () => ({
  getFunctions: jest.fn(() => ({})),
  httpsCallable: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(() => 'mock-doc-ref'),
  getDocs: jest.fn(() => Promise.resolve({ docs: [] })),
  query: jest.fn(),
  where: jest.fn(),
  setDoc: jest.fn(() => Promise.resolve()),
  deleteDoc: jest.fn(() => Promise.resolve()),
  Timestamp: { now: jest.fn(() => ({ seconds: 1000, nanoseconds: 0 })) },
}));

const ollie: Trick = {
  id: 'trick1',
  name: 'Ollie',
  description: 'The foundational trick',
  imageUrl: '',
  video_url: '',
  difficulty: 'Easy',
  category: 'Basics',
  points: 10,
  prerequisites: [],
  status: 'NOT_STARTED',
};

describe('trickStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useTrickStore.setState({ tricks: [], loading: false });
  });

  it('populates tricks with NOT_STARTED status after fetchTricks', async () => {
    const mockFn = jest.fn().mockResolvedValue({
      data: {
        tricks: [
          { id: 'trick1', name: 'Ollie', description: '', imageUrl: '', video_url: '', difficulty: 'Easy', category: 'Basics', points: 10, prerequisites: [] },
        ],
      },
    });
    jest.mocked(functions.httpsCallable).mockReturnValue(mockFn);

    const { result } = renderHook(() => useTrickStore());

    await act(async () => {
      await result.current.fetchTricks();
    });

    expect(result.current.tricks).toHaveLength(1);
    expect(result.current.tricks[0].name).toBe('Ollie');
    expect(result.current.tricks[0].status).toBe('NOT_STARTED');
    expect(result.current.loading).toBe(false);
  });

  it('applies optimistic status update to IN_PROGRESS immediately', async () => {
    useTrickStore.setState({ tricks: [ollie] });

    const { result } = renderHook(() => useTrickStore());

    await act(async () => {
      await result.current.updateTrickStatus('user1', 'trick1', 'IN_PROGRESS');
    });

    expect(result.current.tricks[0].status).toBe('IN_PROGRESS');
    expect(jest.mocked(firestore.setDoc)).toHaveBeenCalled();
  });

  it('calls deleteDoc when reverting trick to NOT_STARTED', async () => {
    useTrickStore.setState({ tricks: [{ ...ollie, status: 'IN_PROGRESS' }] });

    const { result } = renderHook(() => useTrickStore());

    await act(async () => {
      await result.current.updateTrickStatus('user1', 'trick1', 'NOT_STARTED');
    });

    expect(jest.mocked(firestore.deleteDoc)).toHaveBeenCalled();
    expect(result.current.tricks[0].status).toBe('NOT_STARTED');
  });

  it('only updates the targeted trick when multiple tricks exist', async () => {
    const kickflip: Trick = { ...ollie, id: 'trick2', name: 'Kickflip', status: 'NOT_STARTED' };
    useTrickStore.setState({ tricks: [ollie, kickflip] });

    const { result } = renderHook(() => useTrickStore());

    await act(async () => {
      await result.current.updateTrickStatus('user1', 'trick2', 'IN_PROGRESS');
    });

    expect(result.current.tricks[0].status).toBe('NOT_STARTED'); // ollie unchanged
    expect(result.current.tricks[1].status).toBe('IN_PROGRESS'); // kickflip updated
  });
});
