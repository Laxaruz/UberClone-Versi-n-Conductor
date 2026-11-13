const assert = require('node:assert/strict');
const { createHmac } = require('node:crypto');
const { test } = require('node:test');
const { createApp } = require('../app');
const { createMercadoPagoClient } = require('../mercadoPagoClient');
const { canStartCheckout, isSandboxCheckoutUrl, matchesApprovedTestPayment } = require('../paymentChecks');
const { createPaymentRepository } = require('../paymentRepository');

async function start(app) {
  const server = await new Promise((resolve) => {
    const listening = app.listen(0, '127.0.0.1', () => resolve(listening));
  });
  return { base: `http://127.0.0.1:${server.address().port}`, close: () => new Promise((resolve) => server.close(resolve)) };
}

test('current trips remain blocked, and test checkout uses the stored fare', async () => {
  const trip = { driverId: 'driver-1', status: 'completed', paymentMethod: 'mercadopago', paymentStatus: 'pending', fare: 19200 };
  let calls = 0;
  const app = createApp({
    verifyIdToken: async (token) => ({ uid: token === 'owner' ? 'driver-1' : 'driver-2' }),
    findTrip: async () => trip,
    savePreference: async (_id, preferenceId, checkoutUrl) => {
      Object.assign(trip, { paymentPreferenceId: preferenceId, paymentCheckoutUrl: checkoutUrl });
      return trip;
    },
    mercadoPago: { createPreference: async (details) => {
      calls += 1;
      assert.deepEqual(details, { tripId: 'trip-1', fare: 19200, notificationUrl: 'https://example.test/webhook' });
      return { id: 'pref-1', sandbox_init_point: 'https://sandbox.mercadopago.com/test' };
    } },
    webhookSecret: 'test-secret', notificationUrl: 'https://example.test/webhook', paymentsTestMode: true,
  });
  const server = await start(app);
  const post = (token, body = {}) => fetch(`${server.base}/api/trips/trip-1/checkout`, {
    method: 'POST', headers: { authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  try {
    assert.equal((await post('other')).status, 404);
    assert.equal((await post('owner', { fare: 1 })).status, 409);
    assert.equal(calls, 0);
    trip.paymentEligible = true;
    const first = await post('owner', { fare: 1 });
    assert.equal(first.status, 200);
    assert.deepEqual(await first.json(), { preferenceId: 'pref-1', checkoutUrl: 'https://sandbox.mercadopago.com/test' });
    assert.equal((await post('owner')).status, 200);
    assert.equal(calls, 1);
    trip.paymentCheckoutUrl = 'https://sandbox.mercadopago.com.evil.test/checkout';
    assert.equal((await post('owner')).status, 502);
  } finally {
    await server.close();
  }
});

test('webhook requires a signed matching payment and handles repeats', async () => {
  const trip = {
    driverId: 'driver-1', status: 'completed', paymentMethod: 'mercadopago',
    paymentStatus: 'pending', paymentEligible: true, fare: 19200, paymentPreferenceId: 'pref-1',
  };
  let updates = 0;
  const payment = {
    id: 123, status: 'approved', live_mode: false, external_reference: 'trip-1',
    currency_id: 'COP', transaction_amount: 19200, order: { id: 456 },
  };
  const order = {
    id: 456, external_reference: 'trip-1', preference_id: 'pref-1', status: 'closed',
    is_test: true,
    total_amount: 19200, paid_amount: 19200, refunded_amount: 0,
    payments: [{ id: 123, status: 'approved' }],
  };
  const app = createApp({
    verifyIdToken: async () => ({ uid: 'driver-1' }), findTrip: async () => trip,
    mercadoPago: { getPayment: async () => payment, getMerchantOrder: async () => order },
    markPaid: async () => {
      updates += 1;
      Object.assign(trip, { status: 'paid', paymentStatus: 'approved', paymentId: '123' });
    },
    webhookSecret: 'test-secret', paymentsTestMode: true,
  });
  const server = await start(app);
  const signature = createHmac('sha256', 'test-secret')
    .update('id:123;request-id:req-1;ts:1700000000;').digest('hex');
  const post = (sig) => fetch(`${server.base}/api/payments/webhook?data.id=123`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'x-request-id': 'req-1', 'x-signature': sig },
    body: JSON.stringify({ type: 'payment', data: { id: '123' } }),
  });
  try {
    assert.equal((await post('bad')).status, 401);
    assert.equal(updates, 0);
    payment.transaction_amount = 1;
    assert.equal((await post(`ts=1700000000,v1=${signature}`)).status, 422);
    payment.transaction_amount = 19200;
    assert.equal((await post(`ts=1700000000,v1=${signature}`)).status, 200);
    assert.equal(updates, 1);
    assert.equal(trip.status, 'paid');
    assert.equal((await post(`ts=1700000000,v1=${signature}`)).status, 200);
  } finally {
    await server.close();
  }
});

test('signed sandbox webhook accepts only the configured test accounts', async () => {
  const tripId = 'sandbox_trip-1';
  const trip = {
    status: 'completed', paymentMethod: 'mercadopago', paymentStatus: 'pending',
    paymentEligible: true, testFixture: true, fare: 19200, paymentPreferenceId: 'pref-1',
  };
  const payment = {
    id: 123, status: 'approved', live_mode: true, external_reference: tripId,
    currency_id: 'COP', transaction_amount: 19200, order: { id: 456 },
    collector_id: 11, payer: { id: 22 },
  };
  const order = {
    id: 456, external_reference: tripId, preference_id: 'pref-1', status: 'closed',
    is_test: true, collector: { id: 11 }, payer: { id: 22 },
    total_amount: 19200, paid_amount: 19200, refunded_amount: 0,
    payments: [{ id: 123, status: 'approved' }],
  };
  let updates = 0;
  const app = createApp({
    verifyIdToken: async () => ({ uid: 'driver-1' }),
    findTrip: async () => trip,
    mercadoPago: { getPayment: async () => payment, getMerchantOrder: async () => order },
    markPaid: async () => { updates += 1; },
    webhookSecret: 'test-secret', paymentsTestMode: true,
    testAccounts: { sellerId: '11', buyerId: '22' },
  });
  const server = await start(app);
  const signature = createHmac('sha256', 'test-secret')
    .update('id:123;request-id:req-1;ts:1700000000;').digest('hex');
  try {
    const response = await fetch(`${server.base}/api/payments/webhook?data.id=123`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-request-id': 'req-1',
        'x-signature': `ts=1700000000,v1=${signature}` },
      body: JSON.stringify({ type: 'payment', data: { id: '123' } }),
    });
    assert.equal(response.status, 200);
    assert.equal(updates, 1);
  } finally {
    await server.close();
  }
});

test('Mercado Pago client sends the stored amount and reads payment details', async () => {
  const calls = [];
  const client = createMercadoPagoClient('test-token', async (url, options) => {
    calls.push({ url, options });
    return { ok: true, json: async () => ({ id: 'ok' }) };
  });
  await client.createPreference({ tripId: 'trip-1', fare: 19200, notificationUrl: 'https://example.test/webhook' });
  await client.getPayment('123');
  assert.equal(calls[0].url, 'https://api.mercadopago.com/checkout/preferences');
  assert.equal(JSON.parse(calls[0].options.body).items[0].unit_price, 19200);
  assert.equal(calls[1].url, 'https://api.mercadopago.com/v1/payments/123');
});

test('payment checks reject live and mismatched provider data', () => {
  const trip = {
    status: 'completed', paymentMethod: 'mercadopago', paymentStatus: 'pending',
    paymentEligible: true, fare: 19200, paymentPreferenceId: 'pref-1',
  };
  const payment = {
    id: 123, status: 'approved', live_mode: false, external_reference: 'trip-1',
    currency_id: 'COP', transaction_amount: 19200, order: { id: 456 },
  };
  const order = {
    id: 456, external_reference: 'trip-1', preference_id: 'pref-1', status: 'closed',
    is_test: true,
    total_amount: 19200, paid_amount: 19200, refunded_amount: 0,
    payments: [{ id: 123, status: 'approved' }],
  };
  assert.equal(canStartCheckout(trip), true);
  assert.equal(isSandboxCheckoutUrl('https://sandbox.mercadopago.com/checkout'), true);
  assert.equal(isSandboxCheckoutUrl('https://sandbox.mercadopago.com.co/checkout'), true);
  assert.equal(isSandboxCheckoutUrl('http://sandbox.mercadopago.com/checkout'), false);
  assert.equal(isSandboxCheckoutUrl('https://sandbox.mercadopago.com.evil.test/checkout'), false);
  assert.equal(matchesApprovedTestPayment(payment, order, 'trip-1', trip), true);
  assert.equal(matchesApprovedTestPayment(payment, { ...order, is_test: undefined }, 'trip-1', trip), true);
  assert.equal(matchesApprovedTestPayment({ ...payment, live_mode: true }, order, 'trip-1', trip), false);
  assert.equal(matchesApprovedTestPayment(payment, { ...order, is_test: false }, 'trip-1', trip), false);
  assert.equal(matchesApprovedTestPayment(payment, { ...order, preference_id: 'other' }, 'trip-1', trip), false);
  assert.equal(matchesApprovedTestPayment({ ...payment, currency_id: 'USD' }, order, 'trip-1', trip), false);
  assert.equal(matchesApprovedTestPayment(payment, { ...order, status: 'opened' }, 'trip-1', trip), false);
  assert.equal(matchesApprovedTestPayment(payment, { ...order, paid_amount: 1 }, 'trip-1', trip), false);
  assert.equal(canStartCheckout({ ...trip, paymentEligible: undefined }), false);
});

test('sandbox payment with live_mode true needs the Admin fixture and both test accounts', () => {
  const tripId = 'sandbox_trip-1';
  const trip = {
    status: 'completed', paymentMethod: 'mercadopago', paymentStatus: 'pending',
    paymentEligible: true, testFixture: true, fare: 19200, paymentPreferenceId: 'pref-1',
  };
  const payment = {
    id: 123, status: 'approved', live_mode: true, external_reference: tripId,
    currency_id: 'COP', transaction_amount: 19200, order: { id: 456 },
    collector_id: 11, payer: { id: '22' },
  };
  const order = {
    id: 456, external_reference: tripId, preference_id: 'pref-1', status: 'closed',
    is_test: true, collector: { id: 11 }, payer: { id: 22 },
    total_amount: 19200, paid_amount: 19200, refunded_amount: 0,
    payments: [{ id: 123, status: 'approved' }],
  };
  const accounts = { sellerId: '11', buyerId: '22' };
  assert.equal(matchesApprovedTestPayment(payment, order, tripId, trip, accounts), true);
  assert.equal(matchesApprovedTestPayment(payment, order, tripId, { ...trip, testFixture: false }, accounts), false);
  assert.equal(matchesApprovedTestPayment(payment, { ...order, is_test: false }, tripId, trip, accounts), false);
  assert.equal(matchesApprovedTestPayment(payment, order, tripId, trip, { ...accounts, buyerId: '33' }), false);
  assert.equal(matchesApprovedTestPayment({ ...payment, collector_id: 44 }, order, tripId, trip, accounts), false);
  assert.equal(matchesApprovedTestPayment(payment, { ...order, payer: { id: 33 } }, tripId, trip, accounts), false);
  assert.equal(matchesApprovedTestPayment({ ...payment, transaction_amount: 1 }, order, tripId, trip, accounts), false);
  assert.equal(matchesApprovedTestPayment(payment, { ...order, preference_id: 'other' }, tripId, trip, accounts), false);
});

test('repository marks an approved trip paid without applying the same payment twice', async () => {
  const trip = {
    driverId: 'driver-1',
    status: 'completed', paymentMethod: 'mercadopago', paymentStatus: 'pending',
    paymentEligible: true, testFixture: true, fare: 19200, commission: 3840, commissionRate: 0.2,
    tip: 0, driverEarnings: 15360, paymentPreferenceId: 'pref-1',
  };
  const payment = {
    id: 123, status: 'approved', live_mode: true, external_reference: 'sandbox_trip-1',
    currency_id: 'COP', transaction_amount: 19200, order: { id: 456 }, collector_id: 11, payer: { id: 22 },
  };
  const order = {
    id: 456, external_reference: 'sandbox_trip-1', preference_id: 'pref-1', status: 'closed',
    is_test: true, collector: { id: 11 }, payer: { id: 22 },
    total_amount: 19200, paid_amount: 19200, refunded_amount: 0,
    payments: [{ id: 123, status: 'approved' }],
  };
  let updates = 0;
  let balanceWrites = 0;
  const balance = { balance: -1000 };
  const database = {
    collection: (name) => ({ doc: (id) => ({ path: `${name}/${id}` }) }),
    runTransaction: async (callback) => callback({
      get: async (ref) => ({ data: () => ref.path.startsWith('trips/') ? trip : balance }),
      update: (_ref, fields) => { updates += 1; Object.assign(trip, fields); },
      set: (_ref, fields) => { balanceWrites += 1; Object.assign(balance, fields); },
    }),
  };
  const repository = createPaymentRepository(database, { sellerId: '11', buyerId: '22' });
  await repository.markPaid('sandbox_trip-1', 123, payment, order);
  assert.equal(trip.status, 'paid');
  assert.equal(trip.paymentStatus, 'approved');
  assert.equal(trip.paymentId, '123');
  assert.equal(balance.balance, 14360);
  await repository.markPaid('sandbox_trip-1', 123, payment, order);
  assert.equal(updates, 1);
  assert.equal(balanceWrites, 1);
  await assert.rejects(repository.markPaid('sandbox_trip-1', 456, { ...payment, id: 456 }, order));
  assert.equal(updates, 1);
  assert.equal(balance.balance, 14360);
  Object.assign(trip, { status: 'completed', paymentStatus: 'pending', driverEarnings: 1 });
  await assert.rejects(repository.markPaid('sandbox_trip-1', 123, payment, order));
  assert.equal(balanceWrites, 1);
  assert.equal(balance.balance, 14360);
});
