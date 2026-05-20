import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';

import UnlockedTricksRow from '@/components/UnlockedTricksRow';
import { Trick } from '@/types';

jest.mock('@/components/SpriteIcon', () => 'SpriteIcon');
jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Ionicons' }));

function makeTrick(overrides: Partial<Trick>): Trick {
  return {
    id: overrides.id ?? '1',
    name: overrides.name ?? 'Ollie',
    description: '',
    imageUrl: '',
    video_url: '',
    difficulty: overrides.difficulty ?? 'Easy',
    category: overrides.category ?? 'Basics',
    points: 10,
    prerequisites: overrides.prerequisites ?? [],
    status: overrides.status ?? 'NOT_STARTED',
    ...overrides,
  };
}

const ollie = makeTrick({ id: 'ollie', name: 'Ollie', status: 'COMPLETED', prerequisites: [] });
const kickflip = makeTrick({
  id: 'kickflip',
  name: 'Kickflip',
  status: 'NOT_STARTED',
  prerequisites: ['Ollie'],
  difficulty: 'Intermediate',
});
const heelflip = makeTrick({
  id: 'heelflip',
  name: 'Heelflip',
  status: 'NOT_STARTED',
  prerequisites: ['Ollie'],
  difficulty: 'Easy',
});

describe('UnlockedTricksRow', () => {
  it('returns null when no tricks are unlocked', () => {
    const { toJSON } = render(<UnlockedTricksRow tricks={[ollie]} onPress={() => {}} />);
    expect(toJSON()).toBeNull();
  });

  it('returns null when prerequisite is not completed', () => {
    const incomplete = makeTrick({ id: 'ollie', name: 'Ollie', status: 'IN_PROGRESS', prerequisites: [] });
    const { toJSON } = render(
      <UnlockedTricksRow tricks={[incomplete, kickflip]} onPress={() => {}} />,
    );
    expect(toJSON()).toBeNull();
  });

  it('returns null for tricks already IN_PROGRESS', () => {
    const inProgress = makeTrick({
      id: 'kickflip',
      name: 'Kickflip',
      status: 'IN_PROGRESS',
      prerequisites: ['Ollie'],
    });
    const { toJSON } = render(
      <UnlockedTricksRow tricks={[ollie, inProgress]} onPress={() => {}} />,
    );
    expect(toJSON()).toBeNull();
  });

  it('returns null for tricks with no prerequisites', () => {
    const noPrereqs = makeTrick({ id: 'noop', name: 'Noop', status: 'NOT_STARTED', prerequisites: [] });
    const { toJSON } = render(<UnlockedTricksRow tricks={[noPrereqs]} onPress={() => {}} />);
    expect(toJSON()).toBeNull();
  });

  it('shows unlocked trick when all prerequisites are completed', () => {
    render(<UnlockedTricksRow tricks={[ollie, kickflip]} onPress={() => {}} />);
    // NativeWind uppercase is a style — the raw text value in the tree is unchanged
    expect(screen.getByText('Kickflip')).toBeTruthy();
    expect(screen.getByText('Newly Unlocked')).toBeTruthy();
  });

  it('shows correct trick count label for multiple tricks', () => {
    render(<UnlockedTricksRow tricks={[ollie, kickflip, heelflip]} onPress={() => {}} />);
    expect(screen.getByText('2 tricks')).toBeTruthy();
  });

  it('shows singular "trick" for a single unlocked trick', () => {
    render(<UnlockedTricksRow tricks={[ollie, kickflip]} onPress={() => {}} />);
    expect(screen.getByText('1 trick')).toBeTruthy();
  });

  it('calls onPress with the correct trick when tapped', () => {
    const onPress = jest.fn();
    render(<UnlockedTricksRow tricks={[ollie, kickflip]} onPress={onPress} />);
    fireEvent.press(screen.getByLabelText('Kickflip, newly unlocked'));
    expect(onPress).toHaveBeenCalledWith(kickflip);
  });

  it('sorts unlocked tricks by difficulty — Easy before Intermediate', () => {
    render(<UnlockedTricksRow tricks={[ollie, kickflip, heelflip]} onPress={() => {}} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons[0].props.accessibilityLabel).toBe('Heelflip, newly unlocked');
    expect(buttons[1].props.accessibilityLabel).toBe('Kickflip, newly unlocked');
  });
});
