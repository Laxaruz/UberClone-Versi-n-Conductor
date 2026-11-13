import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import AppIcon from '../components/AppIcon';
import IncomingTripCard from '../components/IncomingTripCard';
import { colors } from '../config/theme';
import { useDriver } from '../context/DriverContext';
import useTranslation from '../i18n/useTranslation';

// AI-assisted: see docs/AI_LOG.md #29
export default function TripPreviewScreen({ navigation }) {
  const t = useTranslation();
  const { activeTrip, advanceTrip } = useDriver();

  function startPickup() {
    if (activeTrip?.status !== 'accepted') return;
    advanceTrip('start_pickup');
    navigation.navigate('ActiveTrip');
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Text style={styles.eyebrow}>{t('preview')}</Text>
      <Text style={styles.title}>{t('trip')}</Text>
      {activeTrip ? (
        <>
          <Text style={styles.description}>{activeTrip.id}</Text>
          <IncomingTripCard request={activeTrip} />
          <Text style={styles.notice}>{t(activeTrip.source === 'demo' ? 'requestAcceptedDemo' : 'requestAcceptedTest')}</Text>
          <Text style={styles.notice}>{t('tripLocalOnly')}</Text>
          <Pressable accessibilityRole="button" style={styles.button}
            onPress={activeTrip.status === 'accepted' ? startPickup : () => navigation.navigate(activeTrip.status === 'completed' ? 'TripCompleted' : 'ActiveTrip')}>
            <AppIcon name="route" size={21} color={colors.surface} />
            <Text style={styles.buttonText}>{t(activeTrip.status === 'accepted' ? 'startPickup' : 'continueTrip')}</Text>
          </Pressable>
        </>
      ) : <Text style={styles.description}>{t('noTrip')}</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { padding: 20, paddingBottom: 40 },
  eyebrow: { color: colors.primary, fontWeight: '700', textTransform: 'uppercase' },
  title: { marginTop: 10, fontSize: 28, fontWeight: '700', color: colors.text },
  description: { marginTop: 12, fontSize: 16, color: colors.muted },
  notice: { marginTop: 14, color: colors.warning },
  button: { marginTop: 22, padding: 17, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
    flexDirection: 'row', gap: 10, backgroundColor: colors.primary },
  buttonText: { color: colors.surface, fontSize: 16, fontWeight: '700' },
});
