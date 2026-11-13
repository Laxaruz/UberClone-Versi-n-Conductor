import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { remainingRequestSeconds } from '../utils/tripRequestTimer';

export default function useTripRequests(source, isFocused) {
  const [request, setRequest] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [appActive, setAppActive] = useState(AppState.currentState === 'active');
  const [connected, setConnected] = useState(source?.mode === 'demo');
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState(null);
  const resolvingRef = useRef(false);
  const active = isFocused && appActive && !!source;
  const remainingSeconds = request?.status === 'requested' ? remainingRequestSeconds(request.expiresAt, now) : 0;

  useEffect(() => {
    const listener = AppState.addEventListener('change', (state) => setAppActive(state === 'active'));
    return () => listener.remove();
  }, []);

  useEffect(() => {
    setRequest(null);
    setConnected(source?.mode === 'demo');
    setError(null);
    if (!active) return undefined;
    return source.subscribe((nextRequest, online = true, sourceError = null) => {
      setRequest(nextRequest);
      setConnected(online);
      setError(sourceError);
      setNow(Date.now());
    });
  }, [source, active]);

  useEffect(() => {
    if (!active || !connected || request?.status !== 'requested') return undefined;
    const update = () => {
      const currentTime = Date.now();
      setNow(currentTime);
      if (currentTime >= request.expiresAt && !resolvingRef.current) {
        if (source.mode === 'demo') source.resolve(request.id, 'expire', currentTime);
        else {
          setRequest((current) => current?.id === request.id ? { ...current, status: 'expired' } : current);
          Promise.resolve(source.resolve(request.id, 'expire', currentTime))
            .catch(() => setError('requestActionFailed'));
        }
      }
    };
    update();
    const interval = setInterval(update, 250);
    return () => clearInterval(interval);
  }, [source, active, connected, request?.id, request?.status, request?.expiresAt]);

  const decide = useCallback(async (action) => {
    if (!active || !connected || !request || request.status !== 'requested'
      || remainingSeconds === 0 || resolvingRef.current) return;
    resolvingRef.current = true;
    setResolving(true);
    try {
      // AI-assisted: see docs/AI_LOG.md #29
      const resolvedRequest = await source.resolve(request.id, action, Date.now());
      setError(null);
      return resolvedRequest;
    } catch {
      setError('requestActionFailed');
    } finally {
      resolvingRef.current = false;
      setResolving(false);
    }
  }, [source, active, connected, request, remainingSeconds]);

  const accept = useCallback(() => decide('accept'), [decide]);
  const reject = useCallback(() => decide('reject'), [decide]);

  const restartDemo = useCallback(() => {
    if (active && source?.mode === 'demo') source.restart();
  }, [source, active]);

  return { request, remainingSeconds, accept, reject, restartDemo, active, connected, resolving, error };
}
