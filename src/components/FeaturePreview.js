import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../config/theme';
import useTranslation from '../i18n/useTranslation';

export default function FeaturePreview({ title, detail }) {
  const t = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>{t('preview')}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{detail || t('placeholder')}</Text>
      </View>
      <Text style={styles.notice}>{t('mockMode')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: colors.background },
  card: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  eyebrow: {
    color: colors.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: { marginTop: 12, fontSize: 26, fontWeight: '700', color: colors.text },
  description: { marginTop: 10, fontSize: 16, lineHeight: 24, color: colors.muted },
  notice: { marginTop: 18, color: colors.warning, fontWeight: '600' },
});
