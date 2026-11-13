const DAY_MS = 24 * 60 * 60 * 1000;
const BOGOTA_OFFSET_MS = 5 * 60 * 60 * 1000;

export function getEarningsBoundaries(now = new Date()) {
  const local = new Date(now.getTime() - BOGOTA_OFFSET_MS);
  const year = local.getUTCFullYear();
  const monthIndex = local.getUTCMonth();
  const day = local.getUTCDate();
  const calendarDay = Date.UTC(year, monthIndex, day);
  const today = calendarDay + BOGOTA_OFFSET_MS;
  const mondayOffset = (new Date(calendarDay).getUTCDay() + 6) % 7;
  const week = today - mondayOffset * DAY_MS;
  const month = Date.UTC(year, monthIndex, 1) + BOGOTA_OFFSET_MS;
  return { today, week, month, earliest: Math.min(week, month) };
}

function emptyTotals() {
  return { tripCount: 0, totalFare: 0, totalCommission: 0, totalTips: 0,
    netEarnings: 0, averagePerTrip: 0 };
}

function addTrip(totals, trip) {
  totals.tripCount += 1;
  totals.totalFare += trip.fare;
  totals.totalCommission += trip.commission;
  totals.totalTips += trip.tip;
  totals.netEarnings += trip.driverEarnings;
  totals.averagePerTrip = Math.round(totals.netEarnings / totals.tripCount);
}

function validAmounts(trip) {
  return Number.isSafeInteger(trip.fare) && trip.fare >= 0
    && Number.isSafeInteger(trip.commission) && trip.commission >= 0
    && Number.isSafeInteger(trip.tip) && trip.tip >= 0
    && Number.isSafeInteger(trip.driverEarnings)
    && trip.driverEarnings === trip.fare - trip.commission + trip.tip;
}

export function summarizeEarnings(trips, now = new Date()) {
  const boundaries = getEarningsBoundaries(now);
  const periods = { today: emptyTotals(), week: emptyTotals(), month: emptyTotals() };
  const breakdown = { confirmedGateway: 0, pendingGateway: 0,
    pendingCashCommission: 0, deductedCashCommission: 0 };
  const seen = new Set();

  for (const trip of trips) {
    if (!trip?.id || seen.has(trip.id) || !validAmounts(trip)
      || !Number.isFinite(trip.completedAtMs)
      || trip.completedAtMs < boundaries.earliest || trip.completedAtMs > now.getTime()) continue;
    seen.add(trip.id);
    const gatewayPaid = trip.status === 'paid' && trip.paymentStatus === 'approved'
      && trip.paymentMethod !== 'cash';
    const cashPaid = trip.status === 'paid' && trip.paymentStatus === 'cash_received'
      && trip.paymentMethod === 'cash';

    if (trip.completedAtMs >= boundaries.month) {
      if (gatewayPaid) breakdown.confirmedGateway += trip.driverEarnings;
      if (trip.status === 'completed' && trip.paymentStatus === 'pending'
        && trip.paymentMethod !== 'cash') breakdown.pendingGateway += trip.driverEarnings;
      if (trip.status === 'completed' && trip.paymentStatus === 'pending'
        && trip.paymentMethod === 'cash') breakdown.pendingCashCommission += trip.commission;
      if (cashPaid) breakdown.deductedCashCommission += trip.commission;
    }

    if (!gatewayPaid && !cashPaid) continue;
    if (trip.completedAtMs >= boundaries.month) addTrip(periods.month, trip);
    if (trip.completedAtMs >= boundaries.week) addTrip(periods.week, trip);
    if (trip.completedAtMs >= boundaries.today) addTrip(periods.today, trip);
  }

  return { periods, breakdown, boundaries };
}
