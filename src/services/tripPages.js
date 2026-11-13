import { collection, doc, getDocFromServer, getDocsFromServer, limit, orderBy,
  query, startAfter, Timestamp, where } from 'firebase/firestore';
import { database, ensureDemoUser } from './firebaseClient';

export const TRIP_PAGE_SIZE = 20;

export function tripsQuery(driverUid, { startMs, endMs, paymentMethod, cursor } = {}) {
  const filters = [where('driverId', '==', driverUid)];
  if (paymentMethod) filters.push(where('paymentMethod', '==', paymentMethod));
  if (Number.isFinite(startMs)) filters.push(where('completedAt', '>=', Timestamp.fromMillis(startMs)));
  if (Number.isFinite(endMs)) filters.push(where('completedAt', '<', Timestamp.fromMillis(endMs)));
  filters.push(orderBy('completedAt', 'desc'), limit(TRIP_PAGE_SIZE));
  if (cursor) filters.push(startAfter(cursor));
  return query(collection(database, 'trips'), ...filters);
}

async function checkDriver(driverUid) {
  if (!database || !driverUid) throw new Error('Trips are unavailable');
  const user = await ensureDemoUser();
  if (user.uid !== driverUid) throw new Error('Driver session changed');
}

function mapTrip(snapshot) {
  const data = snapshot.data();
  return { ...data, id: snapshot.id, completedAtMs: data.completedAt?.toMillis?.() };
}

export async function loadTripsPage(driverUid, filters = {}) {
  await checkDriver(driverUid);
  const snapshot = await getDocsFromServer(tripsQuery(driverUid, filters));
  return {
    trips: snapshot.docs.map(mapTrip),
    cursor: snapshot.docs[snapshot.docs.length - 1] ?? null,
    hasMore: snapshot.size === TRIP_PAGE_SIZE,
  };
}

export async function loadTripDetail(driverUid, tripId) {
  await checkDriver(driverUid);
  if (!tripId) throw new Error('Trip ID is required');
  const snapshot = await getDocFromServer(doc(database, 'trips', tripId));
  if (!snapshot.exists() || snapshot.data().driverId !== driverUid) return null;
  return mapTrip(snapshot);
}
