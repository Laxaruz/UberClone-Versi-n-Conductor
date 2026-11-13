import { useEffect, useMemo, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import IncomingTripCard from '../components/IncomingTripCard';
import ScreenHero, { InfoBanner, StatusPill } from '../components/ScreenHero';
import { appVisuals as visual } from '../config/appVisuals';
import { pricing } from '../config/pricing';
import { useDriver } from '../context/DriverContext';
import useDriverLocation from '../hooks/useDriverLocation';
import useTripRequests from '../hooks/useTripRequests';
import useTranslation from '../i18n/useTranslation';
import { createDemoTripRequestSource } from '../services/demoTripRequests';
import { createFirestoreTripRequestSource } from '../services/firestoreTripRequests';

export default function IncomingRequestScreen({ navigation, route }) {
  const t = useTranslation();
  const isFocused = useIsFocused();
  const { driverUid, available, firebaseConfigured, saveCurrentLocation, updateAvailability, setActiveTrip } = useDriver();
  const [demoSource] = useState(createDemoTripRequestSource);
  const notifiedRequestId = route?.params?.requestId;
  const liveSource = useMemo(() => firebaseConfigured && driverUid
    ? createFirestoreTripRequestSource(driverUid, notifiedRequestId) : null,
  [firebaseConfigured, driverUid, notifiedRequestId]);
  const source = firebaseConfigured ? liveSource : demoSource;
  const { request, remainingSeconds, accept, reject, restartDemo, active, connected, resolving, error } =
    useTripRequests(source, isFocused && (!firebaseConfigured || available));
  const { error: locationError } = useDriverLocation({
    isFocused: active && firebaseConfigured,
    trackingEnabled: available,
    onLocation: saveCurrentLocation,
  });

  useEffect(() => {
    if (locationError && available) updateAvailability(false);
  }, [locationError, available, updateAvailability]);
  const canDecide = active && connected && !resolving && request?.status === 'requested' && remainingSeconds > 0;
  const statusKey = {
    requested: 'requestPending',
    accepted: firebaseConfigured ? 'requestAcceptedTest' : 'requestAcceptedDemo',
    rejected: firebaseConfigured ? 'requestRejectedTest' : 'requestRejectedDemo',
    expired: 'requestExpiredDemo',
  }[request?.status];
  const timerWidth = `${Math.max(0, Math.min(100, remainingSeconds / 15 * 100))}%`;

  // AI-assisted: see docs/AI_LOG.md #29
  async function handleAccept() {
    const acceptedRequest = await accept();
    if (acceptedRequest?.status !== 'accepted') return;
    setActiveTrip({ ...acceptedRequest, commissionRate: pricing.commissionRate, tip: 0 });
    await updateAvailability(false);
    navigation.navigate('TripPreview');
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <ScreenHero icon="clock" eyebrow={t(firebaseConfigured ? 'firestoreRequestTestMode' : 'mockMode')}
        title={t('incomingRequest')}
        description={t(firebaseConfigured ? 'firestoreRequestTestNotice' : 'demoRequestNotice')}>
        {request ? <View style={styles.timerPanel}>
          <View style={styles.timerRow}>
            <Text style={styles.timerLabel}>{t('secondsRemaining')}</Text>
            <Text style={[styles.timer, remainingSeconds <= 5 && styles.timerUrgent]}>{remainingSeconds} s</Text>
          </View>
          <View style={styles.timerTrack}><View style={[styles.timerFill, { width: timerWidth },
            remainingSeconds <= 5 && styles.timerFillUrgent]} /></View>
        </View> : null}
      </ScreenHero>
      {firebaseConfigured && !available ? <InfoBanner>{t('requestAvailabilityRequired')}</InfoBanner> : null}
      {request ? (
        <>
          <IncomingTripCard request={request} />
          {statusKey ? <View style={styles.status}><StatusPill label={t(statusKey)}
            tone={request.status === 'accepted' ? 'success' : request.status === 'requested' ? 'info' : 'warning'} /></View> : null}
          <View style={styles.actions}>
            <Pressable accessibilityRole="button" disabled={!canDecide}
              style={[styles.action, styles.accept, !canDecide && styles.disabled]} onPress={handleAccept}>
              <Text style={styles.acceptText}>{t('acceptRequest')}</Text>
            </Pressable>
            <Pressable accessibilityRole="button" disabled={!canDecide}
              style={[styles.action, styles.reject, !canDecide && styles.disabled]} onPress={reject}>
              <Text style={styles.rejectText}>{t('rejectRequest')}</Text>
            </Pressable>
          </View>
        </>
      ) : <View style={styles.empty}><Text style={styles.emptyText}>{t('noIncomingRequests')}</Text></View>}
      {firebaseConfigured && !connected && available ? <InfoBanner tone="info">{t('requestConnecting')}</InfoBanner> : null}
      {error ? <InfoBanner tone="danger">{t(error)}</InfoBanner> : null}
      {!firebaseConfigured ? (
        <Pressable accessibilityRole="button" disabled={!active} style={styles.newButton} onPress={restartDemo}>
          <Text style={styles.newButtonText}>{t('newDemoRequest')}</Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: visual.background },
  content: { padding: 16, paddingTop: 20, paddingBottom: 40 },
  timerPanel: { marginTop: 20, padding: 15, borderRadius: 17, backgroundColor: '#31565D' },
  timerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  timerLabel: { color: visual.heroMuted, fontWeight: '700', flex: 1 },
  timer: { color: visual.surface, fontSize: 31, fontWeight: '800', fontVariant: ['tabular-nums'] },
  timerUrgent: { color: '#FFD7D2' },
  timerTrack: { height: 7, borderRadius: 5, backgroundColor: '#53767A', marginTop: 11, overflow: 'hidden' },
  timerFill: { height: '100%', borderRadius: 5, backgroundColor: '#75D7BF' },
  timerFillUrgent: { backgroundColor: '#FFB2AA' },
  status: { marginTop: 14, marginBottom: 16 },
  actions: { flexDirection: 'row', gap: 12 },
  action: { flex: 1, minHeight: 54, padding: 15, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  accept: { backgroundColor: visual.accent },
  reject: { borderWidth: 1.5, borderColor: visual.border, backgroundColor: visual.surface },
  disabled: { opacity: 0.45 },
  acceptText: { color: visual.surface, fontWeight: '800', fontSize: 15 },
  rejectText: { color: visual.ink, fontWeight: '800', fontSize: 15 },
  newButton: { padding: 16, marginTop: 20, alignItems: 'center', borderRadius: 14,
    backgroundColor: visual.accentSoft },
  newButtonText: { color: visual.accent, fontWeight: '800' },
  empty: { padding: 24, borderRadius: 20, borderWidth: 1, borderColor: visual.border,
    backgroundColor: visual.surface, alignItems: 'center' },
  emptyText: { color: visual.muted, textAlign: 'center', lineHeight: 22 },
});
