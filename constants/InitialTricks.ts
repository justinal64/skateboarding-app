import { Trick } from "@/context/TrickContext";

export const INITIAL_TRICKS_DATA: Omit<Trick, 'id'>[] = [
  // Basics
  { name: 'Ollie', description: 'The fundamental jump. Popping the tail and sliding the front foot up.' },
  { name: 'Manual', description: 'Balancing on the back two wheels while rolling.' },
  { name: 'Kickturn', description: 'Lifting the front wheels to pivot and turn.' },
  { name: 'Tic-Tac', description: 'Consecutive kickturns to generate speed.' },
  { name: 'Fakie Riding', description: 'Riding backwards in your normal stance.' },
  { name: 'Switch Riding', description: 'Riding in your opposite stance.' },
  { name: 'Shuvit', description: 'Rotating the board 180 degrees horizontally without popping.' },
  { name: 'Pop Shuvit', description: 'Popping the tail to rotate the board 180 degrees horizontally.' },
  { name: 'Frontside 180', description: 'Rotating yourself and the board 180 degrees facing forward.' },
  { name: 'Backside 180', description: 'Rotating yourself and the board 180 degrees facing backward.' },

  // Flip Tricks
  { name: 'Kickflip', description: 'Flipping the board 360 degrees along its axis with your toe.' },
  { name: 'Heelflip', description: 'Flipping the board 360 degrees with your heel.' },
  { name: 'Varial Kickflip', description: 'A combination of a backside pop shuvit and a kickflip.' },
  { name: 'Hardflip', description: 'A frontside pop shuvit combined with a kickflip.' },
  { name: '360 Flip', description: 'A 360 shove-it combined with a kickflip. Also known as a Tre Flip.' },
  { name: 'Impossible', description: 'Wrapping the board vertically around the back foot.' },

  // Grinds & Slides
  { name: '50-50 Grind', description: 'Grinding on both trucks equally.' },
  { name: '5-0 Grind', description: 'Grinding only on the back truck.' },
  { name: 'Nose Grind', description: 'Grinding only on the front truck.' },
  { name: 'Boardslide', description: 'Sliding the middle of the board between the trucks.' },
  { name: 'Noseslide', description: 'Sliding on the nose of the deck.' },
  { name: 'Tailslide', description: 'Sliding on the tail of the deck.' },
  { name: 'Crooked Grind', description: 'Grinding on the front truck with the nose angled out.' },

  // Transition
  { name: 'Rock to Fakie', description: 'Hooking the front truck over the coping and rolling back.' },
  { name: 'Drop In', description: 'Entering a bowl or ramp from the top coping.' },
];
