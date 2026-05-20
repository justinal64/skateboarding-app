import { renderHook } from '@testing-library/react-native';

import { useUserScore } from '@/hooks/useUserScore';
import { useTrickStore } from '@/store/trickStore';
import { Trick } from '@/types';

jest.mock('@/lib/firebase', () => ({ db: {}, auth: {} }));
jest.mock('firebase/functions', () => ({
  getFunctions: jest.fn(() => ({})),
  httpsCallable: jest.fn(),
}));
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDocs: jest.fn(() => Promise.resolve({ docs: [] })),
  query: jest.fn(),
  where: jest.fn(),
  setDoc: jest.fn(),
  deleteDoc: jest.fn(),
  Timestamp: { now: jest.fn(() => ({ seconds: 0, nanoseconds: 0 })) },
}));

function makeTrick(overrides: Partial<Trick> = {}): Trick {
  return {
    id: '1',
    name: 'Ollie',
    description: '',
    imageUrl: '',
    video_url: '',
    difficulty: 'Easy',
    category: 'Basics',
    points: 10,
    prerequisites: [],
    status: 'NOT_STARTED',
    ...overrides,
  };
}

beforeEach(() => {
  useTrickStore.setState({ tricks: [], loading: false });
});

describe('useUserScore', () => {
  it('returns 0 when there are no tricks', () => {
    const { result } = renderHook(() => useUserScore());
    expect(result.current).toBe(0);
  });

  it('returns 0 when no tricks are COMPLETED', () => {
    useTrickStore.setState({
      tricks: [
        makeTrick({ id: '1', status: 'NOT_STARTED' }),
        makeTrick({ id: '2', status: 'IN_PROGRESS' }),
      ],
    });
    const { result } = renderHook(() => useUserScore());
    expect(result.current).toBe(0);
  });

  it('sums points for COMPLETED tricks only', () => {
    useTrickStore.setState({
      tricks: [
        makeTrick({ id: '1', status: 'COMPLETED', points: 10 }),
        makeTrick({ id: '2', status: 'IN_PROGRESS', points: 20 }),
        makeTrick({ id: '3', status: 'COMPLETED', points: 30 }),
      ],
    });
    const { result } = renderHook(() => useUserScore());
    expect(result.current).toBe(40);
  });

  it('falls back to 10 points when points is undefined', () => {
    useTrickStore.setState({
      tricks: [makeTrick({ id: '1', status: 'COMPLETED', points: undefined as unknown as number })],
    });
    const { result } = renderHook(() => useUserScore());
    expect(result.current).toBe(10);
  });
});
