import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AppIcon from '../components/AppIcon';
import ChoiceSelector from '../components/ChoiceSelector';
import DateSelector from '../components/DateSelector';
import { colors } from '../config/theme';
import { appVisuals as visual } from '../config/appVisuals';
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
  const [focusedField, setFocusedField] = useState(null);
  const sectionIndex = section === 'personal' ? 0 : section === 'vehicle' ? 1 : 2;
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
        <Text style={styles.label}>{t(key)}<Text style={styles.required}> *</Text></Text>
        {type === 'image' && (
          <View style={styles.photoLayout}>
            <View style={styles.photoFrame}>
              {registration[key] ? <Image source={{ uri: registration[key] }} style={styles.photo} accessibilityLabel={t(key)} />
                : <View style={styles.photoPlaceholder}>
                  <AppIcon name="gallery" size={29} color={visual.accent} />
                  <Text style={styles.photoPlaceholderText}>{t('noPhotoSelected')}</Text>
                </View>}
            </View>
            <View style={styles.choices}>
              <Pressable disabled={locked} style={[styles.choice, locked && styles.disabledChoice]} onPress={() => pickImage(key, 'camera')}>
                <AppIcon name="camera" size={19} color={visual.accent} /><Text style={styles.choiceText}>{t('camera')}</Text>
              </Pressable>
              <Pressable disabled={locked} style={[styles.choice, locked && styles.disabledChoice]} onPress={() => pickImage(key, 'library')}>
                <AppIcon name="gallery" size={19} color={visual.accent} /><Text style={styles.choiceText}>{t('gallery')}</Text>
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
          <TextInput style={[styles.input, !error && registration[key] && styles.inputFilled,
            focusedField === key && styles.inputFocused, error && styles.inputError]}
            value={registration[key]} onChangeText={(value) => updateRegistration(key, normalizeRegistrationInput(key, value))}
            editable={!locked}
            onFocus={() => setFocusedField(key)}
            onBlur={() => { setFocusedField(null); setTouched((current) => ({ ...current, [key]: true })); }}
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
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.heroIcon}><AppIcon name={section === 'personal' ? 'person' : section === 'vehicle' ? 'car' : 'document'}
              size={24} color={visual.surface} /></View>
            <Text style={styles.step}>{String(sectionIndex + 1).padStart(2, '0')} / 03</Text>
          </View>
          <Text style={styles.title}>{t(section)}</Text>
          <Text style={styles.sectionHint}>{t(`${section}SectionHint`)}</Text>
          <View style={styles.progress}>
            {[0, 1, 2].map((step) => <View key={step}
              style={[styles.progressSegment, step <= sectionIndex && styles.progressActive]} />)}
          </View>
        </View>
        <View style={styles.formCard}>
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
        </View>
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
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: visual.background },
  screen: { flex: 1, backgroundColor: visual.background },
  container: { flex: 1, backgroundColor: visual.background },
  content: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 26 },
  hero: { backgroundColor: visual.hero, borderRadius: 26, padding: 22, marginBottom: 16 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroIcon: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#31565D' },
  step: { color: visual.surface, fontSize: 13, fontWeight: '800', letterSpacing: 1.2,
    borderWidth: 1, borderColor: '#64858A', borderRadius: 13, paddingVertical: 7, paddingHorizontal: 11 },
  title: { color: visual.surface, fontSize: 29, fontWeight: '800', marginTop: 17 },
  sectionHint: { color: visual.heroMuted, fontSize: 14, lineHeight: 21, marginTop: 7 },
  progress: { flexDirection: 'row', gap: 7, marginTop: 22 },
  progressSegment: { flex: 1, height: 5, borderRadius: 4, backgroundColor: '#41646B' },
  progressActive: { backgroundColor: '#75D7BF' },
  formCard: { backgroundColor: visual.surface, borderRadius: 24, padding: 18,
    borderWidth: 1, borderColor: visual.border },
  field: { marginBottom: 24 },
  label: { color: visual.ink, fontSize: 15, fontWeight: '700', marginBottom: 9 },
  required: { color: visual.accent },
  input: { backgroundColor: visual.surface, borderWidth: 1.5, borderColor: visual.border, borderRadius: 14,
    paddingHorizontal: 15, minHeight: 56, color: visual.ink, fontSize: 16 },
  inputFilled: { borderColor: '#A6D3C8' },
  inputFocused: { borderColor: visual.accent, backgroundColor: '#F9FFFC' },
  inputError: { borderColor: visual.error, backgroundColor: visual.errorSoft },
  photoLayout: { flexDirection: 'row', gap: 12, alignItems: 'stretch' },
  choices: { flex: 1, gap: 9 },
  choice: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    minHeight: 50, paddingHorizontal: 8, borderRadius: 13, borderWidth: 1, borderColor: visual.border,
    backgroundColor: visual.surface },
  disabledChoice: { opacity: 0.55 }, choiceText: { color: visual.accent, fontWeight: '700', fontSize: 14 },
  photoFrame: { width: 112, height: 112, borderRadius: 16, overflow: 'hidden', borderWidth: 1,
    borderStyle: 'dashed', borderColor: '#A4C8C3', backgroundColor: visual.accentSoft },
  photo: { height: '100%', width: '100%', resizeMode: 'cover' },
  photoPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 5, padding: 6 },
  photoPlaceholderText: { color: visual.muted, fontSize: 11, lineHeight: 14, textAlign: 'center' },
  error: { color: visual.error, marginTop: 7, fontSize: 13, fontWeight: '600' },
  terms: { flexDirection: 'row', alignItems: 'center', marginTop: 2, marginBottom: 14, padding: 14, borderRadius: 16,
    borderWidth: 1, borderColor: visual.border, backgroundColor: '#F8FBFA' },
  checkbox: { width: 24, height: 24, borderRadius: 7, borderWidth: 2, borderColor: visual.accent,
    marginRight: 12, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: visual.accent }, termsText: { flex: 1, color: visual.ink, lineHeight: 21 },
  footer: { backgroundColor: visual.surface, borderTopWidth: 1, borderTopColor: visual.border,
    paddingHorizontal: 18, paddingVertical: 12 },
  footerStatus: { color: '#8A5700', fontWeight: '700', textAlign: 'center', marginTop: 8 },
  submit: { backgroundColor: visual.accent, padding: 16, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  spinner: { marginRight: 10 }, disabled: { opacity: 0.42 },
  submitText: { color: visual.surface, fontWeight: '800', fontSize: 16 },
  hint: { color: visual.muted, marginTop: 8, fontSize: 12, textAlign: 'center' },
  notice: { color: '#7A5310', marginTop: 15, padding: 14, backgroundColor: '#FFF5DA',
    borderRadius: 14, lineHeight: 20, fontSize: 13 },
});
