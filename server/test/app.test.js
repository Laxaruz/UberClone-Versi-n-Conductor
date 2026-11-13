const assert = require('node:assert/strict');
const { test } = require('node:test');
const { createApp } = require('../app');

// AI-assisted: see docs/AI_LOG.md #38
test('health and owner-only trip read', async () => {
  const trip = {
    driverId: 'driver-1', status: 'completed', paymentMethod: 'mercadopago',
    fare: 19200, paymentStatus: 'pending', passengerName: 'Private passenger',
    origin: { address: 'Private address', lat: 6.25, lng: -75.57 },
  };
  let reads = 0;
  const app = createApp({
    verifyIdToken: async (token) => {
      if (token === 'owner') return { uid: 'driver-1' };
      if (token === 'other') return { uid: 'driver-2' };
      throw new Error('Invalid token');
    },
    findTrip: async (id) => {
      reads += 1;
      if (id === 'unavailable') throw new Error('Database offline');
      return id === 'trip-1' ? trip : null;
    },
  });
  const server = await new Promise((resolve) => {
    const listening = app.listen(0, '127.0.0.1', () => resolve(listening));
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  const get = (path, token) => fetch(`${base}${path}`, {
    headers: token ? { authorization: `Bearer ${token}` } : {},
  });

  try {
    const health = await get('/health');
    assert.equal(health.status, 200);
    assert.deepEqual(await health.json(), { status: 'ok' });

    assert.equal((await get('/api/trips/trip-1')).status, 401);
    assert.equal((await get('/api/trips/trip-1', 'invalid')).status, 401);
    assert.equal(reads, 0);
    assert.equal((await get('/api/trips/trip-1', 'other')).status, 404);
    assert.equal((await get('/api/trips/missing', 'owner')).status, 404);
    assert.equal((await get('/api/trips/bad.id', 'owner')).status, 400);
    assert.equal((await get('/api/trips/unavailable', 'owner')).status, 503);

    const owner = await get('/api/trips/trip-1', 'owner');
    assert.equal(owner.status, 200);
    assert.deepEqual(await owner.json(), {
      id: 'trip-1', status: 'completed', paymentMethod: 'mercadopago',
      fare: 19200, paymentStatus: 'pending',
    });
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
