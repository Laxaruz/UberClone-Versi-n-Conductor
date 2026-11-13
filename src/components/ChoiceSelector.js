import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import AppIcon from './AppIcon';
import { appVisuals as visual } from '../config/appVisuals';
import useTranslation from '../i18n/useTranslation';

export default function ChoiceSelector({ label, value, options, getLabel, onChange, disabled }) {
  const t = useTranslation();
  const [visible, setVisible] = useState(false);

  return <>
    <Pressable accessibilityRole="button" accessibilityLabel={label} disabled={disabled}
      style={[styles.input, value && styles.selectedInput, disabled && styles.disabled]} onPress={() => setVisible(true)}>
      <Text style={[styles.value, !value && styles.placeholder]}>{value ? getLabel(value) : t('selectOption')}</Text>
      <View style={styles.chevron}><AppIcon name="chevron" size={18} color={visual.accent} /></View>
    </Pressable>
    <Modal transparent visible={visible} animationType="slide" onRequestClose={() => setVisible(false)}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>{label}</Text>
          <ScrollView style={styles.list}>
            {options.map((option) => <Pressable key={option} accessibilityRole="button"
              accessibilityState={{ selected: option === value }} style={styles.option}
              onPress={() => { onChange(option); setVisible(false); }}>
              <Text style={[styles.optionText, option === value && styles.selectedText]}>{getLabel(option)}</Text>
              {option === value ? <View style={styles.check}><AppIcon name="check" size={18} color={visual.surface} /></View> : null}
            </Pressable>)}
          </ScrollView>
          <Pressable accessibilityRole="button" style={styles.cancel} onPress={() => setVisible(false)}>
            <Text style={styles.cancelText}>{t('cancel')}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  </>;
}

const styles = StyleSheet.create({
  input: { minHeight: 56, paddingLeft: 15, paddingRight: 9, borderWidth: 1.5, borderColor: visual.border,
    borderRadius: 14, backgroundColor: visual.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectedInput: { borderColor: '#A6D3C8' },
  chevron: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center',
    backgroundColor: visual.accentSoft },
  disabled: { opacity: 0.7 }, value: { flex: 1, color: visual.ink, fontSize: 16 },
  placeholder: { color: visual.muted },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#102A33A8' },
  sheet: { backgroundColor: visual.surface, borderTopLeftRadius: 30, borderTopRightRadius: 30,
    paddingHorizontal: 22, paddingTop: 12, paddingBottom: 32, maxHeight: '85%' },
  handle: { alignSelf: 'center', width: 44, height: 5, borderRadius: 4,
    backgroundColor: visual.border, marginBottom: 22 },
  title: { color: visual.ink, fontSize: 23, fontWeight: '800', marginBottom: 16 },
  list: { flexGrow: 0 }, option: { minHeight: 58, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: visual.border },
  optionText: { color: visual.ink, fontSize: 16 }, selectedText: { color: visual.accent, fontWeight: '800' },
  check: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    backgroundColor: visual.accent },
  cancel: { alignItems: 'center', padding: 15, marginTop: 18, borderRadius: 14,
    borderWidth: 1, borderColor: visual.border },
  cancelText: { color: visual.ink, fontWeight: '700' },
});
