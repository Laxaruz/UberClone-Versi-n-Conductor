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
      if (typeof trip.driverId !== 'string' || !trip.driverId
        || !Number.isSafeInteger(trip.commission) || trip.commission < 0
        || !Number.isFinite(trip.commissionRate) || trip.commissionRate < 0
        || trip.commissionRate > 1
        || trip.commission !== Math.round(trip.fare * trip.commissionRate)
        || !Number.isSafeInteger(trip.tip) || trip.tip < 0
        || !Number.isSafeInteger(trip.driverEarnings)
        || trip.driverEarnings !== trip.fare - trip.commission + trip.tip) {
        throw new Error('Invalid trip earnings');
      }
      const balanceRef = database.collection('driverBalances').doc(trip.driverId);
      const balanceSnapshot = await transaction.get(balanceRef);
      const balance = balanceSnapshot.data()?.balance ?? 0;
      const nextBalance = balance + trip.driverEarnings;
      if (!Number.isSafeInteger(balance) || !Number.isSafeInteger(nextBalance)) {
        throw new Error('Invalid driver balance');
      }
      const now = new Date();
      transaction.set(balanceRef, { balance: nextBalance, updatedAt: now }, { merge: true });
      transaction.update(ref, {
        status: 'paid', paymentStatus: 'approved', paymentId: String(paymentId),
        paymentUpdatedAt: now,
      });
    }),
  };
}

module.exports = { createPaymentRepository };
