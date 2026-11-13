import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const pricingSource = readFileSync(new URL('../src/config/pricing.js', import.meta.url), 'utf8');
const fareSource = readFileSync(new URL('../src/utils/calculateFare.js', import.meta.url), 'utf8')
  .replace("import { pricing } from '../config/pricing';", '');
const completedSource = readFileSync(new URL('../src/utils/completedTrip.js', import.meta.url), 'utf8')
  .replace("import { pricing } from '../config/pricing';", '')
  .replace("import { calculateFare } from './calculateFare';", '');
const { buildCompletedTrip } = await import(`data:text/javascript;base64,${Buffer.from(
  `${pricingSource}\n${fareSource}\n${completedSource}`,
).toString('base64')}`);

const request = {
  status: 'accepted', acceptedBy: 'driver-1', passengerName: 'Pasajero de prueba',
  origin: { lat: 6.25, lng: -75.57, address: 'Punto A' },
  destination: { lat: 6.26, lng: -75.58, address: 'Punto B' },
  distanceKm: 8.5, durationMin: 22, category: 'economy', paymentMethod: 'mercadopago',
  fare: 19200, commission: 3840, driverEarnings: 15360, createdAt: 'request-date',
};
const trip = {
  id: 'request-1', status: 'completed', paymentMethod: 'mercadopago', tip: 0,
  finalFare: 19200, finalCommission: 3840, finalDriverEarnings: 15360,
};
const saved = buildCompletedTrip(trip, request, 'driver-1', 'server-date');
assert.equal(saved.requestId, 'request-1');
assert.equal(saved.driverId, 'driver-1');
assert.equal(saved.fare, 19200);
assert.equal(saved.commissionRate, 0.2);
assert.equal(saved.paymentStatus, 'pending');
assert.equal(saved.paymentId, null);
assert.equal(saved.createdAt, 'request-date');
assert.equal(saved.completedAt, 'server-date');

assert.throws(() => buildCompletedTrip({ ...trip, finalFare: 100 }, request, 'driver-1', 'server-date'));
assert.throws(() => buildCompletedTrip(trip, { ...request, fare: 100 }, 'driver-1', 'server-date'));
assert.throws(() => buildCompletedTrip(trip, request, 'another-driver', 'server-date'));
assert.throws(() => buildCompletedTrip({ ...trip, status: 'in_progress' }, request, 'driver-1', 'server-date'));

console.log('Completed trip values and owner checks passed');
