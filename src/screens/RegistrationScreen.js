import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../config/theme';
import { useDriver } from '../context/DriverContext';
import useTranslation from '../i18n/useTranslation';
import { needsInspection, normalizeRegistrationInput, registrationInputLimits, validateRegistration } from '../utils/validateRegistration';

const sections = {
  personal: [
    ['profilePhoto', 'image'], ['fullName', 'text'], ['identityNumber', 'number'], ['phone', 'phone'],
    ['birthDate', 'date'], ['gender', 'choice', ['female', 'male', 'other']], ['email', 'email'],
    ['language', 'choice', ['es', 'en']],
  ],
  vehicle: [
    ['category', 'choice', ['economy', 'xl', 'premium']], ['plate', 'plate'], ['brand', 'text'],
    ['model', 'text'], ['year', 'number'], ['color', 'choice', ['white', 'black', 'gray', 'silver', 'blue', 'red', 'other']],
    ['capacity', 'number'], ['vehiclePhoto', 'image'],
  ],
  documents: [
    ['licenseNumber', 'number'], ['licensePhoto', 'image'], ['licenseExpiry', 'date'],
    ['soatPhoto', 'image'], ['soatExpiry', 'date'], ['inspectionPhoto', 'image'],
    ['inspectionExpiry', 'date'], ['paymentEmail', 'email'],
  ],
};

function dateString(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default function RegistrationScreen({ section }) {
  const t = useTranslation();
  const { updateLanguage, registration, registrationLoading, updateRegistration, registrationSubmitted, registrationStatus,
    submitRegistration, firebaseConfigured, realtimeConnected, backendError, registering } = useDriver();
  const [touched, setTouched] = useState({});
  const [openDate, setOpenDate] = useState(null);
  const [openChoice, setOpenChoice] = useState(null);
  const [imageErrors, setImageErrors] = useState({});
  const errors = validateRegistration(registration);
  const inspectionRequired = needsInspection(registration.year);
  const canSubmit = !registrationLoading && Object.keys(errors).length === 0 && registrationStatus === 'not_submitted'
    && (!firebaseConfigured || realtimeConnected) && !registering;
  const locked = registrationStatus !== 'not_submitted' || (firebaseConfigured && !realtimeConnected);
  const showValidationErrors = registrationStatus === 'not_submitted';
  const submitLabel = registering ? t('sendingRegistration') : t(firebaseConfigured ? 'submitRegistration' : 'simulateRegistration');

  function choiceLabel(option) {
    if (option === 'es') return t('spanish');
    if (option === 'en') return t('english');
    return t(option);
  }

  async function pickImage(key, source) {
    setImageErrors((current) => ({ ...current, [key]: '' }));
    try {
      if (source === 'camera') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) { setImageErrors((current) => ({ ...current, [key]: 'cameraDenied' })); return; }
      }
      const launch = source === 'camera' ? ImagePicker.launchCameraAsync : ImagePicker.launchImageLibraryAsync;
      const result = await launch({ mediaTypes: ['images'], quality: 0.7 });
      if (result.canceled) return;
      const asset = result.assets?.[0];
      if (!asset?.uri) { setImageErrors((current) => ({ ...current, [key]: 'imageFailed' })); return; }
      if (asset.mimeType && !['image/jpeg', 'image/png', 'image/heic', 'image/heif'].includes(asset.mimeType.toLowerCase())) {
        setImageErrors((current) => ({ ...current, [key]: 'invalidImageType' })); return;
      }
      if (asset.fileSize && asset.fileSize > 10 * 1024 * 1024) {
        setImageErrors((current) => ({ ...current, [key]: 'imageTooLarge' })); return;
      }
      updateRegistration(key, asset.uri);
    } catch {
      setImageErrors((current) => ({ ...current, [key]: source === 'library' ? 'galleryDenied' : 'imageFailed' }));
    }
    setTouched((current) => ({ ...current, [key]: true }));
  }

  function renderField([key, type, options]) {
    if (!inspectionRequired && (key === 'inspectionPhoto' || key === 'inspectionExpiry')) return null;
    const error = showValidationErrors && (touched[key] || registrationSubmitted) && errors[key];
    const selectedChoice = registration[key];
    return (
      <View key={key} style={styles.field}>
        <Text style={styles.label}>{t(key)}{key === 'inspectionPhoto' && ' *'}</Text>
        {type === 'image' && (
          <View>
            {registration[key] ? <Image source={{ uri: registration[key] }} style={styles.photo} accessibilityLabel={t(key)} /> : null}
            <View style={styles.choices}>
              <Pressable disabled={locked} style={styles.choice} onPress={() => pickImage(key, 'camera')}><Text style={styles.choiceText}>{t('camera')}</Text></Pressable>
              <Pressable disabled={locked} style={styles.choice} onPress={() => pickImage(key, 'library')}><Text style={styles.choiceText}>{t('gallery')}</Text></Pressable>
            </View>
          </View>
        )}
        {type === 'choice' && (
          <View>
            <Pressable accessibilityRole="button" accessibilityState={{ expanded: openChoice === key }}
              disabled={locked} style={styles.input}
              onPress={() => setOpenChoice((current) => current === key ? null : key)}>
              <Text>{selectedChoice ? choiceLabel(selectedChoice) : t('selectOption')} {openChoice === key ? '▲' : '▼'}</Text>
            </Pressable>
            {openChoice === key && (
              <View style={styles.choiceList}>{options.map((option) => (
                <Pressable key={option} accessibilityRole="button" accessibilityState={{ selected: selectedChoice === option }}
                  style={[styles.choiceOption, selectedChoice === option && styles.selected]}
                  onPress={() => {
                    if (key === 'language') updateLanguage(option);
                    else updateRegistration(key, option);
                    setTouched((current) => ({ ...current, [key]: true }));
                    setOpenChoice(null);
                  }}>
                  <Text style={[styles.choiceText, selectedChoice === option && styles.selectedText]}>{choiceLabel(option)}</Text>
                </Pressable>
              ))}</View>
            )}
          </View>
        )}
        {type === 'date' && (
          <View>
            <Pressable disabled={locked} style={styles.input} onPress={() => setOpenDate(key)}><Text>{registration[key] || t('selectDate')}</Text></Pressable>
            {openDate === key && <DateTimePicker value={registration[key] ? new Date(`${registration[key]}T12:00:00`) : key === 'birthDate' ? new Date(2000, 0, 1) : new Date()}
              mode="date" display="default" onChange={(event, date) => {
                setOpenDate(null);
                if (event.type === 'set' && date) updateRegistration(key, dateString(date));
                setTouched((current) => ({ ...current, [key]: true }));
              }} />}
          </View>
        )}
        {['text', 'number', 'phone', 'email', 'plate'].includes(type) && (
          <TextInput style={styles.input} value={registration[key]} onChangeText={(value) => updateRegistration(key, normalizeRegistrationInput(key, value))}
            editable={!locked}
            onBlur={() => setTouched((current) => ({ ...current, [key]: true }))}
            keyboardType={type === 'email' ? 'email-address' : type === 'phone' ? 'phone-pad' : type === 'number' ? 'numeric' : 'default'}
            autoCapitalize={type === 'email' ? 'none' : type === 'plate' ? 'characters' : 'sentences'}
            maxLength={registrationInputLimits[key]} />
        )}
        {error ? <Text style={styles.error}>{t(error)}</Text> : null}
        {showValidationErrors && imageErrors[key] ? <Text style={styles.error}>{t(imageErrors[key])}</Text> : null}
      </View>
    );
  }

  if (registrationLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.hint}>{t('loadingRegistration')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{t(section)}</Text>
        {sections[section].map(renderField)}
        {section === 'documents' && (
          <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: registration.acceptedTerms }} style={styles.terms}
            disabled={locked}
            onPress={() => updateRegistration('acceptedTerms', !registration.acceptedTerms)}>
            <Text style={styles.checkbox}>{registration.acceptedTerms ? '☑' : '☐'}</Text>
            <Text style={styles.termsText}>{t('acceptTerms')}</Text>
          </Pressable>
        )}
        {section === 'documents' && showValidationErrors && registrationSubmitted && errors.acceptedTerms ? <Text style={styles.error}>{t('required')}</Text> : null}
        <Text style={styles.notice}>{t(firebaseConfigured ? 'registrationCloudDemo' : 'registrationDemo')}</Text>
      </ScrollView>
      <View style={styles.footer}>
        <Pressable accessibilityRole="button" accessibilityLabel={submitLabel} disabled={!canSubmit}
          style={[styles.submit, !canSubmit && styles.disabled]} onPress={submitRegistration}>
          {registering && <ActivityIndicator color={colors.surface} style={styles.spinner} />}
          <Text style={styles.submitText}>{submitLabel}</Text>
        </Pressable>
        {registrationStatus === 'not_submitted' ? (
          <>
            {Object.keys(errors).length > 0 ? <Text style={styles.hint}>{t('completeTabs')}</Text> : null}
            {firebaseConfigured && !realtimeConnected ? <Text style={styles.hint}>{t('firebaseConnecting')}</Text> : null}
          </>
        ) : <Text style={styles.footerStatus}>{t(registrationStatus === 'approved_demo' ? 'approvedDemo' : registrationStatus === 'approved' ? 'approved' : 'pendingApproval')}</Text>}
        {backendError ? <Text style={styles.error}>{t(backendError)}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  screen: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 24 },
  title: { color: colors.text, fontSize: 24, fontWeight: '700', marginBottom: 16 },
  field: { marginBottom: 18 }, label: { color: colors.text, fontWeight: '600', marginBottom: 8 },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, minHeight: 48, justifyContent: 'center' },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  choice: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: colors.primary, backgroundColor: colors.surface },
  choiceList: { marginTop: 4, borderWidth: 1, borderColor: colors.border, borderRadius: 10, backgroundColor: colors.surface },
  choiceOption: { padding: 12 },
  choiceText: { color: colors.primary }, selected: { backgroundColor: colors.primary }, selectedText: { color: colors.surface },
  photo: { height: 120, width: 120, borderRadius: 10, marginBottom: 8 },
  error: { color: '#B3261E', marginTop: 5 },
  terms: { flexDirection: 'row', alignItems: 'center', marginVertical: 14 }, checkbox: { fontSize: 24, marginRight: 8 }, termsText: { flex: 1, color: colors.text },
  footer: { backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, paddingHorizontal: 20, paddingVertical: 12 },
  footerStatus: { color: colors.warning, fontWeight: '700', textAlign: 'center', marginTop: 8 },
  submit: { backgroundColor: colors.primary, padding: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  spinner: { marginRight: 10 }, disabled: { opacity: 0.4 }, submitText: { color: colors.surface, fontWeight: '700' },
  hint: { color: colors.muted, marginTop: 8 }, notice: { color: colors.warning, marginTop: 20 },
});
