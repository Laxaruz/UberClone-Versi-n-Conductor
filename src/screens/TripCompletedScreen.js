import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import AppIcon from '../components/AppIcon';
import { colors } from '../config/theme';
import { useDriver } from '../context/DriverContext';
import useTranslation from '../i18n/useTranslation';

function formatCop(amount) {
  return `$${String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} COP`;
}

function Amount({ label, amount }) {
  return <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.amount}>{formatCop(amount)}</Text>
  </View>;
}

export default function TripCompletedScreen({ navigation }) {
  const t = useTranslation();
  const { activeTrip } = useDriver();
  const completed = activeTrip?.status === 'completed';

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <View style={styles.successIcon}><AppIcon name="check" size={38} color={colors.surface} /></View>
      <Text style={styles.badge}>{t('tripDemoBadge')}</Text>
      <Text style={styles.title}>{t('tripSummary')}</Text>
      {completed ? <>
        <Text style={styles.notice}>{t('finalFareEstimateNotice')}</Text>
        <View style={styles.card}>
          <Text style={styles.detail}>{activeTrip.origin?.address} → {activeTrip.destination?.address}</Text>
          <Text style={styles.detail}>{activeTrip.distanceKm} km · {activeTrip.durationMin} min</Text>
          <View style={styles.separator} />
          <Amount label={t('finalFare')} amount={activeTrip.finalFare} />
          <Amount label={t('commission')} amount={activeTrip.finalCommission} />
          <Amount label={t('netEarnings')} amount={activeTrip.finalDriverEarnings} />
          <View style={styles.paymentRow}><Text style={styles.label}>{t('paymentStatus')}</Text>
            <Text style={styles.paymentPending}>{t('paymentPending')}</Text></View>
        </View>
        <Text style={styles.notice}>{t('paymentNotProcessed')}</Text>
      </> : <Text style={styles.notice}>{t('noCompletedTrip')}</Text>}
      <Pressable accessibilityRole="button" style={styles.button} onPress={() => navigation.getParent()?.navigate('MainDrawer')}>
        <Text style={styles.buttonText}>{t('backHome')}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { padding: 20, paddingBottom: 40 },
  successIcon: { width: 72, height: 72, borderRadius: 24, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  badge: { alignSelf: 'flex-start', padding: 8, borderRadius: 12, backgroundColor: colors.warningSoft,
    color: colors.warning, fontWeight: '700' },
  title: { marginTop: 16, fontSize: 30, fontWeight: '800', color: colors.text },
  notice: { marginTop: 14, color: colors.warning, lineHeight: 22 },
  card: { marginTop: 22, padding: 20, borderRadius: 20, borderWidth: 1,
    borderColor: colors.border, backgroundColor: colors.surface },
  detail: { marginBottom: 14, color: colors.text, fontSize: 16 },
  separator: { height: 1, backgroundColor: colors.border, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginVertical: 8 },
  label: { flex: 1, color: colors.muted, fontSize: 15 },
  amount: { color: colors.text, fontSize: 16, fontWeight: '700' },
  paymentRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  paymentPending: { color: colors.warning, backgroundColor: colors.warningSoft, paddingHorizontal: 12,
    paddingVertical: 7, borderRadius: 10, fontWeight: '700' },
  button: { marginTop: 24, padding: 17, borderRadius: 16, alignItems: 'center', backgroundColor: colors.primary },
  buttonText: { color: colors.surface, fontSize: 16, fontWeight: '700' },
});
