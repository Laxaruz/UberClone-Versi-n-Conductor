import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AppIcon from './AppIcon';
import { colors } from '../config/theme';
import useTranslation from '../i18n/useTranslation';
import { fromIsoDate, toIsoDate } from '../utils/dateInput';

export default function DateSelector({ label, value, onChange, disabled, birthDate }) {
  const t = useTranslation();
  const [visible, setVisible] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [draft, setDraft] = useState({ day: '', month: '', year: '' });
  const [invalid, setInvalid] = useState(false);
  const today = new Date();
  const boundary = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  function open() {
    const initial = birthDate ? new Date(2000, 0, 1) : tomorrow;
    setDraft(fromIsoDate(value, initial));
    setInvalid(false);
    setShowCalendar(false);
    setVisible(true);
  }

  function save() {
    const next = toIsoDate(draft.day, draft.month, draft.year);
    if (!next) { setInvalid(true); return; }
    onChange(next);
    setVisible(false);
  }

  const selected = toIsoDate(draft.day, draft.month, draft.year);
  const calendarValue = selected ? new Date(`${selected}T12:00:00`) : birthDate ? new Date(2000, 0, 1) : tomorrow;

  return <>
    <Pressable accessibilityRole="button" accessibilityLabel={label} disabled={disabled}
      style={[styles.input, disabled && styles.disabled]} onPress={open}>
      <Text style={[styles.value, !value && styles.placeholder]}>{value || t('selectDate')}</Text>
      <AppIcon name="calendar" size={23} />
    </Pressable>
    <Modal visible={visible} animationType="slide" transparent onRequestClose={() => setVisible(false)}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>{label}</Text>
          <Text style={styles.hint}>{t('dateInputHint')}</Text>
          <View style={styles.parts}>
            {[
              ['day', 'dateDay', 2], ['month', 'dateMonth', 2], ['year', 'dateYear', 4],
            ].map(([part, textKey, length]) => <View key={part} style={styles.part}>
              <Text style={styles.partLabel}>{t(textKey)}</Text>
              <TextInput accessibilityLabel={t(textKey)} style={styles.partInput}
                value={draft[part]} maxLength={length} keyboardType="number-pad"
                onChangeText={(text) => { setDraft((current) => ({ ...current, [part]: text.replace(/\D/g, '').slice(0, length) })); setInvalid(false); }} />
            </View>)}
          </View>
          {invalid ? <Text style={styles.error}>{t('invalidDateInput')}</Text> : null}
          <Pressable accessibilityRole="button" style={styles.calendarToggle}
            onPress={() => setShowCalendar((current) => !current)}>
            <Text style={styles.calendarToggleText}>{t(showCalendar ? 'hideCalendar' : 'showCalendar')}</Text>
          </Pressable>
          {showCalendar ? <ScrollView style={styles.calendarArea}>
            <DateTimePicker value={calendarValue} mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
              maximumDate={birthDate ? boundary : undefined}
              minimumDate={birthDate ? undefined : tomorrow}
              onChange={(event, date) => {
                if (event.type === 'set' && date) {
                  setDraft(fromIsoDate(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`, date));
                  setInvalid(false);
                }
                if (Platform.OS === 'android') setShowCalendar(false);
              }} />
          </ScrollView> : null}
          <View style={styles.actions}>
            <Pressable accessibilityRole="button" style={styles.cancel} onPress={() => setVisible(false)}>
              <Text style={styles.cancelText}>{t('cancel')}</Text>
            </Pressable>
            <Pressable accessibilityRole="button" style={styles.save} onPress={save}>
              <Text style={styles.saveText}>{t('saveDate')}</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  </>;
}

const styles = StyleSheet.create({
  input: { minHeight: 58, paddingHorizontal: 16, borderWidth: 1, borderColor: colors.border,
    borderRadius: 16, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  disabled: { opacity: 0.7 }, value: { fontSize: 16, color: colors.text }, placeholder: { color: colors.muted },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#17242B88' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 32, maxHeight: '90%' },
  handle: { alignSelf: 'center', width: 48, height: 5, borderRadius: 4, backgroundColor: colors.border, marginBottom: 20 },
  title: { fontSize: 22, fontWeight: '800', color: colors.text },
  hint: { color: colors.muted, marginTop: 6, marginBottom: 18 },
  parts: { flexDirection: 'row', gap: 10 }, part: { flex: 1 },
  partLabel: { color: colors.muted, fontSize: 13, marginBottom: 7 },
  partInput: { height: 54, borderWidth: 1, borderColor: colors.border, borderRadius: 12,
    textAlign: 'center', color: colors.text, fontSize: 18, backgroundColor: colors.background },
  error: { marginTop: 10, color: '#B3261E' },
  calendarToggle: { paddingVertical: 16 }, calendarToggleText: { color: colors.primary, fontWeight: '700' },
  calendarArea: { maxHeight: 330 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  cancel: { flex: 1, alignItems: 'center', padding: 15, borderRadius: 13, borderWidth: 1, borderColor: colors.border },
  cancelText: { color: colors.text, fontWeight: '700' },
  save: { flex: 1, alignItems: 'center', padding: 15, borderRadius: 13, backgroundColor: colors.primary },
  saveText: { color: colors.surface, fontWeight: '700' },
});
