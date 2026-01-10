import { Timestamp } from 'firebase/firestore';

export type TrickDifficulty = 'Easy' | 'Intermediate' | 'Advanced';
export type TrickCategory = 'Basics' | 'Flip' | 'Grind' | 'Transition';
export type TrickStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export interface TrickMeta {
  id?: string; // Optional for seeding (auto-generated)
  title: string; // Mapped to 'name' in user request, keeping 'title' for consistency or refactoring? User asked for 'name'. I will map 'title' to 'name' in Firestore or renaming here. Let's use 'name' to verify strict compliance.
  // Wait, TrickData.ts uses 'title'. I should double check.
  // User Request: "name". I will switch to "name".
  name: string;
  description: string;
  imageUrl: string;
  difficulty: TrickDifficulty;
  category: TrickCategory;
  video_url: string;
  points: number;
  prerequisites: string[]; // List of Trick IDs or Names
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
