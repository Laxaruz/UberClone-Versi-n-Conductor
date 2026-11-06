import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

export default function useDriverLocation({ isFocused, trackingEnabled, onLocation }) {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isFocused) {
      setLocation(null);
      setLoading(false);
      return undefined;
    }

    let active = true;
    let subscription = null;
    let heartbeat = null;
    let latestCoordinates = null;
    setLoading(true);
    setError(null);

    async function locate() {
      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (!active) return;
        if (!permission.granted) {
          setError('locationPermissionDenied');
          setLocation(null);
          return;
        }

        const servicesEnabled = await Location.hasServicesEnabledAsync();
        if (!active) return;
        if (!servicesEnabled) {
          setError('locationServicesDisabled');
          setLocation(null);
          return;
        }

        const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (!active) return;
        setLocation(current.coords);
        latestCoordinates = current.coords;

        if (trackingEnabled) {
          const watcher = await Location.watchPositionAsync(
            { accuracy: Location.Accuracy.Balanced, timeInterval: 5000, distanceInterval: 5 },
            (update) => {
              if (!active) return;
              latestCoordinates = update.coords;
              setLocation(update.coords);
            },
            () => {
              if (!active) return;
              setError('locationUnavailable');
              if (heartbeat) clearInterval(heartbeat);
              subscription?.remove();
              subscription = null;
            },
          );
          if (active) {
            subscription = watcher;
            heartbeat = setInterval(() => {
              if (active && latestCoordinates) onLocation?.(latestCoordinates);
            }, 5000);
          } else watcher.remove();
        }
      } catch {
        if (active) {
          setError('locationUnavailable');
          setLocation(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    locate();

    return () => {
      active = false;
      if (heartbeat) clearInterval(heartbeat);
      subscription?.remove();
    };
  }, [isFocused, trackingEnabled, onLocation]);

  return { location, loading, error };
}
