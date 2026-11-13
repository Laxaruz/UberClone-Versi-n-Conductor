import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import AppIcon from '../components/AppIcon';
import IncomingTripCard from '../components/IncomingTripCard';
import ScreenHero, { InfoBanner } from '../components/ScreenHero';
import { appVisuals as visual } from '../config/appVisuals';
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
      <ScreenHero icon="route" eyebrow={t('preview')} title={t('trip')}
        description={activeTrip?.id} />
      {activeTrip ? (
        <>
          <IncomingTripCard request={activeTrip} />
          <InfoBanner tone="info">{t(activeTrip.source === 'demo' ? 'requestAcceptedDemo' : 'requestAcceptedTest')}</InfoBanner>
          <InfoBanner>{t('tripLocalOnly')}</InfoBanner>
          <Pressable accessibilityRole="button" style={styles.button}
            onPress={activeTrip.status === 'accepted' ? startPickup : () => navigation.navigate(['completed', 'paid'].includes(activeTrip.status) ? 'TripCompleted' : 'ActiveTrip')}>
            <AppIcon name="route" size={21} color={visual.surface} />
            <Text style={styles.buttonText}>{t(activeTrip.status === 'accepted' ? 'startPickup' : 'continueTrip')}</Text>
          </Pressable>
        </>
      ) : <InfoBanner>{t('noTrip')}</InfoBanner>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: visual.background },
  container: { padding: 16, paddingTop: 20, paddingBottom: 40 },
  button: { marginTop: 20, minHeight: 56, padding: 16, borderRadius: 16, alignItems: 'center',
    justifyContent: 'center', flexDirection: 'row', gap: 10, backgroundColor: visual.accent },
  buttonText: { color: visual.surface, fontSize: 16, fontWeight: '800' },
});
