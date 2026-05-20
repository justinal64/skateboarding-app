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

function makeTricksMock(tricks: object[]) {
  const mockFn = jest.fn().mockResolvedValue({ data: { tricks } });
  jest.mocked(functions.httpsCallable).mockReturnValue(mockFn);
  return mockFn;
}

beforeEach(() => {
  jest.clearAllMocks();
  useTrickStore.setState({ tricks: [], loading: false });
});

describe('fetchTricks', () => {
  it('populates tricks with NOT_STARTED status after fetchTricks', async () => {
    makeTricksMock([
      {
        id: 'trick1',
        name: 'Ollie',
        description: '',
        imageUrl: '',
        video_url: '',
        difficulty: 'Easy',
        category: 'Basics',
        points: 10,
        prerequisites: [],
      },
    ]);

    const { result } = renderHook(() => useTrickStore());

    await act(async () => {
      await result.current.fetchTricks();
    });

    expect(result.current.tricks).toHaveLength(1);
    expect(result.current.tricks[0].name).toBe('Ollie');
    expect(result.current.tricks[0].status).toBe('NOT_STARTED');
    expect(result.current.loading).toBe(false);
  });

  it('merges user progress when userId is provided', async () => {
    makeTricksMock([
      { id: 'trick1', name: 'Ollie', difficulty: 'Easy', category: 'Basics', points: 10, prerequisites: [] },
    ]);

    jest.mocked(firestore.getDocs).mockResolvedValueOnce({
      docs: [
        {
          data: () => ({ trickId: 'trick1', status: 'IN_PROGRESS', note: 'getting close' }),
        },
      ],
    } as any);

    const { result } = renderHook(() => useTrickStore());

    await act(async () => {
      await result.current.fetchTricks('user1');
    });

    expect(result.current.tricks[0].status).toBe('IN_PROGRESS');
    expect(result.current.tricks[0].note).toBe('getting close');
  });

  it('filters out test tricks by name', async () => {
    makeTricksMock([
      { id: '1', name: 'Ollie', difficulty: 'Easy', category: 'Basics', points: 10, prerequisites: [] },
      { id: '2', name: 'test trick', difficulty: 'Easy', category: 'Basics', points: 10, prerequisites: [] },
      { id: '3', name: 'Kickflip Test', difficulty: 'Easy', category: 'Flip', points: 20, prerequisites: [] },
    ]);

    const { result } = renderHook(() => useTrickStore());

    await act(async () => {
      await result.current.fetchTricks();
    });

    expect(result.current.tricks).toHaveLength(1);
    expect(result.current.tricks[0].name).toBe('Ollie');
  });

  it('sets loading false even when fetch throws', async () => {
    jest.mocked(functions.httpsCallable).mockReturnValue(
      jest.fn().mockRejectedValue(new Error('network error')),
    );

    const { result } = renderHook(() => useTrickStore());

    await act(async () => {
      await result.current.fetchTricks();
    });

    expect(result.current.loading).toBe(false);
  });
});

describe('updateTrickStatus', () => {
  it('applies optimistic status update to IN_PROGRESS immediately', async () => {
    useTrickStore.setState({ tricks: [ollie] });
    const { result } = renderHook(() => useTrickStore());

    await act(async () => {
      await result.current.updateTrickStatus('user1', 'trick1', 'IN_PROGRESS');
    });

    expect(result.current.tricks[0].status).toBe('IN_PROGRESS');
    expect(jest.mocked(firestore.setDoc)).toHaveBeenCalled();
  });

  it('sets masteredAt when status is COMPLETED', async () => {
    useTrickStore.setState({ tricks: [ollie] });
    const { result } = renderHook(() => useTrickStore());

    await act(async () => {
      await result.current.updateTrickStatus('user1', 'trick1', 'COMPLETED');
    });

    const payload = jest.mocked(firestore.setDoc).mock.calls[0][1] as Record<string, unknown>;
    expect(payload.masteredAt).toBeDefined();
    expect(payload.startedAt).toBeUndefined();
  });

  it('sets startedAt and clears masteredAt when status is IN_PROGRESS', async () => {
    useTrickStore.setState({ tricks: [ollie] });
    const { result } = renderHook(() => useTrickStore());

    await act(async () => {
      await result.current.updateTrickStatus('user1', 'trick1', 'IN_PROGRESS');
    });

    const payload = jest.mocked(firestore.setDoc).mock.calls[0][1] as Record<string, unknown>;
    expect(payload.startedAt).toBeDefined();
    expect(payload.masteredAt).toBeNull();
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

    expect(result.current.tricks[0].status).toBe('NOT_STARTED');
    expect(result.current.tricks[1].status).toBe('IN_PROGRESS');
  });

  it('re-fetches to revert on Firestore failure', async () => {
    jest.mocked(firestore.setDoc).mockRejectedValueOnce(new Error('write failed'));
    makeTricksMock([{ id: 'trick1', name: 'Ollie', difficulty: 'Easy', category: 'Basics', points: 10, prerequisites: [] }]);
    useTrickStore.setState({ tricks: [ollie] });

    const { result } = renderHook(() => useTrickStore());

    await act(async () => {
      await result.current.updateTrickStatus('user1', 'trick1', 'COMPLETED');
    });

    expect(jest.mocked(functions.httpsCallable)).toHaveBeenCalled();
  });
});

describe('saveNote', () => {
  it('updates the note optimistically in the store', async () => {
    useTrickStore.setState({ tricks: [ollie] });
    const { result } = renderHook(() => useTrickStore());

    await act(async () => {
      await result.current.saveNote('user1', 'trick1', 'focus on the pop');
    });

    expect(result.current.tricks[0].note).toBe('focus on the pop');
    expect(jest.mocked(firestore.setDoc)).toHaveBeenCalledWith(
      'mock-doc-ref',
      { note: 'focus on the pop' },
      { merge: true },
    );
  });

  it('re-fetches to revert on Firestore failure', async () => {
    jest.mocked(firestore.setDoc).mockRejectedValueOnce(new Error('write failed'));
    makeTricksMock([{ id: 'trick1', name: 'Ollie', difficulty: 'Easy', category: 'Basics', points: 10, prerequisites: [] }]);
    useTrickStore.setState({ tricks: [ollie] });

    const { result } = renderHook(() => useTrickStore());

    await act(async () => {
      await result.current.saveNote('user1', 'trick1', 'bad note');
    });

    expect(jest.mocked(functions.httpsCallable)).toHaveBeenCalled();
  });
});

describe('addTrick', () => {
  it('calls the addTrick Cloud Function and re-fetches', async () => {
    const addTrickFn = jest.fn().mockResolvedValue({ data: { id: 'new-trick' } });
    jest.mocked(functions.httpsCallable)
      .mockReturnValueOnce(addTrickFn)
      .mockReturnValueOnce(jest.fn().mockResolvedValue({ data: { tricks: [] } }));

    const { result } = renderHook(() => useTrickStore());

    await act(async () => {
      await result.current.addTrick('user1', {
        name: 'Custom Trick',
        description: '',
        imageUrl: '',
        video_url: '',
        difficulty: 'Intermediate',
        category: 'Flip',
        points: 20,
        prerequisites: [],
      });
    });

    expect(addTrickFn).toHaveBeenCalled();
  });

  it('throws when the Cloud Function fails', async () => {
    jest.mocked(functions.httpsCallable).mockReturnValue(
      jest.fn().mockRejectedValue(new Error('permission denied')),
    );

    const { result } = renderHook(() => useTrickStore());

    await expect(
      act(async () => {
        await result.current.addTrick('user1', {
          name: 'Bad Trick',
          description: '',
          imageUrl: '',
          video_url: '',
          difficulty: 'Easy',
          category: 'Basics',
          points: 10,
          prerequisites: [],
        });
      }),
    ).rejects.toThrow('permission denied');
  });
});
