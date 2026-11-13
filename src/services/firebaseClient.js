import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApps, initializeApp } from 'firebase/app';
import { EmailAuthProvider, getAuth, getReactNativePersistence, initializeAuth,
  linkWithCredential, signInAnonymously, signInWithEmailAndPassword, signOut } from 'firebase/auth';
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
const SIGNED_OUT_KEY = '@uberclone_driver_signed_out';

export function restoreDriverUser() {
  if (!auth) return Promise.reject(new Error('Firebase no esta configurado'));
  if (!demoUserPromise) {
    demoUserPromise = auth.authStateReady()
      .then(async () => {
        if (await AsyncStorage.getItem(SIGNED_OUT_KEY) === 'true') {
          if (auth.currentUser) await signOut(auth);
          return null;
        }
        return auth.currentUser || signInAnonymously(auth).then((result) => result.user);
      })
      .catch((error) => {
        demoUserPromise = null;
        throw error;
      });
  }
  return demoUserPromise;
}

export async function ensureDemoUser() {
  const user = await restoreDriverUser();
  if (!user) throw new Error('Driver session is closed');
  return user;
}

export async function linkDriverAccount(email, password) {
  const user = await ensureDemoUser();
  if (!user.isAnonymous) throw new Error('Driver account is already linked');
  const result = await linkWithCredential(user, EmailAuthProvider.credential(email.trim(), password));
  demoUserPromise = Promise.resolve(result.user);
  return result.user;
}

export async function logOutDriver() {
  const user = await ensureDemoUser();
  if (user.isAnonymous) throw new Error('Link an account before signing out');
  await AsyncStorage.setItem(SIGNED_OUT_KEY, 'true');
  demoUserPromise = Promise.resolve(null);
  try {
    await signOut(auth);
  } catch (error) {
    await AsyncStorage.removeItem(SIGNED_OUT_KEY);
    demoUserPromise = Promise.resolve(user);
    throw error;
  }
}

export async function logInDriver(email, password) {
  if (!auth) throw new Error('Firebase no esta configurado');
  const result = await signInWithEmailAndPassword(auth, email.trim(), password);
  try {
    await AsyncStorage.removeItem(SIGNED_OUT_KEY);
  } catch (error) {
    await signOut(auth);
    throw error;
  }
  demoUserPromise = Promise.resolve(result.user);
  return result.user;
}
