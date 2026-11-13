import { useCallback, useEffect, useRef, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { AppState, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../config/theme';
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
    if (!trip?.checkoutEnabled || trip.paymentStatus !== 'pending' || openingRef.current) return;
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

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.badge}>{t('checkoutTestBadge')}</Text>
      <Text style={styles.title}>{t('payment')}</Text>
      <Text style={styles.notice}>{t('checkoutExplanation')}</Text>
      {!checkoutServiceConfigured ? <Text style={styles.warning}>{t('checkoutBackendRequired')}</Text> : null}
      {checkoutServiceConfigured && !tripId ? <Text style={styles.warning}>{t('checkoutNoTrip')}</Text> : null}
      {trip ? <View style={styles.card}>
        <Text style={styles.label}>{t('finalFare')}</Text>
        <Text style={styles.amount}>{formatCop(trip.fare)}</Text>
        <Text style={styles.label}>{t('paymentStatus')}</Text>
        <Text style={styles.status}>{t(statusKey)}</Text>
        {trip.paymentStatus === 'pending' && !trip.checkoutEnabled
          ? <Text style={styles.warning}>{t('checkoutNotEligible')}</Text> : null}
      </View> : null}
      {error ? <Text style={styles.warning}>{t(error)}</Text> : null}
      <Pressable accessibilityRole="button" disabled={!trip?.checkoutEnabled || opening || loading}
        style={[styles.button, (!trip?.checkoutEnabled || opening || loading) && styles.disabled]}
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
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  badge: { alignSelf: 'flex-start', padding: 8, borderRadius: 12,
    backgroundColor: colors.warningSoft, color: colors.warning, fontWeight: '700' },
  title: { marginTop: 18, color: colors.text, fontSize: 30, fontWeight: '800' },
  notice: { marginTop: 12, color: colors.muted, lineHeight: 23 },
  warning: { marginTop: 14, color: colors.warning, lineHeight: 22 },
  card: { marginTop: 20, padding: 20, borderRadius: 18, borderWidth: 1,
    borderColor: colors.border, backgroundColor: colors.surface },
  label: { marginTop: 8, color: colors.muted },
  amount: { marginTop: 5, color: colors.text, fontSize: 24, fontWeight: '800' },
  status: { marginTop: 5, color: colors.primary, fontSize: 18, fontWeight: '700' },
  button: { marginTop: 22, padding: 17, borderRadius: 16, alignItems: 'center', backgroundColor: colors.primary },
  buttonText: { color: colors.surface, fontSize: 16, fontWeight: '700' },
  outlineButton: { marginTop: 12, padding: 16, borderRadius: 16, borderWidth: 1,
    borderColor: colors.primary, alignItems: 'center' },
  outlineText: { color: colors.primary, fontSize: 16, fontWeight: '700' },
  disabled: { opacity: 0.45 },
});
