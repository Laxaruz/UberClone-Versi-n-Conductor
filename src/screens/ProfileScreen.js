import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AppIcon from '../components/AppIcon';
import ChoiceSelector from '../components/ChoiceSelector';
import DateSelector from '../components/DateSelector';
import { colors } from '../config/theme';
import { useDriver } from '../context/DriverContext';
import useTranslation from '../i18n/useTranslation';
import { profileForm, validateProfileDetails, validateProfileDocuments } from '../utils/profileDetails';
import { needsInspection, normalizeRegistrationInput, registrationInputLimits } from '../utils/validateRegistration';

const fields = {
  personal: [
    ['profilePhoto', 'image'], ['fullName', 'text'], ['identityNumber', 'number'], ['phone', 'phone'],
    ['birthDate', 'date'], ['gender', 'choice', ['female', 'male', 'other']], ['email', 'email'],
  ],
  vehicle: [
    ['category', 'choice', ['economy', 'xl', 'premium']], ['plate', 'plate'],
    ['brand', 'text'], ['model', 'text'], ['year', 'number'],
    ['color', 'choice', ['white', 'black', 'gray', 'silver', 'blue', 'red', 'other']],
    ['capacity', 'number'], ['vehiclePhoto', 'image'],
  ],
  documents: [
    ['licenseNumber', 'number'], ['licenseExpiry', 'date'], ['soatExpiry', 'date'],
    ['inspectionExpiry', 'date'], ['paymentEmail', 'email'],
    ['licensePhoto', 'image'], ['soatPhoto', 'image'], ['inspectionPhoto', 'image'],
  ],
};

export default function ProfileScreen({ navigation }) {
  const t = useTranslation();
  const { driverSession, registration, realtimeConnected, profileSaving, profileError,
    saveProfile } = useDriver();
  const [section, setSection] = useState('personal');
  const [editing, setEditing] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState(false);
  const [photoError, setPhotoError] = useState(null);
  const [form, setForm] = useState(() => profileForm(driverSession, registration));

  useEffect(() => {
    if (!editing) setForm(profileForm(driverSession, registration));
  }, [driverSession, editing, registration]);

  const errors = section === 'documents' ? validateProfileDocuments(form) : validateProfileDetails(form);
  const visibleFields = fields[section].filter(([key]) =>
    !['inspectionExpiry', 'inspectionPhoto'].includes(key) || needsInspection(form.year));

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  function changeSection(nextSection) {
    setEditing(false);
    setSubmitted(false);
    setPhotoError(null);
    setSection(nextSection);
  }

  async function pickPhoto(key, source) {
    setPhotoError(null);
    try {
      if (source === 'camera') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) { setPhotoError('cameraDenied'); return; }
      }
      const launch = source === 'camera' ? ImagePicker.launchCameraAsync : ImagePicker.launchImageLibraryAsync;
      const result = await launch({ mediaTypes: ['images'], quality: 0.7 });
      const asset = result.assets?.[0];
      if (result.canceled) return;
      if (!asset?.uri) { setPhotoError('imageFailed'); return; }
      if (asset.mimeType && !['image/jpeg', 'image/png', 'image/heic', 'image/heif'].includes(asset.mimeType.toLowerCase())) {
        setPhotoError('invalidImageType'); return;
      }
      if (asset.fileSize && asset.fileSize > 10 * 1024 * 1024) {
        setPhotoError('imageTooLarge'); return;
      }
      update(key, asset.uri);
    } catch {
      setPhotoError(source === 'camera' ? 'imageFailed' : 'galleryDenied');
    }
  }

  async function save() {
    setSubmitted(true);
    if (Object.keys(errors).length > 0) return;
    if (await saveProfile(form, section)) {
      setEditing(false);
      setSaved(true);
      setSubmitted(false);
    }
  }

  function renderField([key, type, options]) {
    return <View key={key} style={styles.field}>
      <Text style={styles.fieldLabel}>{t(key)}</Text>
      {type === 'choice' ? <ChoiceSelector label={t(key)} value={form[key]} options={options}
        getLabel={(option) => t(option)} disabled={!editing}
        onChange={(value) => update(key, value)} /> : null}
      {type === 'date' ? <DateSelector label={t(key)} value={form[key]} disabled={!editing}
        birthDate={key === 'birthDate'} onChange={(value) => update(key, value)} /> : null}
      {type === 'image' ? <>
        {form[key] ? <Image source={{ uri: form[key] }} style={styles.photo} accessibilityLabel={t(key)} />
          : <Text style={styles.muted}>{t('noPhotoSelected')}</Text>}
        {editing ? <View style={styles.photoActions}>
          <Pressable style={styles.smallButton} onPress={() => pickPhoto(key, 'camera')}>
            <Text style={styles.smallButtonText}>{t('camera')}</Text>
          </Pressable>
          <Pressable style={styles.smallButton} onPress={() => pickPhoto(key, 'library')}>
            <Text style={styles.smallButtonText}>{t('gallery')}</Text>
          </Pressable>
        </View> : null}
      </> : null}
      {['text', 'number', 'phone', 'email', 'plate'].includes(type) ? <TextInput
        style={[styles.input, !editing && styles.readOnly]}
        value={form[key] ?? ''} editable={editing}
        onChangeText={(value) => update(key, normalizeRegistrationInput(key, value))}
        keyboardType={type === 'email' ? 'email-address' : type === 'phone' ? 'phone-pad'
          : type === 'number' ? 'numeric' : 'default'}
        autoCapitalize={type === 'email' ? 'none' : type === 'plate' ? 'characters' : 'sentences'}
        maxLength={registrationInputLimits[key]} /> : null}
      {submitted && errors[key] ? <Text style={styles.error}>{t(errors[key])}</Text> : null}
    </View>;
  }

  if (!driverSession) return <View style={styles.screen}>
    <Text style={styles.title}>{t('profile')}</Text>
    <Text style={styles.muted}>{t('profileMissing')}</Text>
    <Pressable style={styles.button} onPress={() => navigation.navigate('Registration')}>
      <Text style={styles.buttonText}>{t('openRegistration')}</Text>
    </Pressable>
  </View>;

  return <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <Text style={styles.title}>{t('profile')}</Text>
    <Text style={styles.muted}>{t('profileIntro')}</Text>
    <View style={styles.statusCard}>
      <Text style={styles.statusName}>{driverSession.displayName}</Text>
      <Text style={styles.statusText}>{t(driverSession.approvalStatus === 'approved_demo'
        ? 'approvedDemo' : driverSession.approvalStatus === 'approved' ? 'approved' : 'pendingApproval')}</Text>
    </View>
    <View style={styles.sectionRow}>
      {['personal', 'vehicle', 'documents'].map((item) => <Pressable key={item}
        accessibilityRole="button" accessibilityState={{ selected: section === item }}
        style={[styles.sectionButton, section === item && styles.sectionActive]}
        onPress={() => changeSection(item)}>
        <AppIcon name={item === 'vehicle' ? 'car' : item === 'documents' ? 'document' : 'person'}
          size={19} color={section === item ? colors.surface : colors.primary} />
        <Text style={[styles.sectionText, section === item && styles.sectionTextActive]}>{t(item)}</Text>
      </Pressable>)}
    </View>
    <Text style={styles.notice}>{t('profilePhotosLocal')}</Text>
    {visibleFields.map(renderField)}
    {photoError ? <Text style={styles.error}>{t(photoError)}</Text> : null}
    {profileError ? <Text style={styles.error}>{t(profileError)}</Text> : null}
    {saved ? <Text style={styles.success}>{t('profileSaved')}</Text> : null}
    {editing ? <>
      <Text style={styles.notice}>{t('profileApprovalReset')}</Text>
      <Pressable accessibilityRole="button" disabled={profileSaving || !realtimeConnected}
        style={[styles.button, (profileSaving || !realtimeConnected) && styles.disabled]} onPress={save}>
        {profileSaving ? <ActivityIndicator color={colors.surface} /> : <Text style={styles.buttonText}>{t('profileSave')}</Text>}
      </Pressable>
      <Pressable accessibilityRole="button" style={styles.secondaryButton} onPress={() => setEditing(false)}>
        <Text style={styles.secondaryText}>{t('cancel')}</Text>
      </Pressable>
    </> : <Pressable accessibilityRole="button" disabled={!realtimeConnected}
      style={[styles.button, !realtimeConnected && styles.disabled]} onPress={() => { setSaved(false); setEditing(true); }}>
      <Text style={styles.buttonText}>{t('profileEdit')}</Text>
    </Pressable>}
    {!realtimeConnected ? <Text style={styles.notice}>{t('profileOffline')}</Text> : null}
  </ScrollView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, padding: 20 },
  content: { paddingBottom: 48 },
  title: { color: colors.text, fontSize: 29, fontWeight: '800' },
  muted: { color: colors.muted, marginTop: 8, lineHeight: 21 },
  statusCard: { marginTop: 18, padding: 18, borderRadius: 16, backgroundColor: colors.primarySoft },
  statusName: { color: colors.text, fontSize: 19, fontWeight: '800' },
  statusText: { color: colors.warning, marginTop: 5 },
  sectionRow: { flexDirection: 'row', gap: 7, marginTop: 20, marginBottom: 16 },
  sectionButton: { flex: 1, alignItems: 'center', gap: 5, paddingVertical: 10, borderRadius: 12,
    borderWidth: 1, borderColor: colors.primary, backgroundColor: colors.surface },
  sectionActive: { backgroundColor: colors.primary },
  sectionText: { color: colors.primary, fontSize: 11, fontWeight: '700', textAlign: 'center' },
  sectionTextActive: { color: colors.surface },
  field: { marginBottom: 17 },
  fieldLabel: { color: colors.text, fontWeight: '700', marginBottom: 8 },
  input: { color: colors.text, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: 13, minHeight: 52, paddingHorizontal: 15 },
  readOnly: { backgroundColor: colors.background },
  photo: { width: '100%', height: 150, borderRadius: 13 },
  photoActions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  smallButton: { padding: 10, borderRadius: 9, borderWidth: 1, borderColor: colors.primary },
  smallButtonText: { color: colors.primary, fontWeight: '700' },
  button: { backgroundColor: colors.primary, borderRadius: 13, padding: 15, alignItems: 'center', marginTop: 16 },
  buttonText: { color: colors.surface, fontWeight: '800' },
  secondaryButton: { alignItems: 'center', padding: 13 },
  secondaryText: { color: colors.primary, fontWeight: '700' },
  notice: { color: colors.warning, lineHeight: 21, marginTop: 14 },
  error: { color: '#B3261E', marginTop: 6 },
  success: { color: colors.primary, marginTop: 12, fontWeight: '700' },
  disabled: { opacity: 0.45 },
});
