export const initialRegistration = {
  profilePhoto: '', fullName: '', identityNumber: '', phone: '', birthDate: '', gender: '', email: '', language: 'es',
  category: '', plate: '', brand: '', model: '', year: '', color: '', capacity: '', vehiclePhoto: '',
  licenseNumber: '', licensePhoto: '', licenseExpiry: '', soatPhoto: '', soatExpiry: '',
  inspectionPhoto: '', inspectionExpiry: '', paymentEmail: '', acceptedTerms: false,
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const required = (value) => Boolean(String(value ?? '').trim());
const localDate = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
function parseDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
}

const futureDate = (value, today) => Boolean(parseDate(value) && value > localDate(today));

export function needsInspection(year, today = new Date()) {
  return /^\d{4}$/.test(String(year)) && Number(year) <= today.getFullYear() - 5;
}

export function validateRegistration(form, today = new Date()) {
  const errors = {};
  for (const key of ['profilePhoto', 'fullName', 'identityNumber', 'phone', 'birthDate', 'gender', 'email', 'language',
    'category', 'plate', 'brand', 'model', 'year', 'color', 'capacity', 'vehiclePhoto', 'licenseNumber',
    'licensePhoto', 'licenseExpiry', 'soatPhoto', 'soatExpiry', 'paymentEmail']) {
    if (!required(form[key])) errors[key] = 'required';
  }
  if (required(form.fullName) && (!/^[\p{L} ]+$/u.test(form.fullName.trim()) || form.fullName.trim().length > 50)) errors.fullName = 'invalidName';
  if (required(form.identityNumber) && !/^\d{6,10}$/.test(form.identityNumber)) errors.identityNumber = 'invalidIdentity';
  if (required(form.phone) && !/^\d{10}$/.test(form.phone)) errors.phone = 'invalidPhone';
  if (required(form.birthDate)) {
    const date = parseDate(form.birthDate);
    const adulthood = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    if (!date || date > adulthood) errors.birthDate = 'mustBeAdult';
  }
  if (required(form.email) && !emailPattern.test(form.email.trim())) errors.email = 'invalidEmail';
  if (form.language !== 'es' && form.language !== 'en') errors.language = 'required';
  if (!['economy', 'xl', 'premium'].includes(form.category)) errors.category = 'required';
  if (required(form.plate) && !/^[A-Z]{3}\d{3}$/.test(form.plate)) errors.plate = 'invalidPlate';
  for (const key of ['brand', 'model']) {
    if (required(form[key]) && form[key].trim().length > 30) errors[key] = 'maxThirty';
  }
  if (required(form.year) && (!/^\d{4}$/.test(form.year) || Number(form.year) > today.getFullYear() || Number(form.year) < 1900)) errors.year = 'invalidYear';
  if (required(form.capacity) && (!/^\d+$/.test(form.capacity) || Number(form.capacity) < (form.category === 'xl' ? 6 : 1))) errors.capacity = form.category === 'xl' ? 'xlCapacity' : 'invalidCapacity';
  for (const key of ['licenseExpiry', 'soatExpiry']) {
    if (required(form[key]) && !futureDate(form[key], today)) errors[key] = 'expiredDocument';
  }
  if (needsInspection(form.year, today)) {
    if (!required(form.inspectionPhoto)) errors.inspectionPhoto = 'required';
    if (!required(form.inspectionExpiry)) errors.inspectionExpiry = 'required';
    else if (!futureDate(form.inspectionExpiry, today)) errors.inspectionExpiry = 'expiredDocument';
  }
  if (required(form.paymentEmail) && !emailPattern.test(form.paymentEmail.trim())) errors.paymentEmail = 'invalidEmail';
  if (!form.acceptedTerms) errors.acceptedTerms = 'required';
  return errors;
}
