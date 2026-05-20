import React from 'react';
import { render, screen } from '@testing-library/react-native';

import ScoreBadge from '@/components/ScoreBadge';
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

describe('ScoreBadge', () => {
  it('renders nothing when score is 0', () => {
    const { toJSON } = render(<ScoreBadge />);
    expect(toJSON()).toBeNull();
  });

  it('renders nothing when no tricks are completed', () => {
    useTrickStore.setState({
      tricks: [makeTrick({ id: '1', status: 'IN_PROGRESS', points: 20 })],
    });
    const { toJSON } = render(<ScoreBadge />);
    expect(toJSON()).toBeNull();
  });

  it('renders the total score when completed tricks exist', () => {
    useTrickStore.setState({
      tricks: [
        makeTrick({ id: '1', status: 'COMPLETED', points: 10 }),
        makeTrick({ id: '2', status: 'COMPLETED', points: 20 }),
      ],
    });
    render(<ScoreBadge />);
    expect(screen.getByText('30')).toBeTruthy();
    expect(screen.getByText('PTS')).toBeTruthy();
  });
});
