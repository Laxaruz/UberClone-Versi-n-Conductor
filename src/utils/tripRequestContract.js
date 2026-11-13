const categories = ['economy', 'xl', 'premium'];
const paymentMethods = ['cash', 'mercadopago', 'stripe'];
const requestTimeoutMs = 15_000;

function validPlace(place) {
  return place && typeof place.address === 'string' && place.address.trim()
    && Number.isFinite(place.lat) && Math.abs(place.lat) <= 90
    && Number.isFinite(place.lng) && Math.abs(place.lng) <= 180;
}

export function requestExpiresAt(data) {
  const value = data?.expiresAt?.toMillis?.();
  return Number.isFinite(value) ? value : null;
}

export function canAcceptTripRequest(data, now = Date.now()) {
  const createdAt = data?.createdAt?.toMillis?.();
  const expiresAt = requestExpiresAt(data);
  return data?.status === 'requested' && data.acceptedBy == null
    && Number.isFinite(createdAt) && expiresAt - createdAt === requestTimeoutMs
    && now < expiresAt;
}

export function mapTripRequest(id, data) {
  const receivedAt = data?.createdAt?.toMillis?.();
  const expiresAt = requestExpiresAt(data);
  if (!id || !Number.isFinite(receivedAt) || expiresAt === null
    || expiresAt - receivedAt !== requestTimeoutMs
    || data.status !== 'requested' || data.acceptedBy != null
    || !validPlace(data.origin) || !validPlace(data.destination)
    || !categories.includes(data.category) || !paymentMethods.includes(data.paymentMethod)
    || typeof data.passengerName !== 'string' || !data.passengerName.trim()
    || !Number.isFinite(data.distanceKm) || data.distanceKm < 0
    || !Number.isFinite(data.durationMin) || data.durationMin < 0
    || !Number.isInteger(data.fare) || data.fare < 0
    || !Number.isInteger(data.commission) || data.commission < 0
    || !Number.isInteger(data.driverEarnings) || data.driverEarnings < 0) return null;

  return {
    id, source: 'firestore_test', status: 'requested', receivedAt, expiresAt,
    passengerName: data.passengerName, origin: data.origin, destination: data.destination,
    distanceKm: data.distanceKm, durationMin: data.durationMin,
    category: data.category, paymentMethod: data.paymentMethod,
    fare: data.fare, commission: data.commission, driverEarnings: data.driverEarnings,
  };
}
