import { pricing } from '../config/pricing';
import { calculateFare } from './calculateFare';

// AI-assisted: see docs/AI_LOG.md #35
export function buildCompletedTrip(trip, request, driverId, completedAt) {
  if (!trip?.id || trip.status !== 'completed' || !driverId
    || request?.status !== 'accepted' || request.acceptedBy !== driverId
    || trip.paymentMethod !== request.paymentMethod) {
    throw new Error('Invalid completed trip');
  }

  const amounts = calculateFare({
    distanceKm: request.distanceKm,
    durationMin: request.durationMin,
    category: request.category,
    tip: 0,
  });
  if (request.fare !== amounts.fare || request.commission !== amounts.commission
    || request.driverEarnings !== amounts.driverEarnings
    || trip.finalFare !== amounts.fare || trip.finalCommission !== amounts.commission
    || trip.finalDriverEarnings !== amounts.driverEarnings || trip.tip !== 0) {
    throw new Error('Trip amounts do not match the accepted request');
  }

  return {
    requestId: trip.id,
    driverId,
    passengerName: request.passengerName,
    origin: request.origin,
    destination: request.destination,
    distanceKm: request.distanceKm,
    durationMin: request.durationMin,
    category: request.category,
    paymentMethod: request.paymentMethod,
    fare: amounts.fare,
    commission: amounts.commission,
    driverEarnings: amounts.driverEarnings,
    commissionRate: pricing.commissionRate,
    tip: 0,
    status: 'completed',
    paymentStatus: 'pending',
    paymentId: null,
    createdAt: request.createdAt,
    completedAt,
  };
}
