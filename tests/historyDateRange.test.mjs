import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/utils/historyDateRange.js', import.meta.url), 'utf8');
const { parseHistoryDateRange } = await import(
  `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);

assert.deepEqual(parseHistoryDateRange('2024-02-29', '2024-03-01'), {
  startMs: Date.parse('2024-02-29T05:00:00.000Z'),
  endMs: Date.parse('2024-03-02T05:00:00.000Z'),
});
assert.equal(parseHistoryDateRange('2025-02-29', '2025-03-01'), null);
assert.equal(parseHistoryDateRange('2026-11-14', '2026-11-13'), null);
assert.equal(parseHistoryDateRange('', '2026-11-13'), null);
assert.equal(parseHistoryDateRange('2026-11-13', '2026-11-13').endMs,
  Date.parse('2026-11-14T05:00:00.000Z'));

console.log('History date ranges in Bogota passed');
