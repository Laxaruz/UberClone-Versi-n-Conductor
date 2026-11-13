const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');
const { createApp } = require('./app');
const { createMercadoPagoClient } = require('./mercadoPagoClient');
const { createPaymentRepository } = require('./paymentRepository');

const projectId = process.env.FIREBASE_PROJECT_ID;
const host = process.env.SERVER_HOST || '127.0.0.1';
const port = Number(process.env.SERVER_PORT || 3000);
if (!projectId) throw new Error('FIREBASE_PROJECT_ID is required');
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('SERVER_PORT must be a valid port');
}

// AI-assisted: see docs/AI_LOG.md #38
const firebaseApp = initializeApp({ credential: applicationDefault(), projectId });
const auth = getAuth(firebaseApp);
const database = getFirestore(firebaseApp);
const paymentRepository = createPaymentRepository(database);
const paymentsTestMode = process.env.MERCADOPAGO_TEST_MODE === 'true';
const notificationUrl = process.env.MERCADOPAGO_NOTIFICATION_URL;
if (notificationUrl && !/^https:\/\/[^\s/]+\//.test(notificationUrl)) {
  throw new Error('MERCADOPAGO_NOTIFICATION_URL must be an HTTPS URL');
}
const mercadoPago = paymentsTestMode && process.env.MERCADOPAGO_ACCESS_TOKEN
  ? createMercadoPagoClient(process.env.MERCADOPAGO_ACCESS_TOKEN)
  : null;
const app = createApp({
  verifyIdToken: (token) => auth.verifyIdToken(token),
  findTrip: async (tripId) => {
    const snapshot = await database.collection('trips').doc(tripId).get();
    return snapshot.exists ? snapshot.data() : null;
  },
  ...paymentRepository,
  mercadoPago,
  webhookSecret: process.env.MERCADOPAGO_WEBHOOK_SECRET,
  notificationUrl,
  paymentsTestMode,
});

app.listen(port, host, () => {
  console.log(`Server listening on ${host}:${port}`);
});
