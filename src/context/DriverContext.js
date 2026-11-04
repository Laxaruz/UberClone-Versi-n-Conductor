import { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGE_KEY = '@uberclone_driver_language';
const DriverContext = createContext(null);

export function DriverProvider({ children }) {
  const [language, setLanguage] = useState('es');
  const [driverSession, setDriverSession] = useState(null);
  const [activeTrip, setActiveTrip] = useState(null);

  useEffect(() => {
    let isMounted = true;

    AsyncStorage.getItem(LANGUAGE_KEY)
      .then((savedLanguage) => {
        if (isMounted && (savedLanguage === 'es' || savedLanguage === 'en')) {
          setLanguage(savedLanguage);
        }
      })
      .catch(() => {
        // La preferencia conserva el valor inicial si falla la lectura.
      });

    return () => {
      isMounted = false;
    };
  }, []);

  function updateLanguage(nextLanguage) {
    if (nextLanguage !== 'es' && nextLanguage !== 'en') return;
    setLanguage(nextLanguage);
    AsyncStorage.setItem(LANGUAGE_KEY, nextLanguage).catch(() => {
      // La seleccion sigue activa durante esta sesion si falla el guardado.
    });
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
