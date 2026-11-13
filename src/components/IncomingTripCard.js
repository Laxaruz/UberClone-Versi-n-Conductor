import { StyleSheet, Text, View } from 'react-native';
import AppIcon from './AppIcon';
import { appVisuals as visual } from '../config/appVisuals';
import useTranslation from '../i18n/useTranslation';

function formatCop(amount) {
  return `$${String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} COP`;
}

function Detail({ label, value }) {
  return (
    <View style={styles.detail}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

export default function IncomingTripCard({ request }) {
  const t = useTranslation();
  const demo = request.source === 'demo';
  return (
    <View style={styles.card}>
      <View style={styles.passenger}>
        <View style={styles.passengerIcon}><AppIcon name="person" color={visual.accent} size={21} /></View>
        <Detail label={t('passenger')} value={demo ? t('demoPassenger') : request.passengerName} />
      </View>
      <View style={styles.separator} />
      <View style={styles.routeRow}>
        <View style={styles.routeIcon}><AppIcon name="pin" color={visual.accent} size={21} /></View>
        <Detail label={t('pickup')} value={demo ? t('demoPickup') : request.origin.address} />
      </View>
      <View style={styles.routeLine} />
      <View style={styles.routeRow}>
        <View style={styles.routeIcon}><AppIcon name="flag" color={visual.gold} size={21} /></View>
        <Detail label={t('destination')} value={demo ? t('demoDestination') : request.destination.address} />
      </View>
      <View style={styles.metrics}>
        <View style={styles.metricRow}>
          <Detail label={t('distance')} value={`${request.distanceKm} km`} />
          <Detail label={t('duration')} value={`${request.durationMin} min`} />
        </View>
        <View style={styles.metricRow}>
          <Detail label={t('category')} value={t(request.category)} />
          <Detail label={t('paymentMethod')} value={t(request.paymentMethod)} />
        </View>
      </View>
      <View style={styles.amounts}>
        <Detail label={t('estimatedFare')} value={formatCop(request.fare)} />
        <View style={styles.earnings}><Detail label={t('estimatedEarnings')} value={formatCop(request.driverEarnings)} /></View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 18, borderWidth: 1, borderColor: visual.border, borderRadius: 22,
    backgroundColor: visual.surface },
  detail: { flex: 1, minWidth: 0 },
  label: { fontSize: 12, fontWeight: '700', color: visual.muted },
  value: { marginTop: 4, fontSize: 16, fontWeight: '700', color: visual.ink },
  passenger: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  passengerIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: visual.accentSoft,
    alignItems: 'center', justifyContent: 'center' },
  separator: { height: 1, backgroundColor: visual.border, marginVertical: 17 },
  routeRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  routeIcon: { width: 25, alignItems: 'center', marginTop: 2 },
  routeLine: { height: 19, width: 2, backgroundColor: visual.border, marginLeft: 12, marginVertical: 3 },
  metrics: { gap: 14, marginTop: 19, padding: 15,
    backgroundColor: visual.background, borderRadius: 15 },
  metricRow: { flexDirection: 'row', gap: 12 },
  amounts: { marginTop: 18, gap: 12 },
  earnings: { padding: 14, backgroundColor: visual.accentSoft, borderRadius: 15 },
});
