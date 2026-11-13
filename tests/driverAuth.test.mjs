import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const dataUrl = (source) => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const storage = new Map();
const state = { anonymousSignIns: 0, currentUser: null };
const auth = { authStateReady: async () => {}, get currentUser() { return state.currentUser; } };
const anonymousUser = { uid: 'driver-test', isAnonymous: true, email: null };
const linkedUser = { uid: 'driver-test', isAnonymous: false, email: 'driver@example.com' };

const storageMock = dataUrl(`export default {
  getItem: async (key) => globalThis.authTestStorage.get(key) ?? null,
  setItem: async (key, value) => { globalThis.authTestStorage.set(key, value); },
  removeItem: async (key) => { globalThis.authTestStorage.delete(key); },
};`);
const appMock = dataUrl('export const getApps = () => []; export const initializeApp = () => ({});');
const authMock = dataUrl(`
  export const EmailAuthProvider = { credential: (email, password) => ({ email, password }) };
  export const getReactNativePersistence = () => ({});
  export const initializeAuth = () => globalThis.authTestAuth;
  export const getAuth = () => globalThis.authTestAuth;
  export const signInAnonymously = async () => {
    globalThis.authTestState.anonymousSignIns += 1;
    globalThis.authTestState.currentUser = globalThis.authTestAnonymous;
    return { user: globalThis.authTestAnonymous };
  };
  export const linkWithCredential = async (user, credential) => {
    if (credential.email === 'used@example.com') throw new Error('email-already-in-use');
    globalThis.authTestState.currentUser = globalThis.authTestLinked;
    return { user: globalThis.authTestLinked };
  };
  export const signOut = async () => { globalThis.authTestState.currentUser = null; };
  export const signInWithEmailAndPassword = async () => {
    globalThis.authTestState.currentUser = globalThis.authTestLinked;
    return { user: globalThis.authTestLinked };
  };
`);
const firestoreMock = dataUrl('export const getFirestore = () => ({});');

globalThis.authTestStorage = storage;
globalThis.authTestState = state;
globalThis.authTestAuth = auth;
globalThis.authTestAnonymous = anonymousUser;
globalThis.authTestLinked = linkedUser;
for (const key of ['API_KEY', 'AUTH_DOMAIN', 'PROJECT_ID', 'APP_ID', 'MESSAGING_SENDER_ID']) {
  process.env[`EXPO_PUBLIC_FIREBASE_${key}`] = 'test';
}

const source = readFileSync(new URL('../src/services/firebaseClient.js', import.meta.url), 'utf8')
  .replace("'@react-native-async-storage/async-storage'", `'${storageMock}'`)
  .replace("'firebase/app'", `'${appMock}'`)
  .replace("'firebase/auth'", `'${authMock}'`)
  .replace("'firebase/firestore'", `'${firestoreMock}'`);
const client = await import(dataUrl(source));

assert.equal((await client.restoreDriverUser()).uid, anonymousUser.uid);
assert.equal(state.anonymousSignIns, 1);
await assert.rejects(client.linkDriverAccount('used@example.com', 'example123'));
assert.equal(state.currentUser.isAnonymous, true);
const linked = await client.linkDriverAccount('driver@example.com', 'example123');
assert.equal(linked.uid, anonymousUser.uid);
await client.logOutDriver();
assert.equal(state.currentUser, null);
assert.equal(storage.get('@uberclone_driver_signed_out'), 'true');
assert.equal(await client.restoreDriverUser(), null);
assert.equal(state.anonymousSignIns, 1);
assert.equal((await client.logInDriver('driver@example.com', 'example123')).uid, anonymousUser.uid);
assert.equal(storage.has('@uberclone_driver_signed_out'), false);
assert.equal((await client.restoreDriverUser()).uid, anonymousUser.uid);

storage.set('@uberclone_driver_signed_out', 'true');
const restarted = await import(`${dataUrl(source)}#restart`);
assert.equal(await restarted.restoreDriverUser(), null);
assert.equal(state.currentUser, null);
assert.equal(state.anonymousSignIns, 1);

console.log('Anonymous account linking, logout and recovery passed');
