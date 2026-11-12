import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';


const source = readFileSync(new URL('../src/utils/validateRegistration.js', import.meta.url), 'utf8');
const { initialRegistration, validateRegistration, needsInspection, normalizeRegistrationInput, registrationInputLimits } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
const today = new Date(2026, 10, 4);
const valid = {
  ...initialRegistration, profilePhoto: 'file://profile', fullName: 'María José', identityNumber: '12345678',
  phone: '3001234567', birthDate: '2000-01-01', gender: 'female', email: 'maria@example.com',
  category: 'xl', plate: 'ABC123', brand: 'Renault', model: 'Duster', year: '2024', color: 'white',
  capacity: '6', vehiclePhoto: 'file://vehicle', licenseNumber: '123456', licensePhoto: 'file://license',
  licenseExpiry: '2027-01-01', soatPhoto: 'file://soat', soatExpiry: '2027-01-01',
  paymentEmail: 'maria@example.com', acceptedTerms: true,
};
assert.deepEqual(validateRegistration(valid, today), {});
assert.equal(validateRegistration({ ...valid, phone: '123' }, today).phone, 'invalidPhone');
assert.equal(validateRegistration({ ...valid, capacity: '5' }, today).capacity, 'xlCapacity');
assert.equal(validateRegistration({ ...valid, category: 'XL' }, today).category, 'required');
assert.equal(validateRegistration({ ...valid, language: 'fr' }, today).language, 'required');
assert.equal(validateRegistration({ ...valid, birthDate: '2010-01-01' }, today).birthDate, 'mustBeAdult');
assert.equal(validateRegistration({ ...valid, plate: 'abc123' }, today).plate, 'invalidPlate');
assert.equal(validateRegistration({ ...valid, soatExpiry: '2026-11-04' }, today).soatExpiry, 'expiredDocument');
assert.equal(validateRegistration({ ...valid, soatExpiry: '2027-02-30' }, today).soatExpiry, 'expiredDocument');
assert.equal(validateRegistration({ ...valid, birthDate: '2000-02-30' }, today).birthDate, 'mustBeAdult');
assert.equal(needsInspection('2021', today), true);
assert.equal(validateRegistration({ ...valid, year: '2021' }, today).inspectionPhoto, 'required');
assert.equal(validateRegistration({ ...valid, acceptedTerms: false }, today).acceptedTerms, 'required');
assert.equal(validateRegistration({ ...valid, identityNumber: '12345678901' }, today).identityNumber, 'invalidIdentity');
assert.equal(validateRegistration({ ...valid, phone: '30012345678' }, today).phone, 'invalidPhone');
assert.equal(validateRegistration({ ...valid, plate: 'ABC1234' }, today).plate, 'invalidPlate');
assert.equal(validateRegistration({ ...valid, brand: 'B'.repeat(31) }, today).brand, 'maxThirty');
assert.equal(validateRegistration({ ...valid, year: '20267' }, today).year, 'invalidYear');
assert.equal(registrationInputLimits.fullName, 50);
assert.equal(normalizeRegistrationInput('fullName', 'A'.repeat(51)), 'A'.repeat(50));
assert.equal(normalizeRegistrationInput('identityNumber', '12345678901'), '1234567890');
assert.equal(normalizeRegistrationInput('phone', '300-123-45678'), '3001234567');
assert.equal(normalizeRegistrationInput('plate', 'abc-1234'), 'ABC123');
assert.equal(normalizeRegistrationInput('brand', 'B'.repeat(31)), 'B'.repeat(30));
assert.equal(normalizeRegistrationInput('model', 'M'.repeat(31)), 'M'.repeat(30));
assert.equal(normalizeRegistrationInput('year', '20267'), '2026');
assert.equal(normalizeRegistrationInput('capacity', '6 pasajeros'), '6');
assert.equal(normalizeRegistrationInput('licenseNumber', '123 456'), '123456');
assert.equal(normalizeRegistrationInput('phone', '3001234567'), '3001234567');
assert.equal(normalizeRegistrationInput('phone', '300123456'), '300123456');
assert.equal(validateRegistration({ ...valid, phone: normalizeRegistrationInput('phone', '30012345678') }, today).phone, undefined);
assert.equal(validateRegistration({ ...valid, identityNumber: '12345' }, today).identityNumber, 'invalidIdentity');
console.log('18 validation cases and 14 input limit cases passed');
