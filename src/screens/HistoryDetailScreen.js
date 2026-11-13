import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { colors } from '../config/theme';
import { useDriver } from '../context/DriverContext';
import useTranslation from '../i18n/useTranslation';
import { loadTripDetail } from '../services/tripPages';
import { getDrivingRoute } from '../services/routeService';

function formatCop(value) {
  if (!Number.isFinite(value)) return '—';
  return `$${String(value).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} COP`;
}

function DetailRow({ label, value }) {
  return <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>;
}

function hasCoordinates(place) {
  return Number.isFinite(place?.lat) && Number.isFinite(place?.lng)
    && Math.abs(place.lat) <= 90 && Math.abs(place.lng) <= 180;
}

function HistoryMap({ origin, destination, t }) {
  const map = useRef(null);
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const hasPoints = hasCoordinates(origin) && hasCoordinates(destination);

  useEffect(() => {
    setRoute(null);
    setError(false);
    if (!hasPoints) return undefined;
    let active = true;
    setLoading(true);
    getDrivingRoute(
      { latitude: origin.lat, longitude: origin.lng },
      { latitude: destination.lat, longitude: destination.lng },
    ).then((result) => {
      if (active) setRoute(result);
    }).catch(() => {
      if (active) setError(true);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [origin?.lat, origin?.lng, destination?.lat, destination?.lng, hasPoints]);

  useEffect(() => {
    if (route) map.current?.fitToCoordinates(route.coordinates, {
      edgePadding: { top: 35, right: 35, bottom: 35, left: 35 }, animated: true,
    });
  }, [route]);

  if (!hasPoints) return <Text style={styles.missing}>{t('historyMapMissing')}</Text>;
  const start = { latitude: origin.lat, longitude: origin.lng };
  const end = { latitude: destination.lat, longitude: destination.lng };
  const region = {
    latitude: (start.latitude + end.latitude) / 2,
    longitude: (start.longitude + end.longitude) / 2,
    latitudeDelta: Math.max(0.02, Math.abs(start.latitude - end.latitude) * 1.8),
    longitudeDelta: Math.max(0.02, Math.abs(start.longitude - end.longitude) * 1.8),
  };
  return <View style={styles.mapFrame}>
    <MapView ref={map} style={styles.map} initialRegion={region} scrollEnabled={false}>
      <Marker coordinate={start} title={t('pickup')} description={origin.address} />
      <Marker coordinate={end} title={t('destination')} description={destination.address} />
      {route ? <Polyline coordinates={route.coordinates} strokeColor={colors.primary} strokeWidth={5} /> : null}
    </MapView>
    <Text style={styles.mapNote}>{t('historyMapNote')}</Text>
    {loading ? <Text style={styles.mapStatus}>{t('routeLoading')}</Text> : null}
    {error ? <Text style={styles.mapStatus}>{t('historyRouteUnavailable')}</Text> : null}
    {route ? <Text style={styles.attribution}>{t('routeAttribution')}</Text> : null}
  </View>;
}

export default function HistoryDetailScreen({ route }) {
  const t = useTranslation();
  const { driverUid, firebaseConfigured, language } = useDriver();
  const tripId = route?.params?.tripId;
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    if (!driverUid || !firebaseConfigured || !tripId) return undefined;
    let active = true;
    setTrip(null);
    setLoaded(false);
    setLoading(true);
    setError(false);
    loadTripDetail(driverUid, tripId).then((result) => {
      if (active) setTrip(result);
    }).catch(() => {
      if (active) setError(true);
    }).finally(() => {
      if (active) { setLoading(false); setLoaded(true); }
    });
    return () => { active = false; };
  }, [driverUid, firebaseConfigured, tripId, reload]);

  const date = trip && Number.isFinite(trip.completedAtMs)
    ? new Date(trip.completedAtMs).toLocaleString(language === 'en' ? 'en-US' : 'es-CO',
      { timeZone: 'America/Bogota', dateStyle: 'long', timeStyle: 'short' }) : '—';
  const payment = trip?.paymentStatus === 'cash_received' ? t('historyCashReceived')
    : trip?.paymentStatus === 'approved' ? t('paymentApproved')
      : trip?.paymentStatus === 'pending' ? t('paymentPending')
        : trip?.paymentStatus === 'rejected' ? t('paymentRejected') : trip?.paymentStatus || '—';
  const method = trip?.paymentMethod === 'cash' ? t('cash')
    : trip?.paymentMethod === 'mercadopago' ? 'Mercado Pago' : trip?.paymentMethod || '—';

  return <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
    <Text style={styles.title}>{t('historyDetail')}</Text>
    {!firebaseConfigured ? <Text style={styles.missing}>{t('earningsBackendRequired')}</Text> : null}
    {firebaseConfigured && !driverUid ? <Text style={styles.missing}>{t('earningsConnecting')}</Text> : null}
    {loading ? <ActivityIndicator style={styles.spinner} color={colors.primary} /> : null}
    {error ? <Text style={styles.missing}>{t('historyLoadFailed')}</Text> : null}
    {loaded && !loading && !error && !trip ? <Text style={styles.missing}>{t('historyTripMissing')}</Text> : null}
    {trip ? <>
      <Text style={styles.date}>{date}</Text>
      <View style={styles.card}>
        <Text style={styles.placeLabel}>{t('pickup')}</Text>
        <Text style={styles.place}>{trip.origin?.address || t('historyPlaceMissing')}</Text>
        <Text style={styles.placeLabel}>{t('destination')}</Text>
        <Text style={styles.place}>{trip.destination?.address || t('historyPlaceMissing')}</Text>
      </View>
      <Text style={styles.sectionTitle}>{t('historyMap')}</Text>
      <HistoryMap origin={trip.origin} destination={trip.destination} t={t} />
      <Text style={styles.sectionTitle}>{t('historyTripData')}</Text>
      <View style={styles.card}>
        <DetailRow label={t('category')} value={t(trip.category)} />
        <DetailRow label={t('distance')} value={Number.isFinite(trip.distanceKm) ? `${trip.distanceKm} km` : '—'} />
        <DetailRow label={t('duration')} value={Number.isFinite(trip.durationMin) ? `${trip.durationMin} min` : '—'} />
        <DetailRow label={t('historyFare')} value={formatCop(trip.fare)} />
        <DetailRow label={t('commission')} value={formatCop(trip.commission)} />
        <DetailRow label={t('earningsTips')} value={formatCop(trip.tip)} />
        <DetailRow label={t('earningsNet')} value={formatCop(trip.driverEarnings)} />
        <DetailRow label={t('paymentMethod')} value={method} />
        <DetailRow label={t('paymentStatus')} value={payment} />
        <DetailRow label={t('historyRating')}
          value={Number.isFinite(trip.rating) ? `${trip.rating}/5` : t('historyNoRating')} />
      </View>
    </> : null}
    {firebaseConfigured && driverUid ? <Pressable accessibilityRole="button" style={styles.refresh}
      onPress={() => setReload((value) => value + 1)}>
      <Text style={styles.refreshText}>{t('historyRefresh')}</Text>
    </Pressable> : null}
  </ScrollView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 48 },
  title: { color: colors.text, fontSize: 30, fontWeight: '800' },
  date: { marginTop: 8, color: colors.muted },
  sectionTitle: { marginTop: 25, marginBottom: 12, fontSize: 20, fontWeight: '800', color: colors.text },
  card: { marginTop: 18, padding: 18, borderWidth: 1, borderColor: colors.border,
    borderRadius: 18, backgroundColor: colors.surface },
  placeLabel: { color: colors.muted, marginTop: 6 },
  place: { color: colors.text, fontSize: 17, fontWeight: '700', marginTop: 5, marginBottom: 12 },
  mapFrame: { overflow: 'hidden', borderRadius: 18, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.surface },
  map: { height: 270 },
  mapNote: { padding: 12, color: colors.muted, lineHeight: 19 },
  mapStatus: { paddingHorizontal: 12, paddingBottom: 12, color: colors.warning },
  attribution: { paddingHorizontal: 12, paddingBottom: 12, color: colors.muted, fontSize: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 14, marginVertical: 8 },
  label: { flex: 1, color: colors.muted },
  value: { flex: 1, color: colors.text, textAlign: 'right', fontWeight: '700' },
  missing: { marginTop: 20, color: colors.warning },
  spinner: { marginTop: 20 },
  refresh: { marginTop: 20, padding: 14, alignItems: 'center' },
  refreshText: { color: colors.primary, fontWeight: '700' },
});
