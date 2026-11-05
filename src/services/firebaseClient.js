import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApps, initializeApp } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const config = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
};

export const firebaseConfigured = Object.values(config).every(Boolean);

const existingApp = getApps()[0];
const app = firebaseConfigured ? (existingApp || initializeApp(config)) : null;
export const auth = app
  ? (existingApp ? getAuth(app) : initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) }))
  : null;
export const database = app ? getFirestore(app) : null;

let demoUserPromise;

export function ensureDemoUser() {
  if (!auth) return Promise.reject(new Error('Firebase no esta configurado'));
  if (!demoUserPromise) {
    demoUserPromise = auth.authStateReady()
      .then(() => auth.currentUser || signInAnonymously(auth).then((result) => result.user))
      .catch((error) => {
        demoUserPromise = null;
        throw error;
      });
  }
  return demoUserPromise;
}
