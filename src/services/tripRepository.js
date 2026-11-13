import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { database } from './firebaseClient';
import { buildCompletedTrip } from '../utils/completedTrip';

// AI-assisted: see docs/AI_LOG.md #35
export async function saveCompletedTrip(driverId, trip) {
  if (!database || !driverId || !trip?.id) throw new Error('Trip cannot be saved');

  const requestRef = doc(database, 'tripRequests', trip.id);
  const tripRef = doc(database, 'trips', trip.id);

  return runTransaction(database, async (transaction) => {
    const requestSnapshot = await transaction.get(requestRef);
    const savedSnapshot = await transaction.get(tripRef);
    if (!requestSnapshot.exists()) throw new Error('Accepted request not found');

    const data = buildCompletedTrip(trip, requestSnapshot.data(), driverId, serverTimestamp());
    if (savedSnapshot.exists()) {
      if (savedSnapshot.data().requestId === trip.id && savedSnapshot.data().driverId === driverId) {
        return trip.id;
      }
      throw new Error('Trip already exists');
    }

    transaction.set(tripRef, data);
    return trip.id;
  });
}
