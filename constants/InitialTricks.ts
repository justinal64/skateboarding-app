import { Trick } from "@/types";

export const INITIAL_TRICKS_DATA: Omit<Trick, 'id'>[] = [
  // Basics
  { name: 'Ollie', description: 'The fundamental jump. Popping the tail and sliding the front foot up.', status: 'NOT_STARTED', category: 'Basics', difficulty: 'Easy', points: 10, imageUrl: '', video_url: '', prerequisites: [] },
  { name: 'Manual', description: 'Balancing on the back two wheels while rolling.', status: 'NOT_STARTED', category: 'Basics', difficulty: 'Easy', points: 10, imageUrl: '', video_url: '', prerequisites: [] },
  { name: 'Kickturn', description: 'Lifting the front wheels to pivot and turn.', status: 'NOT_STARTED', category: 'Basics', difficulty: 'Easy', points: 5, imageUrl: '', video_url: '', prerequisites: [] },
  { name: 'Tic-Tac', description: 'Consecutive kickturns to generate speed.', status: 'NOT_STARTED', category: 'Basics', difficulty: 'Easy', points: 5, imageUrl: '', video_url: '', prerequisites: [] },
  { name: 'Fakie Riding', description: 'Riding backwards in your normal stance.', status: 'NOT_STARTED', category: 'Basics', difficulty: 'Easy', points: 5, imageUrl: '', video_url: '', prerequisites: [] },
  { name: 'Switch Riding', description: 'Riding in your opposite stance.', status: 'NOT_STARTED', category: 'Basics', difficulty: 'Intermediate', points: 20, imageUrl: '', video_url: '', prerequisites: [] },
  { name: 'Shuvit', description: 'Rotating the board 180 degrees horizontally without popping.', status: 'NOT_STARTED', category: 'Basics', difficulty: 'Easy', points: 15, imageUrl: '', video_url: '', prerequisites: [] },
  { name: 'Pop Shuvit', description: 'Popping the tail to rotate the board 180 degrees horizontally.', status: 'NOT_STARTED', category: 'Basics', difficulty: 'Intermediate', points: 20, imageUrl: '', video_url: '', prerequisites: [] },
  { name: 'Frontside 180', description: 'Rotating yourself and the board 180 degrees facing forward.', status: 'NOT_STARTED', category: 'Basics', difficulty: 'Intermediate', points: 20, imageUrl: '', video_url: '', prerequisites: [] },
  { name: 'Backside 180', description: 'Rotating yourself and the board 180 degrees facing backward.', status: 'NOT_STARTED', category: 'Basics', difficulty: 'Intermediate', points: 20, imageUrl: '', video_url: '', prerequisites: [] },

  // Flip Tricks
  { name: 'Kickflip', description: 'Flipping the board 360 degrees along its axis with your toe.', status: 'NOT_STARTED', category: 'Flip', difficulty: 'Intermediate', points: 30, imageUrl: '', video_url: '', prerequisites: [] },
  { name: 'Heelflip', description: 'Flipping the board 360 degrees with your heel.', status: 'NOT_STARTED', category: 'Flip', difficulty: 'Intermediate', points: 30, imageUrl: '', video_url: '', prerequisites: [] },
  { name: 'Varial Kickflip', description: 'A combination of a backside pop shuvit and a kickflip.', status: 'NOT_STARTED', category: 'Flip', difficulty: 'Advanced', points: 40, imageUrl: '', video_url: '', prerequisites: [] },
  { name: 'Hardflip', description: 'A frontside pop shuvit combined with a kickflip.', status: 'NOT_STARTED', category: 'Flip', difficulty: 'Advanced', points: 50, imageUrl: '', video_url: '', prerequisites: [] },
  { name: '360 Flip', description: 'A 360 shove-it combined with a kickflip. Also known as a Tre Flip.', status: 'NOT_STARTED', category: 'Flip', difficulty: 'Advanced', points: 50, imageUrl: '', video_url: '', prerequisites: [] },
  { name: 'Impossible', description: 'Wrapping the board vertically around the back foot.', status: 'NOT_STARTED', category: 'Flip', difficulty: 'Advanced', points: 50, imageUrl: '', video_url: '', prerequisites: [] },

  // Grinds & Slides
  { name: '50-50 Grind', description: 'Grinding on both trucks equally.', status: 'NOT_STARTED', category: 'Grind', difficulty: 'Intermediate', points: 25, imageUrl: '', video_url: '', prerequisites: [] },
  { name: '5-0 Grind', description: 'Grinding only on the back truck.', status: 'NOT_STARTED', category: 'Grind', difficulty: 'Advanced', points: 35, imageUrl: '', video_url: '', prerequisites: [] },
  { name: 'Nose Grind', description: 'Grinding only on the front truck.', status: 'NOT_STARTED', category: 'Grind', difficulty: 'Advanced', points: 35, imageUrl: '', video_url: '', prerequisites: [] },
  { name: 'Boardslide', description: 'Sliding the middle of the board between the trucks.', status: 'NOT_STARTED', category: 'Slide', difficulty: 'Intermediate', points: 25, imageUrl: '', video_url: '', prerequisites: [] },
  { name: 'Noseslide', description: 'Sliding on the nose of the deck.', status: 'NOT_STARTED', category: 'Slide', difficulty: 'Advanced', points: 35, imageUrl: '', video_url: '', prerequisites: [] },
  { name: 'Tailslide', description: 'Sliding on the tail of the deck.', status: 'NOT_STARTED', category: 'Slide', difficulty: 'Advanced', points: 35, imageUrl: '', video_url: '', prerequisites: [] },
  { name: 'Crooked Grind', description: 'Grinding on the front truck with the nose angled out.', status: 'NOT_STARTED', category: 'Grind', difficulty: 'Advanced', points: 40, imageUrl: '', video_url: '', prerequisites: [] },

  // Transition
  { name: 'Rock to Fakie', description: 'Hooking the front truck over the coping and rolling back.', status: 'NOT_STARTED', category: 'Transition', difficulty: 'Intermediate', points: 20, imageUrl: '', video_url: '', prerequisites: [] },
  { name: 'Drop In', description: 'Entering a bowl or ramp from the top coping.', status: 'NOT_STARTED', category: 'Transition', difficulty: 'Intermediate', points: 15, imageUrl: '', video_url: '', prerequisites: [] },
];
