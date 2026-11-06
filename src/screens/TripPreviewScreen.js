import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../config/theme';
import { useDriver } from '../context/DriverContext';
import useTranslation from '../i18n/useTranslation';

export default function TripPreviewScreen({ navigation }) {
  const t = useTranslation();
  const { activeTrip } = useDriver();

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>{t('preview')}</Text>
      <Text style={styles.title}>{t('trip')}</Text>
      <Text style={styles.description}>{activeTrip?.id || t('noTrip')}</Text>
      <Text style={styles.notice}>{t('mockDescription')}</Text>
      <Pressable style={styles.button} onPress={() => navigation.navigate('PaymentPreview')}>
        <Text style={styles.buttonText}>{t('openPayment')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: colors.background },
  eyebrow: { color: colors.primary, fontWeight: '700', textTransform: 'uppercase' },
  title: { marginTop: 10, fontSize: 28, fontWeight: '700', color: colors.text },
  description: { marginTop: 12, fontSize: 16, color: colors.muted },
  notice: { marginTop: 14, color: colors.warning },
  button: {
    marginTop: 24,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  buttonText: { color: colors.surface, fontSize: 16, fontWeight: '700' },
});
