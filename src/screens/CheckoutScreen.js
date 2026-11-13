import { useEffect, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../config/theme';
import { useDriver } from '../context/DriverContext';
import useTranslation from '../i18n/useTranslation';
import { checkoutServiceConfigured, getTripPayment, startTestCheckout } from '../services/checkoutPaymentService';

function formatCop(amount) {
  return `$${String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} COP`;
}

export default function CheckoutScreen() {
  const t = useTranslation();
  const { activeTrip, setActiveTrip } = useDriver();
  const [serverTrip, setServerTrip] = useState(null);
  const [loading, setLoading] = useState(false);
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState(false);
  const tripId = activeTrip?.id;
  const isMercadoPago = activeTrip?.paymentMethod === 'mercadopago';

  async function refreshPayment() {
    if (!tripId || !isMercadoPago || !checkoutServiceConfigured) return;
    setLoading(true);
    setError(false);
    try {
      const result = await getTripPayment(tripId);
      setServerTrip(result);
      if (result.paymentStatus === 'approved') {
        setActiveTrip((current) => current?.id === tripId
          ? { ...current, status: result.status, paymentStatus: result.paymentStatus } : current);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshPayment();
  }, [tripId, isMercadoPago]);

  async function openCheckout() {
    if (!serverTrip?.checkoutAvailable || opening) return;
    setOpening(true);
    setError(false);
    try {
      const url = await startTestCheckout(tripId);
      await Linking.openURL(url);
    } catch {
      setError(true);
    } finally {
      setOpening(false);
    }
  }

  return <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
    <Text style={styles.title}>{t('checkoutTitle')}</Text>
    {!tripId || !isMercadoPago ? <Text style={styles.notice}>{t('checkoutNoTrip')}</Text> : <>
      <View style={styles.card}>
        <Text style={styles.label}>{t('finalFare')}</Text>
        <Text style={styles.amount}>{formatCop(serverTrip?.fare ?? activeTrip.finalFare)}</Text>
        <Text style={styles.label}>{t('paymentStatus')}</Text>
        <Text style={styles.status}>{t(!serverTrip ? 'checkoutUnknown'
          : serverTrip.paymentStatus === 'approved' ? 'paymentApproved' : 'paymentPending')}</Text>
      </View>
      <Text style={styles.notice}>{t('checkoutDemoNotice')}</Text>
      {!checkoutServiceConfigured && <Text style={styles.notice}>{t('checkoutBackendRequired')}</Text>}
      {error && <Text style={styles.notice}>{t('checkoutFailed')}</Text>}
      {!loading && serverTrip && !serverTrip.checkoutAvailable && serverTrip.paymentStatus !== 'approved'
        && <Text style={styles.notice}>{t('checkoutNotEligible')}</Text>}
      {serverTrip?.paymentStatus === 'approved' && <Text style={styles.success}>{t('paymentApproved')}</Text>}
      <Pressable accessibilityRole="button" disabled={!serverTrip?.checkoutAvailable || opening || loading}
        style={[styles.button, (!serverTrip?.checkoutAvailable || opening || loading) && styles.disabled]}
        onPress={openCheckout}>
        <Text style={styles.buttonText}>{t(opening ? 'checkoutOpening' : 'checkoutOpen')}</Text>
      </Pressable>
      <Pressable accessibilityRole="button" disabled={loading || !checkoutServiceConfigured}
        style={[styles.button, (loading || !checkoutServiceConfigured) && styles.disabled]}
        onPress={refreshPayment}>
        <Text style={styles.buttonText}>{t(loading ? 'checkoutChecking' : 'checkoutRefresh')}</Text>
      </Pressable>
    </>}
  </ScrollView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 30, fontWeight: '800', color: colors.text },
  card: { marginTop: 22, padding: 20, borderRadius: 20, borderWidth: 1,
    borderColor: colors.border, backgroundColor: colors.surface },
  label: { color: colors.muted, fontSize: 15, marginBottom: 8 },
  amount: { color: colors.text, fontSize: 23, fontWeight: '800', marginBottom: 18 },
  status: { color: colors.text, fontSize: 17, fontWeight: '700' },
  notice: { marginTop: 16, color: colors.warning, lineHeight: 22 },
  success: { marginTop: 16, color: colors.primary, fontWeight: '700' },
  button: { marginTop: 20, padding: 17, borderRadius: 16, alignItems: 'center', backgroundColor: colors.primary },
  disabled: { opacity: 0.45 },
  buttonText: { color: colors.surface, fontSize: 16, fontWeight: '700' },
});
