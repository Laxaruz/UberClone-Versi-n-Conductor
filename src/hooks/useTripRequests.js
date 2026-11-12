import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { remainingRequestSeconds } from '../utils/tripRequestTimer';

export default function useTripRequests(source, isFocused) {
  const [request, setRequest] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [appActive, setAppActive] = useState(AppState.currentState === 'active');
  const active = isFocused && appActive;

  useEffect(() => {
    const listener = AppState.addEventListener('change', (state) => setAppActive(state === 'active'));
    return () => listener.remove();
  }, []);

  useEffect(() => {
    if (!active) return undefined;
    return source.subscribe((nextRequest) => {
      setRequest(nextRequest);
      setNow(Date.now());
    });
  }, [source, active]);

  useEffect(() => {
    if (!active || request?.status !== 'requested') return undefined;
    const update = () => {
      const currentTime = Date.now();
      setNow(currentTime);
      if (currentTime >= request.expiresAt) source.resolve(request.id, 'expire', currentTime);
    };
    update();
    const interval = setInterval(update, 250);
    return () => clearInterval(interval);
  }, [source, active, request?.id, request?.status, request?.expiresAt]);

  const accept = useCallback(() => {
    if (active && request) source.resolve(request.id, 'accept', Date.now());
  }, [source, active, request]);

  const reject = useCallback(() => {
    if (active && request) source.resolve(request.id, 'reject', Date.now());
  }, [source, active, request]);

  const restartDemo = useCallback(() => {
    if (active && source.mode === 'demo') source.restart();
  }, [source, active]);

  const remainingSeconds = request?.status === 'requested' ? remainingRequestSeconds(request.expiresAt, now) : 0;
  return { request, remainingSeconds, accept, reject, restartDemo, active };
}
