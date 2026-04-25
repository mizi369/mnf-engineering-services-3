
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with Offline Persistence
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Analytics
let analytics = null;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (e: any) {
    console.warn('[FIREBASE] Analytics failed to initialize:', e.message);
  }
}

// Enable Offline Persistence for Firestore (Crucial for "Offline System")
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('[FIREBASE] Persistence failed: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      console.warn('[FIREBASE] Persistence failed: Browser not supported');
    }
  });
}

const auth = getAuth(app);

// Connectivity Test (as per integration guidelines)
import { doc, getDocFromServer } from 'firebase/firestore';
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error: any) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

export { app, db, auth };
