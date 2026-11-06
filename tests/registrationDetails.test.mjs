import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/utils/registrationDetails.js', import.meta.url), 'utf8');
const { registrationDetails, restoreRegistrationDetails } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);

const form = {
  profilePhoto: 'file://profile', fullName: 'Persona Ejemplo', identityNumber: '12345678',
  phone: '3001234567', birthDate: '2000-01-01', gender: 'other', email: 'persona@example.com', language: 'en',
  category: 'xl', plate: 'ABC123', brand: 'Renault', model: 'Duster', year: '2024',
  color: 'white', capacity: '6', vehiclePhoto: 'file://vehicle',
};

const saved = registrationDetails(form);
assert.equal(saved.displayName, form.fullName);
assert.equal(saved.vehicleCategory, form.category);
assert.equal(saved.profilePhoto, undefined);
assert.equal(saved.vehiclePhoto, undefined);

const restored = restoreRegistrationDetails({ profilePhoto: '', vehiclePhoto: '', language: 'es' }, saved);
for (const key of ['fullName', 'identityNumber', 'phone', 'birthDate', 'gender', 'email', 'language',
  'category', 'plate', 'brand', 'model', 'year', 'color', 'capacity']) {
  assert.equal(restored[key], form[key], key);
}
assert.equal(restored.profilePhoto, '');
assert.equal(restored.vehiclePhoto, '');

const oldRecord = restoreRegistrationDetails({ phone: '' }, { displayName: 'Antiguo', vehicleCategory: 'economy' });
assert.equal(oldRecord.fullName, 'Antiguo');
assert.equal(oldRecord.category, 'economy');
assert.equal(oldRecord.phone, '');
console.log('Registration details save and restore passed');
