import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AppIcon from '../components/AppIcon';
import ChoiceSelector from '../components/ChoiceSelector';
import DateSelector from '../components/DateSelector';
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

export default function RegistrationScreen({ section }) {
  const t = useTranslation();
  const { updateLanguage, registration, registrationLoading, updateRegistration, registrationSubmitted, registrationStatus,
    submitRegistration, firebaseConfigured, realtimeConnected, backendError, registering } = useDriver();
  const [touched, setTouched] = useState({});
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
            <View style={styles.photoFrame}>
              {registration[key] ? <Image source={{ uri: registration[key] }} style={styles.photo} accessibilityLabel={t(key)} />
                : <View style={styles.photoPlaceholder}>
                  <AppIcon name="gallery" size={32} color={colors.muted} />
                  <Text style={styles.photoPlaceholderText}>{t('noPhotoSelected')}</Text>
                </View>}
            </View>
            <View style={styles.choices}>
              <Pressable disabled={locked} style={[styles.choice, locked && styles.disabledChoice]} onPress={() => pickImage(key, 'camera')}>
                <AppIcon name="camera" size={19} /><Text style={styles.choiceText}>{t('camera')}</Text>
              </Pressable>
              <Pressable disabled={locked} style={[styles.choice, locked && styles.disabledChoice]} onPress={() => pickImage(key, 'library')}>
                <AppIcon name="gallery" size={19} /><Text style={styles.choiceText}>{t('gallery')}</Text>
              </Pressable>
            </View>
          </View>
        )}
        {type === 'choice' && (
          <ChoiceSelector label={t(key)} value={selectedChoice} options={options} getLabel={choiceLabel}
            disabled={locked} onChange={(option) => {
              if (key === 'language') updateLanguage(option);
              else updateRegistration(key, option);
              setTouched((current) => ({ ...current, [key]: true }));
            }} />
        )}
        {type === 'date' && (
          <DateSelector label={t(key)} value={registration[key]} disabled={locked} birthDate={key === 'birthDate'}
            onChange={(date) => { updateRegistration(key, date); setTouched((current) => ({ ...current, [key]: true })); }} />
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
        <Text style={styles.step}>{section === 'personal' ? '01 / 03' : section === 'vehicle' ? '02 / 03' : '03 / 03'}</Text>
        <Text style={styles.title}>{t(section)}</Text>
        <Text style={styles.sectionHint}>{t(`${section}SectionHint`)}</Text>
        {sections[section].map(renderField)}
        {section === 'documents' && (
          <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: registration.acceptedTerms }} style={styles.terms}
            disabled={locked}
            onPress={() => updateRegistration('acceptedTerms', !registration.acceptedTerms)}>
            <View style={[styles.checkbox, registration.acceptedTerms && styles.checkboxChecked]}>
              {registration.acceptedTerms ? <AppIcon name="check" size={17} color={colors.surface} /> : null}
            </View>
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
  content: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 28 },
  step: { color: colors.primary, fontSize: 13, fontWeight: '800', letterSpacing: 1.5 },
  title: { color: colors.text, fontSize: 29, fontWeight: '800', marginTop: 8 },
  sectionHint: { color: colors.muted, fontSize: 15, lineHeight: 22, marginTop: 6, marginBottom: 24 },
  field: { marginBottom: 22 }, label: { color: colors.text, fontSize: 15, fontWeight: '700', marginBottom: 10 },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16,
    paddingHorizontal: 16, minHeight: 58, color: colors.text, fontSize: 16 },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 },
  choice: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 11,
    borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  disabledChoice: { opacity: 0.55 }, choiceText: { color: colors.primary, fontWeight: '700' },
  photoFrame: { width: '100%', height: 160, borderRadius: 18, overflow: 'hidden', borderWidth: 1,
    borderColor: colors.border, backgroundColor: colors.surface },
  photo: { height: '100%', width: '100%', resizeMode: 'cover' },
  photoPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  photoPlaceholderText: { color: colors.muted, fontSize: 14 },
  error: { color: '#B3261E', marginTop: 5 },
  terms: { flexDirection: 'row', alignItems: 'center', marginVertical: 14, padding: 14, borderRadius: 16,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  checkbox: { width: 24, height: 24, borderRadius: 7, borderWidth: 2, borderColor: colors.primary,
    marginRight: 12, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: colors.primary }, termsText: { flex: 1, color: colors.text, lineHeight: 21 },
  footer: { backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, paddingHorizontal: 20, paddingVertical: 14 },
  footerStatus: { color: colors.warning, fontWeight: '700', textAlign: 'center', marginTop: 8 },
  submit: { backgroundColor: colors.primary, padding: 17, borderRadius: 15, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  spinner: { marginRight: 10 }, disabled: { opacity: 0.4 }, submitText: { color: colors.surface, fontWeight: '700' },
  hint: { color: colors.muted, marginTop: 8 }, notice: { color: colors.warning, marginTop: 20 },
});
