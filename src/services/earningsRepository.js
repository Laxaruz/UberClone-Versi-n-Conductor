import { collection, doc, getDocFromServer, getDocsFromServer, limit, onSnapshot,
  orderBy, query, startAfter, Timestamp, where } from 'firebase/firestore';
import { database, ensureDemoUser } from './firebaseClient';

const PAGE_SIZE = 20;

function tripsQuery(driverUid, earliest, after) {
  const constraints = [where('driverId', '==', driverUid),
    where('completedAt', '>=', Timestamp.fromMillis(earliest)),
    orderBy('completedAt', 'desc'), limit(PAGE_SIZE)];
  if (after) constraints.push(startAfter(after));
  return query(collection(database, 'trips'), ...constraints);
}

export async function loadEarningsData(driverUid, earliest) {
  if (!database || !driverUid) throw new Error('Earnings are unavailable');
  const user = await ensureDemoUser();
  if (user.uid !== driverUid) throw new Error('Driver session changed');

  const trips = [];
  let after = null;
  while (true) {
    const snapshot = await getDocsFromServer(tripsQuery(driverUid, earliest, after));
    for (const item of snapshot.docs) {
      const data = item.data();
      trips.push({ id: item.id, fare: data.fare, commission: data.commission,
        tip: data.tip, driverEarnings: data.driverEarnings,
        status: data.status, paymentStatus: data.paymentStatus,
        paymentMethod: data.paymentMethod, completedAtMs: data.completedAt?.toMillis?.() });
    }
    if (snapshot.size < PAGE_SIZE) break;
    after = snapshot.docs[snapshot.docs.length - 1];
  }

  const balanceSnapshot = await getDocFromServer(doc(database, 'driverBalances', driverUid));
  const balance = balanceSnapshot.exists() ? balanceSnapshot.data().balance : 0;
  if (!Number.isSafeInteger(balance)) throw new Error('Invalid driver balance');
  return { trips, balance };
}

export function observeEarningsChanges(driverUid, earliest, onChange) {
  if (!database || !driverUid) return () => {};
  let ready = false;
  const unsubscribeTrips = onSnapshot(tripsQuery(driverUid, earliest), (snapshot) => {
    if (snapshot.metadata.fromCache) return;
    if (ready) onChange();
    ready = true;
  }, onChange);
  const unsubscribeBalance = onSnapshot(doc(database, 'driverBalances', driverUid),
    (snapshot) => { if (!snapshot.metadata.fromCache) onChange(); }, onChange);
  return () => { unsubscribeTrips(); unsubscribeBalance(); };
}
