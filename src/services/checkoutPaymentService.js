import { ensureDemoUser } from './firebaseClient';

export const checkoutServiceConfigured = Boolean(process.env.EXPO_PUBLIC_API_BASE_URL);

async function requestTrip(tripId, method) {
  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, '');
  if (!baseUrl || !/^[A-Za-z0-9_-]{1,128}$/.test(tripId)) {
    throw new Error('Checkout service is not configured');
  }

  const user = await ensureDemoUser();
  const token = await user.getIdToken();
  const suffix = method === 'POST' ? '/checkout' : '';
  const response = await fetch(`${baseUrl}/api/trips/${tripId}${suffix}`, {
    method,
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Checkout request failed');
  return response.json();
}

export async function getTripPayment(tripId) {
  const trip = await requestTrip(tripId, 'GET');
  if (trip.id !== tripId || !['pending', 'approved'].includes(trip.paymentStatus)
    || typeof trip.checkoutAvailable !== 'boolean') {
    throw new Error('Invalid trip payment response');
  }
  return trip;
}

export async function startTestCheckout(tripId) {
  const result = await requestTrip(tripId, 'POST');
  if (!result.preferenceId || !/^https:\/\/sandbox\.mercadopago\.com(?:\.co)?\//.test(result.checkoutUrl || '')) {
    throw new Error('Invalid test checkout URL');
  }
  return result.checkoutUrl;
}
