import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initialRegistration, validateRegistration } from '../utils/validateRegistration';
import { canEnableAvailability } from '../utils/canEnableAvailability';
import { restoreRegistrationDetails } from '../utils/registrationDetails';
import { firebaseConfigured, ensureDemoUser } from '../services/firebaseClient';
import { createPendingDriver, observeDriver, saveDriverLocation, setDriverAvailability, toCoordinates } from '../services/driverRepository';

const LANGUAGE_KEY = '@uberclone_driver_language';
const DriverContext = createContext(null);

export function DriverProvider({ children }) {
  const [language, setLanguage] = useState('es');
  const [driverSession, setDriverSession] = useState(null);
  const [activeTrip, setActiveTrip] = useState(null);
  const [registration, setRegistration] = useState(initialRegistration);
  const [registrationLoading, setRegistrationLoading] = useState(firebaseConfigured);
  const [registrationSubmitted, setRegistrationSubmitted] = useState(false);
  const [requestedAvailability, setRequestedAvailability] = useState(false);
  const [driverUid, setDriverUid] = useState(null);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [backendError, setBackendError] = useState(null);
  const [registering, setRegistering] = useState(false);
  const registrationSubmitInFlight = useRef(false);
  const registrationAlreadySaved = useRef(false);
  const registrationRestored = useRef(false);
  const [availabilityUpdating, setAvailabilityUpdating] = useState(false);
  const availabilityIntent = useRef(false);
  const availabilityTask = useRef(Promise.resolve());
  const registrationStatus = driverSession?.approvalStatus ?? 'not_submitted';
  const canGoAvailable = canEnableAvailability(driverSession, realtimeConnected);
  const available = canGoAvailable && requestedAvailability;

  useEffect(() => {
    if (!firebaseConfigured) return undefined;
    let active = true;
    let unsubscribe = null;

    ensureDemoUser()
      .then((user) => {
        if (!active) return;
        setDriverUid(user.uid);
        unsubscribe = observeDriver(user.uid, (driver, connected) => {
          if (!active) return;
          setRealtimeConnected(connected);
          // AI-assisted: see docs/AI_LOG.md #16
          if (driver || connected) {
            setDriverSession(driver);
            registrationAlreadySaved.current = Boolean(driver);
            if (driver) {
              // AI-assisted: see docs/AI_LOG.md #15
              registrationRestored.current = true;
              setRegistration((current) => restoreRegistrationDetails(current, driver));
            }
          }
          setRegistrationLoading(false);
          setBackendError((current) => current === 'firebaseConnectionFailed' && connected ? null : current);
          if (connected && driver?.available && !availabilityIntent.current) {
            setDriverAvailability(user.uid, false, null).catch(() => {
              if (active) setBackendError('availabilitySaveFailed');
            });
          }
        }, () => {
          if (!active) return;
          setRealtimeConnected(false);
          setRegistrationLoading(false);
          setBackendError('firebaseConnectionFailed');
        });
      })
      .catch(() => {
        if (active) {
          setRegistrationLoading(false);
          setBackendError('firebaseConnectionFailed');
        }
      });

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    AsyncStorage.getItem(LANGUAGE_KEY)
      .then((savedLanguage) => {
        if (isMounted && (savedLanguage === 'es' || savedLanguage === 'en')) {
          setLanguage(savedLanguage);
          setRegistration((current) => registrationRestored.current ? current : { ...current, language: savedLanguage });
        }
      })
      .catch(() => {
        // La preferencia conserva el valor inicial si falla la lectura.
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!canGoAvailable) {
      availabilityIntent.current = false;
      setRequestedAvailability(false);
    }
  }, [canGoAvailable]);

  function updateLanguage(nextLanguage) {
    if (nextLanguage !== 'es' && nextLanguage !== 'en') return;
    setLanguage(nextLanguage);
    setRegistration((current) => ({ ...current, language: nextLanguage }));
    AsyncStorage.setItem(LANGUAGE_KEY, nextLanguage).catch(() => {
      // La seleccion sigue activa durante esta sesion si falla el guardado.
    });
  }

  function updateRegistration(key, value) {
    setRegistration((current) => ({ ...current, [key]: value }));
  }

  async function submitRegistration() {
    if (registrationLoading || registrationSubmitInFlight.current || registrationAlreadySaved.current || registrationStatus !== 'not_submitted') return false;
    setRegistrationSubmitted(true);
    if (Object.keys(validateRegistration(registration)).length > 0) return false;
    if (!firebaseConfigured) {
      setDriverSession({ displayName: registration.fullName.trim(), approvalStatus: 'pending_demo' });
      registrationAlreadySaved.current = true;
      return true;
    }
    if (!driverUid || !realtimeConnected) {
      setBackendError('firebaseConnectionFailed');
      return false;
    }
    registrationSubmitInFlight.current = true;
    setRegistering(true);
    try {
      await createPendingDriver(driverUid, registration);
      registrationAlreadySaved.current = true;
      setBackendError(null);
    } catch {
      setBackendError('registrationSaveFailed');
      return false;
    } finally {
      registrationSubmitInFlight.current = false;
      setRegistering(false);
    }
    return true;
  }

  const updateAvailability = useCallback(async (nextAvailability, location) => {
    const coordinates = toCoordinates(location);
    if (nextAvailability && (!canGoAvailable || !coordinates)) return false;
    if (!nextAvailability && !availabilityIntent.current) return true;
    availabilityIntent.current = nextAvailability;
    if (!nextAvailability) setRequestedAvailability(false);
    if (!firebaseConfigured || !driverUid) return false;
    setAvailabilityUpdating(true);
    const task = availabilityTask.current.catch(() => {}).then(async () => {
      if (nextAvailability && !availabilityIntent.current) return false;
      try {
        await setDriverAvailability(driverUid, nextAvailability, coordinates);
        if (nextAvailability && availabilityIntent.current) setRequestedAvailability(true);
        setBackendError((current) => nextAvailability || current === 'availabilitySaveFailed' ? null : current);
        return true;
      } catch {
        availabilityIntent.current = false;
        setRequestedAvailability(false);
        setBackendError('availabilitySaveFailed');
        return false;
      } finally {
        if (availabilityTask.current === task) setAvailabilityUpdating(false);
      }
    });
    availabilityTask.current = task;
    return task;
  }, [canGoAvailable, driverUid]);

  const saveCurrentLocation = useCallback(async (location) => {
    const coordinates = toCoordinates(location);
    if (!availabilityIntent.current || !driverUid || !coordinates) return;
    try {
      await saveDriverLocation(driverUid, coordinates);
      setBackendError(null);
    } catch {
      setBackendError('locationSaveFailed');
      updateAvailability(false);
    }
  }, [driverUid, updateAvailability]);

  return (
    <DriverContext.Provider
      value={{
        language,
        updateLanguage,
        driverSession,
        activeTrip,
        setActiveTrip,
        registration,
        registrationLoading,
        updateRegistration,
        registrationSubmitted,
        showRegistrationErrors: () => setRegistrationSubmitted(true),
        registrationStatus,
        submitRegistration,
        available,
        availabilityUpdating,
        canGoAvailable,
        updateAvailability,
        saveCurrentLocation,
        firebaseConfigured,
        realtimeConnected,
        backendError,
        registering,
      }}
    >
      {children}
    </DriverContext.Provider>
  );
}

export function useDriver() {
  const context = useContext(DriverContext);
  if (!context) throw new Error('useDriver requires DriverProvider');
  return context;
}
