import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/services/routeService.js', import.meta.url), 'utf8');
const { routeUrl, parseRoute } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);

const url = routeUrl({ latitude: 6.25, longitude: -75.57 }, { latitude: 6.26, longitude: -75.58 });
assert.equal(url, 'https://router.project-osrm.org/route/v1/driving/-75.57,6.25;-75.58,6.26?overview=full&geometries=geojson&steps=false');
assert.throws(() => routeUrl({ latitude: 91, longitude: 0 }, { latitude: 6, longitude: -75 }));

const route = parseRoute({ code: 'Ok', routes: [{
  distance: 3760.1, duration: 348.5,
  geometry: { coordinates: [[-75.57, 6.25], [-75.58, 6.26]] },
}] });
assert.equal(route.distanceMeters, 3760.1);
assert.equal(route.durationSeconds, 348.5);
assert.deepEqual(route.coordinates, [
  { latitude: 6.25, longitude: -75.57 },
  { latitude: 6.26, longitude: -75.58 },
]);
assert.throws(() => parseRoute({ code: 'NoRoute', routes: [] }));
assert.throws(() => parseRoute({ code: 'Ok', routes: [{ distance: 1, duration: 1,
  geometry: { coordinates: [[-75.57, 6.25], [-190, 6.26]] } }] }));

console.log('Route URL and OSRM response checks passed');
