import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/utils/earningsSummary.js', import.meta.url), 'utf8');
const { getEarningsBoundaries, summarizeEarnings } = await import(
  `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);

const now = new Date('2026-11-13T12:00:00.000Z');
assert.deepEqual(getEarningsBoundaries(now), {
  today: Date.parse('2026-11-13T05:00:00.000Z'),
  week: Date.parse('2026-11-09T05:00:00.000Z'),
  month: Date.parse('2026-11-01T05:00:00.000Z'),
  earliest: Date.parse('2026-11-01T05:00:00.000Z'),
});
assert.equal(getEarningsBoundaries(new Date('2026-12-01T04:59:00.000Z')).month,
  Date.parse('2026-11-01T05:00:00.000Z'));
assert.equal(getEarningsBoundaries(new Date('2026-12-01T05:00:00.000Z')).month,
  Date.parse('2026-12-01T05:00:00.000Z'));

const trip = (id, completedAt, values = {}) => ({
  id, completedAtMs: Date.parse(completedAt), fare: 19200, commission: 3840,
  tip: 0, driverEarnings: 15360, paymentMethod: 'mercadopago',
  status: 'paid', paymentStatus: 'approved', ...values,
});

const trips = [
  trip('gateway-today', '2026-11-13T05:00:00.000Z'),
  trip('gateway-today', '2026-11-13T05:00:00.000Z'),
  trip('cash-week', '2026-11-12T18:00:00.000Z', {
    fare: 10000, commission: 2000, tip: 500, driverEarnings: 8500,
    paymentMethod: 'cash', paymentStatus: 'cash_received',
  }),
  trip('gateway-month', '2026-11-02T18:00:00.000Z', {
    fare: 6000, commission: 1200, driverEarnings: 4800,
  }),
  trip('pending-gateway', '2026-11-13T10:00:00.000Z', {
    fare: 20000, commission: 4000, driverEarnings: 16000,
    status: 'completed', paymentStatus: 'pending',
  }),
  trip('pending-cash', '2026-11-13T10:00:00.000Z', {
    fare: 6000, commission: 1200, driverEarnings: 4800,
    paymentMethod: 'cash', status: 'completed', paymentStatus: 'pending',
  }),
  trip('rejected', '2026-11-13T10:00:00.000Z', {
    status: 'completed', paymentStatus: 'rejected',
  }),
  trip('invalid', '2026-11-13T10:00:00.000Z', { driverEarnings: 1 }),
  trip('old', '2026-10-31T18:00:00.000Z'),
];

const result = summarizeEarnings(trips, now);
assert.deepEqual(result.periods.today, {
  tripCount: 1, totalFare: 19200, totalCommission: 3840,
  totalTips: 0, netEarnings: 15360, averagePerTrip: 15360,
});
assert.deepEqual(result.periods.week, {
  tripCount: 2, totalFare: 29200, totalCommission: 5840,
  totalTips: 500, netEarnings: 23860, averagePerTrip: 11930,
});
assert.deepEqual(result.periods.month, {
  tripCount: 3, totalFare: 35200, totalCommission: 7040,
  totalTips: 500, netEarnings: 28660, averagePerTrip: 9553,
});
assert.deepEqual(result.breakdown, {
  confirmedGateway: 20160, pendingGateway: 16000,
  pendingCashCommission: 1200, deductedCashCommission: 2000,
});
assert.equal(summarizeEarnings([], now).periods.month.tripCount, 0);

console.log('Earnings periods, payments and Bogota boundaries passed');
