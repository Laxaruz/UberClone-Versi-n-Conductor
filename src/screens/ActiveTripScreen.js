import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import AppIcon from '../components/AppIcon';
import ScreenHero, { InfoBanner } from '../components/ScreenHero';
import TripRouteMap from '../components/TripRouteMap';
import { appVisuals as visual } from '../config/appVisuals';
import { useDriver } from '../context/DriverContext';
import useTranslation from '../i18n/useTranslation';

export default function ActiveTripScreen({ navigation }) {
  const t = useTranslation();
  const isFocused = useIsFocused();
  const { activeTrip, advanceTrip, completeTrip, tripSaving, tripSaveError } = useDriver();
  const status = activeTrip?.status;
  const headingKey = status === 'driver_arriving'
    ? activeTrip.pickupReachedAt ? 'atPickup' : 'goingToPickup'
    : status === 'in_progress' ? 'goingToDestination' : null;
  const actionKey = status === 'driver_arriving'
    ? activeTrip.pickupReachedAt ? 'passengerOnBoard' : 'confirmArrival'
    : status === 'in_progress' ? 'finishTrip' : null;

  async function handleAction() {
    if (status === 'driver_arriving') {
      advanceTrip(activeTrip.pickupReachedAt ? 'board_passenger' : 'confirm_arrival');
    } else if (status === 'in_progress') {
      if (await completeTrip()) navigation.navigate('TripCompleted');
    }
  }

  if (!headingKey) {
    return (
      <View style={styles.container}>
        <ScreenHero icon="route" title={t('trip')} />
        <InfoBanner>{t(['completed', 'paid'].includes(status) ? 'tripAlreadyCompleted' : 'noTrip')}</InfoBanner>
        {['completed', 'paid'].includes(status) ? <Pressable style={styles.button} onPress={() => navigation.navigate('TripCompleted')}>
          <Text style={styles.buttonText}>{t('viewTripSummary')}</Text>
        </Pressable> : null}
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <ScreenHero icon={status === 'in_progress' ? 'flag' : 'pin'} eyebrow={t('tripDemoBadge')}
        title={t(headingKey)} description={t(status === 'in_progress' ? 'destinationStageHint' : 'pickupStageHint')}>
        <Text style={styles.step}>{t(status === 'in_progress' ? 'tripStepTwo' : 'tripStepOne')}</Text>
        <View style={styles.progress}>
          <View style={[styles.progressBar, styles.progressActive]} />
          <View style={[styles.progressBar, status === 'in_progress' && styles.progressActive]} />
        </View>
      </ScreenHero>
      <View style={styles.card}>
        <View style={styles.passengerRow}>
          <View style={styles.personIcon}><AppIcon name="person" size={23} /></View>
          <View><Text style={styles.label}>{t('passenger')}</Text>
            <Text style={styles.value}>{activeTrip.passengerName}</Text></View>
        </View>
        <View style={styles.separator} />
        <View style={styles.pointRow}>
          <View style={styles.pointIcon}><AppIcon name="pin" size={22} /></View>
          <View style={styles.pointText}><Text style={styles.label}>{t('pickup')}</Text>
            <Text style={styles.value}>{activeTrip.origin?.address}</Text></View>
        </View>
        <View style={styles.line} />
        <View style={styles.pointRow}>
          <View style={styles.pointIcon}><AppIcon name="flag" size={22} /></View>
          <View style={styles.pointText}><Text style={styles.label}>{t('destination')}</Text>
            <Text style={styles.value}>{activeTrip.destination?.address}</Text></View>
        </View>
      </View>
      <View style={styles.estimateCard}>
        <Text style={styles.estimateLabel}>{t('requestEstimate')}</Text>
        <Text style={styles.estimateValue}>{activeTrip.distanceKm} km · {activeTrip.durationMin} min</Text>
      </View>
      <TripRouteMap key={`${activeTrip.id}-${status}`} isFocused={isFocused}
        target={status === 'in_progress' ? activeTrip.destination : activeTrip.origin} />
      <InfoBanner>{t('routeNotNavigation')} {t('tripLocalOnly')}</InfoBanner>
      {tripSaveError && status === 'in_progress' ? <InfoBanner tone="danger">{t(tripSaveError)}</InfoBanner> : null}
      <Pressable accessibilityRole="button" disabled={tripSaving}
        style={[styles.button, tripSaving && styles.buttonDisabled]} onPress={handleAction}>
        <AppIcon name={status === 'in_progress' ? 'flag' : 'check'} color={visual.surface} size={21} />
        <Text style={styles.buttonText}>{t(tripSaving ? 'savingTrip' : actionKey)}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: visual.background },
  container: { flexGrow: 1, padding: 16, paddingTop: 20, paddingBottom: 40,
    backgroundColor: visual.background },
  step: { color: visual.heroMuted, fontWeight: '800', fontSize: 13, marginTop: 19 },
  progress: { flexDirection: 'row', gap: 8, marginTop: 10 },
  progressBar: { flex: 1, height: 6, borderRadius: 5, backgroundColor: '#41646B' },
  progressActive: { backgroundColor: '#75D7BF' },
  card: { padding: 18, borderRadius: 21, borderWidth: 1,
    borderColor: visual.border, backgroundColor: visual.surface },
  passengerRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  personIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: visual.accentSoft,
    alignItems: 'center', justifyContent: 'center' },
  separator: { height: 1, backgroundColor: visual.border, marginVertical: 18 },
  pointRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  pointIcon: { width: 30, alignItems: 'center', marginTop: 2 },
  pointText: { flex: 1 }, line: { width: 2, height: 22, backgroundColor: visual.border, marginLeft: 14, marginVertical: 2 },
  label: { color: visual.muted, fontSize: 13 },
  value: { marginTop: 4, color: visual.ink, fontSize: 16, fontWeight: '700' },
  estimateCard: { marginTop: 14, borderRadius: 17, backgroundColor: visual.accentSoft, padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  estimateLabel: { flex: 1, color: visual.accent, fontWeight: '700' },
  estimateValue: { color: visual.accent, fontWeight: '800' },
  button: { marginTop: 22, minHeight: 56, padding: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
    flexDirection: 'row', gap: 10, backgroundColor: visual.accent },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: visual.surface, fontSize: 16, fontWeight: '800' },
});
