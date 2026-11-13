import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initialRegistration, validateRegistration } from '../utils/validateRegistration';
import { canEnableAvailability } from '../utils/canEnableAvailability';
import { restoreRegistrationDetails } from '../utils/registrationDetails';
import { firebaseConfigured, linkDriverAccount, logInDriver, logOutDriver, restoreDriverUser } from '../services/firebaseClient';
import { createPendingDriver, observeDriver, saveDriverLocation, saveDriverProfile,
  setDriverAvailability, toCoordinates } from '../services/driverRepository';
import { calculateFare } from '../utils/calculateFare';
import { transitionTrip } from '../utils/tripTransitions';
import { saveCompletedTrip } from '../services/tripRepository';
import { clearCheckoutTrip, rememberCheckoutTrip } from '../services/checkoutService';
import { storedDocumentDetails, storedProfileDetails, validateProfileDetails,
  validateProfileDocuments } from '../utils/profileDetails';
import { registerDriverNotifications, removeDriverNotifications } from '../services/pushNotifications';

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
  const [accountLinked, setAccountLinked] = useState(false);
  const [accountEmail, setAccountEmail] = useState(null);
  const [sessionClosed, setSessionClosed] = useState(false);
  const [authLoading, setAuthLoading] = useState(firebaseConfigured);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [sessionEpoch, setSessionEpoch] = useState(0);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [backendError, setBackendError] = useState(null);
  const [registering, setRegistering] = useState(false);
  const registrationSubmitInFlight = useRef(false);
  const registrationAlreadySaved = useRef(false);
  const registrationRestored = useRef(false);
  const [availabilityUpdating, setAvailabilityUpdating] = useState(false);
  const [tripSaving, setTripSaving] = useState(false);
  const [tripSaveError, setTripSaveError] = useState(null);
  const tripCompleteInFlight = useRef(false);
  const availabilityIntent = useRef(false);
  const availabilityTask = useRef(Promise.resolve());
  const registrationStatus = driverSession?.approvalStatus ?? 'not_submitted';
  const canGoAvailable = canEnableAvailability(driverSession, realtimeConnected);
  const available = canGoAvailable && requestedAvailability;

  useEffect(() => {
    if (!firebaseConfigured) return undefined;
    let active = true;
    let unsubscribe = null;

    restoreDriverUser()
      .then((user) => {
        if (!active) return;
        setAuthLoading(false);
        if (!user) {
          setSessionClosed(true);
          setRegistrationLoading(false);
          return;
        }
        setSessionClosed(false);
        setAccountLinked(!user.isAnonymous);
        setAccountEmail(user.email ?? null);
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
          setAuthLoading(false);
          setRegistrationLoading(false);
          setBackendError('firebaseConnectionFailed');
        }
      });

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [sessionEpoch]);

  useEffect(() => {
    if (!driverUid || !['approved_demo', 'approved'].includes(registrationStatus) || sessionClosed) return undefined;
    let active = true;
    let unsubscribe = null;
    registerDriverNotifications(driverUid)
      .then((stop) => {
        if (active) unsubscribe = stop;
        else stop();
      })
      .catch(() => console.warn('No se pudo activar FCM en este dispositivo.'));
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [driverUid, registrationStatus, sessionClosed]);

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

  async function saveProfile(form, section) {
    if (!firebaseConfigured || !driverUid || !driverSession || !realtimeConnected) {
      setProfileError('profileSaveFailed');
      return false;
    }
    const errors = section === 'documents' ? validateProfileDocuments(form) : validateProfileDetails(form);
    if (Object.keys(errors).length > 0) return false;
    setProfileSaving(true);
    setProfileError(null);
    try {
      const fields = section === 'documents' ? storedDocumentDetails(form) : storedProfileDetails(form);
      await saveDriverProfile(driverUid, fields);
      availabilityIntent.current = false;
      setRequestedAvailability(false);
      setRegistration((current) => ({ ...current, ...form, language: current.language }));
      return true;
    } catch {
      setProfileError('profileSaveFailed');
      return false;
    } finally {
      setProfileSaving(false);
    }
  }

  async function linkAccount(email, password) {
    setAuthBusy(true);
    setAuthError(null);
    try {
      const user = await linkDriverAccount(email, password);
      setAccountLinked(true);
      setAccountEmail(user.email ?? email.trim());
      return true;
    } catch {
      setAuthError('accountLinkFailed');
      return false;
    } finally {
      setAuthBusy(false);
    }
  }

  async function logout() {
    if (!accountLinked || authBusy) return false;
    setAuthBusy(true);
    setAuthError(null);
    try {
      availabilityIntent.current = false;
      setRequestedAvailability(false);
      await availabilityTask.current.catch(() => {});
      if (driverSession && driverUid) await setDriverAvailability(driverUid, false, null);
      if (driverUid) await removeDriverNotifications(driverUid).catch(() => {});
      await logOutDriver();
      await clearCheckoutTrip().catch(() => {});
      availabilityIntent.current = false;
      setRequestedAvailability(false);
      setDriverUid(null);
      setDriverSession(null);
      setActiveTrip(null);
      setRegistration(initialRegistration);
      setRegistrationSubmitted(false);
      registrationAlreadySaved.current = false;
      registrationRestored.current = false;
      setRealtimeConnected(false);
      setAccountLinked(false);
      setAccountEmail(null);
      setSessionClosed(true);
      setSessionEpoch((current) => current + 1);
      return true;
    } catch {
      setAuthError('logoutFailed');
      return false;
    } finally {
      setAuthBusy(false);
    }
  }

  async function login(email, password) {
    setAuthBusy(true);
    setAuthError(null);
    try {
      await logInDriver(email, password);
      setAuthLoading(true);
      setSessionEpoch((current) => current + 1);
      return true;
    } catch {
      setAuthError('loginFailed');
      return false;
    } finally {
      setAuthBusy(false);
    }
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

  const advanceTrip = useCallback((action) => {
    if (action === 'complete') return;
    setActiveTrip((current) => {
      if (!current) return current;
      return transitionTrip(current, action, Date.now());
    });
  }, []);

  const completeTrip = useCallback(async () => {
    if (tripCompleteInFlight.current || activeTrip?.status !== 'in_progress') return false;
    tripCompleteInFlight.current = true;
    setTripSaving(true);
    setTripSaveError(null);
    try {
      const amounts = calculateFare({ distanceKm: activeTrip.distanceKm, durationMin: activeTrip.durationMin,
        category: activeTrip.category, tip: activeTrip.tip ?? 0 });
      const completed = transitionTrip(activeTrip, 'complete', Date.now(), amounts);
      if (completed.status !== 'completed') throw new Error('Trip cannot be completed');
      if (firebaseConfigured) {
        if (activeTrip.source !== 'firestore_test' || !driverUid) throw new Error('Trip has no driver');
        await saveCompletedTrip(driverUid, completed);
        if (completed.paymentMethod === 'mercadopago') {
          await rememberCheckoutTrip(completed.id).catch(() => {});
        }
      }
      setActiveTrip(completed);
      return true;
    } catch {
      setTripSaveError('tripSaveFailed');
      return false;
    } finally {
      tripCompleteInFlight.current = false;
      setTripSaving(false);
    }
  }, [activeTrip, driverUid]);

  return (
    <DriverContext.Provider
      value={{
        language,
        updateLanguage,
        driverSession,
        driverUid,
        accountLinked,
        accountEmail,
        sessionClosed,
        authLoading,
        authBusy,
        authError,
        linkAccount,
        logout,
        login,
        saveProfile,
        profileSaving,
        profileError,
        activeTrip,
        setActiveTrip,
        advanceTrip,
        completeTrip,
        tripSaving,
        tripSaveError,
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
