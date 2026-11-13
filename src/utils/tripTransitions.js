export function transitionTrip(trip, action, now = Date.now(), finalAmounts = null) {
  if (!trip) return trip;

  if (action === 'start_pickup' && trip.status === 'accepted') {
    return { ...trip, status: 'driver_arriving', pickupStartedAt: now };
  }
  if (action === 'confirm_arrival' && trip.status === 'driver_arriving' && !trip.pickupReachedAt) {
    return { ...trip, pickupReachedAt: now };
  }
  if (action === 'board_passenger' && trip.status === 'driver_arriving' && trip.pickupReachedAt) {
    return { ...trip, status: 'in_progress', boardedAt: now };
  }
  if (action === 'complete' && trip.status === 'in_progress' &&
    finalAmounts && ['fare', 'commission', 'driverEarnings'].every((key) => Number.isInteger(finalAmounts[key]) && finalAmounts[key] >= 0)) {
    return {
      ...trip,
      status: 'completed',
      completedAt: now,
      finalFare: finalAmounts.fare,
      finalCommission: finalAmounts.commission,
      finalDriverEarnings: finalAmounts.driverEarnings,
      paymentStatus: 'pending',
    };
  }
  return trip;
}
