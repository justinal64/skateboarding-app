import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';

import FeaturedTrickCard from '@/components/FeaturedTrickCard';
import { Trick } from '@/types';

jest.mock('@/components/SpriteIcon', () => 'SpriteIcon');
jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Ionicons' }));

const kickflip: Trick = {
  id: 'trick1',
  name: 'Kickflip',
  description: '',
  imageUrl: '',
  video_url: '',
  difficulty: 'Intermediate',
  category: 'Flip',
  points: 20,
  prerequisites: [],
  status: 'IN_PROGRESS',
};

describe('FeaturedTrickCard', () => {
  it('renders the trick name in uppercase', () => {
    render(
      <FeaturedTrickCard trick={kickflip} onLogSession={() => {}} onLandedIt={() => {}} />,
    );
    expect(screen.getByText('KICKFLIP')).toBeTruthy();
  });

  it('renders difficulty and category', () => {
    render(
      <FeaturedTrickCard trick={kickflip} onLogSession={() => {}} onLandedIt={() => {}} />,
    );
    expect(screen.getByText('Intermediate')).toBeTruthy();
    expect(screen.getByText(' · Flip')).toBeTruthy();
  });

  it('renders XP points', () => {
    render(
      <FeaturedTrickCard trick={kickflip} onLogSession={() => {}} onLandedIt={() => {}} />,
    );
    expect(screen.getByText('+20 XP')).toBeTruthy();
  });

  it('calls onLogSession with the trick when Log Session is tapped', () => {
    const onLogSession = jest.fn();
    render(
      <FeaturedTrickCard trick={kickflip} onLogSession={onLogSession} onLandedIt={() => {}} />,
    );
    fireEvent.press(screen.getByLabelText('Log a practice session'));
    expect(onLogSession).toHaveBeenCalledWith(kickflip);
  });

  it('calls onLandedIt with the trick when I Landed It is tapped', () => {
    const onLandedIt = jest.fn();
    render(
      <FeaturedTrickCard trick={kickflip} onLogSession={() => {}} onLandedIt={onLandedIt} />,
    );
    fireEvent.press(screen.getByLabelText('Mark trick as landed'));
    expect(onLandedIt).toHaveBeenCalledWith(kickflip);
  });

  it('shows the Now Learning badge', () => {
    render(
      <FeaturedTrickCard trick={kickflip} onLogSession={() => {}} onLandedIt={() => {}} />,
    );
    expect(screen.getByText('Now Learning')).toBeTruthy();
  });
});
