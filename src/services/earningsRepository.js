import { doc, getDocFromServer, onSnapshot } from 'firebase/firestore';
import { database } from './firebaseClient';
import { loadTripsPage, tripsQuery } from './tripPages';

export async function loadEarningsData(driverUid, earliest) {
  const trips = [];
  let cursor = null;
  while (true) {
    const page = await loadTripsPage(driverUid, { startMs: earliest, cursor });
    trips.push(...page.trips);
    if (!page.hasMore) break;
    cursor = page.cursor;
  }

  const balanceSnapshot = await getDocFromServer(doc(database, 'driverBalances', driverUid));
  const balance = balanceSnapshot.exists() ? balanceSnapshot.data().balance : 0;
  if (!Number.isSafeInteger(balance)) throw new Error('Invalid driver balance');
  return { trips, balance };
}

export function observeEarningsChanges(driverUid, earliest, onChange) {
  if (!database || !driverUid) return () => {};
  let ready = false;
  const unsubscribeTrips = onSnapshot(tripsQuery(driverUid, { startMs: earliest }), (snapshot) => {
    if (snapshot.metadata.fromCache) return;
    if (ready) onChange();
    ready = true;
  }, onChange);
  const unsubscribeBalance = onSnapshot(doc(database, 'driverBalances', driverUid),
    (snapshot) => { if (!snapshot.metadata.fromCache) onChange(); }, onChange);
  return () => { unsubscribeTrips(); unsubscribeBalance(); };
}
