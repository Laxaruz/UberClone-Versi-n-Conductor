const assert = require('node:assert/strict');
const test = require('node:test');
const { createCashRepository, validCashTrip } = require('../cashRepository');
const { createApp } = require('../app');

function testDatabase() {
  const values = new Map();
  const database = {
    collection: (name) => ({ doc: (id) => ({ key: `${name}/${id}` }) }),
    runTransaction: async (callback) => callback({
      get: async (ref) => ({ exists: values.has(ref.key), data: () => values.get(ref.key) }),
      create: (ref, value) => {
        if (values.has(ref.key)) throw new Error('Already exists');
        values.set(ref.key, value);
      },
      set: (ref, value) => values.set(ref.key, { ...values.get(ref.key), ...value }),
      update: (ref, value) => values.set(ref.key, { ...values.get(ref.key), ...value }),
    }),
  };
  return { database, values };
}

const trip = { driverId: 'driver-1', status: 'completed', paymentMethod: 'cash',
  paymentStatus: 'pending', fare: 19200, commission: 3840,
  driverEarnings: 15360, commissionRate: 0.2, tip: 0 };

test('cash receipt deducts commission once and may make the balance negative', async () => {
  const { database, values } = testDatabase();
  values.set('trips/trip-1', { ...trip });
  const repository = createCashRepository(database);
  const first = await repository.recordCashReceipt('trip-1', 'driver-1');
  const again = await repository.recordCashReceipt('trip-1', 'driver-1');
  assert.equal(first.balance, -3840);
  assert.equal(again.balance, -3840);
  assert.equal(again.alreadyRecorded, true);
  assert.equal(values.get('driverBalances/driver-1').balance, -3840);
  assert.equal(values.get('trips/trip-1').status, 'paid');
  assert.equal(values.get('trips/trip-1').paymentStatus, 'cash_received');
  assert.equal(values.get('cashReceipts/trip-1').commission, 3840);
});

test('cash receipt rejects other drivers, card trips, prior payments and altered amounts', async () => {
  for (const override of [
    {}, { paymentMethod: 'mercadopago' }, { paymentStatus: 'approved' },
    { status: 'in_progress' }, { commission: 1 }, { driverEarnings: 1 },
  ]) {
    const { database, values } = testDatabase();
    values.set('trips/trip-1', { ...trip, ...override });
    const repository = createCashRepository(database);
    if (Object.keys(override).length === 0) {
      await assert.rejects(repository.recordCashReceipt('trip-1', 'driver-2'));
    } else {
      await assert.rejects(repository.recordCashReceipt('trip-1', 'driver-1'));
    }
    assert.equal(values.has('cashReceipts/trip-1'), false);
  }
  assert.equal(validCashTrip({ ...trip }, 'driver-1'), true);
});

test('cash endpoint authenticates and never accepts a phone supplied amount', async () => {
  let calls = 0;
  const app = createApp({
    verifyIdToken: async (token) => ({ uid: token === 'owner' ? 'driver-1' : 'driver-2' }),
    findTrip: async () => trip,
    recordCashReceipt: async () => { calls += 1; return { paymentStatus: 'cash_received', balance: -3840 }; },
  });
  const server = await new Promise((resolve) => {
    const listening = app.listen(0, '127.0.0.1', () => resolve(listening));
  });
  try {
    const url = `http://127.0.0.1:${server.address().port}/api/trips/trip-1/cash-receipt`;
    const wrong = await fetch(url, { method: 'POST', headers: { Authorization: 'Bearer wrong' } });
    assert.equal(wrong.status, 404);
    const allowed = await fetch(url, { method: 'POST',
      headers: { Authorization: 'Bearer owner', 'Content-Type': 'application/json' },
      body: JSON.stringify({ fare: 1, commission: 0 }) });
    assert.equal(allowed.status, 200);
    assert.equal(calls, 1);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
