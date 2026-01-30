import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import { HttpsError, onCall, onRequest } from "firebase-functions/v2/https";

initializeApp();

export const helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});

export const getTricks = onCall(async (request) => {
  const db = getFirestore();
  const tricksRef = db.collection("tricks");

  try {
    // 1. Fetch all public tricks
    const publicTricksQuery = tricksRef.where("isPublic", "==", true).get();

    // 2. Fetch user's private tricks if authenticated
    let userTricksQuery: Promise<FirebaseFirestore.QuerySnapshot> | null = null;
    if (request.auth) {
      userTricksQuery = tricksRef.where("ownerId", "==", request.auth.uid).get();
    }

    const [publicSnapshot, userSnapshot] = await Promise.all([
      publicTricksQuery,
      userTricksQuery ? userTricksQuery : Promise.resolve(null)
    ]);

    const tricks = new Map();

    // Add public tricks
    publicSnapshot.docs.forEach(doc => {
      tricks.set(doc.id, { id: doc.id, ...doc.data() });
    });

    // Add/Overwrite with user tricks (though they shouldn't overlap usually, this handles it safely)
    if (userSnapshot) {
      userSnapshot.docs.forEach(doc => {
        tricks.set(doc.id, { id: doc.id, ...doc.data() });
      });
    }

    return {
      tricks: Array.from(tricks.values())
    };

  } catch (error) {
    logger.error("Error fetching tricks", error);
    throw new HttpsError("internal", "Unable to fetch tricks");
  }
});
