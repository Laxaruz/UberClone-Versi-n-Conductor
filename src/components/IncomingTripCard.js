import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../config/theme';
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
      <Detail label={t('passenger')} value={demo ? t('demoPassenger') : request.passengerName} />
      <Detail label={t('pickup')} value={demo ? t('demoPickup') : request.origin.address} />
      <Detail label={t('destination')} value={demo ? t('demoDestination') : request.destination.address} />
      <View style={styles.row}>
        <Detail label={t('distance')} value={`${request.distanceKm} km`} />
        <Detail label={t('duration')} value={`${request.durationMin} min`} />
      </View>
      <View style={styles.row}>
        <Detail label={t('category')} value={t(request.category)} />
        <Detail label={t('paymentMethod')} value={t(request.paymentMethod)} />
      </View>
      <View style={styles.amounts}>
        <Detail label={t('estimatedFare')} value={formatCop(request.fare)} />
        <Detail label={t('estimatedEarnings')} value={formatCop(request.driverEarnings)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 18, borderWidth: 1, borderColor: colors.border, borderRadius: 18, backgroundColor: colors.surface },
  detail: { flex: 1, marginBottom: 16 },
  label: { fontSize: 14, color: colors.muted },
  value: { marginTop: 4, fontSize: 17, fontWeight: '600', color: colors.text },
  row: { flexDirection: 'row', gap: 12 },
  amounts: { borderTopWidth: 1, borderColor: colors.border, paddingTop: 16 },
});
