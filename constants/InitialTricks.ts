import { Trick } from "@/context/TrickContext";

export const INITIAL_TRICKS_DATA: Omit<Trick, 'id'>[] = [
  // Basics
  { name: 'Ollie', description: 'The fundamental jump. Popping the tail and sliding the front foot up.', status: 'NOT_STARTED' },
  { name: 'Manual', description: 'Balancing on the back two wheels while rolling.', status: 'NOT_STARTED' },
  { name: 'Kickturn', description: 'Lifting the front wheels to pivot and turn.', status: 'NOT_STARTED' },
  { name: 'Tic-Tac', description: 'Consecutive kickturns to generate speed.', status: 'NOT_STARTED' },
  { name: 'Fakie Riding', description: 'Riding backwards in your normal stance.', status: 'NOT_STARTED' },
  { name: 'Switch Riding', description: 'Riding in your opposite stance.', status: 'NOT_STARTED' },
  { name: 'Shuvit', description: 'Rotating the board 180 degrees horizontally without popping.', status: 'NOT_STARTED' },
  { name: 'Pop Shuvit', description: 'Popping the tail to rotate the board 180 degrees horizontally.', status: 'NOT_STARTED' },
  { name: 'Frontside 180', description: 'Rotating yourself and the board 180 degrees facing forward.', status: 'NOT_STARTED' },
  { name: 'Backside 180', description: 'Rotating yourself and the board 180 degrees facing backward.', status: 'NOT_STARTED' },

  // Flip Tricks
  { name: 'Kickflip', description: 'Flipping the board 360 degrees along its axis with your toe.', status: 'NOT_STARTED' },
  { name: 'Heelflip', description: 'Flipping the board 360 degrees with your heel.', status: 'NOT_STARTED' },
  { name: 'Varial Kickflip', description: 'A combination of a backside pop shuvit and a kickflip.', status: 'NOT_STARTED' },
  { name: 'Hardflip', description: 'A frontside pop shuvit combined with a kickflip.', status: 'NOT_STARTED' },
  { name: '360 Flip', description: 'A 360 shove-it combined with a kickflip. Also known as a Tre Flip.', status: 'NOT_STARTED' },
  { name: 'Impossible', description: 'Wrapping the board vertically around the back foot.', status: 'NOT_STARTED' },

  // Grinds & Slides
  { name: '50-50 Grind', description: 'Grinding on both trucks equally.', status: 'NOT_STARTED' },
  { name: '5-0 Grind', description: 'Grinding only on the back truck.', status: 'NOT_STARTED' },
  { name: 'Nose Grind', description: 'Grinding only on the front truck.', status: 'NOT_STARTED' },
  { name: 'Boardslide', description: 'Sliding the middle of the board between the trucks.', status: 'NOT_STARTED' },
  { name: 'Noseslide', description: 'Sliding on the nose of the deck.', status: 'NOT_STARTED' },
  { name: 'Tailslide', description: 'Sliding on the tail of the deck.', status: 'NOT_STARTED' },
  { name: 'Crooked Grind', description: 'Grinding on the front truck with the nose angled out.', status: 'NOT_STARTED' },

  // Transition
  { name: 'Rock to Fakie', description: 'Hooking the front truck over the coping and rolling back.', status: 'NOT_STARTED' },
  { name: 'Drop In', description: 'Entering a bowl or ramp from the top coping.', status: 'NOT_STARTED' },
];
