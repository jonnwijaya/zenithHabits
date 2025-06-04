
import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import * as admin from 'firebase-admin';
import type { Habit, HabitCompletionStatus } from '../../src/types'; 

// Ensure FIREBASE_PRIVATE_KEY newlines are handled
// (e.g., replace \n with \\n in env var, then convert back here)
const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });
    console.log("Firebase Admin SDK initialized successfully.");
  } catch (error) {
    console.error('Firebase Admin SDK initialization error:', error);
  }
}

const db = admin.firestore();

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
  }

  const authorizationHeader = event.headers['authorization'];
  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    return { statusCode: 401, body: JSON.stringify({ message: 'Unauthorized - Missing or malformed token' }) };
  }

  const idToken = authorizationHeader.split('Bearer ')[1];
  let userId: string;

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    userId = decodedToken.uid;
    console.log(`Verified ID token for user: ${userId}`);
  } catch (error: any) {
    console.error("Error verifying Firebase ID token:", error);
    return { statusCode: 401, body: JSON.stringify({ message: `Unauthorized - Invalid token: ${error.message}` }) };
  }

  if (!userId) {
     return { statusCode: 401, body: JSON.stringify({ message: "Unauthorized - User ID not found after token verification" }) };
  }

  try {
    const habitsDoc = await db.collection('users').doc(userId).collection('data').doc('habits').get();
    const completionStatusDoc = await db.collection('users').doc(userId).collection('data').doc('completionStatus').get();

    const habits: Habit[] = habitsDoc.exists ? (habitsDoc.data()?.habits || []) : [];
    const completionStatus: HabitCompletionStatus = completionStatusDoc.exists ? (completionStatusDoc.data()?.completionStatus || {}) : {};
    
    console.log(`Fetched data for user ${userId}: ${habits.length} habits, ${Object.keys(completionStatus).length} completion status entries.`);
    return {
      statusCode: 200,
      body: JSON.stringify({ habits, completionStatus }),
    };
  } catch (error: any) {
    console.error("Error fetching user data from Firestore:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to fetch user data", error: error.message }),
    };
  }
};
