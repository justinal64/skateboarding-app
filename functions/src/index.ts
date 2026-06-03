import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

initializeApp();

const VALID_DIFFICULTIES = new Set(['Easy', 'Intermediate', 'Advanced']);
const VALID_CATEGORIES = new Set(['Basics', 'Flip', 'Grind', 'Slide', 'Transition']);

export const getTricks = onCall({ cors: true }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }
  if (!request.auth.token.email_verified) {
    throw new HttpsError('unauthenticated', 'Email address must be verified.');
  }

  const db = getFirestore();
  const tricksRef = db.collection('tricks');

  try {
    const [publicSnapshot, userSnapshot] = await Promise.all([
      tricksRef.where('isPublic', '==', true).get(),
      tricksRef.where('ownerId', '==', request.auth.uid).get(),
    ]);

    const tricks = new Map();

    publicSnapshot.docs.forEach((doc) => {
      tricks.set(doc.id, { id: doc.id, ...doc.data() });
    });

    userSnapshot.docs.forEach((doc) => {
      tricks.set(doc.id, { id: doc.id, ...doc.data() });
    });

    return { tricks: Array.from(tricks.values()) };
  } catch (error) {
    logger.error('Error fetching tricks', error);
    throw new HttpsError('internal', 'Unable to fetch tricks');
  }
});

export const addTrick = onCall({ cors: true }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }
  if (!request.auth.token.email_verified) {
    throw new HttpsError('unauthenticated', 'Email address must be verified.');
  }

  const { name, description, difficulty, category, video_url, prerequisite_ids } = request.data;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    throw new HttpsError('invalid-argument', 'A valid trick name is required.');
  }
  if (name.trim().length > 100) {
    throw new HttpsError('invalid-argument', 'Trick name must be 100 characters or fewer.');
  }
  if (difficulty !== undefined && !VALID_DIFFICULTIES.has(difficulty)) {
    throw new HttpsError(
      'invalid-argument',
      `difficulty must be one of: ${[...VALID_DIFFICULTIES].join(', ')}.`,
    );
  }
  if (category !== undefined && !VALID_CATEGORIES.has(category)) {
    throw new HttpsError(
      'invalid-argument',
      `category must be one of: ${[...VALID_CATEGORIES].join(', ')}.`,
    );
  }
  if (video_url !== undefined && video_url !== '' && typeof video_url !== 'string') {
    throw new HttpsError('invalid-argument', 'video_url must be a string.');
  }
  if (!Array.isArray(prerequisite_ids) && prerequisite_ids !== undefined) {
    throw new HttpsError('invalid-argument', 'prerequisite_ids must be an array.');
  }

  const db = getFirestore();
  const tricksRef = db.collection('tricks');

  try {
    const newTrick = {
      name: name.trim(),
      description: typeof description === 'string' ? description.trim() : '',
      difficulty: difficulty ?? 'Intermediate',
      category: category ?? 'Basics',
      video_url: typeof video_url === 'string' ? video_url.trim() : '',
      prerequisites: Array.isArray(prerequisite_ids) ? prerequisite_ids : [],
      ownerId: request.auth.uid,
      isPublic: false,
      created_at: new Date(),
    };

    const docRef = await tricksRef.add(newTrick);
    return { id: docRef.id };
  } catch (error) {
    logger.error('Error adding trick', error);
    throw new HttpsError('internal', 'Unable to add trick');
  }
});
