# Viajes terminados de prueba

Al finalizar un viaje aceptado de Firestore, la app guarda un documento en `trips/{requestId}`. El ID del viaje es el mismo de la solicitud. Si el guardado falla, la pantalla mantiene el viaje en curso y permite reintentar.

El documento guarda `requestId`, `driverId`, `passengerName`, `origin`, `destination`, `distanceKm`, `durationMin`, `category`, `paymentMethod`, `fare`, `commission`, `driverEarnings`, `commissionRate`, `tip`, `status`, `paymentStatus`, `paymentId`, `createdAt` y `completedAt`. La solicitud aceptada proporciona los datos y los importes; la app vuelve a calcular la tarifa antes de guardar. Por ahora `tip` es cero, `status` queda en `completed`, `paymentStatus` en `pending` y `paymentId` en `null`.

Las reglas solo permiten al conductor asignado crear este documento con los datos de su solicitud aceptada. El conductor no puede cambiar la tarifa, el estado del pago ni marcar el viaje como pagado. El backend de pagos de prueba tendra que leer el viaje guardado y verificar el pago antes de actualizar esos campos. El flujo de efectivo se implementara aparte.

La comision de las reglas esta fijada en 0.2, igual que en `src/config/pricing.js`. Si cambia la tarifa, se deben actualizar las reglas junto con la configuracion. Las reglas no pueden comprobar que el viaje paso por recogida e inicio porque esas etapas solo viven en la memoria del telefono. Por eso `status: completed` no demuestra por si solo que el viaje es elegible para cobro; antes de habilitar un pago real habria que guardar y validar esas transiciones desde un servicio confiable.

El avance anterior del viaje sigue en memoria y no se restaura al reiniciar la app. No hay una cuenta de pasajero ni una identidad `passengerId`; `passengerName` es solo un alias de prueba. El historial consultara estos documentos en otro avance.

El backend de prueba ahora contiene la creacion de preferencias y la validacion del webhook, pero los viajes actuales siguen sin ser elegibles para checkout. El servidor requiere `paymentEligible: true`, que no se agrega desde el telefono. La pantalla de checkout y una finalizacion controlada por el servidor quedan pendientes.
