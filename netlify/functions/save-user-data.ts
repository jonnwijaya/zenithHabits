
import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import * as admin from 'firebase-admin';

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
    console.log("Firebase Admin SDK initialized successfully for save-user-data.");
  } catch (error) {
    console.error('Firebase Admin SDK initialization error for save-user-data:', error);
  }
}
const db = admin.firestore();

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  if (event.httpMethod !== 'POST') {
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
    console.log(`Verified ID token for user (save action): ${userId}`);
  } catch (error: any) {
    console.error("Error verifying Firebase ID token (save action):", error);
    return { statusCode: 401, body: JSON.stringify({ message: `Unauthorized - Invalid token: ${error.message}` }) };
  }
  
  if (!userId) {
     return { statusCode: 401, body: JSON.stringify({ message: "Unauthorized - User ID not found after token verification (save action)" }) };
  }

  if (!event.body) {
    return { statusCode: 400, body: JSON.stringify({ message: "Bad Request: Missing body" }) };
  }

  try {
    const { habits, habitCompletionStatus } = JSON.parse(event.body);

    // Basic validation (you might want more robust validation)
    if (!Array.isArray(habits) || typeof habitCompletionStatus !== 'object') {
        return { statusCode: 400, body: JSON.stringify({ message: "Bad Request: Invalid data format" }) };
    }

    const batch = db.batch();
    const habitsRef = db.collection('users').doc(userId).collection('data').doc('habits');
    const completionStatusRef = db.collection('users').doc(userId).collection('data').doc('completionStatus');

    batch.set(habitsRef, { habits }); // Firestore expects an object, so wrap array if needed
    batch.set(completionStatusRef, { completionStatus }); // Same here

    await batch.commit();
    
    console.log(`Data saved successfully for user ${userId}.`);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Data saved successfully" }),
    };
  } catch (error: any) {
    console.error("Error saving user data to Firestore:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to save user data", error: error.message }),
    };
  }
};
