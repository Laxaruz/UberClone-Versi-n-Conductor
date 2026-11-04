import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../config/theme';
import { useDriver } from '../context/DriverContext';
import useTranslation from '../i18n/useTranslation';

export default function SettingsScreen() {
  const t = useTranslation();
  const { language, updateLanguage } = useDriver();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('language')}</Text>
      <Text style={styles.description}>{t('currentLanguage')}: {language.toUpperCase()}</Text>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: language === 'es' }}
          style={[styles.choice, language === 'es' && styles.selected]}
          onPress={() => updateLanguage('es')}
        >
          <Text style={[styles.choiceText, language === 'es' && styles.selectedText]}>
            {t('spanish')}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: language === 'en' }}
          style={[styles.choice, language === 'en' && styles.selected]}
          onPress={() => updateLanguage('en')}
        >
          <Text style={[styles.choiceText, language === 'en' && styles.selectedText]}>
            {t('english')}
          </Text>
        </Pressable>
      </View>
      <Text style={styles.notice}>{t('mockMode')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: colors.background },
  title: { fontSize: 26, fontWeight: '700', color: colors.text },
  description: { marginTop: 12, fontSize: 16, color: colors.muted },
  row: { flexDirection: 'row', gap: 12, marginTop: 24 },
  choice: {
    flex: 1,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  selected: { backgroundColor: colors.primary },
  choiceText: { color: colors.primary, fontWeight: '700' },
  selectedText: { color: colors.surface },
  notice: { marginTop: 20, color: colors.warning, fontWeight: '600' },
});
