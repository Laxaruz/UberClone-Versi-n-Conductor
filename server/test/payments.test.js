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
    const summary = await fetch(`${server.base}/api/trips/trip-1`, { headers: { authorization: 'Bearer owner' } });
    assert.equal((await summary.json()).checkoutEnabled, true);
    const first = await post('owner', { fare: 1 });
    assert.equal(first.status, 200);
    assert.deepEqual(await first.json(), { preferenceId: 'pref-1', checkoutUrl: 'https://sandbox.mercadopago.com/test' });
    assert.equal((await post('owner')).status, 200);
    assert.equal(calls, 1);
    trip.paymentCheckoutUrl = 'https://mercadopago.com/checkout';
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
    assert.equal((await post(`ts=1700000000,v1=${signature}`)).status, 200);
    assert.equal(trip.status, 'paid');
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
    total_amount: 19200, paid_amount: 19200, refunded_amount: 0,
    payments: [{ id: 123, status: 'approved' }],
  };
  assert.equal(canStartCheckout(trip), true);
  assert.equal(matchesApprovedTestPayment(payment, order, 'trip-1', trip), true);
  assert.equal(matchesApprovedTestPayment({ ...payment, live_mode: true }, order, 'trip-1', trip), false);
  assert.equal(matchesApprovedTestPayment(payment, { ...order, preference_id: 'other' }, 'trip-1', trip), false);
  assert.equal(matchesApprovedTestPayment({ ...payment, currency_id: 'USD' }, order, 'trip-1', trip), false);
  assert.equal(matchesApprovedTestPayment(payment, { ...order, status: 'opened' }, 'trip-1', trip), false);
  assert.equal(matchesApprovedTestPayment(payment, { ...order, paid_amount: 1 }, 'trip-1', trip), false);
  assert.equal(canStartCheckout({ ...trip, paymentEligible: undefined }), false);
  assert.equal(isSandboxCheckoutUrl('https://sandbox.mercadopago.com/test'), true);
  assert.equal(isSandboxCheckoutUrl('https://mercadopago.com/test'), false);
  assert.equal(isSandboxCheckoutUrl('https://sandbox.mercadopago.com.evil.test/'), false);
});

test('repository marks the completed trip paid only once', async () => {
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
    total_amount: 19200, paid_amount: 19200, refunded_amount: 0,
    payments: [{ id: 123, status: 'approved' }],
  };
  let updates = 0;
  const database = {
    collection: () => ({ doc: () => ({}) }),
    runTransaction: async (callback) => callback({
      get: async () => ({ data: () => trip }),
      update: (_ref, fields) => { updates += 1; Object.assign(trip, fields); },
    }),
  };
  const repository = createPaymentRepository(database);
  await repository.markPaid('trip-1', 123, payment, order);
  assert.equal(trip.status, 'paid');
  assert.equal(trip.paymentStatus, 'approved');
  assert.equal(trip.paymentId, '123');
  await repository.markPaid('trip-1', 123, payment, order);
  assert.equal(updates, 1);
});
