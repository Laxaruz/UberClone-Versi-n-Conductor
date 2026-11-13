import {
  collection, doc, getDoc, limit, onSnapshot, orderBy, query, runTransaction,
  serverTimestamp, setDoc, Timestamp, where,
} from 'firebase/firestore';
import { database } from './firebaseClient';
import { canAcceptTripRequest, mapTripRequest, requestExpiresAt } from '../utils/tripRequestContract';

const requests = () => collection(database, 'tripRequests');
const requestRef = (id) => doc(database, 'tripRequests', id);
const responseRef = (id, uid) => doc(database, 'tripRequests', id, 'responses', uid);

// AI-assisted: see docs/AI_LOG.md #22
export function createFirestoreTripRequestSource(uid, preferredId = null) {
  let current = null;
  let candidates = [];
  let listener = null;
  let connected = false;
  let selection = 0;
  const rejectedIds = new Set();

  function publish(error = null) {
    listener?.(current, connected, error);
  }

  async function selectRequest(keepCurrentIfEmpty = false) {
    const thisSelection = ++selection;
    try {
      for (const candidate of candidates) {
        if (candidate.expiresAt <= Date.now() || rejectedIds.has(candidate.id)) continue;
        const response = await getDoc(responseRef(candidate.id, uid));
        if (thisSelection !== selection) return;
        if (!response.exists()) {
          current = candidate;
          publish();
          return;
        }
      }
      if (thisSelection !== selection) return;
      if (!keepCurrentIfEmpty) current = null;
      publish();
    } catch {
      if (thisSelection === selection) {
        if (!keepCurrentIfEmpty) current = null;
        publish('requestLoadFailed');
      }
    }
  }

  return {
    mode: 'firestore_test',
    subscribe(onChange) {
      listener = onChange;
      if (current?.status !== 'accepted') current = null;
      const pending = query(
        requests(), where('status', '==', 'requested'),
        where('expiresAt', '>', Timestamp.now()), orderBy('expiresAt'), limit(20),
      );
      const unsubscribe = onSnapshot(pending, { includeMetadataChanges: true }, (snapshot) => {
        selection += 1;
        connected = !snapshot.metadata.fromCache && !snapshot.metadata.hasPendingWrites;
        if (!connected) {
          current = null;
          publish();
          return;
        }
        candidates = snapshot.docs
          .map((item) => mapTripRequest(item.id, item.data()))
          .filter(Boolean);
        if (preferredId) candidates.sort((a, b) => Number(b.id === preferredId) - Number(a.id === preferredId));
        if (current?.status === 'accepted') publish();
        else selectRequest();
      }, () => {
        selection += 1;
        connected = false;
        current = null;
        publish('requestLoadFailed');
      });
      return () => {
        selection += 1;
        listener = null;
        unsubscribe();
      };
    },
    async resolve(id, action) {
      if (!connected || current?.id !== id || current.status !== 'requested') {
        throw new Error('Request unavailable');
      }
      const decisionRequest = current;
      if (action === 'reject') {
        await setDoc(responseRef(id, uid), { status: 'rejected', respondedAt: serverTimestamp() });
        rejectedIds.add(id);
        const rejectedRequest = { ...current, status: 'rejected' };
        current = rejectedRequest;
        publish();
        selectRequest(true);
        return rejectedRequest;
      }
      if (action !== 'accept' && action !== 'expire') throw new Error('Invalid request action');
      // AI-assisted: see docs/AI_LOG.md #22
      await runTransaction(database, async (transaction) => {
        const reference = requestRef(id);
        const snapshot = await transaction.get(reference);
        const previousResponse = action === 'accept'
          ? await transaction.get(responseRef(id, uid)) : null;
        if (!snapshot.exists()) throw new Error('Request unavailable');
        const data = snapshot.data();
        if (action === 'accept') {
          if (!canAcceptTripRequest(data) || previousResponse.exists()) {
            throw new Error('Request unavailable');
          }
          transaction.update(reference, {
            status: 'accepted', acceptedBy: uid, acceptedAt: serverTimestamp(),
          });
        } else {
          const expiresAt = requestExpiresAt(data);
          if (data.status !== 'requested' || expiresAt === null || expiresAt > Date.now()) {
            throw new Error('Request not expired');
          }
          transaction.update(reference, { status: 'expired' });
        }
      });
      current = { ...decisionRequest, status: action === 'accept' ? 'accepted' : 'expired' };
      publish();
      return current;
    },
  };
}
