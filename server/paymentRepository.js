const { canStartCheckout, matchesApprovedTestPayment } = require('./paymentChecks');

// AI-assisted: see docs/AI_LOG.md #40
function createPaymentRepository(database, testAccounts) {
  const tripRef = (tripId) => database.collection('trips').doc(tripId);

  return {
    savePreference: (tripId, preferenceId, checkoutUrl) => database.runTransaction(async (transaction) => {
      const ref = tripRef(tripId);
      const snapshot = await transaction.get(ref);
      const trip = snapshot.data();
      if (!canStartCheckout(trip)) throw new Error('Trip is not eligible');
      if (trip.paymentPreferenceId && trip.paymentCheckoutUrl) {
        return { paymentPreferenceId: trip.paymentPreferenceId, paymentCheckoutUrl: trip.paymentCheckoutUrl };
      }
      transaction.update(ref, { paymentPreferenceId: preferenceId, paymentCheckoutUrl: checkoutUrl });
      return { paymentPreferenceId: preferenceId, paymentCheckoutUrl: checkoutUrl };
    }),

    markPaid: (tripId, paymentId, payment, order) => database.runTransaction(async (transaction) => {
      const ref = tripRef(tripId);
      const snapshot = await transaction.get(ref);
      const trip = snapshot.data();
      if (!matchesApprovedTestPayment(payment, order, tripId, trip, testAccounts)) {
        throw new Error('Payment does not match trip');
      }
      if (trip.status === 'paid' && trip.paymentStatus === 'approved'
        && String(trip.paymentId) === String(paymentId)) return;
      transaction.update(ref, {
        status: 'paid', paymentStatus: 'approved', paymentId: String(paymentId),
        paymentUpdatedAt: new Date(),
      });
    }),
  };
}

module.exports = { createPaymentRepository };
