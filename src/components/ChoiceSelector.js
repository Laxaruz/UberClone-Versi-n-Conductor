import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import AppIcon from './AppIcon';
import { colors } from '../config/theme';
import useTranslation from '../i18n/useTranslation';

export default function ChoiceSelector({ label, value, options, getLabel, onChange, disabled }) {
  const t = useTranslation();
  const [visible, setVisible] = useState(false);

  return <>
    <Pressable accessibilityRole="button" accessibilityLabel={label} disabled={disabled}
      style={[styles.input, disabled && styles.disabled]} onPress={() => setVisible(true)}>
      <Text style={[styles.value, !value && styles.placeholder]}>{value ? getLabel(value) : t('selectOption')}</Text>
      <AppIcon name="chevron" size={20} />
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
              {option === value ? <AppIcon name="check" size={21} /> : null}
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
  input: { minHeight: 58, paddingHorizontal: 16, borderWidth: 1, borderColor: colors.border,
    borderRadius: 16, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  disabled: { opacity: 0.7 }, value: { color: colors.text, fontSize: 16 }, placeholder: { color: colors.muted },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#17242B88' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 32, maxHeight: '85%' },
  handle: { alignSelf: 'center', width: 48, height: 5, borderRadius: 4, backgroundColor: colors.border, marginBottom: 20 },
  title: { color: colors.text, fontSize: 22, fontWeight: '800', marginBottom: 12 },
  list: { flexGrow: 0 }, option: { minHeight: 55, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: colors.border },
  optionText: { color: colors.text, fontSize: 17 }, selectedText: { color: colors.primary, fontWeight: '700' },
  cancel: { alignItems: 'center', padding: 15, marginTop: 18, borderRadius: 13, borderWidth: 1, borderColor: colors.border },
  cancelText: { color: colors.text, fontWeight: '700' },
});
