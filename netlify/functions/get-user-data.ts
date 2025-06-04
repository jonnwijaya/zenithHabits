
import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import * as admin from 'firebase-admin';
import type { Habit, HabitCompletionStatus } from '../../src/types'; // Adjust path as needed

// Initialize Firebase Admin SDK
// IMPORTANT: Store your service account credentials securely as Netlify environment variables.
// Example: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
// Ensure FIREBASE_PRIVATE_KEY newlines are handled (e.g., replace \n with \\n in env var, then convert back here)
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('Firebase Admin SDK initialization error:', error);
  }
}

const db = admin.firestore();

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const user = context.clientContext?.user;

  if (!user || !user.sub) {
    return { statusCode: 401, body: JSON.stringify({ message: "Unauthorized - User not found in context" }) };
  }

  const userId = user.sub; // Netlify Identity user ID

  try {
    const habitsDoc = await db.collection('users').doc(userId).collection('data').doc('habits').get();
    const completionStatusDoc = await db.collection('users').doc(userId).collection('data').doc('completionStatus').get();

    const habits: Habit[] = habitsDoc.exists ? (habitsDoc.data()?.habits || []) : [];
    const completionStatus: HabitCompletionStatus = completionStatusDoc.exists ? (completionStatusDoc.data()?.completionStatus || {}) : {};
    
    return {
      statusCode: 200,
      body: JSON.stringify({ habits, completionStatus }),
    };
  } catch (error) {
    console.error("Error fetching user data:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to fetch user data", error: error.message }),
    };
  }
};
