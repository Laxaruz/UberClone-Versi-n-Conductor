import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { loadEarningsData, observeEarningsChanges } from '../services/earningsRepository';
import { getEarningsBoundaries, summarizeEarnings } from '../utils/earningsSummary';

export default function useEarnings(driverUid, enabled, configured) {
  const [trips, setTrips] = useState([]);
  const [balance, setBalance] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const requestSequence = useRef(0);
  const earliest = getEarningsBoundaries(new Date(now)).earliest;

  useEffect(() => {
    requestSequence.current += 1;
    setTrips([]);
    setBalance(null);
    setError(null);
  }, [driverUid]);

  const refresh = useCallback(async () => {
    if (!driverUid || !configured) return;
    const sequence = ++requestSequence.current;
    const requestedAt = Date.now();
    setLoading(true);
    setError(null);
    try {
      const data = await loadEarningsData(driverUid,
        getEarningsBoundaries(new Date(requestedAt)).earliest);
      if (sequence !== requestSequence.current) return;
      setTrips(data.trips);
      setBalance(data.balance);
      setNow(requestedAt);
    } catch {
      if (sequence !== requestSequence.current) return;
      setTrips([]);
      setBalance(null);
      setError('earningsLoadFailed');
    } finally {
      if (sequence === requestSequence.current) setLoading(false);
    }
  }, [configured, driverUid]);

  useEffect(() => {
    if (!enabled || !configured || !driverUid) return undefined;
    refresh();
    const unsubscribe = observeEarningsChanges(driverUid, earliest, refresh);
    return () => {
      requestSequence.current += 1;
      unsubscribe();
    };
  }, [configured, driverUid, earliest, enabled, refresh]);

  useEffect(() => {
    if (!enabled) return undefined;
    const timer = setInterval(() => setNow(Date.now()), 60 * 1000);
    return () => clearInterval(timer);
  }, [enabled]);

  const summary = useMemo(() => summarizeEarnings(trips, new Date(now)), [trips, now]);
  return { ...summary, balance, loading, error, refresh, configured };
}
