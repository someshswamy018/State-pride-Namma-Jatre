import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import config from '../../firebase-applet-config.json';

// Validation to catch placeholders early and provide helpful errors
if (
  config.apiKey === 'YOUR_API_KEY' || 
  config.apiKey === 'MISSING_API_KEY' || 
  config.apiKey.includes('...') ||
  config.appId.includes('xxxx')
) {
  console.error(
    "FIREBASE CONFIGURATION ERROR: You are using placeholder or redacted values in 'firebase-applet-config.json'. " +
    "Please replace the values with your actual Firebase project credentials from the Firebase Console (Project Settings > General > Your Apps)."
  );
}

const app = getApps().length > 0 ? getApp() : initializeApp(config);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
