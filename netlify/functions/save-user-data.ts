
import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import * as admin from 'firebase-admin';
// Habit and HabitCompletionStatus types might be needed if you strongly type the body
// import type { Habit, HabitCompletionStatus } from '../../src/types'; 

// Initialize Firebase Admin SDK (same as in get-user-data.ts)
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
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const user = context.clientContext?.user;

  if (!user || !user.sub) {
    return { statusCode: 401, body: JSON.stringify({ message: "Unauthorized - User not found in context" }) };
  }
  
  const userId = user.sub;

  if (!event.body) {
    return { statusCode: 400, body: JSON.stringify({ message: "Bad Request: Missing body" }) };
  }

  try {
    const { habits, habitCompletionStatus } = JSON.parse(event.body);

    // Validate habits and habitCompletionStatus if necessary

    const batch = db.batch();
    const habitsRef = db.collection('users').doc(userId).collection('data').doc('habits');
    const completionStatusRef = db.collection('users').doc(userId).collection('data').doc('completionStatus');

    batch.set(habitsRef, { habits });
    batch.set(completionStatusRef, { completionStatus });

    await batch.commit();
    
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Data saved successfully" }),
    };
  } catch (error) {
    console.error("Error saving user data:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to save user data", error: error.message }),
    };
  }
};
