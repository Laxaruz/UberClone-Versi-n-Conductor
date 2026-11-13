# Viajes terminados de prueba

Al finalizar un viaje aceptado de Firestore, la app guarda un documento en `trips/{requestId}`. El ID del viaje es el mismo de la solicitud. Si el guardado falla, la pantalla mantiene el viaje en curso y permite reintentar.

El documento guarda `requestId`, `driverId`, `passengerName`, `origin`, `destination`, `distanceKm`, `durationMin`, `category`, `paymentMethod`, `fare`, `commission`, `driverEarnings`, `commissionRate`, `tip`, `status`, `paymentStatus`, `paymentId`, `createdAt` y `completedAt`. La solicitud aceptada proporciona los datos y los importes; la app vuelve a calcular la tarifa antes de guardar. Por ahora `tip` es cero, `status` queda en `completed`, `paymentStatus` en `pending` y `paymentId` en `null`.

Las reglas solo permiten al conductor asignado crear este documento con los datos de su solicitud aceptada. El conductor no puede cambiar la tarifa, el estado del pago ni marcar el viaje como pagado. El backend de pagos de prueba tendra que leer el viaje guardado y verificar el pago antes de actualizar esos campos. El flujo de efectivo se implementara aparte.

La comision de las reglas esta fijada en 0.2, igual que en `src/config/pricing.js`. Si cambia la tarifa, se deben actualizar las reglas junto con la configuracion. Las reglas no pueden comprobar que el viaje paso por recogida e inicio porque esas etapas solo viven en la memoria del telefono. Por eso `status: completed` no demuestra por si solo que el viaje es elegible para cobro; antes de habilitar un pago real habria que guardar y validar esas transiciones desde un servicio confiable.

El avance anterior del viaje sigue en memoria y no se restaura al reiniciar la app. No hay una cuenta de pasajero ni una identidad `passengerId`; `passengerName` es solo un alias de prueba. El historial consultara estos documentos en otro avance.

El backend de prueba contiene la creacion de preferencias y la validacion del webhook. La pantalla Cobro puede consultar el estado del viaje desde el servidor y abrir un enlace de Checkout Pro de prueba. Los viajes actuales siguen sin ser elegibles para checkout: el servidor requiere `paymentEligible: true`, que no se agrega desde el telefono. Solo un administrador puede habilitar un viaje de prueba. Si el servidor confirma el pago, el webhook cambia el viaje a `status: paid` y `paymentStatus: approved`. La finalizacion controlada por el servidor y la prueba completa de pago en el iPhone siguen pendientes.

Para viajes con `paymentMethod: cash`, el conductor puede declarar el efectivo recibido desde el resumen. El telefono solo envia `tripId`; el servidor valida la propiedad y los importes guardados. Una transaccion unica crea `cashReceipts/{tripId}`, cambia el viaje a `paid` con `paymentStatus: cash_received` y descuenta una sola vez la comision de `driverBalances/{driverId}`. El saldo puede quedar negativo. Este registro representa una declaracion de cobro, no una comprobacion fisica del dinero.
