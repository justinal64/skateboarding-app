import React from 'react';
import { act, renderHook } from '@testing-library/react-native';

// All mock state lives here — must NOT reference module-level vars in jest.mock factories
// because jest.mock is hoisted before any let/const declarations.
const mocks = {
  authStateCallback: null as ((user: unknown) => void) | null,
  signOut: jest.fn(() => Promise.resolve()),
  userDelete: jest.fn(() => Promise.resolve()),
  reauth: jest.fn(() => Promise.resolve()),
  batchDelete: jest.fn(),
  batchCommit: jest.fn(() => Promise.resolve()),
  currentUser: null as { email: string; uid: string; delete: jest.Mock } | null,
};

jest.mock('@/lib/firebase', () => ({
  db: {},
  auth: {
    onAuthStateChanged: (cb: (user: unknown) => void) => {
      mocks.authStateCallback = cb;
      cb(null);
      return jest.fn();
    },
    signOut: () => mocks.signOut(),
    get currentUser() {
      return mocks.currentUser;
    },
  },
}));

jest.mock('firebase/auth', () => ({
  EmailAuthProvider: { credential: jest.fn(() => 'mock-credential') },
  reauthenticateWithCredential: (...args: unknown[]) => mocks.reauth(...args),
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(() => 'mock-doc-ref'),
  deleteDoc: jest.fn(() => Promise.resolve()),
  getDocs: jest.fn(() =>
    Promise.resolve({ docs: [{ ref: 'ref-1' }, { ref: 'ref-2' }] }),
  ),
  query: jest.fn(),
  where: jest.fn(),
  writeBatch: jest.fn(() => ({
    delete: () => mocks.batchDelete(),
    commit: () => mocks.batchCommit(),
  })),
}));

import { AuthProvider, useAuth } from '@/context/AuthContext';

function wrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

beforeEach(() => {
  jest.clearAllMocks();
  mocks.authStateCallback = null;
  mocks.batchCommit.mockResolvedValue(undefined);
  mocks.userDelete.mockResolvedValue(undefined);
  mocks.reauth.mockResolvedValue(undefined);
  mocks.currentUser = {
    email: 'test@example.com',
    uid: 'user123',
    delete: mocks.userDelete,
  };
});

describe('useAuth', () => {
  it('throws when used outside AuthProvider', () => {
    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth must be used within an AuthProvider',
    );
  });

  it('starts with user null and loading false after auth resolves', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('exposes updated user when auth state changes', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      mocks.authStateCallback?.({ uid: 'user123', email: 'test@example.com' });
    });

    expect(result.current.user).toMatchObject({ uid: 'user123' });
  });
});

describe('signOut', () => {
  it('calls auth.signOut', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.signOut();
    });

    expect(mocks.signOut).toHaveBeenCalled();
  });
});

describe('deleteAccount', () => {
  it('re-authenticates, deletes Firestore data, and deletes the user', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.deleteAccount('password123');
    });

    expect(mocks.reauth).toHaveBeenCalled();
    expect(mocks.batchCommit).toHaveBeenCalled();
    expect(mocks.userDelete).toHaveBeenCalled();
  });

  it('throws when there is no current user', async () => {
    mocks.currentUser = null;
    const { result } = renderHook(() => useAuth(), { wrapper });

    await expect(
      act(async () => {
        await result.current.deleteAccount('password123');
      }),
    ).rejects.toThrow('No authenticated user');
  });
});
