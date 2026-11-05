# Firestore del conductor

El proyecto Firebase `uberclone-conductor-93a68` usa el plan Spark sin facturacion. La base `(default)` es Firestore Standard y esta en `southamerica-east1` (Sao Paulo). La ubicacion de la base no se puede cambiar.

## Configuracion local

1. Ejecutar `npm install`.
2. Copiar `.env.example` como `.env` y completar las variables `EXPO_PUBLIC_FIREBASE_API_KEY`, `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`, `EXPO_PUBLIC_FIREBASE_PROJECT_ID`, `EXPO_PUBLIC_FIREBASE_APP_ID` y `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` con la configuracion de la app web `UberClone Expo JS` en Firebase Console. `.env` esta excluido de Git.
3. Ejecutar `npx expo start -c` y abrir la app en Expo Go. La clave API de Firebase para la app es publica; las claves secretas de pagos no se colocan en la app.
4. En Firebase Console, habilitar Authentication > Metodo de acceso > Anonimo y publicar el contenido de `firestore.rules` en Firestore > Reglas.

Si faltan las variables Firebase, la app conserva el registro de demostracion local. No se conecta a Firestore ni envia la ubicacion.

## Datos guardados

La coleccion `drivers` usa el UID anonimo como ID de documento. Al enviar un formulario valido, el documento contiene nombre, categoria canonica (`economy`, `xl` o `premium`), `approvalStatus: pending_demo`, `registrationMode: demo`, `photoStatus: local_only`, disponibilidad y marcas de tiempo. Las fotos y los demas datos del formulario permanecen en el telefono durante esta etapa. El registro no constituye una revision real de documentos. La autenticacion anonima es temporal para esta demostracion y no reemplaza una cuenta de conductor definitiva.

Las reglas permiten al conductor leer solo su documento. La app no puede cambiar `approvalStatus`. Para ensayar la aprobacion simulada, cambiar manualmente ese campo a `approved_demo` desde Firebase Console en un documento de prueba. Con conexion a Firestore y ubicacion disponible, se habilita el interruptor. Al activarlo se guarda la posicion y, mientras Inicio siga visible, se actualiza aproximadamente cada cinco segundos. Al desactivarlo, salir de Inicio o enviar la app a segundo plano, se detiene la suscripcion de ubicacion y se intenta guardar `available: false` y `location: null`.

El interruptor no se habilita para `pending_demo` ni cuando Firestore solo entrega datos de cache. Si se pierde la red o la app se cierra de forma abrupta, el ultimo valor remoto puede quedar desactualizado; antes de asignar viajes se debe comprobar que `locationUpdatedAt` sea reciente o incorporar un mecanismo de expiracion en el backend.

## Comprobacion

- `npm run test:registration` verifica las validaciones del formulario.
- `npm run test:availability` verifica la condicion de aprobacion y conexion.
- `npm run check` revisa las versiones de Expo.
- `npx expo export --platform android --platform ios` verifica el empaquetado de JavaScript y recursos. No genera APK ni IPA.
- En un dispositivo, comprobar por separado permiso de ubicacion, documento `drivers/{uid}`, cambio manual de `approvalStatus` en la consola, encendido y apagado del interruptor, actualizaciones de `locationUpdatedAt` y limpieza al salir de Inicio.

No hay integracion de pagos ni subida de fotos en Firestore en esta etapa. Las llaves secretas y la creacion de pagos corresponderan al backend de pagos.
