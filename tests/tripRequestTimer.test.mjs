import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/utils/tripRequestTimer.js', import.meta.url), 'utf8');
const { REQUEST_TIMEOUT_MS, remainingRequestSeconds, transitionTripRequest } = await import(
  `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`
);

const receivedAt = 1_000_000;
const requested = { id: 'demo-1', status: 'requested', expiresAt: receivedAt + REQUEST_TIMEOUT_MS };

assert.equal(REQUEST_TIMEOUT_MS, 15_000);
assert.equal(remainingRequestSeconds(requested.expiresAt, receivedAt), 15);
assert.equal(remainingRequestSeconds(requested.expiresAt, receivedAt + 1_000), 14);
assert.equal(remainingRequestSeconds(requested.expiresAt, requested.expiresAt - 1), 1);
assert.equal(remainingRequestSeconds(requested.expiresAt, requested.expiresAt), 0);
assert.equal(remainingRequestSeconds(requested.expiresAt, requested.expiresAt + 5_000), 0);

const accepted = transitionTripRequest(requested, 'accept', receivedAt + 2_000);
assert.equal(accepted.status, 'accepted');
assert.equal(transitionTripRequest(accepted, 'reject', receivedAt + 3_000), accepted);
assert.equal(transitionTripRequest(accepted, 'expire', requested.expiresAt), accepted);

const rejected = transitionTripRequest(requested, 'reject', receivedAt + 2_000);
assert.equal(rejected.status, 'rejected');
assert.equal(transitionTripRequest(rejected, 'accept', receivedAt + 3_000), rejected);

const expired = transitionTripRequest(requested, 'expire', requested.expiresAt);
assert.equal(expired.status, 'expired');
assert.equal(transitionTripRequest(expired, 'accept', requested.expiresAt + 1), expired);
assert.equal(transitionTripRequest(requested, 'accept', requested.expiresAt).status, 'expired');
assert.equal(transitionTripRequest(requested, 'expire', receivedAt + 2_000), requested);

console.log('15 trip request timer and transition cases passed');
