import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';

import TrickListItem from '@/components/TrickListItem';
import { Trick } from '@/types';

jest.mock('@/components/SpriteIcon', () => 'SpriteIcon');
jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Ionicons' }));

const baseTrick: Trick = {
  id: '1',
  name: 'Kickflip',
  description: '',
  imageUrl: '',
  video_url: '',
  difficulty: 'Intermediate',
  category: 'Flip',
  points: 20,
  prerequisites: [],
  status: 'NOT_STARTED',
};

describe('TrickListItem', () => {
  it('renders the trick name in uppercase', () => {
    render(<TrickListItem trick={baseTrick} index={1} onPress={() => {}} />);
    expect(screen.getByText('KICKFLIP')).toBeTruthy();
  });

  it('renders the row number zero-padded to 2 digits', () => {
    render(<TrickListItem trick={baseTrick} index={3} onPress={() => {}} />);
    expect(screen.getByText('03')).toBeTruthy();
  });

  it('renders difficulty and category', () => {
    render(<TrickListItem trick={baseTrick} index={1} onPress={() => {}} />);
    expect(screen.getByText('Intermediate')).toBeTruthy();
    expect(screen.getByText(' · Flip')).toBeTruthy();
  });

  it('renders point value', () => {
    render(<TrickListItem trick={baseTrick} index={1} onPress={() => {}} />);
    expect(screen.getByText('+20')).toBeTruthy();
  });

  it('calls onPress with the trick when tapped', () => {
    const onPress = jest.fn();
    render(<TrickListItem trick={baseTrick} index={1} onPress={onPress} />);
    fireEvent.press(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalledWith(baseTrick);
  });

  it('has correct accessibility label for NOT_STARTED status', () => {
    render(<TrickListItem trick={baseTrick} index={1} onPress={() => {}} />);
    expect(screen.getByLabelText('Kickflip, not started')).toBeTruthy();
  });

  it('has correct accessibility label for COMPLETED status', () => {
    render(
      <TrickListItem trick={{ ...baseTrick, status: 'COMPLETED' }} index={1} onPress={() => {}} />,
    );
    expect(screen.getByLabelText('Kickflip, completed')).toBeTruthy();
  });

  it('has correct accessibility label for IN_PROGRESS status', () => {
    render(
      <TrickListItem trick={{ ...baseTrick, status: 'IN_PROGRESS' }} index={1} onPress={() => {}} />,
    );
    expect(screen.getByLabelText('Kickflip, in progress')).toBeTruthy();
  });
});
