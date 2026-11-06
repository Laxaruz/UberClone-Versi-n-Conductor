import { pricing } from '../config/pricing';
import { calculateFare } from '../utils/calculateFare';

// AI-assisted: see docs/AI_LOG.md #2
export function createTrip({
  driverId,
  passengerId,
  origin,
  destination,
  distanceKm,
  durationMin,
  category,
  tip = 0,
  paymentMethod,
}) {
  const amounts = calculateFare({ distanceKm, durationMin, category, tip });

  return {
    driverId,
    passengerId,
    origin,
    destination,
    distanceKm,
    durationMin,
    category,
    tip,
    paymentMethod,
    fare: amounts.fare,
    commission: amounts.commission,
    driverEarnings: amounts.driverEarnings,
    commissionRate: pricing.commissionRate,
    status: 'requested',
    paymentStatus: 'pending',
  };
}
