# Solicitudes compartidas de prueba

Este avance permite que dos conductores de prueba vean una solicitud guardada en Firestore y que solo uno la acepte. La app del conductor no crea solicitudes. Por ahora, un integrante con acceso de administrador debe crear los documentos de prueba. No hay una app de pasajero ni un backend productor de solicitudes.

## Contrato de `tripRequests/{requestId}`

| Campo | Tipo | Uso |
| --- | --- | --- |
| `status` | string | `requested` al crear. Luego puede ser `accepted`, `expired` o `cancelled`. |
| `createdAt`, `expiresAt` | timestamp | `expiresAt` debe ser 15 segundos después de `createdAt`. |
| `origin`, `destination` | map | Cada uno contiene `address` (string), `lat` y `lng` (number). |
| `distanceKm`, `durationMin` | number | Estimación calculada por el productor de la solicitud. |
| `category` | string | `economy`, `xl` o `premium`. |
| `paymentMethod` | string | `cash`, `mercadopago` o `stripe`. |
| `passengerName` | string | Alias de prueba visible en la tarjeta. No usar datos personales reales. |
| `fare`, `commission`, `driverEarnings` | number | Pesos colombianos enteros, calculados con la función de tarifas del proyecto. |
| `acceptedBy`, `acceptedAt` | string o null, timestamp o null | Comienzan en `null`; se asignan en una transacción al aceptar. |

Rechazar no cambia `status` para los demás conductores. Se crea `tripRequests/{requestId}/responses/{driverUid}` con `status: rejected` y `respondedAt` como timestamp. Los conductores no pueden crear solicitudes ni modificar los datos del viaje; solo pueden aceptar una solicitud vigente, registrar su propio rechazo o marcar como vencida una solicitud que ya expiró.

La pantalla escucha únicamente solicitudes `requested` aún vigentes y requiere un conductor aprobado, disponible y conectado a Firestore. `src/services/firestoreTripRequests.js` convierte los timestamps a milisegundos para reutilizar el temporizador de 15 segundos. La transacción vuelve a leer el documento antes de aceptar; las reglas usan la hora de Firestore para rechazar una aceptación tardía.

Al rechazar una solicitud, la pantalla busca la siguiente solicitud disponible para ese conductor. Si no hay otra, conserva la confirmación del rechazo hasta que llegue una nueva actualización. Si no hay ningún cliente conectado cuando se cumple el tiempo, el documento puede seguir con `status: requested`; la consulta no lo muestra y las reglas no permiten aceptarlo tarde. Cambiar ese estado de forma automática sin un cliente conectado requiere un proceso del servidor que aún no existe en el proyecto.

## Verificación pendiente con Firebase

1. Configurar Firebase localmente según `docs/FIREBASE_SETUP.md`. Publicar las reglas e índice de `firestore.rules` y `firestore.indexes.json` en un proyecto de prueba, o usar el emulador de Firestore.
2. Crear dos conductores con UIDs distintos, `approvalStatus: approved_demo` y `available: true`. Crear una solicitud de prueba con el contrato anterior, `status: requested`, `acceptedBy: null` y `acceptedAt: null`.
3. Confirmar que ambos clientes la reciben. Aceptarla casi a la vez desde ambos dispositivos; un solo UID debe quedar en `acceptedBy`.
4. Probar rechazo individual, vencimiento, un conductor pendiente, un conductor no disponible y un intento de cambiar origen, destino o tarifa desde el cliente. Estos intentos no deben alterar la solicitud compartida.

Las pruebas unitarias del contrato y el bundle no sustituyen esta prueba entre dos clientes. El flujo de viaje, los pagos y un productor real de solicitudes pertenecen a avances posteriores.
