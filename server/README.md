# Servidor de viajes y pagos de prueba

El servidor tambien escucha solicitudes nuevas de Firestore y envia avisos FCM solo a conductores aprobados y disponibles con un dispositivo registrado. Consulta [la configuracion de notificaciones](../docs/NOTIFICATIONS.md). El envio depende de que este servidor siga encendido; no usa Cloud Functions.

Este paquete es independiente de Expo. `GET /health` y `GET /api/trips/:tripId` conservan la consulta de viajes propios. `POST /api/trips/:tripId/checkout` prepara Checkout Pro de prueba y `POST /api/payments/webhook` verifica una notificacion antes de marcar el pago en Firestore.

El checkout recibe solo el ID del viaje. El servidor verifica el ID token de Firebase, comprueba que el conductor sea el propietario y toma `fare` del documento guardado. Nunca usa un monto enviado por el telefono. Devuelve `sandbox_init_point` de una preferencia creada con credenciales de prueba. La compra debe hacerse con una cuenta compradora y una tarjeta de prueba.

La pantalla de cobro consulta el estado confirmado por este servidor y vuelve a consultarlo al regresar a la app o al recibir un cambio del viaje. La app admite HTTPS para la API. Para probar desde un telefono en la misma red se puede usar HTTP local solo en Expo desarrollo, con `EXPO_PUBLIC_ALLOW_HTTP_LAN_FOR_TESTS=true` y una URL localhost o `192.168.x.x`; esta opcion no funciona en una compilacion de entrega.

Los viajes actuales quedan bloqueados para checkout. Su estado `completed` se crea desde el telefono, asi que no prueba que haya ocurrido el recorrido. El servidor exige `paymentEligible: true`, un campo que la app no puede escribir y que este avance no establece. La elegibilidad requiere un flujo posterior controlado por servidor. Tampoco se debe presentar la autenticacion anonima como identificacion real del conductor.

El webhook exige una firma valida, consulta el pago y la orden comercial directamente a Mercado Pago y compara referencia, preferencia, monto en COP y estado aprobado. En la prueba de Checkout Pro, Mercado Pago devolvio `payment.live_mode: true` pese a mostrar Sandbox. Ese caso se acepta solo si la orden confirma `is_test: true`, el viaje fue creado por Admin como `testFixture`, su ID comienza con `sandbox_` y los IDs de comprador y vendedor coinciden con los configurados en el servidor. Si `live_mode` es `false`, una orden sin campo `is_test` se puede procesar, pero `is_test: false` se rechaza. Sin la configuracion de las cuentas, un pago con `live_mode: true` queda pendiente. Una transaccion de Firebase Admin cambia `status` a `paid`, actualiza `paymentStatus`, `paymentId` y `paymentUpdatedAt`, y suma una sola vez `driverEarnings` a `driverBalances/{driverId}`. Este saldo es una simulacion contable, no una transferencia real. El retorno del navegador por si solo no aprueba un pago.

## Cobro en efectivo

`POST /api/trips/:tripId/cash-receipt` requiere el ID token del conductor. El telefono envia solo el ID del viaje. El servidor comprueba que sea un viaje propio, terminado, con metodo `cash`, importes enteros coherentes y pago pendiente. Una transaccion registra `cashReceipts/{tripId}`, cambia el viaje a `status: paid` y `paymentStatus: cash_received`, y descuenta la comision de `driverBalances/{driverId}`. Un reintento del mismo viaje devuelve el saldo actual sin aplicar otro descuento. El saldo puede ser negativo.

Esta confirmacion registra la declaracion del conductor de que recibio el efectivo; el servidor no puede verificar la entrega fisica. La app solo muestra un resultado confirmado cuando el servidor responde correctamente. Para probarlo desde el iPhone se necesitan Firebase Admin y una URL de servidor accesible desde el telefono en `EXPO_PUBLIC_API_BASE_URL`. No requiere credenciales de Mercado Pago.

Si falta esa configuracion, el resumen mantiene el pago pendiente y explica que el servidor no esta disponible. Las solicitudes locales de demostracion no generan un viaje guardado en Firestore, por lo que no habilitan el registro de efectivo.

## Configuracion local

Desde `server/`, ejecuta `npm install`, `npm test` y `npm start`. Configura en el `.env` de la raiz los valores del servidor. `.gitignore` excluye ese archivo y cualquier `.env.*` salvo `.env.example`.

- `FIREBASE_PROJECT_ID`: ID del proyecto compartido.
- `GOOGLE_APPLICATION_CREDENTIALS`: ruta de credenciales de Firebase Admin fuera del repositorio.
- `MERCADOPAGO_TEST_MODE=true`: activa exclusivamente las rutas de prueba.
- `MERCADOPAGO_TEST_SELLER_ID` y `MERCADOPAGO_TEST_BUYER_ID`: IDs de las cuentas de prueba usados para comprobar pagos Sandbox que Mercado Pago reporta con `live_mode: true`.
- `MERCADOPAGO_ACCESS_TOKEN`: Access Token del entorno de prueba de la aplicacion Checkout Pro.
- `MERCADOPAGO_WEBHOOK_SECRET`: firma secreta de los webhooks de esa aplicacion.
- `MERCADOPAGO_NOTIFICATION_URL`: URL HTTPS publica que apunte a `/api/payments/webhook`.
- `SERVER_HOST` y `SERVER_PORT`: direccion y puerto del servidor. Por defecto escucha en `127.0.0.1:3000`. Para probar desde un telefono en la misma red, usa `SERVER_HOST=0.0.0.0`, configura `EXPO_PUBLIC_API_BASE_URL` con la IP LAN y el puerto del PC y permite ese puerto en el firewall local. Usa HTTP solo en Expo desarrollo con la opcion indicada arriba.

Si faltan la configuracion de prueba, el token, la firma o la URL, las rutas de pago responden sin crear preferencias ni aprobar pagos. Para recibir notificaciones reales se necesita un servidor accesible por HTTPS y configurar el evento `payment` en Mercado Pago Developers. Las pruebas locales de `npm test` usan un proveedor simulado; no acreditan una compra en Mercado Pago ni una prueba en telefono.
