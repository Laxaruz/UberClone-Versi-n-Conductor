import { useEffect, useMemo, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../config/theme';
import { useDriver } from '../context/DriverContext';
import useTripHistory from '../hooks/useTripHistory';
import useTranslation from '../i18n/useTranslation';
import { getEarningsBoundaries } from '../utils/earningsSummary';
import { parseHistoryDateRange } from '../utils/historyDateRange';

const periods = ['all', 'today', 'week', 'month', 'range'];
const methods = ['all', 'cash', 'mercadopago', 'stripe'];

function formatCop(value) {
  if (!Number.isFinite(value)) return '—';
  return `$${String(value).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} COP`;
}

function TripCard({ trip, onPress, t, language }) {
  const date = Number.isFinite(trip.completedAtMs)
    ? new Date(trip.completedAtMs).toLocaleString(language === 'en' ? 'en-US' : 'es-CO',
      { timeZone: 'America/Bogota', dateStyle: 'medium', timeStyle: 'short' }) : '—';
  const payment = trip.paymentStatus === 'cash_received' ? t('historyCashReceived')
    : trip.paymentStatus === 'approved' ? t('paymentApproved')
      : trip.paymentStatus === 'pending' ? t('paymentPending')
        : trip.paymentStatus === 'rejected' ? t('paymentRejected') : trip.paymentStatus || '—';
  return <Pressable accessibilityRole="button" style={styles.card} onPress={onPress}>
    <View style={styles.cardTop}>
      <Text style={styles.date}>{date}</Text>
      <Text style={styles.paymentBadge}>{payment}</Text>
    </View>
    <Text style={styles.place}>{trip.origin?.address || t('historyPlaceMissing')}</Text>
    <Text style={styles.arrow}>↓</Text>
    <Text style={styles.place}>{trip.destination?.address || t('historyPlaceMissing')}</Text>
    <View style={styles.divider} />
    <Text style={styles.meta}>{t('category')}: {t(trip.category)}</Text>
    <Text style={styles.meta}>{t('historyFare')}: {formatCop(trip.fare)}</Text>
    <Text style={styles.net}>{t('earningsNet')}: {formatCop(trip.driverEarnings)}</Text>
    <Text style={styles.openDetail}>{t('historyOpenDetail')} →</Text>
  </Pressable>;
}

export default function HistoryScreen({ navigation }) {
  const t = useTranslation();
  const isFocused = useIsFocused();
  const { driverUid, firebaseConfigured, language } = useDriver();
  const [period, setPeriod] = useState('all');
  const [method, setMethod] = useState('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [range, setRange] = useState(null);
  const [rangeError, setRangeError] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => { if (isFocused) setNow(Date.now()); }, [isFocused]);

  const filters = useMemo(() => {
    const result = method === 'all' ? {} : { paymentMethod: method };
    const boundaries = getEarningsBoundaries(new Date(now));
    if (period === 'today') result.startMs = boundaries.today;
    if (period === 'week') result.startMs = boundaries.week;
    if (period === 'month') result.startMs = boundaries.month;
    if (period === 'range') {
      if (!range) return null;
      result.startMs = range.startMs;
      result.endMs = range.endMs;
    }
    return result;
  }, [period, method, range, now]);

  const { trips, hasMore, loading, loadingMore, loaded, error, loadMore, refresh } =
    useTripHistory(driverUid, isFocused, firebaseConfigured, filters);

  function applyRange() {
    const next = parseHistoryDateRange(from, to);
    setRangeError(!next);
    setRange(next);
  }

  const header = <View>
    <Text style={styles.title}>{t('history')}</Text>
    <Text style={styles.description}>{t('historyDescription')}</Text>
    <Text style={styles.filterLabel}>{t('historyPeriod')}</Text>
    <View style={styles.chips}>{periods.map((value) =>
      <Pressable key={value} accessibilityRole="button" style={[styles.chip, period === value && styles.chipActive]}
        onPress={() => { setPeriod(value); setRangeError(false); }}>
        <Text style={[styles.chipText, period === value && styles.chipTextActive]}>
          {t(`historyPeriod_${value}`)}
        </Text>
      </Pressable>)}</View>
    {period === 'range' ? <View style={styles.rangePanel}>
      <Text style={styles.description}>{t('historyDateHint')}</Text>
      <View style={styles.rangeRow}>
        <View style={styles.rangeField}>
          <Text style={styles.filterLabel}>{t('historyFrom')}</Text>
          <TextInput style={styles.dateInput} value={from} placeholder="AAAA-MM-DD"
            accessibilityLabel={t('historyFrom')} autoCapitalize="none"
            onChangeText={(text) => { setFrom(text); setRange(null); setRangeError(false); }} />
        </View>
        <View style={styles.rangeField}>
          <Text style={styles.filterLabel}>{t('historyTo')}</Text>
          <TextInput style={styles.dateInput} value={to} placeholder="AAAA-MM-DD"
            accessibilityLabel={t('historyTo')} autoCapitalize="none"
            onChangeText={(text) => { setTo(text); setRange(null); setRangeError(false); }} />
        </View>
      </View>
      {rangeError ? <Text style={styles.warning}>{t('historyInvalidRange')}</Text> : null}
      <Pressable accessibilityRole="button" style={styles.applyButton} onPress={applyRange}>
        <Text style={styles.applyText}>{t('historyApplyRange')}</Text>
      </Pressable>
    </View> : null}
    <Text style={styles.filterLabel}>{t('paymentMethod')}</Text>
    <View style={styles.chips}>{methods.map((value) =>
      <Pressable key={value} accessibilityRole="button" style={[styles.chip, method === value && styles.chipActive]}
        onPress={() => setMethod(value)}>
        <Text style={[styles.chipText, method === value && styles.chipTextActive]}>
          {value === 'all' ? t('historyAllMethods') : value === 'cash' ? t('cash')
            : value === 'mercadopago' ? 'Mercado Pago' : 'Stripe'}
        </Text>
      </Pressable>)}</View>
    {!firebaseConfigured ? <Text style={styles.warning}>{t('earningsBackendRequired')}</Text> : null}
    {firebaseConfigured && !driverUid ? <Text style={styles.description}>{t('earningsConnecting')}</Text> : null}
    {period === 'range' && !range ? <Text style={styles.description}>{t('historyChooseRange')}</Text> : null}
    <Text style={styles.sectionTitle}>{t('historyTrips')}</Text>
  </View>;

  return <FlatList style={styles.screen} contentContainerStyle={styles.content} data={trips}
    keyExtractor={(item) => item.id} ListHeaderComponent={header}
    renderItem={({ item }) => <TripCard trip={item} t={t} language={language}
      onPress={() => navigation.getParent()?.navigate('HistoryDetail', { tripId: item.id })} />}
    ListEmptyComponent={loaded && !loading && filters && firebaseConfigured && driverUid && !error
      ? <Text style={styles.empty}>{t('historyEmpty')}</Text> : null}
    ListFooterComponent={<View>
      {loading || loadingMore ? <ActivityIndicator style={styles.spinner} color={colors.primary} /> : null}
      {error ? <Text style={styles.warning}>{t('historyLoadFailed')}</Text> : null}
      {hasMore && !loadingMore ? <Pressable accessibilityRole="button" style={styles.button}
        onPress={loadMore}><Text style={styles.buttonText}>{t('historyLoadMore')}</Text></Pressable> : null}
      {filters && firebaseConfigured && driverUid && !loading && !loadingMore
        ? <Pressable accessibilityRole="button" style={styles.refresh} onPress={refresh}>
          <Text style={styles.refreshText}>{t('historyRefresh')}</Text>
        </Pressable> : null}
    </View>} />;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 48 },
  title: { fontSize: 30, fontWeight: '800', color: colors.text },
  description: { marginTop: 8, color: colors.muted, lineHeight: 22 },
  filterLabel: { marginTop: 18, marginBottom: 8, color: colors.text, fontWeight: '700' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 13, paddingVertical: 9, borderRadius: 18, borderWidth: 1,
    borderColor: colors.border, backgroundColor: colors.surface },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text, fontWeight: '600' },
  chipTextActive: { color: colors.surface },
  rangePanel: { marginTop: 12, padding: 14, borderRadius: 16, backgroundColor: colors.surface },
  rangeRow: { flexDirection: 'row', gap: 10 },
  rangeField: { flex: 1 },
  dateInput: { padding: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 12,
    color: colors.text, backgroundColor: colors.surface },
  applyButton: { marginTop: 14, padding: 13, borderRadius: 12, alignItems: 'center',
    backgroundColor: colors.primary },
  applyText: { color: colors.surface, fontWeight: '700' },
  sectionTitle: { marginTop: 24, marginBottom: 4, fontSize: 20, fontWeight: '800', color: colors.text },
  card: { marginTop: 14, padding: 18, borderRadius: 18, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.surface },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, alignItems: 'center' },
  date: { color: colors.muted, flex: 1 },
  paymentBadge: { color: colors.primary, backgroundColor: colors.primarySoft,
    paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8, fontSize: 12, fontWeight: '700' },
  place: { marginTop: 9, color: colors.text, fontWeight: '700', fontSize: 16 },
  arrow: { marginTop: 3, color: colors.primary, fontSize: 20 },
  divider: { marginTop: 14, height: 1, backgroundColor: colors.border },
  meta: { marginTop: 9, color: colors.muted },
  net: { marginTop: 10, color: colors.text, fontWeight: '800' },
  openDetail: { marginTop: 13, color: colors.primary, fontWeight: '700' },
  empty: { marginTop: 20, color: colors.muted },
  warning: { marginTop: 12, color: colors.warning },
  spinner: { marginTop: 18 },
  button: { marginTop: 18, padding: 15, alignItems: 'center', borderRadius: 14,
    backgroundColor: colors.primary },
  buttonText: { color: colors.surface, fontWeight: '700' },
  refresh: { marginTop: 16, padding: 12, alignItems: 'center' },
  refreshText: { color: colors.primary, fontWeight: '700' },
});
