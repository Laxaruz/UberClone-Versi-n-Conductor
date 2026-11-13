const express = require('express');

function createApp({ verifyIdToken, findTrip }) {
  const app = express();
  app.disable('x-powered-by');

  app.get('/health', (_request, response) => {
    response.json({ status: 'ok' });
  });

  // AI-assisted: see docs/AI_LOG.md #38
  app.get('/api/trips/:tripId', async (request, response) => {
    const authorization = /^Bearer ([^\s]+)$/i.exec(request.get('authorization') || '');
    if (!authorization) return response.status(401).json({ error: 'Unauthorized' });

    let uid;
    try {
      const user = await verifyIdToken(authorization[1]);
      uid = user?.uid;
    } catch {
      return response.status(401).json({ error: 'Unauthorized' });
    }
    if (!uid) return response.status(401).json({ error: 'Unauthorized' });

    const tripId = request.params.tripId;
    if (!/^[A-Za-z0-9_-]{1,128}$/.test(tripId)) {
      return response.status(400).json({ error: 'Invalid trip ID' });
    }

    let trip;
    try {
      trip = await findTrip(tripId);
    } catch {
      return response.status(503).json({ error: 'Trip unavailable' });
    }
    if (!trip || trip.driverId !== uid) {
      return response.status(404).json({ error: 'Trip not found' });
    }

    return response.json({
      id: tripId,
      status: trip.status,
      paymentMethod: trip.paymentMethod,
      fare: trip.fare,
      paymentStatus: trip.paymentStatus,
    });
  });

  return app;
}

module.exports = { createApp };
