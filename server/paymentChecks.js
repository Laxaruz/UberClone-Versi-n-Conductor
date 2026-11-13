const { createHmac, timingSafeEqual } = require('node:crypto');

function canStartCheckout(trip) {
  return trip?.status === 'completed'
    && trip.paymentMethod === 'mercadopago'
    && trip.paymentStatus === 'pending'
    && trip.paymentEligible === true
    && Number.isSafeInteger(trip.fare)
    && trip.fare > 0;
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

function matchesTestEnvironment(payment, order, tripId, trip, testAccounts) {
  if (payment?.live_mode === false) return order?.is_test !== false;
  return payment?.live_mode === true
    && order?.is_test === true
    && trip?.testFixture === true
    && tripId.startsWith('sandbox_')
    && /^[0-9]+$/.test(testAccounts?.sellerId || '')
    && /^[0-9]+$/.test(testAccounts?.buyerId || '')
    && String(payment.collector_id) === testAccounts.sellerId
    && String(payment.payer?.id) === testAccounts.buyerId
    && String(order.collector?.id) === testAccounts.sellerId
    && String(order.payer?.id) === testAccounts.buyerId;
}

function matchesApprovedTestPayment(payment, order, tripId, trip, testAccounts) {
  return Boolean(trip)
    && payment?.status === 'approved'
    && matchesTestEnvironment(payment, order, tripId, trip, testAccounts)
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

module.exports = { canStartCheckout, validWebhookSignature, matchesApprovedTestPayment };
