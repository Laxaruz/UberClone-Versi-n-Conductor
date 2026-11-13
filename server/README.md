# Servidor de viajes y pagos de prueba

Este paquete es independiente de Expo. `GET /health` y `GET /api/trips/:tripId` conservan la consulta de viajes propios. `POST /api/trips/:tripId/checkout` prepara Checkout Pro de prueba y `POST /api/payments/webhook` verifica una notificacion antes de marcar el pago en Firestore.

El checkout recibe solo el ID del viaje. El servidor verifica el ID token de Firebase, comprueba que el conductor sea el propietario y toma `fare` del documento guardado. Nunca usa un monto enviado por el telefono. Solo devuelve una URL de `sandbox_init_point`.

Los viajes actuales quedan bloqueados para checkout. Su estado `completed` se crea desde el telefono, asi que no prueba que haya ocurrido el recorrido. El servidor exige `paymentEligible: true`, un campo que la app no puede escribir y que este avance no establece. La elegibilidad requiere un flujo posterior controlado por servidor. Tampoco se debe presentar la autenticacion anonima como identificacion real del conductor.

El webhook exige una firma valida, consulta el pago y la orden comercial directamente a Mercado Pago y compara referencia, preferencia, monto en COP, estado aprobado y modo de prueba. Una transaccion de Firebase Admin actualiza `paymentStatus`, `paymentId` y `paymentUpdatedAt`; el estado del viaje permanece en `completed`. El retorno del navegador por si solo no aprueba un pago. El flujo de efectivo y la pantalla de checkout de la app quedan separados.

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
