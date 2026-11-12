import { useEffect, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { AppState, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import AvailabilityToggle from '../components/AvailabilityToggle';
import DriverMap from '../components/DriverMap';
import { colors } from '../config/theme';
import { useDriver } from '../context/DriverContext';
import useDriverLocation from '../hooks/useDriverLocation';
import useTranslation from '../i18n/useTranslation';

export default function HomeScreen({ navigation }) {
  const t = useTranslation();
  const { driverSession, activeTrip, registrationStatus, available, canGoAvailable, updateAvailability,
    saveCurrentLocation, firebaseConfigured, realtimeConnected, backendError, availabilityUpdating } = useDriver();
  let statusMessage = t('notRegistered');
  if (registrationStatus === 'pending_demo') statusMessage = t('pendingApproval');
  if (registrationStatus === 'approved_demo') statusMessage = t('approvedDemo');
  if (registrationStatus === 'approved') statusMessage = t('approved');
  const isFocused = useIsFocused();
  const [appActive, setAppActive] = useState(AppState.currentState === 'active');
  const { location, loading, error } = useDriverLocation({
    isFocused: isFocused && appActive,
    trackingEnabled: available && canGoAvailable,
    onLocation: saveCurrentLocation,
  });

  useEffect(() => {
    const listener = AppState.addEventListener('change', (state) => setAppActive(state === 'active'));
    return () => listener.remove();
  }, []);

  useEffect(() => {
    if (!isFocused || !appActive) updateAvailability(false);
  }, [isFocused, appActive, updateAvailability]);

  useEffect(() => {
    if (error && available) updateAvailability(false);
  }, [error, available, updateAvailability]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Text style={styles.title}>{t('appName')}</Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{t(firebaseConfigured && realtimeConnected ? 'connectedDemo' : 'mockMode')}</Text>
      </View>
      <Text style={styles.description}>{t(firebaseConfigured ? 'connectedDescription' : 'mockDescription')}</Text>

      <DriverMap location={location} sharing={available} simulatedApproval={registrationStatus === 'approved_demo'} />
      {loading ? <Text style={styles.locationMessage}>{t('locating')}</Text> : null}
      {error ? <Text style={styles.locationError}>{t(error)}</Text> : null}
      {backendError ? <Text style={styles.locationError}>{t(backendError)}</Text> : null}
      <AvailabilityToggle
        value={available}
        enabled={canGoAvailable && !!location && !availabilityUpdating}
        reason={availabilityUpdating ? 'savingAvailability' : !canGoAvailable && registrationStatus !== 'approved_demo' && registrationStatus !== 'approved'
          ? 'approvalRequired' : !realtimeConnected ? 'realtimeRequired' : 'locationRequired'}
        onChange={(nextValue) => updateAvailability(nextValue, location)}
      />

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('profile')}</Text>
        <Text style={styles.cardText}>{driverSession?.displayName || t('noSession')}</Text>
        <Text style={styles.cardText}>{statusMessage}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('trip')}</Text>
        <Text style={styles.cardText}>{activeTrip?.id || t('noTrip')}</Text>
      </View>

      <Pressable style={styles.button} onPress={() => navigation.navigate('Registration')}>
        <Text style={styles.buttonText}>{t('openRegistration')}</Text>
      </Pressable>
      <Pressable
        style={styles.secondaryButton}
        onPress={() => navigation.getParent()?.navigate('TripFlow')}
      >
        <Text style={styles.secondaryButtonText}>{t('openDemoRequest')}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { padding: 20, paddingBottom: 40 },
  locationMessage: { color: colors.muted, marginTop: 8 },
  locationError: { color: colors.warning, marginTop: 8 },
  title: { fontSize: 28, fontWeight: '800', color: colors.text },
  badge: {
    alignSelf: 'flex-start',
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.warningSoft,
  },
  badgeText: { color: colors.warning, fontWeight: '700' },
  description: { marginVertical: 16, color: colors.muted, fontSize: 16, lineHeight: 23 },
  card: {
    padding: 18,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cardTitle: { color: colors.primary, fontSize: 15, fontWeight: '700' },
  cardText: { color: colors.text, fontSize: 16, marginTop: 6 },
  button: {
    marginTop: 12,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  buttonText: { color: colors.surface, fontSize: 16, fontWeight: '700' },
  secondaryButton: {
    marginTop: 10,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  secondaryButtonText: { color: colors.primary, fontSize: 16, fontWeight: '700' },
});
