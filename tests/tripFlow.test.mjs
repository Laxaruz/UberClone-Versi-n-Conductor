import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const transitionsSource = readFileSync(new URL('../src/utils/tripTransitions.js', import.meta.url), 'utf8');
const { transitionTrip } = await import(`data:text/javascript;base64,${Buffer.from(transitionsSource).toString('base64')}`);
const pricingSource = readFileSync(new URL('../src/config/pricing.js', import.meta.url), 'utf8');
const fareSource = readFileSync(new URL('../src/utils/calculateFare.js', import.meta.url), 'utf8')
  .replace("import { pricing } from '../config/pricing';", '');
const { calculateFare } = await import(`data:text/javascript;base64,${Buffer.from(`${pricingSource}\n${fareSource}`).toString('base64')}`);

const estimated = calculateFare({ distanceKm: 8.5, durationMin: 22, category: 'economy' });
assert.deepEqual(estimated, { fare: 19200, commission: 3840, driverEarnings: 15360 });
assert.deepEqual(calculateFare({ distanceKm: 8.5, durationMin: 22, category: 'xl' }),
  { fare: 26900, commission: 5380, driverEarnings: 21520 });

const accepted = { id: 'trip-1', status: 'accepted', distanceKm: 8.5, durationMin: 22, category: 'economy' };
assert.equal(transitionTrip(accepted, 'complete', 1000, estimated), accepted);
assert.equal(transitionTrip(accepted, 'board_passenger', 1000), accepted);

const arriving = transitionTrip(accepted, 'start_pickup', 1000);
assert.equal(arriving.status, 'driver_arriving');
assert.equal(arriving.pickupStartedAt, 1000);
assert.equal(transitionTrip(arriving, 'start_pickup', 1100), arriving);
assert.equal(transitionTrip(arriving, 'board_passenger', 1100), arriving);
assert.equal(transitionTrip(arriving, 'complete', 1100, estimated), arriving);

const atPickup = transitionTrip(arriving, 'confirm_arrival', 2000);
assert.equal(atPickup.status, 'driver_arriving');
assert.equal(atPickup.pickupReachedAt, 2000);
assert.equal(transitionTrip(atPickup, 'confirm_arrival', 2100), atPickup);

const onTrip = transitionTrip(atPickup, 'board_passenger', 3000);
assert.equal(onTrip.status, 'in_progress');
assert.equal(onTrip.boardedAt, 3000);
assert.equal(transitionTrip(onTrip, 'board_passenger', 3100), onTrip);
assert.equal(transitionTrip(onTrip, 'complete', 4000), onTrip);

const completed = transitionTrip(onTrip, 'complete', 4000, estimated);
assert.equal(completed.status, 'completed');
assert.equal(completed.finalFare, 19200);
assert.equal(completed.finalCommission, 3840);
assert.equal(completed.finalDriverEarnings, 15360);
assert.equal(completed.paymentStatus, 'pending');
assert.equal(transitionTrip(completed, 'complete', 5000, estimated), completed);
assert.equal(transitionTrip(completed, 'start_pickup', 5000), completed);

console.log('Trip transitions and fare example passed');
