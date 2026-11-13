import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { collection, deleteDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { PermissionsAndroid, Platform } from 'react-native';
import { database } from './firebaseClient';

const DEVICE_ID_KEY = '@uberclone_push_device_id';

export function pushAvailable() {
  return !!database && Platform.OS !== 'web'
    && Constants.executionEnvironment !== 'storeClient';
}

function messagingModule() {
  if (!pushAvailable()) return null;
  return require('@react-native-firebase/messaging');
}

async function deviceDocument(uid) {
  let id = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = doc(collection(database, 'drivers', uid, 'devices')).id;
    await AsyncStorage.setItem(DEVICE_ID_KEY, id);
  }
  return doc(database, 'drivers', uid, 'devices', id);
}

export async function registerDriverNotifications(uid) {
  const native = messagingModule();
  if (!uid || !native) return () => {};

  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const permission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    if (permission !== PermissionsAndroid.RESULTS.GRANTED) return () => {};
  }

  const messaging = native.getMessaging();
  if (Platform.OS === 'ios') {
    const permission = await native.requestPermission(messaging);
    if (permission !== native.AuthorizationStatus.AUTHORIZED
      && permission !== native.AuthorizationStatus.PROVISIONAL) return () => {};
  }

  const deviceRef = await deviceDocument(uid);
  const unsubscribe = native.onRegistered(messaging, (fid) => {
    setDoc(deviceRef, { fid, platform: Platform.OS, updatedAt: serverTimestamp() })
      .catch(() => console.warn('No se pudo guardar el dispositivo para notificaciones.'));
  });
  try {
    await native.register(messaging);
  } catch (error) {
    unsubscribe();
    throw error;
  }
  return unsubscribe;
}

export async function removeDriverNotifications(uid) {
  const native = messagingModule();
  if (!uid || !native) return;
  await deleteDoc(await deviceDocument(uid));
  await native.unregister(native.getMessaging());
}

export function listenForRequestNotifications(onOpen) {
  const native = messagingModule();
  if (!native) return () => {};
  const messaging = native.getMessaging();
  let active = true;
  const receive = (message) => {
    const requestId = message?.data?.requestId;
    if (active && typeof requestId === 'string' && requestId.length > 0) onOpen(requestId);
  };
  const unsubscribe = native.onNotificationOpenedApp(messaging, receive);
  native.getInitialNotification(messaging).then(receive).catch(() => {});
  return () => {
    active = false;
    unsubscribe();
  };
}
