import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../config/theme';
import { useDriver } from '../context/DriverContext';
import useTranslation from '../i18n/useTranslation';

export default function LoginScreen() {
  const t = useTranslation();
  const { login, authBusy, authError } = useDriver();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && password.length >= 6;

  function submit() {
    setSubmitted(true);
    if (valid && !authBusy) login(email, password);
  }

  return <View style={styles.screen}>
    <Text style={styles.title}>{t('loginTitle')}</Text>
    <Text style={styles.description}>{t('loginDescription')}</Text>
    <Text style={styles.label}>{t('email')}</Text>
    <TextInput style={styles.input} value={email} onChangeText={setEmail}
      keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
    <Text style={styles.label}>{t('accountPassword')}</Text>
    <TextInput style={styles.input} value={password} onChangeText={setPassword}
      secureTextEntry autoComplete="password" />
    {submitted && !valid ? <Text style={styles.error}>{t('loginInputInvalid')}</Text> : null}
    {authError ? <Text style={styles.error}>{t(authError)}</Text> : null}
    <Pressable accessibilityRole="button" disabled={authBusy} style={[styles.button, authBusy && styles.disabled]}
      onPress={submit}>
      {authBusy ? <ActivityIndicator color={colors.surface} />
        : <Text style={styles.buttonText}>{t('loginAction')}</Text>}
    </Pressable>
  </View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: colors.background },
  title: { color: colors.text, fontSize: 31, fontWeight: '800' },
  description: { marginTop: 10, marginBottom: 22, color: colors.muted, lineHeight: 22 },
  label: { color: colors.text, fontWeight: '700', marginTop: 15, marginBottom: 8 },
  input: { minHeight: 54, paddingHorizontal: 15, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border, borderRadius: 13, color: colors.text },
  error: { color: '#B3261E', marginTop: 12 },
  button: { backgroundColor: colors.primary, padding: 16, borderRadius: 13,
    alignItems: 'center', marginTop: 24 },
  buttonText: { color: colors.surface, fontWeight: '800' },
  disabled: { opacity: 0.5 },
});
