import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, onSnapshot } from 'firebase/firestore';
import { database, ensureDemoUser } from './firebaseClient';

const LAST_CHECKOUT_TRIP_KEY = '@uberclone_last_checkout_trip';
const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/+$/, '');

function hasSecureApiUrl(value) {
  try {
    const url = new URL(value);
    if (!url.hostname || url.username || url.password) return false;
    if (url.protocol === 'https:') return true;
    return __DEV__ && process.env.EXPO_PUBLIC_ALLOW_HTTP_LAN_FOR_TESTS === 'true'
      && url.protocol === 'http:'
      && (url.hostname === 'localhost' || url.hostname === '127.0.0.1'
        || /^192\.168\.[0-9]{1,3}\.[0-9]{1,3}$/.test(url.hostname));
  } catch {
    return false;
  }
}

export const checkoutServiceConfigured = hasSecureApiUrl(apiBaseUrl);

export function isSandboxCheckoutUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:'
      && ['sandbox.mercadopago.com', 'sandbox.mercadopago.com.co'].includes(url.hostname)
      && !url.username && !url.password && !url.port;
  } catch {
    return false;
  }
}

async function authorizedRequest(tripId, path, method = 'GET') {
  if (!checkoutServiceConfigured || !/^[A-Za-z0-9_-]{1,128}$/.test(tripId)) {
    throw new Error('Checkout is not configured');
  }
  const user = await ensureDemoUser();
  const token = await user.getIdToken();
  const response = await fetch(`${apiBaseUrl}/api/trips/${tripId}${path}`, {
    method, headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error(`Checkout service returned ${response.status}`);
  return response.json();
}

export async function getCheckoutTrip(tripId) {
  const trip = await authorizedRequest(tripId, '');
  if (trip.id !== tripId || trip.paymentMethod !== 'mercadopago'
    || !['completed', 'paid'].includes(trip.status)
    || !['pending', 'approved', 'rejected'].includes(trip.paymentStatus)
    || !Number.isSafeInteger(trip.fare) || trip.fare < 0
    || typeof trip.checkoutAvailable !== 'boolean') {
    throw new Error('Invalid checkout trip response');
  }
  return trip;
}

export async function createTestCheckout(tripId) {
  const result = await authorizedRequest(tripId, '/checkout', 'POST');
  if (!result.preferenceId || !isSandboxCheckoutUrl(result.checkoutUrl)) {
    throw new Error('Invalid sandbox checkout URL');
  }
  return result.checkoutUrl;
}

export function rememberCheckoutTrip(tripId) {
  return AsyncStorage.setItem(LAST_CHECKOUT_TRIP_KEY, tripId);
}

export function getLastCheckoutTripId() {
  return AsyncStorage.getItem(LAST_CHECKOUT_TRIP_KEY);
}

export function clearCheckoutTrip() {
  return AsyncStorage.removeItem(LAST_CHECKOUT_TRIP_KEY);
}

export function observeCheckoutTrip(tripId, onUpdate) {
  if (!database || !/^[A-Za-z0-9_-]{1,128}$/.test(tripId || '')) return () => {};
  let lastState = null;
  let stopped = false;
  let unsubscribe = () => {};
  ensureDemoUser().then(() => {
    if (stopped) return;
    unsubscribe = onSnapshot(doc(database, 'trips', tripId), { includeMetadataChanges: true }, (snapshot) => {
      if (!snapshot.exists() || snapshot.metadata.fromCache || snapshot.metadata.hasPendingWrites) return;
      const data = snapshot.data();
      const nextState = `${data.status}:${data.paymentStatus}:${data.paymentId ?? ''}`;
      if (nextState !== lastState) {
        lastState = nextState;
        onUpdate();
      }
    }, () => {});
  }).catch(() => {});
  return () => {
    stopped = true;
    unsubscribe();
  };
}
