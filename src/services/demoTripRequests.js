import { calculateFare } from '../utils/calculateFare';
import { REQUEST_TIMEOUT_MS, transitionTripRequest } from '../utils/tripRequestTimer';

export function createDemoTripRequest(now = Date.now(), sequence = 1) {
  const distanceKm = 8.5;
  const durationMin = 22;
  const category = 'economy';
  const amounts = calculateFare({ distanceKm, durationMin, category, tip: 0 });

  return {
    id: `demo-request-${now}-${sequence}`,
    source: 'demo',
    status: 'requested',
    receivedAt: now,
    expiresAt: now + REQUEST_TIMEOUT_MS,
    passengerName: 'Pasajero de prueba',
    origin: { address: 'Punto de recogida de prueba' },
    destination: { address: 'Destino de prueba' },
    distanceKm,
    durationMin,
    category,
    paymentMethod: 'cash',
    fare: amounts.fare,
    commission: amounts.commission,
    driverEarnings: amounts.driverEarnings,
  };
}

export function createDemoTripRequestSource() {
  const listeners = new Set();
  let sequence = 1;
  let current = createDemoTripRequest(Date.now(), sequence);

  function publish() {
    listeners.forEach((listener) => listener(current));
  }

  return {
    mode: 'demo',
    subscribe(listener) {
      listeners.add(listener);
      listener(current);
      return () => listeners.delete(listener);
    },
    resolve(id, action, now = Date.now()) {
      if (current?.id !== id) return null;
      const next = transitionTripRequest(current, action, now);
      if (next !== current) {
        current = next;
        publish();
      }
      return current;
    },
    restart() {
      sequence += 1;
      current = createDemoTripRequest(Date.now(), sequence);
      publish();
      return current;
    },
  };
}
