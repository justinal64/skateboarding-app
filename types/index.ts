import { Timestamp } from 'firebase/firestore';

export type TrickDifficulty = 'Easy' | 'Intermediate' | 'Advanced';
export type TrickCategory = 'Basics' | 'Flip' | 'Grind' | 'Transition' | 'Slide';
export type TrickStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export interface TrickMeta {
  id?: string; // Optional for seeding (auto-generated)
  name: string;
  description: string;
  imageUrl: string;
  difficulty: TrickDifficulty;
  category: TrickCategory;
  video_url: string;
  points: number;
  prerequisites: string[]; // List of Trick IDs or Names
  ownerId?: string; // If present, only visible to this user
  isPublic?: boolean; // If true, visible to everyone
}

export interface UserTrickProgress {
  userId: string;
  trickId: string;
  status: TrickStatus;
  startedAt: Timestamp | null;
  masteredAt: Timestamp | null;
  attempts: number;
}

// Combined type for UI
export interface Trick extends TrickMeta {
  id: string; // Must have ID
  status: TrickStatus; // From user progress
}
