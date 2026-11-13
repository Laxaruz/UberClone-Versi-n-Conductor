# Firestore del conductor

El proyecto Firebase `uberclone-conductor-93a68` usa el plan Spark sin facturacion. La base `(default)` es Firestore Standard y esta en `southamerica-east1` (Sao Paulo). La ubicacion de la base no se puede cambiar.

## Configuracion local

1. Ejecutar `npm install`.
2. Copiar `.env.example` como `.env` y completar las variables `EXPO_PUBLIC_FIREBASE_API_KEY`, `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`, `EXPO_PUBLIC_FIREBASE_PROJECT_ID`, `EXPO_PUBLIC_FIREBASE_APP_ID` y `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` con la configuracion de la app web `UberClone Expo JS` en Firebase Console. `.env` esta excluido de Git.
3. Ejecutar `npx expo start -c` y abrir la app en Expo Go. La clave API de Firebase para la app es publica; las claves secretas de pagos no se colocan en la app.
4. En Firebase Console, habilitar Authentication > Metodo de acceso > Anonimo y Correo/Contrasena, y publicar el contenido de `firestore.rules` en Firestore > Reglas.

Si faltan las variables Firebase, la app conserva el registro de demostracion local. No se conecta a Firestore ni envia la ubicacion.

## Datos guardados

La coleccion `drivers` usa el UID de Firebase Auth como ID de documento. Al enviar un formulario valido, el documento contiene los campos escritos de Datos personales, Vehiculo y los numeros y fechas de Documentos, la categoria canonica (`economy`, `xl` o `premium`), `approvalStatus: pending_demo`, `registrationMode: demo`, `photoStatus: local_only`, disponibilidad y marcas de tiempo. Esos campos se restauran desde Firestore al volver a abrir la app. Las fotos se seleccionan en el telefono y no se restauran despues de reiniciar. El registro no constituye una revision real de documentos.

En Perfil se pueden editar los campos guardados. Guardar datos personales, del vehiculo o de documentos apaga la disponibilidad y devuelve el registro a `pending_demo`; la app no puede aprobar al conductor. Las fotos elegidas desde Perfil siguen siendo locales y no se suben a Firestore.

La primera sesion puede ser anonima. Antes de cerrar sesion, el conductor debe vincularla en Configuracion con un correo y una contrasena. Firebase conserva el mismo UID al vincularla. Cerrar sesion apaga la disponibilidad y abre la pantalla de acceso; volver con ese correo recupera el documento asociado al UID. La app no guarda la contrasena en AsyncStorage. Si el metodo Correo/Contrasena no esta habilitado en Firebase, la vinculacion falla y el cierre de sesion permanece bloqueado para no perder el acceso al registro anonimo.

Las reglas permiten al conductor leer solo su documento. La app solo puede cambiar `approvalStatus` a `pending_demo` al editar su perfil; no puede aprobarlo. Para ensayar la aprobacion simulada, cambiar manualmente ese campo a `approved_demo` desde Firebase Console en un documento de prueba. Con conexion a Firestore y ubicacion disponible, se habilita el interruptor. Al activarlo se guarda la posicion y, mientras Inicio siga visible, se actualiza aproximadamente cada cinco segundos. Al desactivarlo, salir de Inicio o enviar la app a segundo plano, se detiene la suscripcion de ubicacion y se intenta guardar `available: false` y `location: null`.

El interruptor no se habilita para `pending_demo` ni cuando Firestore solo entrega datos de cache. Si se pierde la red o la app se cierra de forma abrupta, el ultimo valor remoto puede quedar desactualizado; antes de asignar viajes se debe comprobar que `locationUpdatedAt` sea reciente o incorporar un mecanismo de expiracion en el backend.

## Comprobacion

- `npm run test:registration` verifica las validaciones del formulario.
- `npm run test:availability` verifica la condicion de aprobacion y conexion.
- `node tests/registrationDetails.test.mjs` verifica el guardado y la restauracion de los campos escritos, sin fotos.
- `node tests/profileDetails.test.mjs` comprueba la lectura del perfil y la validacion de cambios personales, del vehiculo y documentos.
- `node tests/driverAuth.test.mjs` comprueba que la vinculacion conserva el UID, que salir no crea otra cuenta anonima y que el mismo perfil puede recuperarse al entrar.
- `npm run check` revisa las versiones de Expo.
- `npx expo export --platform android --platform ios` verifica el empaquetado de JavaScript y recursos. No genera APK ni IPA.
- En un dispositivo, comprobar por separado permiso de ubicacion, documento `drivers/{uid}`, cambio manual de `approvalStatus` en la consola, encendido y apagado del interruptor, actualizaciones de `locationUpdatedAt` y limpieza al salir de Inicio.
- En un dispositivo, comprobar la edicion del perfil, el regreso a `pending_demo`, el idioma tras reiniciar, la vinculacion de correo, la salida y el acceso posterior al mismo UID.

Las fotos no se suben a Firestore. Las llaves secretas y la creacion de pagos permanecen en el backend de pruebas.
