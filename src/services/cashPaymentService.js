import { ensureDemoUser } from './firebaseClient';

export const cashServiceConfigured = Boolean(process.env.EXPO_PUBLIC_API_BASE_URL);

export async function recordCashReceipt(tripId) {
  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, '');
  if (!baseUrl || !/^[A-Za-z0-9_-]{1,128}$/.test(tripId)) {
    throw new Error('Cash service is not configured');
  }
  const user = await ensureDemoUser();
  const token = await user.getIdToken();
  const response = await fetch(`${baseUrl}/api/trips/${tripId}/cash-receipt`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Cash receipt was not confirmed');
  const result = await response.json();
  if (result.paymentStatus !== 'cash_received' || !Number.isSafeInteger(result.balance)) {
    throw new Error('Invalid cash receipt response');
  }
  return result;
}
