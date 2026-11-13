import { useCallback, useEffect, useRef, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { AppState, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import ScreenHero, { InfoBanner, StatusPill } from '../components/ScreenHero';
import { appVisuals as visual } from '../config/appVisuals';
import { useDriver } from '../context/DriverContext';
import useTranslation from '../i18n/useTranslation';
import {
  checkoutServiceConfigured, createTestCheckout, getCheckoutTrip, getLastCheckoutTripId,
  observeCheckoutTrip,
} from '../services/checkoutService';

function formatCop(amount) {
  return `$${String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} COP`;
}

export default function PaymentScreen({ route }) {
  const t = useTranslation();
  const isFocused = useIsFocused();
  const { activeTrip, setActiveTrip } = useDriver();
  const [tripId, setTripId] = useState(route?.params?.tripId || null);
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(false);
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState(null);
  const openingRef = useRef(false);
  const refreshSequence = useRef(0);

  useEffect(() => {
    if (route?.params?.tripId) {
      setTripId(route.params.tripId);
      return;
    }
    if (activeTrip?.paymentMethod === 'mercadopago' && activeTrip.id) {
      setTripId(activeTrip.id);
      return;
    }
    let mounted = true;
    getLastCheckoutTripId().then((savedId) => {
      if (mounted) setTripId(savedId);
    }).catch(() => {
      if (mounted) setError('checkoutLoadFailed');
    });
    return () => { mounted = false; };
  }, [activeTrip?.id, activeTrip?.paymentMethod, route?.params?.tripId]);

  const refresh = useCallback(async () => {
    if (!checkoutServiceConfigured || !tripId) return;
    const sequence = ++refreshSequence.current;
    setLoading(true);
    setError(null);
    setTrip(null);
    try {
      const savedTrip = await getCheckoutTrip(tripId);
      if (sequence !== refreshSequence.current) return;
      setTrip(savedTrip);
      if (savedTrip.status === 'paid' && savedTrip.paymentStatus === 'approved') {
        setActiveTrip((current) => current?.id === savedTrip.id
          ? { ...current, status: 'paid', paymentStatus: 'approved' } : current);
      }
    } catch {
      if (sequence === refreshSequence.current) setError('checkoutLoadFailed');
    } finally {
      if (sequence === refreshSequence.current) setLoading(false);
    }
  }, [setActiveTrip, tripId]);

  useEffect(() => {
    if (!isFocused) return undefined;
    refresh();
    const unsubscribe = tripId ? observeCheckoutTrip(tripId, refresh) : () => {};
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    return () => {
      refreshSequence.current += 1;
      unsubscribe();
      subscription.remove();
    };
  }, [isFocused, refresh, tripId]);

  async function openCheckout() {
    if (!trip?.checkoutAvailable || trip.paymentStatus !== 'pending' || openingRef.current) return;
    openingRef.current = true;
    setOpening(true);
    setError(null);
    try {
      const url = await createTestCheckout(trip.id);
      await Linking.openURL(url);
    } catch {
      setError('checkoutOpenFailed');
    } finally {
      openingRef.current = false;
      setOpening(false);
    }
  }

  const statusKey = { approved: 'paymentApproved', rejected: 'paymentRejected', pending: 'paymentPending' }[trip?.paymentStatus];
  const statusTone = trip?.paymentStatus === 'approved' ? 'success'
    : trip?.paymentStatus === 'rejected' ? 'danger' : 'warning';

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <ScreenHero icon="payment" eyebrow={t('checkoutTestBadge')} title={t('payment')}
        description={t('checkoutExplanation')} />
      {!checkoutServiceConfigured ? <InfoBanner>{t('checkoutBackendRequired')}</InfoBanner> : null}
      {checkoutServiceConfigured && !tripId ? <InfoBanner>{t('checkoutNoTrip')}</InfoBanner> : null}
      {trip ? <View style={styles.card}>
        <Text style={styles.label}>{t('finalFare')}</Text>
        <Text style={styles.amount}>{formatCop(trip.fare)}</Text>
        <View style={styles.divider} />
        <View style={styles.statusRow}>
          <Text style={styles.label}>{t('paymentStatus')}</Text>
          <StatusPill label={t(statusKey)} tone={statusTone} />
        </View>
        {trip.paymentStatus === 'pending' && !trip.checkoutAvailable
          ? <InfoBanner>{t('checkoutNotEligible')}</InfoBanner> : null}
      </View> : null}
      {error ? <InfoBanner tone="danger">{t(error)}</InfoBanner> : null}
      <Pressable accessibilityRole="button" disabled={!trip?.checkoutAvailable || opening || loading}
        style={[styles.button, (!trip?.checkoutAvailable || opening || loading) && styles.disabled]}
        onPress={openCheckout}>
        <Text style={styles.buttonText}>{t(opening ? 'checkoutOpening' : 'checkoutOpen')}</Text>
      </Pressable>
      <Pressable accessibilityRole="button" disabled={!tripId || loading || !checkoutServiceConfigured}
        style={[styles.outlineButton, (!tripId || loading || !checkoutServiceConfigured) && styles.disabled]}
        onPress={refresh}>
        <Text style={styles.outlineText}>{t(loading ? 'checkoutRefreshing' : 'checkoutRefresh')}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: visual.background },
  content: { padding: 16, paddingTop: 20, paddingBottom: 40 },
  card: { padding: 20, borderRadius: 22, borderWidth: 1,
    borderColor: visual.border, backgroundColor: visual.surface },
  label: { color: visual.muted, fontWeight: '700', fontSize: 13 },
  amount: { marginTop: 7, color: visual.ink, fontSize: 32, fontWeight: '800' },
  divider: { height: 1, backgroundColor: visual.border, marginVertical: 18 },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  button: { marginTop: 22, minHeight: 56, padding: 16, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', backgroundColor: visual.accent },
  buttonText: { color: visual.surface, fontSize: 16, fontWeight: '800' },
  outlineButton: { marginTop: 12, minHeight: 54, padding: 15, borderRadius: 16, borderWidth: 1.5,
    borderColor: visual.border, alignItems: 'center', justifyContent: 'center', backgroundColor: visual.surface },
  outlineText: { color: visual.accent, fontSize: 15, fontWeight: '800' },
  disabled: { opacity: 0.45 },
});
