import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import AppIcon from '../components/AppIcon';
import { colors } from '../config/theme';
import { useDriver } from '../context/DriverContext';
import useTranslation from '../i18n/useTranslation';

export default function ActiveTripScreen({ navigation }) {
  const t = useTranslation();
  const { activeTrip, advanceTrip } = useDriver();
  const status = activeTrip?.status;
  const headingKey = status === 'driver_arriving'
    ? activeTrip.pickupReachedAt ? 'atPickup' : 'goingToPickup'
    : status === 'in_progress' ? 'goingToDestination' : null;
  const actionKey = status === 'driver_arriving'
    ? activeTrip.pickupReachedAt ? 'passengerOnBoard' : 'confirmArrival'
    : status === 'in_progress' ? 'finishTrip' : null;

  function handleAction() {
    if (status === 'driver_arriving') {
      advanceTrip(activeTrip.pickupReachedAt ? 'board_passenger' : 'confirm_arrival');
    } else if (status === 'in_progress') {
      advanceTrip('complete');
      navigation.navigate('TripCompleted');
    }
  }

  if (!headingKey) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{t('trip')}</Text>
        <Text style={styles.notice}>{t(status === 'completed' ? 'tripAlreadyCompleted' : 'noTrip')}</Text>
        {status === 'completed' ? <Pressable style={styles.button} onPress={() => navigation.navigate('TripCompleted')}>
          <Text style={styles.buttonText}>{t('viewTripSummary')}</Text>
        </Pressable> : null}
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <View style={styles.topLine}>
        <Text style={styles.badge}>{t('tripDemoBadge')}</Text>
        <Text style={styles.step}>{t(status === 'in_progress' ? 'tripStepTwo' : 'tripStepOne')}</Text>
      </View>
      <Text style={styles.title}>{t(headingKey)}</Text>
      <Text style={styles.subtitle}>{t(status === 'in_progress' ? 'destinationStageHint' : 'pickupStageHint')}</Text>
      <View style={styles.progress}>
        <View style={[styles.progressBar, styles.progressActive]} />
        <View style={[styles.progressBar, status === 'in_progress' && styles.progressActive]} />
      </View>
      <View style={styles.card}>
        <View style={styles.passengerRow}>
          <View style={styles.personIcon}><AppIcon name="person" size={23} /></View>
          <View><Text style={styles.label}>{t('passenger')}</Text>
            <Text style={styles.value}>{activeTrip.passengerName}</Text></View>
        </View>
        <View style={styles.separator} />
        <View style={styles.pointRow}>
          <View style={styles.pointIcon}><AppIcon name="pin" size={22} /></View>
          <View style={styles.pointText}><Text style={styles.label}>{t('pickup')}</Text>
            <Text style={styles.value}>{activeTrip.origin?.address}</Text></View>
        </View>
        <View style={styles.line} />
        <View style={styles.pointRow}>
          <View style={styles.pointIcon}><AppIcon name="flag" size={22} /></View>
          <View style={styles.pointText}><Text style={styles.label}>{t('destination')}</Text>
            <Text style={styles.value}>{activeTrip.destination?.address}</Text></View>
        </View>
      </View>
      <View style={styles.estimateCard}>
        <Text style={styles.estimateLabel}>{t('distance')} · {t('duration')}</Text>
        <Text style={styles.estimateValue}>{activeTrip.distanceKm} km · {activeTrip.durationMin} min</Text>
      </View>
      <Text style={styles.notice}>{t('routeNotAvailable')} {t('tripLocalOnly')}</Text>
      <Pressable accessibilityRole="button" style={styles.button} onPress={handleAction}>
        <AppIcon name={status === 'in_progress' ? 'flag' : 'check'} color={colors.surface} size={21} />
        <Text style={styles.buttonText}>{t(actionKey)}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { flexGrow: 1, padding: 20, paddingBottom: 40, backgroundColor: colors.background },
  topLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: colors.warningSoft,
    color: colors.warning, fontWeight: '700' },
  step: { color: colors.primary, fontWeight: '800', fontSize: 13 },
  title: { marginTop: 22, fontSize: 30, fontWeight: '800', color: colors.text },
  subtitle: { marginTop: 8, color: colors.muted, fontSize: 16, lineHeight: 23 },
  progress: { flexDirection: 'row', gap: 8, marginTop: 22 },
  progressBar: { flex: 1, height: 5, borderRadius: 5, backgroundColor: colors.border },
  progressActive: { backgroundColor: colors.primary },
  notice: { marginTop: 18, color: colors.warning, lineHeight: 21, fontSize: 14 },
  card: { marginTop: 22, padding: 18, borderRadius: 20, borderWidth: 1,
    borderColor: colors.border, backgroundColor: colors.surface },
  passengerRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  personIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.primarySoft,
    alignItems: 'center', justifyContent: 'center' },
  separator: { height: 1, backgroundColor: colors.border, marginVertical: 18 },
  pointRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  pointIcon: { width: 30, alignItems: 'center', marginTop: 2 },
  pointText: { flex: 1 }, line: { width: 2, height: 22, backgroundColor: colors.border, marginLeft: 14, marginVertical: 2 },
  label: { color: colors.muted, fontSize: 13 },
  value: { marginTop: 4, color: colors.text, fontSize: 16, fontWeight: '700' },
  estimateCard: { marginTop: 14, borderRadius: 17, backgroundColor: colors.primarySoft, padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  estimateLabel: { flex: 1, color: colors.primary, fontWeight: '600' },
  estimateValue: { color: colors.primary, fontWeight: '800' },
  button: { marginTop: 24, padding: 17, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
    flexDirection: 'row', gap: 10, backgroundColor: colors.primary },
  buttonText: { color: colors.surface, fontSize: 16, fontWeight: '700' },
});
