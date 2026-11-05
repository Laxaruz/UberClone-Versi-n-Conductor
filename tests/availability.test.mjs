import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/utils/canEnableAvailability.js', import.meta.url), 'utf8');
const { canEnableAvailability } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);

assert.equal(canEnableAvailability({ approvalStatus: 'pending_demo' }, false), false);
assert.equal(canEnableAvailability({ approvalStatus: 'pending_demo' }, true), false);
assert.equal(canEnableAvailability(null, true), false);
assert.equal(canEnableAvailability({ approvalStatus: 'approved' }, false), false);
assert.equal(canEnableAvailability({ approvalStatus: 'approved' }, true), true);
assert.equal(canEnableAvailability({ approvalStatus: 'approved_demo' }, false), false);
assert.equal(canEnableAvailability({ approvalStatus: 'approved_demo' }, true), true);
console.log('7 availability cases passed');
