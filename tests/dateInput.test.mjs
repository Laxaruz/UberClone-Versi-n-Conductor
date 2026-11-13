import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/utils/dateInput.js', import.meta.url), 'utf8');
const { toIsoDate, fromIsoDate } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);

assert.equal(toIsoDate('8', '1', '2000'), '2000-01-08');
assert.equal(toIsoDate('29', '2', '2000'), '2000-02-29');
assert.equal(toIsoDate('29', '2', '2001'), null);
assert.equal(toIsoDate('31', '4', '2026'), null);
assert.equal(toIsoDate('0', '1', '2026'), null);
assert.equal(toIsoDate('1', '13', '2026'), null);
assert.equal(toIsoDate('1', '1', 'abcd'), null);
assert.deepEqual(fromIsoDate('2026-12-30', new Date(2000, 0, 1)),
  { day: '30', month: '12', year: '2026' });

console.log('Date input cases passed');
