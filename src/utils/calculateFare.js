import { pricing } from '../config/pricing';

// AI-assisted: see docs/AI_LOG.md #3
export function calculateFare({ distanceKm, durationMin, category, tip = 0 }) {
  if (!Object.prototype.hasOwnProperty.call(pricing.multipliers, category)) {
    throw new Error('Invalid trip category');
  }

  if (
    !Number.isFinite(distanceKm) ||
    distanceKm < 0 ||
    !Number.isFinite(durationMin) ||
    durationMin < 0 ||
    !Number.isInteger(tip) ||
    tip < 0
  ) {
    throw new Error('Invalid trip values');
  }

  const multiplier = pricing.multipliers[category];
  const subtotal =
    (pricing.baseFare + distanceKm * pricing.perKm + durationMin * pricing.perMinute) *
    multiplier;
  const fare = Math.round(Math.max(pricing.minimumFare, subtotal) / 100) * 100;
  const commission = Math.round(fare * pricing.commissionRate);
  const driverEarnings = fare - commission + tip;

  return { fare, commission, driverEarnings };
}
