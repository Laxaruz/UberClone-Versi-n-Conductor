import { useIsFocused } from '@react-navigation/native';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../config/theme';
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
    <Text style={styles.periodTitle}>{title}</Text>
    <Text style={styles.tripCount}>{t('earningsTripCount')}: {totals.tripCount}</Text>
    <AmountRow label={t('earningsFare')} amount={totals.totalFare} />
    <AmountRow label={t('earningsCommission')} amount={totals.totalCommission} />
    <AmountRow label={t('earningsTips')} amount={totals.totalTips} />
    <AmountRow label={t('earningsNet')} amount={totals.netEarnings} />
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
    <Text style={styles.title}>{t('earnings')}</Text>
    <Text style={styles.description}>{t('earningsDescription')}</Text>
    {!firebaseConfigured ? <Text style={styles.warning}>{t('earningsBackendRequired')}</Text> : null}
    {firebaseConfigured && !driverUid ? <Text style={styles.description}>{t('earningsConnecting')}</Text> : null}
    {loading ? <ActivityIndicator style={styles.spinner} color={colors.primary} /> : null}
    {error ? <Text style={styles.warning}>{t(error)}</Text> : null}
    {ready ? <>
      <View style={styles.balanceCard}>
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
        <AmountRow label={t('earningsCashPending')} amount={breakdown.pendingCashCommission} />
        <AmountRow label={t('earningsCashDeducted')} amount={breakdown.deductedCashCommission} />
      </View>
      {periods.month.tripCount === 0 ? <Text style={styles.empty}>{t('earningsEmpty')}</Text> : null}
    </> : null}
    <Pressable accessibilityRole="button" disabled={!firebaseConfigured || !driverUid || loading}
      style={[styles.button, (!firebaseConfigured || !driverUid || loading) && styles.disabled]}
      onPress={refresh}>
      <Text style={styles.buttonText}>{t('earningsRefresh')}</Text>
    </Pressable>
  </ScrollView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 48 },
  title: { color: colors.text, fontSize: 30, fontWeight: '800' },
  description: { marginTop: 8, color: colors.muted, lineHeight: 22 },
  warning: { marginTop: 16, color: colors.warning, lineHeight: 22 },
  spinner: { marginTop: 18 },
  balanceCard: { marginTop: 20, padding: 20, borderRadius: 18, backgroundColor: colors.primary },
  balanceLabel: { color: colors.surface, fontWeight: '700' },
  balanceAmount: { marginTop: 10, color: colors.surface, fontSize: 29, fontWeight: '800' },
  balanceNote: { marginTop: 8, color: colors.surface, lineHeight: 20 },
  sectionTitle: { marginTop: 26, color: colors.text, fontSize: 21, fontWeight: '800' },
  card: { marginTop: 14, padding: 18, borderRadius: 18, borderWidth: 1,
    borderColor: colors.border, backgroundColor: colors.surface },
  periodTitle: { color: colors.primary, fontSize: 19, fontWeight: '800' },
  tripCount: { marginTop: 7, marginBottom: 8, color: colors.text, fontWeight: '700' },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginTop: 10 },
  label: { color: colors.muted, flex: 1 },
  value: { color: colors.text, fontWeight: '700', textAlign: 'right' },
  empty: { marginTop: 16, color: colors.muted },
  button: { marginTop: 22, padding: 17, alignItems: 'center', borderRadius: 16,
    backgroundColor: colors.primary },
  buttonText: { color: colors.surface, fontWeight: '700' },
  disabled: { opacity: 0.45 },
});
