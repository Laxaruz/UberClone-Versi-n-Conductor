export const REQUEST_TIMEOUT_MS = 15_000;

export function remainingRequestSeconds(expiresAt, now = Date.now()) {
  if (!Number.isFinite(expiresAt)) return 0;
  return Math.max(0, Math.ceil((expiresAt - now) / 1000));
}

export function transitionTripRequest(request, action, now = Date.now()) {
  if (!request || request.status !== 'requested') return request;
  if (remainingRequestSeconds(request.expiresAt, now) === 0) return { ...request, status: 'expired' };
  if (action === 'accept') return { ...request, status: 'accepted' };
  if (action === 'reject') return { ...request, status: 'rejected' };
  return request;
}
