function validCashTrip(trip, driverId) {
  return trip?.driverId === driverId && trip.status === 'completed'
    && trip.paymentMethod === 'cash' && trip.paymentStatus === 'pending'
    && Number.isSafeInteger(trip.fare) && trip.fare > 0
    && Number.isSafeInteger(trip.commission) && trip.commission >= 0
    && Number.isSafeInteger(trip.tip) && trip.tip >= 0
    && Number.isFinite(trip.commissionRate) && trip.commissionRate >= 0
    && trip.commissionRate <= 1
    && trip.commission === Math.round(trip.fare * trip.commissionRate)
    && Number.isSafeInteger(trip.driverEarnings)
    && trip.driverEarnings === trip.fare - trip.commission + trip.tip;
}

function createCashRepository(database) {
  return {
    recordCashReceipt: (tripId, driverId) => database.runTransaction(async (transaction) => {
      const tripRef = database.collection('trips').doc(tripId);
      const receiptRef = database.collection('cashReceipts').doc(tripId);
      const balanceRef = database.collection('driverBalances').doc(driverId);
      const tripSnapshot = await transaction.get(tripRef);
      const receiptSnapshot = await transaction.get(receiptRef);
      const balanceSnapshot = await transaction.get(balanceRef);
      const trip = tripSnapshot.data();
      if (!trip || trip.driverId !== driverId) throw new Error('Trip not found');
      if (receiptSnapshot.exists) {
        const receipt = receiptSnapshot.data();
        if (trip.status !== 'paid' || trip.paymentStatus !== 'cash_received'
          || receipt.driverId !== driverId) throw new Error('Cash receipt mismatch');
        return { paymentStatus: 'cash_received', balance: balanceSnapshot.data()?.balance ?? 0,
          receiptId: tripId, alreadyRecorded: true };
      }
      if (!validCashTrip(trip, driverId)) throw new Error('Trip is not eligible for cash');
      const balance = balanceSnapshot.data()?.balance ?? 0;
      if (!Number.isSafeInteger(balance) || !Number.isSafeInteger(balance - trip.commission)) {
        throw new Error('Invalid balance');
      }
      const nextBalance = balance - trip.commission;
      const now = new Date();
      transaction.create(receiptRef, { driverId, tripId, fare: trip.fare,
        commission: trip.commission, balanceAfter: nextBalance, createdAt: now });
      transaction.set(balanceRef, { balance: nextBalance, updatedAt: now }, { merge: true });
      transaction.update(tripRef, { status: 'paid', paymentStatus: 'cash_received',
        paymentId: `cash_${tripId}`, paymentUpdatedAt: now });
      return { paymentStatus: 'cash_received', balance: nextBalance,
        receiptId: tripId, alreadyRecorded: false };
    }),
  };
}

module.exports = { validCashTrip, createCashRepository };
