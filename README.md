# UberClone Conductor

Aplicacion academica de demostracion para conductores, desarrollada con React Native, Expo y Firebase. El proyecto permite registrar un conductor, revisar solicitudes de prueba, seguir etapas de un viaje, consultar ganancias e historial y probar flujos de cobro.

La app no ofrece un servicio de transporte real. Las solicitudes y aprobaciones son de demostracion. El saldo es contable y no representa dinero transferido.

## Funciones actuales

- Registro del conductor en tres secciones, con validaciones, seleccion de fotos y guardado de los datos escritos en Firestore.
- Inicio de sesion anonimo y opcion de vincular la cuenta con correo y contrasena para conservar el mismo perfil.
- Mapa, ubicacion y disponibilidad del conductor, con acceso limitado por el estado de aprobacion.
- Solicitudes compartidas en Firestore, con vencimiento de 15 segundos y aceptacion unica.
- Flujo del viaje desde la recogida hasta la finalizacion.
- Rutas estimadas de OSRM, con distancia y duracion. No son navegacion giro a giro ni prueban el recorrido real.
- Cobro declarado en efectivo, con comision y saldo de demostracion calculados por el servidor.
- Checkout Pro de prueba y validacion de webhooks. Los viajes normales siguen bloqueados para checkout mientras la finalizacion no se valide desde un servicio confiable.
- Ganancias e historial con filtros y paginacion. El detalle dibuja una ruta estimada entre los puntos guardados.
- Preparacion de avisos FCM para nuevas solicitudes. Expo Go no recibe FCM y la entrega real en iPhone esta pendiente de una compilacion nativa firmada.

## Requisitos

- Node.js y npm.
- Expo Go para ejecutar las funciones compatibles de la app. Las notificaciones FCM requieren una compilacion nativa de desarrollo.
- Acceso al proyecto Firebase compartido para probar autenticacion y Firestore.
- Para ejecutar el servidor: credenciales locales de Firebase Admin. Para Checkout Pro: credenciales de prueba de Mercado Pago y configuracion del webhook.

## Configuracion de la app

Desde la raiz del proyecto:

```bash
npm install
```

Copia `.env.example` como `.env` y completa las variables necesarias. Para conectar la app con Firebase se usan `EXPO_PUBLIC_FIREBASE_API_KEY`, `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`, `EXPO_PUBLIC_FIREBASE_PROJECT_ID`, `EXPO_PUBLIC_FIREBASE_APP_ID` y `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`.

Para usar un servidor local desde un telefono en la misma red, configura `EXPO_PUBLIC_API_BASE_URL` con la IP LAN del computador y el puerto del servidor. En Expo de desarrollo, HTTP local requiere `EXPO_PUBLIC_ALLOW_HTTP_LAN_FOR_TESTS=true`. No uses esta opcion en una compilacion de entrega.

Luego inicia Expo:

```bash
npx expo start --go
```

Abre el proyecto con Expo Go. Si Firebase no esta configurado, algunas pantallas usan el modo local de demostracion y no guardan datos compartidos.

## Configuracion de Firebase

La aplicacion usa el proyecto compartido `uberclone-conductor-93a68`. Habilita los metodos de autenticacion que necesita la prueba y publica las reglas e indices del repositorio:

```bash
npx firebase-tools deploy --only firestore:rules,firestore:indexes --project uberclone-conductor-93a68
```

La configuracion local de Firebase esta descrita en [docs/FIREBASE_SETUP.md](docs/FIREBASE_SETUP.md). Nunca guardes la clave privada de Firebase Admin en Git.

## Configuracion y ejecucion del servidor

El backend esta separado del paquete Expo. Desde la carpeta `server`:

```bash
npm install
npm test
npm start
```

Configura las variables del servidor en el `.env` local de la raiz. Las principales son `FIREBASE_PROJECT_ID`, `GOOGLE_APPLICATION_CREDENTIALS`, `SERVER_HOST` y `SERVER_PORT`. Para pagos de prueba se usan `MERCADOPAGO_TEST_MODE`, `MERCADOPAGO_ACCESS_TOKEN` y `MERCADOPAGO_WEBHOOK_SECRET`. La URL de notificaciones de Mercado Pago debe ser HTTPS y apuntar a `/api/payments/webhook`.

Para que un telefono alcance el servidor en la misma red, configura `SERVER_HOST=0.0.0.0`, permite el puerto en el firewall y usa la IP LAN del computador en `EXPO_PUBLIC_API_BASE_URL`. No expongas credenciales en el cliente ni en el repositorio.

El servidor escucha solicitudes nuevas de Firestore y envia avisos FCM mientras esta encendido. No hay un disparador alojado: si el proceso esta apagado, no envia avisos. Consulta [server/README.md](server/README.md) y [docs/NOTIFICATIONS.md](docs/NOTIFICATIONS.md) para los limites y pasos detallados.

## Pruebas y comprobaciones

Desde la raiz:

```bash
npm run test:registration
npm run test:availability
npm run test:requests
npm run test:trip-flow
npm run test:date-input
npm run check
```

Desde `server/`, `npm test` ejecuta las pruebas del backend.

Para comprobar el empaquetado JavaScript de las plataformas:

```bash
npx expo export --platform android --platform ios
```

La exportacion no produce un APK, AAB ni IPA y no sustituye una prueba en dispositivo. Las pruebas push requieren una compilacion nativa y configuracion de APNs/FCM; la prueba de iPhone sigue pendiente.

## Documentacion adicional

- [Configuracion de Firebase](docs/FIREBASE_SETUP.md)
- [Contrato de solicitudes](docs/TRIP_REQUESTS.md)
- [Viajes, pagos y ganancias](docs/TRIPS.md)
- [Notificaciones](docs/NOTIFICATIONS.md)
- [Servidor de viajes y pagos](server/README.md)
- [Bitacora comun de IA](docs/AI_LOG.md)

## Equipo

Proyecto realizado por Kevin y Jhoseth para una actividad academica. Las ramas de trabajo son `Kevin-dev` y `Jhoseth-dev`.
