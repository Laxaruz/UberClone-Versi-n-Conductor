const { createHmac, timingSafeEqual } = require('node:crypto');

function canStartCheckout(trip) {
  return trip?.status === 'completed'
    && trip.paymentMethod === 'mercadopago'
    && trip.paymentStatus === 'pending'
    && trip.paymentEligible === true
    && Number.isSafeInteger(trip.fare)
    && trip.fare > 0;
}

function isSandboxCheckoutUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'sandbox.mercadopago.com';
  } catch {
    return false;
  }
}

// AI-assisted: see docs/AI_LOG.md #40
function validWebhookSignature({ signature, requestId, dataId, secret }) {
  if (!signature || !requestId || !/^[0-9]+$/.test(dataId || '') || !secret) return false;
  const values = Object.fromEntries(signature.split(',').map((part) => part.trim().split('=')));
  if (!/^[0-9]+$/.test(values.ts || '') || !/^[a-f0-9]{64}$/i.test(values.v1 || '')) return false;

  const manifest = `id:${dataId};request-id:${requestId};ts:${values.ts};`;
  const expected = createHmac('sha256', secret).update(manifest).digest();
  return timingSafeEqual(expected, Buffer.from(values.v1, 'hex'));
}

function matchesApprovedTestPayment(payment, order, tripId, trip) {
  return Boolean(trip)
    && payment?.status === 'approved'
    && payment.live_mode === false
    && payment.external_reference === tripId
    && payment.currency_id === 'COP'
    && payment.transaction_amount === trip.fare
    && String(payment.order?.id) === String(order?.id)
    && order.status === 'closed'
    && order.total_amount === trip.fare
    && order.paid_amount === trip.fare
    && order.refunded_amount === 0
    && Array.isArray(order.payments)
    && order.payments.some((entry) => String(entry.id) === String(payment.id)
      && entry.status === 'approved')
    && order?.preference_id === trip.paymentPreferenceId
    && order?.external_reference === tripId
    && (canStartCheckout(trip)
      || (trip.status === 'paid' && trip.paymentStatus === 'approved'
        && String(trip.paymentId) === String(payment.id)));
}

module.exports = { canStartCheckout, isSandboxCheckoutUrl, validWebhookSignature, matchesApprovedTestPayment };
