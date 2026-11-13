import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AppIcon from './AppIcon';
import { appVisuals as visual } from '../config/appVisuals';
import { useDriver } from '../context/DriverContext';
import useTranslation from '../i18n/useTranslation';
import { fromIsoDate, toIsoDate } from '../utils/dateInput';

export default function DateSelector({ label, value, onChange, disabled, birthDate }) {
  const t = useTranslation();
  const { language } = useDriver();
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
    setShowCalendar(true);
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
      style={[styles.input, value && styles.selectedInput, disabled && styles.disabled]} onPress={open}>
      <Text style={[styles.value, !value && styles.placeholder]}>{value || t('selectDate')}</Text>
      <View style={styles.calendarIcon}><AppIcon name="calendar" size={21} color={visual.accent} /></View>
    </Pressable>
    <Modal visible={visible} animationType="slide" transparent onRequestClose={() => setVisible(false)}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.headerIcon}><AppIcon name="calendar" size={24} color={visual.accent} /></View>
            <View style={styles.headerText}>
              <Text style={styles.title}>{label}</Text>
              <Text style={styles.hint}>{t('dateInputHint')}</Text>
            </View>
          </View>
          <ScrollView style={styles.sheetContent} keyboardShouldPersistTaps="handled">
            <View style={styles.datePreview}>
              <Text style={styles.datePreviewText}>{selected || t('selectDate')}</Text>
            </View>
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
              <AppIcon name="calendar" size={18} color={visual.accent} />
              <Text style={styles.calendarToggleText}>{t(showCalendar ? 'hideCalendar' : 'showCalendar')}</Text>
              <AppIcon name="chevron" size={17} color={visual.accent} />
            </Pressable>
            {showCalendar ? <View style={[styles.calendarArea, Platform.OS === 'android' && styles.androidCalendarArea]}>
              <DateTimePicker value={calendarValue} mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
                themeVariant={Platform.OS === 'ios' ? 'light' : undefined}
                accentColor={visual.accent}
                locale={language === 'en' ? 'en-US' : 'es-CO'}
                style={Platform.OS === 'ios' ? styles.iosCalendar : undefined}
                maximumDate={birthDate ? boundary : undefined}
                minimumDate={birthDate ? undefined : tomorrow}
                onChange={(event, date) => {
                  if (event.type === 'set' && date) {
                    setDraft(fromIsoDate(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`, date));
                    setInvalid(false);
                  }
                  if (Platform.OS === 'android') setShowCalendar(false);
                }} />
            </View> : null}
          </ScrollView>
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
  input: { minHeight: 56, paddingLeft: 15, paddingRight: 9, borderWidth: 1.5, borderColor: visual.border,
    borderRadius: 14, backgroundColor: visual.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectedInput: { borderColor: '#A6D3C8' },
  calendarIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: visual.accentSoft,
    alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.7 }, value: { fontSize: 16, color: visual.ink }, placeholder: { color: visual.muted },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#102A33A8' },
  sheet: { backgroundColor: visual.surface, borderTopLeftRadius: 30, borderTopRightRadius: 30,
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 28, maxHeight: '90%' },
  handle: { alignSelf: 'center', width: 44, height: 5, borderRadius: 4,
    backgroundColor: visual.border, marginBottom: 18 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 },
  headerIcon: { width: 45, height: 45, borderRadius: 14, backgroundColor: visual.accentSoft,
    alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1 },
  title: { fontSize: 21, fontWeight: '800', color: visual.ink },
  hint: { color: visual.muted, marginTop: 3, fontSize: 13, lineHeight: 18 },
  sheetContent: { flexGrow: 0, flexShrink: 1 },
  datePreview: { paddingVertical: 12, paddingHorizontal: 16, backgroundColor: visual.accentSoft,
    borderRadius: 13, alignItems: 'center', marginBottom: 17 },
  datePreviewText: { color: visual.accent, fontSize: 19, fontWeight: '800', letterSpacing: 0.6 },
  parts: { flexDirection: 'row', gap: 10 }, part: { flex: 1 },
  partLabel: { color: visual.muted, fontSize: 12, fontWeight: '700', marginBottom: 7 },
  partInput: { height: 51, borderWidth: 1.5, borderColor: visual.border, borderRadius: 12,
    textAlign: 'center', color: visual.ink, fontSize: 18, backgroundColor: visual.surface },
  error: { marginTop: 10, color: visual.error, fontWeight: '600' },
  calendarToggle: { marginTop: 17, paddingVertical: 12, paddingHorizontal: 13, borderRadius: 13,
    backgroundColor: visual.accentSoft, flexDirection: 'row', alignItems: 'center', gap: 8 },
  calendarToggleText: { flex: 1, color: visual.accent, fontWeight: '700', fontSize: 14 },
  calendarArea: { minHeight: 340, marginTop: 5, alignItems: 'center' },
  iosCalendar: { width: '100%', height: 340, alignSelf: 'center' },
  androidCalendarArea: { minHeight: 0 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  cancel: { flex: 1, alignItems: 'center', padding: 15, borderRadius: 13,
    borderWidth: 1, borderColor: visual.border },
  cancelText: { color: visual.ink, fontWeight: '700' },
  save: { flex: 1, alignItems: 'center', padding: 15, borderRadius: 13, backgroundColor: visual.accent },
  saveText: { color: visual.surface, fontWeight: '800' },
});
