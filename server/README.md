# Servidor de lectura de viajes

Este servidor es una base para la integracion de pagos de prueba. Por ahora solo ofrece `GET /health` y `GET /api/trips/:tripId`. No crea preferencias de Mercado Pago, no inicia cobros y no cambia el estado de un pago.

El endpoint de viaje recibe `Authorization: Bearer <ID token de Firebase>`. Firebase Admin verifica el token y el servidor compara su UID con `driverId` del documento `trips/{tripId}` antes de responder. Devuelve solo ID, estado del viaje, metodo de pago, tarifa y estado del pago. Los conductores sin acceso reciben la misma respuesta que un viaje inexistente.

Para ejecutarlo localmente se necesita Node.js, un valor `FIREBASE_PROJECT_ID` y credenciales de aplicacion de Google disponibles en el servidor, por ejemplo mediante `GOOGLE_APPLICATION_CREDENTIALS`. Los nombres estan en `.env.example` de la raiz; los valores privados van en `.env`, que Git ignora. El archivo de credenciales debe permanecer fuera del repositorio. Desde `server/` se ejecuta `npm install` y luego `npm start`. El servidor escucha en `127.0.0.1` y usa `SERVER_PORT` o el puerto 3000. `SERVER_HOST` permite cambiar la direccion cuando exista un entorno de prueba accesible; desde un telefono se necesitara HTTPS y configuracion segura del servidor.

La autenticacion anonima de la app identifica una sesion, no la identidad real del conductor. Ademas, el estado `completed` fue creado desde el telefono, por lo que esta lectura no demuestra que el viaje sea elegible para un cobro. El flujo de efectivo y el resumen pertenecen a otro avance.
