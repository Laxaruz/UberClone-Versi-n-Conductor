import { ScrollView, StyleSheet, Text } from 'react-native';
import IncomingTripCard from '../components/IncomingTripCard';
import { colors } from '../config/theme';
import { useDriver } from '../context/DriverContext';
import useTranslation from '../i18n/useTranslation';

// AI-assisted: see docs/AI_LOG.md #29
export default function TripPreviewScreen() {
  const t = useTranslation();
  const { activeTrip } = useDriver();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Text style={styles.eyebrow}>{t('preview')}</Text>
      <Text style={styles.title}>{t('trip')}</Text>
      {activeTrip ? (
        <>
          <Text style={styles.description}>{activeTrip.id}</Text>
          <IncomingTripCard request={activeTrip} />
          <Text style={styles.notice}>{t(activeTrip.source === 'demo' ? 'requestAcceptedDemo' : 'requestAcceptedTest')}</Text>
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
});
