import { doc, onSnapshot, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { database } from './firebaseClient';
import { registrationDetails } from '../utils/registrationDetails';

function driverReference(uid) {
  return doc(database, 'drivers', uid);
}

export function observeDriver(uid, onChange, onError) {
  return onSnapshot(driverReference(uid), { includeMetadataChanges: true }, (snapshot) => {
    onChange(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null, !snapshot.metadata.fromCache);
  }, onError);
}

export function createPendingDriver(uid, registration) {
  return setDoc(driverReference(uid), {
    // AI-assisted: see docs/AI_LOG.md #15
    ...registrationDetails(registration),
    approvalStatus: 'pending_demo',
    registrationMode: 'demo',
    photoStatus: 'local_only',
    available: false,
    location: null,
    locationUpdatedAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export function setDriverAvailability(uid, available, coordinates) {
  const location = available ? coordinates : null;
  return updateDoc(driverReference(uid), {
    available,
    location,
    locationUpdatedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export function saveDriverLocation(uid, coordinates) {
  return updateDoc(driverReference(uid), {
    location: coordinates,
    locationUpdatedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export function toCoordinates(location) {
  const latitude = location?.latitude;
  const longitude = location?.longitude;
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;
  return { latitude, longitude };
}
