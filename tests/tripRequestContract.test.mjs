import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/utils/tripRequestContract.js', import.meta.url), 'utf8');
const { canAcceptTripRequest, mapTripRequest } = await import(
  `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`
);
const timestamp = (time) => ({ toMillis: () => time });
const data = {
  status: 'requested', createdAt: timestamp(1000), expiresAt: timestamp(16000),
  acceptedBy: null, acceptedAt: null, passengerName: 'Pasajero de prueba',
  origin: { address: 'Origen de prueba', lat: 4.7, lng: -74.0 },
  destination: { address: 'Destino de prueba', lat: 4.8, lng: -74.1 },
  distanceKm: 8.5, durationMin: 22, category: 'economy', paymentMethod: 'cash',
  fare: 19200, commission: 3840, driverEarnings: 15360,
};

assert.equal(mapTripRequest('request-1', data).source, 'firestore_test');
assert.equal(mapTripRequest('request-1', data).expiresAt, 16000);
assert.equal(canAcceptTripRequest(data, 15999), true);
assert.equal(canAcceptTripRequest(data, 16000), false);
assert.equal(canAcceptTripRequest({ ...data, status: 'accepted' }, 2000), false);
assert.equal(canAcceptTripRequest({ ...data, acceptedBy: 'otro' }, 2000), false);
assert.equal(canAcceptTripRequest({ ...data, expiresAt: timestamp(16001) }, 2000), false);
assert.equal(canAcceptTripRequest({ ...data, expiresAt: timestamp(15999) }, 2000), false);
assert.equal(mapTripRequest('request-1', { ...data, origin: { address: 'Sin coordenadas' } }), null);
assert.equal(mapTripRequest('request-1', { ...data, expiresAt: 16000 }), null);
assert.equal(mapTripRequest('request-1', { ...data, expiresAt: timestamp(16001) }), null);
assert.equal(mapTripRequest('request-1', { ...data, expiresAt: timestamp(15999) }), null);
assert.equal(mapTripRequest('request-1', { ...data, category: 'otra' }), null);
assert.equal(mapTripRequest('request-1', { ...data, fare: NaN }), null);
assert.equal(mapTripRequest('request-1', { ...data, status: 'accepted' }), null);

console.log('Trip request contract cases passed');
