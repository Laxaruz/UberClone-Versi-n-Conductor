import { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initialRegistration, validateRegistration } from '../utils/validateRegistration';
import { canEnableAvailability } from '../utils/canEnableAvailability';

const LANGUAGE_KEY = '@uberclone_driver_language';
const DriverContext = createContext(null);

export function DriverProvider({ children }) {
  const [language, setLanguage] = useState('es');
  const [driverSession, setDriverSession] = useState(null);
  const [activeTrip, setActiveTrip] = useState(null);
  const [registration, setRegistration] = useState(initialRegistration);
  const [registrationSubmitted, setRegistrationSubmitted] = useState(false);
  const [requestedAvailability, setRequestedAvailability] = useState(false);
  const registrationStatus = driverSession?.approvalStatus ?? 'not_submitted';
  const canGoAvailable = canEnableAvailability(driverSession);
  const available = canGoAvailable && requestedAvailability;

  useEffect(() => {
    let isMounted = true;

    AsyncStorage.getItem(LANGUAGE_KEY)
      .then((savedLanguage) => {
        if (isMounted && (savedLanguage === 'es' || savedLanguage === 'en')) {
          setLanguage(savedLanguage);
          setRegistration((current) => ({ ...current, language: savedLanguage }));
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
    if (!canGoAvailable) setRequestedAvailability(false);
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

  function submitRegistration() {
    setRegistrationSubmitted(true);
    if (Object.keys(validateRegistration(registration)).length > 0) return false;
    setDriverSession({ name: registration.fullName.trim(), approvalStatus: 'pending_demo' });
    return true;
  }

  function updateAvailability(nextAvailability) {
    if (nextAvailability && !canGoAvailable) return false;
    setRequestedAvailability(nextAvailability);
    return true;
  }

  return (
    <DriverContext.Provider
      value={{
        language,
        updateLanguage,
        driverSession,
        setDriverSession,
        activeTrip,
        setActiveTrip,
        registration,
        updateRegistration,
        registrationSubmitted,
        showRegistrationErrors: () => setRegistrationSubmitted(true),
        registrationStatus,
        submitRegistration,
        available,
        canGoAvailable,
        updateAvailability,
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
