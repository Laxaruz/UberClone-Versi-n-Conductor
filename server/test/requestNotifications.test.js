const assert = require('node:assert/strict');
const test = require('node:test');
const { notifyNewRequest } = require('../requestNotifications');

function setup({ expired = false, sendFailsOnce = false, devicesFailOnce = false, partialFailure = false } = {}) {
  const request = {
    status: 'requested',
    expiresAt: { toMillis: () => Date.now() + (expired ? -1000 : 10000) },
  };
  const messages = [];
  let sendAttempts = 0;
  let deviceReads = 0;
  const drivers = [
    { approvalStatus: 'approved_demo', available: true, language: 'es', fid: 'es-device' },
    ...(partialFailure ? [{ approvalStatus: 'approved', available: true, language: 'es', fid: 'es-device-2' }] : []),
    { approvalStatus: 'approved', available: true, language: 'en', fid: 'en-device' },
    { approvalStatus: 'pending_demo', available: true, language: 'es', fid: 'pending-device' },
  ];
  const database = {
    collection(name) {
      if (name === 'tripRequests') return { doc: () => ({}) };
      return {
        where: () => ({
          get: async () => ({ docs: drivers.map((driver) => ({
            data: () => driver,
            ref: { collection: () => ({ get: async () => {
              if (devicesFailOnce && deviceReads++ === 0) throw new Error('Temporary Firestore error');
              return { docs: [{ data: () => ({ fid: driver.fid }) }] };
            } }) },
          })) }),
        }),
      };
    },
    async runTransaction(work) {
      return work({
        get: async () => ({ exists: true, data: () => request }),
        update: () => { request.pushClaimedAt = true; },
      });
    },
  };
  const messaging = {
    async sendEachForMulticast(message) {
      if (sendFailsOnce && sendAttempts++ === 0) throw new Error('Temporary FCM error');
      messages.push(message);
      if (partialFailure && message.fids.length === 2) {
        return { successCount: 1, responses: [{ success: true }, { success: false }] };
      }
      return { successCount: message.fids.length };
    },
  };
  return { database, messaging, messages, request };
}

test('only approved available drivers receive one short-lived notification', async () => {
  const { database, messaging, messages } = setup();
  assert.equal(await notifyNewRequest(database, messaging, 'request-1'), 2);
  assert.equal(messages.length, 2);
  assert.deepEqual(messages.flatMap((message) => message.fids).sort(), ['en-device', 'es-device']);
  assert.ok(messages.every((message) => message.data.requestId === 'request-1'
    && message.android.ttl <= 15000));
  assert.equal(await notifyNewRequest(database, messaging, 'request-1'), 0);
  assert.equal(messages.length, 2);
});

test('expired requests do not send notifications', async () => {
  const { database, messaging, messages } = setup({ expired: true });
  assert.equal(await notifyNewRequest(database, messaging, 'request-2'), 0);
  assert.equal(messages.length, 0);
});

test('a temporary FCM failure retries without sending twice', async () => {
  const { database, messaging, messages } = setup({ sendFailsOnce: true });
  assert.equal(await notifyNewRequest(database, messaging, 'request-3', Date.now(), async () => {}), 2);
  assert.deepEqual(messages.flatMap((message) => message.fids).sort(), ['en-device', 'es-device']);
  assert.equal(await notifyNewRequest(database, messaging, 'request-3'), 0);
});

test('a temporary device read failure retries before sending', async () => {
  const { database, messaging, messages } = setup({ devicesFailOnce: true });
  assert.equal(await notifyNewRequest(database, messaging, 'request-4', Date.now(), async () => {}), 2);
  assert.equal(messages.length, 2);
});

test('a partial FCM response retries only the failed device', async () => {
  const { database, messaging, messages } = setup({ partialFailure: true });
  assert.equal(await notifyNewRequest(database, messaging, 'request-5', Date.now(), async () => {}), 3);
  assert.deepEqual(messages.map((message) => message.fids),
    [['es-device', 'es-device-2'], ['es-device-2'], ['en-device']]);
});
