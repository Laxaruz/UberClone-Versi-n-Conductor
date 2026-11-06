import { StyleSheet, Switch, Text, View } from 'react-native';
import { colors } from '../config/theme';
import useTranslation from '../i18n/useTranslation';

export default function AvailabilityToggle({ value, enabled, reason, onChange }) {
  const t = useTranslation();
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.title}>{t('availability')}</Text>
        <Switch accessibilityLabel={t('availability')} value={value} disabled={!enabled} onValueChange={onChange} trackColor={{ true: colors.primary, false: colors.border }} />
      </View>
      <Text style={styles.status}>{t(value ? 'available' : 'unavailable')}</Text>
      {!enabled && <Text style={styles.reason}>{t(reason)}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 18, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, marginTop: 16 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: colors.text, fontSize: 18, fontWeight: '700' },
  status: { color: colors.primary, marginTop: 6, fontWeight: '600' },
  reason: { color: colors.warning, marginTop: 8, lineHeight: 20 },
});
