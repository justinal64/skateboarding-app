import { act, renderHook } from '@testing-library/react-native';
import * as firestore from 'firebase/firestore';

import { useSessionStore } from '@/store/sessionStore';

jest.mock('@/lib/firebase', () => ({ db: {}, auth: {} }));

jest.mock('firebase/firestore', () => ({
  addDoc: jest.fn(() => Promise.resolve()),
  collection: jest.fn(() => 'mock-collection-ref'),
  Timestamp: { now: jest.fn(() => ({ seconds: 1000, nanoseconds: 0 })) },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('sessionStore.logSession', () => {
  it('calls addDoc with the correct payload', async () => {
    const { result } = renderHook(() => useSessionStore());

    await act(async () => {
      await result.current.logSession('user1', 'trick1', 'Kickflip', 5, 'landed it clean');
    });

    expect(jest.mocked(firestore.addDoc)).toHaveBeenCalledWith('mock-collection-ref', {
      userId: 'user1',
      trickId: 'trick1',
      trickName: 'Kickflip',
      attempts: 5,
      note: 'landed it clean',
      date: { seconds: 1000, nanoseconds: 0 },
    });
  });

  it('trims whitespace from the note', async () => {
    const { result } = renderHook(() => useSessionStore());

    await act(async () => {
      await result.current.logSession('user1', 'trick1', 'Ollie', 3, '  almost  ');
    });

    const call = jest.mocked(firestore.addDoc).mock.calls[0][1] as Record<string, unknown>;
    expect(call.note).toBe('almost');
  });

  it('records zero attempts', async () => {
    const { result } = renderHook(() => useSessionStore());

    await act(async () => {
      await result.current.logSession('user1', 'trick1', 'Heelflip', 0, '');
    });

    const call = jest.mocked(firestore.addDoc).mock.calls[0][1] as Record<string, unknown>;
    expect(call.attempts).toBe(0);
  });
});
