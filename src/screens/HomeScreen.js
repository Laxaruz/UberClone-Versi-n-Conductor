import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../config/theme';
import { useDriver } from '../context/DriverContext';
import useTranslation from '../i18n/useTranslation';

export default function HomeScreen({ navigation }) {
  const t = useTranslation();
  const { driverSession, activeTrip, registrationStatus } = useDriver();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('appName')}</Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{t('mockMode')}</Text>
      </View>
      <Text style={styles.description}>{t('mockDescription')}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('profile')}</Text>
        <Text style={styles.cardText}>{driverSession?.name || t('noSession')}</Text>
        <Text style={styles.cardText}>{t(registrationStatus === 'pending_demo' ? 'pendingApproval' : 'notRegistered')}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('trip')}</Text>
        <Text style={styles.cardText}>{activeTrip?.id || t('noTrip')}</Text>
      </View>

      <Pressable style={styles.button} onPress={() => navigation.navigate('Registration')}>
        <Text style={styles.buttonText}>{t('openRegistration')}</Text>
      </Pressable>
      <Pressable
        style={styles.secondaryButton}
        onPress={() => navigation.getParent()?.navigate('TripFlow')}
      >
        <Text style={styles.secondaryButtonText}>{t('openTrip')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: colors.background },
  title: { fontSize: 28, fontWeight: '800', color: colors.text },
  badge: {
    alignSelf: 'flex-start',
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.warningSoft,
  },
  badgeText: { color: colors.warning, fontWeight: '700' },
  description: { marginVertical: 16, color: colors.muted, fontSize: 16, lineHeight: 23 },
  card: {
    padding: 18,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cardTitle: { color: colors.primary, fontSize: 15, fontWeight: '700' },
  cardText: { color: colors.text, fontSize: 16, marginTop: 6 },
  button: {
    marginTop: 12,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  buttonText: { color: colors.surface, fontSize: 16, fontWeight: '700' },
  secondaryButton: {
    marginTop: 10,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  secondaryButtonText: { color: colors.primary, fontSize: 16, fontWeight: '700' },
});
