import { useCallback, useEffect, useRef, useState } from 'react';
import { loadTripsPage } from '../services/tripPages';

export default function useTripHistory(driverUid, enabled, configured, filters) {
  const [trips, setTrips] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [reload, setReload] = useState(0);
  const sequence = useRef(0);
  const moreInFlight = useRef(false);
  const filterKey = filters ? JSON.stringify(filters) : '';

  useEffect(() => {
    const current = ++sequence.current;
    moreInFlight.current = false;
    setTrips([]);
    setCursor(null);
    setHasMore(false);
    setError(false);
    setLoading(false);
    setLoadingMore(false);
    setLoaded(false);
    if (enabled && configured && driverUid && filters) {
      setLoading(true);
      loadTripsPage(driverUid, filters).then((page) => {
        if (current !== sequence.current) return;
        setTrips(page.trips);
        setCursor(page.cursor);
        setHasMore(page.hasMore);
      }).catch(() => {
        if (current === sequence.current) setError(true);
      }).finally(() => {
        if (current === sequence.current) {
          setLoading(false);
          setLoaded(true);
        }
      });
    }
    return () => { sequence.current += 1; };
  }, [driverUid, enabled, configured, filterKey, reload]);

  const loadMore = useCallback(async () => {
    if (!enabled || !configured || !driverUid || !filters || !hasMore || moreInFlight.current) return;
    const current = sequence.current;
    moreInFlight.current = true;
    setLoadingMore(true);
    setError(false);
    try {
      const page = await loadTripsPage(driverUid, { ...filters, cursor });
      if (current !== sequence.current) return;
      setTrips((previous) => [...previous, ...page.trips]);
      setCursor(page.cursor);
      setHasMore(page.hasMore);
    } catch {
      if (current === sequence.current) setError(true);
    } finally {
      if (current === sequence.current) {
        moreInFlight.current = false;
        setLoadingMore(false);
      }
    }
  }, [driverUid, enabled, configured, filterKey, cursor, hasMore]);

  return { trips, hasMore, loading, loadingMore, loaded, error, loadMore,
    refresh: () => setReload((value) => value + 1) };
}
