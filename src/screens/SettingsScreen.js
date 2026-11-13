import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../config/theme';
import { useDriver } from '../context/DriverContext';
import useTranslation from '../i18n/useTranslation';

export default function SettingsScreen() {
  const t = useTranslation();
  const { language, updateLanguage, firebaseConfigured, accountLinked, accountEmail,
    linkAccount, logout, authBusy, authError } = useDriver();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [linkedNotice, setLinkedNotice] = useState(false);
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    && password.length >= 6 && password === confirmation;

  async function submitLink() {
    setSubmitted(true);
    if (!valid || authBusy) return;
    if (await linkAccount(email, password)) {
      setPassword('');
      setConfirmation('');
      setLinkedNotice(true);
    }
  }

  function confirmLogout() {
    Alert.alert(t('logoutTitle'), t('logoutConfirm'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('logoutAction'), style: 'destructive', onPress: logout },
    ]);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
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
      <Text style={styles.sectionTitle}>{t('accountSection')}</Text>
      {!firebaseConfigured ? <Text style={styles.notice}>{t('accountFirebaseRequired')}</Text> : null}
      {firebaseConfigured && !accountLinked ? <>
        <Text style={styles.notice}>{t('accountLinkDescription')}</Text>
        <Text style={styles.label}>{t('accountEmail')}</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail}
          keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
        <Text style={styles.label}>{t('accountPassword')}</Text>
        <TextInput style={styles.input} value={password} onChangeText={setPassword}
          secureTextEntry autoComplete="new-password" />
        <Text style={styles.label}>{t('accountConfirmPassword')}</Text>
        <TextInput style={styles.input} value={confirmation} onChangeText={setConfirmation}
          secureTextEntry autoComplete="new-password" />
        {submitted && !valid ? <Text style={styles.error}>{t('accountInputInvalid')}</Text> : null}
        <Pressable accessibilityRole="button" disabled={authBusy}
          style={[styles.action, authBusy && styles.disabled]} onPress={submitLink}>
          {authBusy ? <ActivityIndicator color={colors.surface} />
            : <Text style={styles.actionText}>{t('accountLinkAction')}</Text>}
        </Pressable>
      </> : null}
      {firebaseConfigured && accountLinked ? <>
        <Text style={styles.description}>{t('accountLinkedAs')}: {accountEmail}</Text>
        {linkedNotice ? <Text style={styles.success}>{t('accountLinkedSuccess')}</Text> : null}
        <Pressable accessibilityRole="button" disabled={authBusy}
          style={[styles.logout, authBusy && styles.disabled]} onPress={confirmLogout}>
          {authBusy ? <ActivityIndicator color={colors.primary} />
            : <Text style={styles.logoutText}>{t('logoutAction')}</Text>}
        </Pressable>
      </> : null}
      {authError ? <Text style={styles.error}>{t(authError)}</Text> : null}
      <Text style={styles.notice}>{t(firebaseConfigured ? 'connectedDemo' : 'mockMode')}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: colors.background },
  content: { paddingBottom: 55 },
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
  sectionTitle: { marginTop: 36, fontSize: 22, fontWeight: '800', color: colors.text },
  label: { color: colors.text, fontWeight: '700', marginTop: 16, marginBottom: 7 },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, minHeight: 52, paddingHorizontal: 14, color: colors.text },
  action: { backgroundColor: colors.primary, padding: 15, marginTop: 20, borderRadius: 12, alignItems: 'center' },
  actionText: { color: colors.surface, fontWeight: '800' },
  logout: { borderWidth: 1, borderColor: colors.primary, padding: 15, marginTop: 20,
    borderRadius: 12, alignItems: 'center' },
  logoutText: { color: colors.primary, fontWeight: '800' },
  error: { color: '#B3261E', marginTop: 10 },
  success: { color: colors.primary, marginTop: 10, fontWeight: '700' },
  disabled: { opacity: 0.45 },
});
