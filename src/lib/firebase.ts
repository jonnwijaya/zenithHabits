
import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

if (!firebaseApiKey || typeof firebaseApiKey !== 'string' || firebaseApiKey.trim() === '') {
  throw new Error(
    'Firebase API Key is missing or invalid. ' +
    'Please ensure NEXT_PUBLIC_FIREBASE_API_KEY is correctly set in your .env.local file ' +
    'and that you have restarted your development server.'
  );
}

const firebaseConfig: FirebaseOptions = {
  apiKey: firebaseApiKey,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  // measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Optional
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth = getAuth(app);
// const db = getFirestore(app); // Add if you need client-side Firestore access

export { app, auth /*, db */ };
