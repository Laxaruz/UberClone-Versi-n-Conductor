import { useIsFocused } from '@react-navigation/native';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import AppIcon from '../components/AppIcon';
import ScreenHero, { InfoBanner } from '../components/ScreenHero';
import { appVisuals as visual } from '../config/appVisuals';
import { useDriver } from '../context/DriverContext';
import useEarnings from '../hooks/useEarnings';
import useTranslation from '../i18n/useTranslation';

function formatCop(amount) {
  const sign = amount < 0 ? '-' : '';
  const digits = String(Math.abs(amount)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${sign}$${digits} COP`;
}

function AmountRow({ label, amount }) {
  return <View style={styles.row}><Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{formatCop(amount)}</Text></View>;
}

function PeriodCard({ title, totals, t }) {
  return <View style={styles.card}>
    <View style={styles.periodTop}>
      <Text style={styles.periodTitle}>{title}</Text>
      <View style={styles.periodIcon}><AppIcon name="earnings" size={19} color={visual.accent} /></View>
    </View>
    <Text style={styles.periodNetLabel}>{t('earningsNet')}</Text>
    <Text style={styles.periodNet}>{formatCop(totals.netEarnings)}</Text>
    <Text style={styles.tripCount}>{t('earningsTripCount')}: {totals.tripCount}</Text>
    <View style={styles.divider} />
    <AmountRow label={t('earningsFare')} amount={totals.totalFare} />
    <AmountRow label={t('earningsCommission')} amount={totals.totalCommission} />
    <AmountRow label={t('earningsTips')} amount={totals.totalTips} />
    <AmountRow label={t('earningsAverage')} amount={totals.averagePerTrip} />
  </View>;
}

export default function EarningsScreen() {
  const t = useTranslation();
  const isFocused = useIsFocused();
  const { driverUid, firebaseConfigured } = useDriver();
  const { periods, breakdown, balance, loading, error, refresh } = useEarnings(
    driverUid, isFocused, firebaseConfigured);
  const ready = balance !== null && !error;

  return <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
    <ScreenHero icon="earnings" title={t('earnings')} description={t('earningsDescription')} />
    {!firebaseConfigured ? <InfoBanner>{t('earningsBackendRequired')}</InfoBanner> : null}
    {firebaseConfigured && !driverUid ? <Text style={styles.description}>{t('earningsConnecting')}</Text> : null}
    {loading ? <ActivityIndicator style={styles.spinner} color={visual.accent} /> : null}
    {error ? <InfoBanner tone="danger">{t(error)}</InfoBanner> : null}
    {ready ? <>
      <View style={styles.balanceCard}>
        <View style={styles.balanceIcon}><AppIcon name="wallet" size={25} color={visual.surface} /></View>
        <Text style={styles.balanceLabel}>{t('earningsBalance')}</Text>
        <Text style={styles.balanceAmount}>{formatCop(balance)}</Text>
        <Text style={styles.balanceNote}>{t('earningsBalanceNote')}</Text>
      </View>
      <Text style={styles.sectionTitle}>{t('earningsSummary')}</Text>
      <Text style={styles.description}>{t('earningsPaidOnly')}</Text>
      <PeriodCard title={t('earningsToday')} totals={periods.today} t={t} />
      <PeriodCard title={t('earningsWeek')} totals={periods.week} t={t} />
      <PeriodCard title={t('earningsMonth')} totals={periods.month} t={t} />
      <Text style={styles.sectionTitle}>{t('earningsPaymentBreakdown')}</Text>
      <Text style={styles.description}>{t('earningsBreakdownMonth')}</Text>
      <View style={styles.card}>
        <AmountRow label={t('earningsGatewayConfirmed')} amount={breakdown.confirmedGateway} />
        <AmountRow label={t('earningsGatewayPending')} amount={breakdown.pendingGateway} />
      </View>
      <View style={styles.card}>
        <Text style={styles.periodTitle}>{t('cash')}</Text>
        <AmountRow label={t('earningsCashPending')} amount={breakdown.pendingCashCommission} />
        <AmountRow label={t('earningsCashDeducted')} amount={breakdown.deductedCashCommission} />
      </View>
      {periods.month.tripCount === 0 ? <InfoBanner tone="info">{t('earningsEmpty')}</InfoBanner> : null}
    </> : null}
    <Pressable accessibilityRole="button" disabled={!firebaseConfigured || !driverUid || loading}
      style={[styles.button, (!firebaseConfigured || !driverUid || loading) && styles.disabled]}
      onPress={refresh}>
      <Text style={styles.buttonText}>{t('earningsRefresh')}</Text>
    </Pressable>
  </ScrollView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: visual.background },
  content: { padding: 16, paddingTop: 20, paddingBottom: 48 },
  description: { marginTop: 8, color: visual.muted, lineHeight: 22 },
  spinner: { marginTop: 18 },
  balanceCard: { padding: 20, borderRadius: 22, backgroundColor: visual.accent },
  balanceIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#288D7F',
    alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  balanceLabel: { color: '#D5F4EB', fontWeight: '700' },
  balanceAmount: { marginTop: 7, color: visual.surface, fontSize: 31, fontWeight: '800' },
  balanceNote: { marginTop: 9, color: '#D5F4EB', lineHeight: 20, fontSize: 13 },
  sectionTitle: { marginTop: 26, color: visual.ink, fontSize: 21, fontWeight: '800' },
  card: { marginTop: 14, padding: 18, borderRadius: 20, borderWidth: 1,
    borderColor: visual.border, backgroundColor: visual.surface },
  periodTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  periodIcon: { width: 34, height: 34, backgroundColor: visual.accentSoft,
    borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  periodTitle: { color: visual.accent, fontSize: 18, fontWeight: '800' },
  periodNetLabel: { color: visual.muted, fontSize: 12, fontWeight: '700', marginTop: 8 },
  periodNet: { color: visual.ink, fontSize: 25, fontWeight: '800', marginTop: 3 },
  tripCount: { marginTop: 7, color: visual.muted, fontWeight: '700', fontSize: 13 },
  divider: { height: 1, backgroundColor: visual.border, marginVertical: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginTop: 11 },
  label: { color: visual.muted, flex: 1 },
  value: { color: visual.ink, fontWeight: '800', textAlign: 'right' },
  button: { marginTop: 22, minHeight: 54, padding: 16, alignItems: 'center', borderRadius: 16,
    backgroundColor: visual.accent },
  buttonText: { color: visual.surface, fontWeight: '800' },
  disabled: { opacity: 0.45 },
});
