# Servidor de viajes y pagos de prueba

Este paquete es independiente de Expo. `GET /health` y `GET /api/trips/:tripId` conservan la consulta de viajes propios. `POST /api/trips/:tripId/checkout` prepara Checkout Pro de prueba y `POST /api/payments/webhook` verifica una notificacion antes de marcar el pago en Firestore.

El checkout recibe solo el ID del viaje. El servidor verifica el ID token de Firebase, comprueba que el conductor sea el propietario y toma `fare` del documento guardado. Nunca usa un monto enviado por el telefono. Solo devuelve una URL de `sandbox_init_point`.

Los viajes actuales quedan bloqueados para checkout. Su estado `completed` se crea desde el telefono, asi que no prueba que haya ocurrido el recorrido. El servidor exige `paymentEligible: true`, un campo que la app no puede escribir y que este avance no establece. La elegibilidad requiere un flujo posterior controlado por servidor. Tampoco se debe presentar la autenticacion anonima como identificacion real del conductor.

El webhook exige una firma valida, consulta el pago y la orden comercial directamente a Mercado Pago y compara referencia, preferencia, monto en COP, estado aprobado y modo de prueba. Una transaccion de Firebase Admin cambia el viaje a `status: paid` y actualiza `paymentStatus`, `paymentId` y `paymentUpdatedAt`. Una notificacion repetida no vuelve a actualizarlo. El retorno del navegador por si solo no aprueba un pago.

La pantalla Cobro de Expo envia el ID del viaje y el token de Firebase al servidor. Abre solo una URL HTTPS de `sandbox.mercadopago.com`. Escucha los cambios del documento del viaje en Firestore y consulta `GET /api/trips/:tripId` al recibir un cambio confirmado, al regresar a la app o al pulsar Actualizar estado. Nunca escribe la aprobacion desde el telefono. Recuerda el ultimo ID de viaje de Mercado Pago para volver a consultar su estado tras reiniciar la app. Sin URL HTTPS del servidor, el boton de checkout queda deshabilitado.

Para una prueba completa, configura Firebase Admin, una URL HTTPS publica para el webhook y `EXPO_PUBLIC_API_BASE_URL` accesible desde el telefono. El servidor debe estar en `MERCADOPAGO_TEST_MODE=true` con credenciales de prueba. En Firestore, un administrador debe marcar **solo un viaje de prueba** con `paymentEligible: true` despues de verificarlo; la app no puede escribir ese campo. Entonces se puede abrir Checkout Pro con una cuenta compradora de prueba y confirmar el resultado desde el webhook y la consulta del servidor. Sin esos datos y esa habilitacion, el flujo permanece pendiente. No se ha realizado una compra ni una prueba completa en el iPhone en este avance.

## Cobro en efectivo

`POST /api/trips/:tripId/cash-receipt` requiere el ID token del conductor. El telefono envia solo el ID del viaje. El servidor comprueba que sea un viaje propio, terminado, con metodo `cash`, importes enteros coherentes y pago pendiente. Una transaccion registra `cashReceipts/{tripId}`, cambia el viaje a `status: paid` y `paymentStatus: cash_received`, y descuenta la comision de `driverBalances/{driverId}`. Un reintento del mismo viaje devuelve el saldo actual sin aplicar otro descuento. El saldo puede ser negativo.

Esta confirmacion registra la declaracion del conductor de que recibio el efectivo; el servidor no puede verificar la entrega fisica. La app solo muestra un resultado confirmado cuando el servidor responde correctamente. Para probarlo desde el iPhone se necesitan Firebase Admin y una URL de servidor accesible desde el telefono en `EXPO_PUBLIC_API_BASE_URL`. No requiere credenciales de Mercado Pago.

Si falta esa configuracion, el resumen mantiene el pago pendiente y explica que el servidor no esta disponible. Las solicitudes locales de demostracion no generan un viaje guardado en Firestore, por lo que no habilitan el registro de efectivo.

## Configuracion local

Desde `server/`, ejecuta `npm install`, `npm test` y `npm start`. Configura en el `.env` de la raiz los valores del servidor. `.gitignore` excluye ese archivo y cualquier `.env.*` salvo `.env.example`.

- `FIREBASE_PROJECT_ID`: ID del proyecto compartido.
- `GOOGLE_APPLICATION_CREDENTIALS`: ruta de credenciales de Firebase Admin fuera del repositorio.
- `MERCADOPAGO_TEST_MODE=true`: activa exclusivamente las rutas de prueba.
- `MERCADOPAGO_ACCESS_TOKEN`: Access Token del entorno de prueba de la aplicacion Checkout Pro.
- `MERCADOPAGO_WEBHOOK_SECRET`: firma secreta de los webhooks de esa aplicacion.
- `MERCADOPAGO_NOTIFICATION_URL`: URL HTTPS publica que apunte a `/api/payments/webhook`.
- `SERVER_HOST` y `SERVER_PORT`: direccion y puerto del servidor. Por defecto escucha en `127.0.0.1:3000`.

Si faltan la configuracion de prueba, el token, la firma o la URL, las rutas de pago responden sin crear preferencias ni aprobar pagos. Para recibir notificaciones reales se necesita un servidor accesible por HTTPS y configurar el evento `payment` en Mercado Pago Developers. Las pruebas locales de `npm test` usan un proveedor simulado; no acreditan una compra en Mercado Pago ni una prueba en telefono.
