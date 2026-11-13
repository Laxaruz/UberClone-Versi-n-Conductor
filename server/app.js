const express = require('express');
const { canStartCheckout, isSandboxCheckoutUrl, validWebhookSignature, matchesApprovedTestPayment } = require('./paymentChecks');

function createApp({ verifyIdToken, findTrip, savePreference, markPaid, recordCashReceipt, mercadoPago, webhookSecret, notificationUrl, paymentsTestMode = false }) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json());

  async function authenticatedTrip(request, response) {
    const authorization = /^Bearer ([^\s]+)$/i.exec(request.get('authorization') || '');
    if (!authorization) {
      response.status(401).json({ error: 'Unauthorized' });
      return null;
    }

    let uid;
    try {
      uid = (await verifyIdToken(authorization[1]))?.uid;
    } catch {
      response.status(401).json({ error: 'Unauthorized' });
      return null;
    }
    if (!uid) {
      response.status(401).json({ error: 'Unauthorized' });
      return null;
    }

    const tripId = request.params.tripId;
    if (!/^[A-Za-z0-9_-]{1,128}$/.test(tripId)) {
      response.status(400).json({ error: 'Invalid trip ID' });
      return null;
    }

    let trip;
    try {
      trip = await findTrip(tripId);
    } catch {
      response.status(503).json({ error: 'Trip unavailable' });
      return null;
    }
    if (!trip || trip.driverId !== uid) {
      response.status(404).json({ error: 'Trip not found' });
      return null;
    }
    return { trip, tripId };
  }

  app.get('/health', (_request, response) => {
    response.json({ status: 'ok' });
  });

  // AI-assisted: see docs/AI_LOG.md #38
  app.get('/api/trips/:tripId', async (request, response) => {
    const found = await authenticatedTrip(request, response);
    if (!found) return;
    const { trip, tripId } = found;

    return response.json({
      id: tripId,
      status: trip.status,
      paymentMethod: trip.paymentMethod,
      fare: trip.fare,
      paymentStatus: trip.paymentStatus,
      checkoutEnabled: Boolean(paymentsTestMode && mercadoPago && notificationUrl
        && webhookSecret && canStartCheckout(trip)),
    });
  });

  app.post('/api/trips/:tripId/cash-receipt', async (request, response) => {
    const found = await authenticatedTrip(request, response);
    if (!found) return;
    if (found.trip.paymentMethod !== 'cash') {
      return response.status(409).json({ error: 'Trip is not a cash trip' });
    }
    if (!recordCashReceipt) return response.status(503).json({ error: 'Cash service unavailable' });
    try {
      const receipt = await recordCashReceipt(found.tripId, found.trip.driverId);
      return response.json(receipt);
    } catch {
      return response.status(409).json({ error: 'Cash receipt could not be recorded' });
    }
  });

  // AI-assisted: see docs/AI_LOG.md #40
  app.post('/api/trips/:tripId/checkout', async (request, response) => {
    const found = await authenticatedTrip(request, response);
    if (!found) return;
    const { trip, tripId } = found;
    if (!paymentsTestMode || !mercadoPago || !notificationUrl || !webhookSecret) {
      return response.status(503).json({ error: 'Test payments are not configured' });
    }
    if (!canStartCheckout(trip)) {
      return response.status(409).json({ error: 'Trip is not eligible for test checkout' });
    }
    if (trip.paymentPreferenceId && trip.paymentCheckoutUrl) {
      if (!isSandboxCheckoutUrl(trip.paymentCheckoutUrl)) {
        return response.status(502).json({ error: 'Invalid test checkout response' });
      }
      return response.json({ preferenceId: trip.paymentPreferenceId, checkoutUrl: trip.paymentCheckoutUrl });
    }

    try {
      const preference = await mercadoPago.createPreference({ tripId, fare: trip.fare, notificationUrl });
      if (!preference?.id || !isSandboxCheckoutUrl(preference.sandbox_init_point)) {
        return response.status(502).json({ error: 'Invalid test checkout response' });
      }
      const saved = await savePreference(tripId, preference.id, preference.sandbox_init_point);
      if (!saved?.paymentPreferenceId || !isSandboxCheckoutUrl(saved.paymentCheckoutUrl)) {
        return response.status(502).json({ error: 'Invalid test checkout response' });
      }
      return response.json({ preferenceId: saved.paymentPreferenceId, checkoutUrl: saved.paymentCheckoutUrl });
    } catch {
      return response.status(503).json({ error: 'Test checkout unavailable' });
    }
  });

  // AI-assisted: see docs/AI_LOG.md #40
  app.post('/api/payments/webhook', async (request, response) => {
    if (!paymentsTestMode || !mercadoPago || !webhookSecret) {
      return response.status(503).json({ error: 'Test payments are not configured' });
    }
    const paymentId = request.query['data.id'];
    if (request.body?.type !== 'payment' || String(request.body?.data?.id) !== paymentId
      || !validWebhookSignature({
        signature: request.get('x-signature'),
        requestId: request.get('x-request-id'),
        dataId: paymentId,
        secret: webhookSecret,
      })) {
      return response.status(401).json({ error: 'Invalid notification' });
    }

    let payment;
    let order;
    try {
      payment = await mercadoPago.getPayment(paymentId);
      if (payment?.status !== 'approved') return response.sendStatus(200);
      if (!/^[0-9]+$/.test(String(payment.order?.id || ''))) {
        return response.status(422).json({ error: 'Invalid payment order' });
      }
      order = await mercadoPago.getMerchantOrder(payment.order.id);
    } catch {
      return response.status(503).json({ error: 'Payment verification unavailable' });
    }

    const tripId = payment.external_reference;
    if (!/^[A-Za-z0-9_-]{1,128}$/.test(tripId || '')) {
      return response.status(422).json({ error: 'Invalid payment reference' });
    }
    try {
      const trip = await findTrip(tripId);
      if (!trip || !matchesApprovedTestPayment(payment, order, tripId, trip)) {
        return response.status(422).json({ error: 'Payment does not match trip' });
      }
      await markPaid(tripId, paymentId, payment, order);
      return response.sendStatus(200);
    } catch {
      return response.status(503).json({ error: 'Payment update unavailable' });
    }
  });

  return app;
}

module.exports = { createApp };
