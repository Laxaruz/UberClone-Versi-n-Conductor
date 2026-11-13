import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const dataUrl = (source) => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const validation = dataUrl(readFileSync(new URL('../src/utils/validateRegistration.js', import.meta.url), 'utf8'));
const details = dataUrl(readFileSync(new URL('../src/utils/registrationDetails.js', import.meta.url), 'utf8'));
const source = readFileSync(new URL('../src/utils/profileDetails.js', import.meta.url), 'utf8')
  .replace("'./validateRegistration'", `'${validation}'`)
  .replace("'./registrationDetails'", `'${details}'`);
const { profileForm, validateProfileDetails, validateProfileDocuments,
  storedProfileDetails, storedDocumentDetails } = await import(dataUrl(source));

const today = new Date(2026, 10, 13);
const driver = {
  displayName: 'Maria Jose', identityNumber: '12345678', phone: '3001234567',
  birthDate: '2000-01-01', gender: 'female', email: 'maria@example.com', language: 'es',
  vehicleCategory: 'xl', plate: 'ABC123', brand: 'Renault', model: 'Duster',
  year: '2024', color: 'white', capacity: '6', licenseNumber: '123456',
  licenseExpiry: '2027-01-01', soatExpiry: '2027-01-01',
  inspectionExpiry: '', paymentEmail: 'maria@example.com',
};
const form = profileForm(driver);
assert.equal(form.fullName, 'Maria Jose');
assert.equal(form.category, 'xl');
assert.equal(form.licenseNumber, '123456');
assert.deepEqual(validateProfileDetails(form, today), {});
assert.deepEqual(validateProfileDocuments(form, today), {});
assert.equal(validateProfileDetails({ ...form, phone: '123' }, today).phone, 'invalidPhone');
assert.equal(validateProfileDetails({ ...form, plate: 'abc123' }, today).plate, 'invalidPlate');
assert.equal(validateProfileDocuments({ ...form, licenseNumber: 'AB123' }, today).licenseNumber, 'required');
assert.equal(validateProfileDocuments({ ...form, soatExpiry: '2026-11-13' }, today).soatExpiry, 'expiredDocument');
assert.equal(validateProfileDocuments({ ...form, year: '2020' }, today).inspectionExpiry, 'required');
assert.equal(storedProfileDetails(form).displayName, 'Maria Jose');
assert.equal('language' in storedProfileDetails(form), false);
assert.equal(storedDocumentDetails(form).licenseNumber, '123456');
console.log('Profile data, edits and document validation passed');
