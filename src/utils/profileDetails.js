import { initialRegistration, needsInspection, validateRegistration } from './validateRegistration';
import { registrationDetails, restoreRegistrationDetails } from './registrationDetails';

export const personalVehicleKeys = [
  'fullName', 'identityNumber', 'phone', 'birthDate', 'gender', 'email',
  'category', 'plate', 'brand', 'model', 'year', 'color', 'capacity',
];

export const documentKeys = [
  'licenseNumber', 'licenseExpiry', 'soatExpiry', 'inspectionExpiry', 'paymentEmail',
];

export function profileForm(driver, localRegistration = initialRegistration) {
  const restored = restoreRegistrationDetails({ ...initialRegistration, ...localRegistration }, driver);
  return {
    ...restored,
    licenseNumber: driver?.licenseNumber ?? restored.licenseNumber,
    licenseExpiry: driver?.licenseExpiry ?? restored.licenseExpiry,
    soatExpiry: driver?.soatExpiry ?? restored.soatExpiry,
    inspectionExpiry: driver?.inspectionExpiry ?? restored.inspectionExpiry,
    paymentEmail: driver?.paymentEmail ?? restored.paymentEmail,
  };
}

function pickErrors(form, keys, today) {
  const errors = validateRegistration(form, today);
  return Object.fromEntries(keys.filter((key) => errors[key]).map((key) => [key, errors[key]]));
}

export function validateProfileDetails(form, today = new Date()) {
  return pickErrors(form, personalVehicleKeys, today);
}

export function validateProfileDocuments(form, today = new Date()) {
  const keys = needsInspection(form.year, today)
    ? documentKeys : documentKeys.filter((key) => key !== 'inspectionExpiry');
  return pickErrors(form, keys, today);
}

export function storedProfileDetails(form) {
  const { language, ...details } = registrationDetails(form);
  return details;
}

export function storedDocumentDetails(form) {
  return Object.fromEntries(documentKeys.map((key) => [key, form[key] ?? '']));
}
