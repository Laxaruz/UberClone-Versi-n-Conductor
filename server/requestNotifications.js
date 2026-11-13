const { FieldValue, Timestamp } = require('firebase-admin/firestore');
const pause = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function retryOnce(action, expiresAt, wait) {
  try {
    return await action();
  } catch (error) {
    if (Date.now() + 500 >= expiresAt) throw error;
    await wait(500);
    return action();
  }
}

// AI-assisted: see docs/AI_LOG.md #60
async function notifyNewRequest(database, messaging, requestId, now = Date.now(), wait = pause) {
  const requestRef = database.collection('tripRequests').doc(requestId);
  const expiresAt = await database.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(requestRef);
    const request = snapshot.data();
    const expiry = request?.expiresAt?.toMillis?.();
    if (!snapshot.exists || request.status !== 'requested' || request.pushClaimedAt
      || !Number.isFinite(expiry) || expiry <= now) return null;
    transaction.update(requestRef, { pushClaimedAt: FieldValue.serverTimestamp() });
    return expiry;
  });
  if (!expiresAt) return 0;

  const drivers = await retryOnce(
    () => database.collection('drivers').where('available', '==', true).get(), expiresAt, wait,
  );
  const recipients = { es: new Set(), en: new Set() };
  for (const driver of drivers.docs) {
    const details = driver.data();
    if (!['approved', 'approved_demo'].includes(details.approvalStatus)) continue;
    const devices = await retryOnce(() => driver.ref.collection('devices').get(), expiresAt, wait);
    for (const device of devices.docs) {
      const fid = device.data().fid;
      if (typeof fid === 'string' && fid.length > 0) {
        recipients[details.language === 'en' ? 'en' : 'es'].add(fid);
      }
    }
  }

  let sent = 0;
  for (const language of ['es', 'en']) {
    const fids = [...recipients[language]];
    while (fids.length > 0 && Date.now() < expiresAt) {
      let remaining = fids.splice(0, 500);
      for (let attempt = 0; attempt < 2 && remaining.length > 0; attempt += 1) {
        try {
          const result = await messaging.sendEachForMulticast({
            fids: remaining,
            notification: language === 'en'
              ? { title: 'New trip request', body: 'Open the app to review it before it expires.' }
              : { title: 'Nueva solicitud de viaje', body: 'Abre la app para revisarla antes de que venza.' },
            data: { requestId },
            android: { ttl: Math.min(15000, Math.max(1000, expiresAt - Date.now())) },
            apns: { headers: { 'apns-expiration': String(Math.floor(expiresAt / 1000)) } },
          });
          sent += result.successCount;
          if (result.responses?.length === remaining.length) {
            remaining = remaining.filter((_, index) => !result.responses[index].success);
          } else if (result.successCount === remaining.length) remaining = [];
          else {
            const incomplete = new Error('FCM returned an incomplete response');
            incomplete.noRetry = result.successCount > 0;
            throw incomplete;
          }
        } catch (error) {
          if (error.noRetry || attempt === 1 || Date.now() + 500 >= expiresAt) throw error;
        }
        if (remaining.length > 0 && attempt === 0 && Date.now() + 500 < expiresAt) await wait(500);
      }
      if (remaining.length > 0) throw new Error('FCM did not deliver the notification');
    }
  }
  return sent;
}

function startRequestNotifications(database, messaging, onError = console.error) {
  const pending = database.collection('tripRequests')
    .where('status', '==', 'requested')
    .where('expiresAt', '>', Timestamp.now());
  return pending.onSnapshot((snapshot) => {
    for (const change of snapshot.docChanges()) {
      if (change.type !== 'added') continue;
      notifyNewRequest(database, messaging, change.doc.id)
        .catch(() => onError('No se pudo enviar la notificacion de una solicitud.'));
    }
  }, () => onError('No se pudo escuchar las solicitudes para notificaciones.'));
}

module.exports = { notifyNewRequest, startRequestNotifications };
