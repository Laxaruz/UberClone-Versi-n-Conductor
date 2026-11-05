import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';


const source = readFileSync(new URL('../src/utils/validateRegistration.js', import.meta.url), 'utf8');
const { initialRegistration, validateRegistration, needsInspection } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
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
console.log('13 validation cases passed');
