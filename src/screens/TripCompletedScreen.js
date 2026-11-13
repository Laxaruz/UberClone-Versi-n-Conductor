import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import ScreenHero, { InfoBanner, StatusPill } from '../components/ScreenHero';
import { appVisuals as visual } from '../config/appVisuals';
import { useDriver } from '../context/DriverContext';
import useTranslation from '../i18n/useTranslation';
import { cashServiceConfigured, recordCashReceipt } from '../services/cashPaymentService';

function formatCop(amount) {
  return `$${String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} COP`;
}

function Amount({ label, amount, featured }) {
  return <View style={[styles.row, featured && styles.featuredRow]}>
    <Text style={[styles.label, featured && styles.featuredLabel]}>{label}</Text>
    <Text style={[styles.amount, featured && styles.featuredAmount]}>{formatCop(amount)}</Text>
  </View>;
}

export default function TripCompletedScreen({ navigation }) {
  const t = useTranslation();
  const { activeTrip, setActiveTrip } = useDriver();
  const [cashBusy, setCashBusy] = useState(false);
  const [cashError, setCashError] = useState(false);
  const cashInFlight = useRef(false);
  const completed = activeTrip?.status === 'completed' || activeTrip?.status === 'paid';
  const cashTrip = activeTrip?.paymentMethod === 'cash';
  const checkoutTrip = activeTrip?.paymentMethod === 'mercadopago';
  const cashRecorded = activeTrip?.paymentStatus === 'cash_received';
  const checkoutApproved = activeTrip?.paymentStatus === 'approved';
  const cashCanSubmit = cashTrip && !cashRecorded && activeTrip?.source === 'firestore_test'
    && cashServiceConfigured;

  async function confirmCash() {
    if (!cashCanSubmit || cashInFlight.current) return;
    cashInFlight.current = true;
    setCashBusy(true);
    setCashError(false);
    try {
      const result = await recordCashReceipt(activeTrip.id);
      setActiveTrip((current) => current?.id === activeTrip.id
        ? { ...current, status: 'paid', paymentStatus: result.paymentStatus,
          cashBalance: result.balance } : current);
    } catch {
      setCashError(true);
    } finally {
      cashInFlight.current = false;
      setCashBusy(false);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <ScreenHero icon="check" eyebrow={t('tripDemoBadge')} title={t('tripSummary')} />
      {completed ? <>
        <InfoBanner>{t('finalFareEstimateNotice')}</InfoBanner>
        <View style={styles.card}>
          <Text style={styles.detail}>{activeTrip.origin?.address} → {activeTrip.destination?.address}</Text>
          <Text style={styles.detail}>{activeTrip.distanceKm} km · {activeTrip.durationMin} min</Text>
          <View style={styles.separator} />
          <Amount label={t('finalFare')} amount={activeTrip.finalFare} featured />
          <Amount label={t('commission')} amount={activeTrip.finalCommission} />
          <Amount label={t('netEarnings')} amount={activeTrip.finalDriverEarnings} />
          <View style={styles.paymentRow}><Text style={styles.label}>{t('paymentStatus')}</Text>
            <StatusPill tone={cashRecorded || checkoutApproved ? 'success' : 'warning'}
              label={t(cashRecorded ? 'cashReceived' : checkoutApproved ? 'paymentApproved' : 'paymentPending')} /></View>
        </View>
        {cashTrip && cashRecorded ? <>
          <InfoBanner tone="info">{t('cashReceiptDemo')}</InfoBanner>
          <View style={styles.balanceCard}><Amount label={t('driverBalance')} amount={activeTrip.cashBalance} /></View>
        </> : <InfoBanner tone={checkoutApproved ? 'info' : 'warning'}>{t(cashTrip ? 'cashPending'
          : checkoutApproved ? 'checkoutVerifiedNotice' : 'paymentNotProcessed')}</InfoBanner>}
        {cashTrip && !cashRecorded ? <>
          {!cashCanSubmit && <InfoBanner>{t('cashBackendRequired')}</InfoBanner>}
          {cashError && <InfoBanner tone="danger">{t('cashSaveFailed')}</InfoBanner>}
          <Pressable accessibilityRole="button" disabled={!cashCanSubmit || cashBusy}
            style={[styles.button, (!cashCanSubmit || cashBusy) && styles.buttonDisabled]}
            onPress={confirmCash}>
            <Text style={styles.buttonText}>{t(cashBusy ? 'savingCash' : 'confirmCash')}</Text>
          </Pressable>
        </> : null}
        {checkoutTrip && <Pressable accessibilityRole="button" style={styles.button}
          onPress={() => navigation.navigate('PaymentPreview', { tripId: activeTrip.id })}>
          <Text style={styles.buttonText}>{t('openTestCheckout')}</Text>
        </Pressable>}
      </> : <InfoBanner>{t('noCompletedTrip')}</InfoBanner>}
      <Pressable accessibilityRole="button" style={styles.secondaryButton} onPress={() => navigation.getParent()?.navigate('MainDrawer')}>
        <Text style={styles.secondaryText}>{t('backHome')}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: visual.background },
  container: { padding: 16, paddingTop: 20, paddingBottom: 40 },
  card: { marginTop: 16, padding: 19, borderRadius: 22, borderWidth: 1,
    borderColor: visual.border, backgroundColor: visual.surface },
  detail: { marginBottom: 10, color: visual.ink, fontSize: 16, fontWeight: '600' },
  separator: { height: 1, backgroundColor: visual.border, marginVertical: 13 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginVertical: 9 },
  featuredRow: { flexDirection: 'column', padding: 15, marginBottom: 10,
    backgroundColor: visual.accentSoft, borderRadius: 15 },
  label: { flex: 1, color: visual.muted, fontSize: 14 },
  featuredLabel: { flex: 0, color: visual.accent, fontWeight: '700' },
  amount: { color: visual.ink, fontSize: 16, fontWeight: '800', textAlign: 'right' },
  featuredAmount: { color: visual.accent, fontSize: 27, textAlign: 'left', marginTop: 6 },
  paymentRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10,
    marginTop: 17, borderTopWidth: 1, borderTopColor: visual.border, paddingTop: 16 },
  balanceCard: { backgroundColor: visual.surface, borderWidth: 1, borderColor: visual.border,
    borderRadius: 16, padding: 16, marginTop: 12 },
  button: { marginTop: 22, minHeight: 56, padding: 16, borderRadius: 16, alignItems: 'center',
    justifyContent: 'center', backgroundColor: visual.accent },
  buttonDisabled: { opacity: 0.45 },
  buttonText: { color: visual.surface, fontSize: 16, fontWeight: '800' },
  secondaryButton: { marginTop: 12, minHeight: 54, padding: 15, borderRadius: 16,
    borderWidth: 1.5, borderColor: visual.border, alignItems: 'center', justifyContent: 'center' },
  secondaryText: { color: visual.accent, fontWeight: '800' },
});
