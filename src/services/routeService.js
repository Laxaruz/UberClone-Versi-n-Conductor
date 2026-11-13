const OSRM_URL = 'https://router.project-osrm.org/route/v1/driving';

function validCoordinates(point) {
  return Number.isFinite(point?.latitude) && Math.abs(point.latitude) <= 90
    && Number.isFinite(point?.longitude) && Math.abs(point.longitude) <= 180;
}

export function routeUrl(start, end) {
  if (!validCoordinates(start) || !validCoordinates(end)) throw new Error('invalidRoutePoint');
  return `${OSRM_URL}/${start.longitude},${start.latitude};${end.longitude},${end.latitude}`
    + '?overview=full&geometries=geojson&steps=false';
}

export function parseRoute(data) {
  const first = data?.routes?.[0];
  const points = first?.geometry?.coordinates;
  if (data?.code !== 'Ok' || !Number.isFinite(first?.distance) || first.distance < 0
    || !Number.isFinite(first?.duration) || first.duration < 0
    || !Array.isArray(points) || points.length < 2) throw new Error('routeUnavailable');

  const coordinates = points.map((point) => ({ latitude: point?.[1], longitude: point?.[0] }));
  if (!coordinates.every(validCoordinates)) throw new Error('routeUnavailable');

  return { coordinates, distanceMeters: first.distance, durationSeconds: first.duration };
}

export async function getDrivingRoute(start, end) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(routeUrl(start, end), { signal: controller.signal });
    if (!response.ok) throw new Error('routeUnavailable');
    return parseRoute(await response.json());
  } finally {
    clearTimeout(timeout);
  }
}
