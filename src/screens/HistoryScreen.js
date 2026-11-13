import { useEffect, useMemo, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import AppIcon from '../components/AppIcon';
import ScreenHero, { InfoBanner, StatusPill } from '../components/ScreenHero';
import { appVisuals as visual } from '../config/appVisuals';
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
  const paymentTone = ['cash_received', 'approved'].includes(trip.paymentStatus) ? 'success'
    : trip.paymentStatus === 'rejected' ? 'danger' : 'warning';
  return <Pressable accessibilityRole="button" style={styles.card} onPress={onPress}>
    <View style={styles.cardTop}>
      <Text style={styles.date}>{date}</Text>
      <StatusPill label={payment} tone={paymentTone} />
    </View>
    <View style={styles.routeRow}>
      <AppIcon name="pin" size={20} color={visual.accent} />
      <Text style={styles.place}>{trip.origin?.address || t('historyPlaceMissing')}</Text>
    </View>
    <View style={styles.routeLine} />
    <View style={styles.routeRow}>
      <AppIcon name="flag" size={20} color={visual.gold} />
      <Text style={styles.place}>{trip.destination?.address || t('historyPlaceMissing')}</Text>
    </View>
    <View style={styles.divider} />
    <Text style={styles.meta}>{t('category')}: {t(trip.category)}</Text>
    <View style={styles.amounts}>
      <View style={styles.amountColumn}><Text style={styles.amountLabel}>{t('historyFare')}</Text>
        <Text style={styles.amount}>{formatCop(trip.fare)}</Text></View>
      <View style={styles.amountColumn}><Text style={styles.amountLabel}>{t('earningsNet')}</Text>
        <Text style={styles.net}>{formatCop(trip.driverEarnings)}</Text></View>
    </View>
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
    <ScreenHero icon="history" title={t('history')} description={t('historyDescription')} />
    <View style={styles.filterPanel}>
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
    </View>
    {!firebaseConfigured ? <InfoBanner>{t('earningsBackendRequired')}</InfoBanner> : null}
    {firebaseConfigured && !driverUid ? <Text style={styles.description}>{t('earningsConnecting')}</Text> : null}
    {period === 'range' && !range ? <InfoBanner tone="info">{t('historyChooseRange')}</InfoBanner> : null}
    <Text style={styles.sectionTitle}>{t('historyTrips')}</Text>
  </View>;

  return <FlatList style={styles.screen} contentContainerStyle={styles.content} data={trips}
    keyExtractor={(item) => item.id} ListHeaderComponent={header}
    renderItem={({ item }) => <TripCard trip={item} t={t} language={language}
      onPress={() => navigation.getParent()?.navigate('HistoryDetail', { tripId: item.id })} />}
    ListEmptyComponent={loaded && !loading && filters && firebaseConfigured && driverUid && !error
      ? <View style={styles.empty}><Text style={styles.emptyText}>{t('historyEmpty')}</Text></View> : null}
    ListFooterComponent={<View>
      {loading || loadingMore ? <ActivityIndicator style={styles.spinner} color={visual.accent} /> : null}
      {error ? <InfoBanner tone="danger">{t('historyLoadFailed')}</InfoBanner> : null}
      {hasMore && !loadingMore ? <Pressable accessibilityRole="button" style={styles.button}
        onPress={loadMore}><Text style={styles.buttonText}>{t('historyLoadMore')}</Text></Pressable> : null}
      {filters && firebaseConfigured && driverUid && !loading && !loadingMore
        ? <Pressable accessibilityRole="button" style={styles.refresh} onPress={refresh}>
          <Text style={styles.refreshText}>{t('historyRefresh')}</Text>
        </Pressable> : null}
    </View>} />;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: visual.background },
  content: { padding: 20, paddingBottom: 48 },
  description: { marginTop: 8, color: visual.muted, lineHeight: 22 },
  filterPanel: { marginTop: 18, padding: 18, borderRadius: 22, borderWidth: 1,
    borderColor: visual.border, backgroundColor: visual.surface },
  filterLabel: { marginTop: 14, marginBottom: 9, color: visual.ink, fontWeight: '700' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, borderWidth: 1,
    borderColor: visual.border, backgroundColor: visual.background },
  chipActive: { backgroundColor: visual.accent, borderColor: visual.accent },
  chipText: { color: visual.ink, fontWeight: '700' },
  chipTextActive: { color: visual.surface },
  rangePanel: { marginTop: 14, padding: 14, borderRadius: 16, backgroundColor: visual.background },
  rangeRow: { flexDirection: 'row', gap: 10 },
  rangeField: { flex: 1 },
  dateInput: { padding: 12, borderWidth: 1, borderColor: visual.border, borderRadius: 12,
    color: visual.ink, backgroundColor: visual.surface },
  applyButton: { marginTop: 14, padding: 14, borderRadius: 12, alignItems: 'center',
    backgroundColor: visual.accent },
  applyText: { color: visual.surface, fontWeight: '800' },
  sectionTitle: { marginTop: 24, marginBottom: 4, fontSize: 21, fontWeight: '800', color: visual.ink },
  card: { marginTop: 14, padding: 18, borderRadius: 22, borderWidth: 1, borderColor: visual.border,
    backgroundColor: visual.surface },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, alignItems: 'center' },
  date: { color: visual.muted, flex: 1, fontSize: 12 },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 14 },
  routeLine: { marginLeft: 9, height: 12, borderLeftWidth: 2, borderLeftColor: visual.border },
  place: { color: visual.ink, fontWeight: '700', fontSize: 15, flex: 1 },
  divider: { marginTop: 17, height: 1, backgroundColor: visual.border },
  meta: { marginTop: 11, color: visual.muted },
  amounts: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginTop: 14 },
  amountColumn: { flex: 1, minWidth: 0 },
  amountLabel: { color: visual.muted, fontSize: 12 },
  amount: { marginTop: 4, color: visual.ink, fontSize: 16, fontWeight: '700' },
  net: { marginTop: 4, color: visual.accent, fontSize: 17, fontWeight: '800' },
  openDetail: { marginTop: 18, color: visual.accent, fontWeight: '800' },
  empty: { marginTop: 20, padding: 20, borderRadius: 18, backgroundColor: visual.surface },
  emptyText: { color: visual.muted, textAlign: 'center' },
  warning: { marginTop: 12, color: visual.error },
  spinner: { marginTop: 18 },
  button: { marginTop: 18, padding: 15, alignItems: 'center', borderRadius: 14,
    backgroundColor: visual.accent },
  buttonText: { color: visual.surface, fontWeight: '800' },
  refresh: { marginTop: 16, padding: 12, alignItems: 'center' },
  refreshText: { color: visual.accent, fontWeight: '800' },
});
