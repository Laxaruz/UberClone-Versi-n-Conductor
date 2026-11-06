# Bitácora de uso de IA de Jhoseth

## Entrada #7 — Revisión del segundo avance del registro del conductor

- **Fecha:** 2026-11-04
- **Integrante:** Keiner Jhoseth Vega
- **Herramienta:** ChatGPT
- **Objetivo:** Revisar y documentar el segundo avance funcional personal del registro del conductor, incluyendo validaciones, pruebas automatizadas, comprobaciones parciales en iPhone y estado de los cambios en Git.
- **Prompt(s):**

  **1. Solicitud inicial de revisión:**

  > Termine los cambios locales de mi segundo commit personal en Jhoseth-dev. Implemente las tres pestañas del registro, validaciones por campo, seleccion de fotos y fechas, y el estado pending_demo. La pantalla aclara que no hubo revision real. Pase 10 casos de validacion, la comprobacion de dependencias y la exportacion para Android e iOS. Todavia no hice el commit ni probe el formulario en un dispositivo. Revisa este resumen para la bitacora y dime si necesitas algun dato verificable adicional antes de registrar el avance.

  **2. Ampliación y corrección de evidencias:**

  > Verifique mi rama Jhoseth-dev. Los cambios siguen sin commit. Corrijo un dato anterior, ejecute 11 comprobaciones y no 10. El comando npm run test termino con 11 validation cases passed. Probe un formulario valido, telefono corto, capacidad XL menor de 6, conductor menor de edad, placa en minusculas, SOAT que vence hoy, fecha imposible de SOAT, fecha imposible de nacimiento, vehiculo que requiere revision segun el año, foto de revision faltante y terminos sin aceptar. Ejecute npm run check y termino con Dependencies are up to date usando el mapa local de Expo porque la consulta de red no estuvo disponible. Ejecute npx expo export --platform android --platform ios y se exportaron los paquetes de ambas plataformas. Esta fue una exportacion de JavaScript y recursos, no hay hash nuevo. Adjunto las salidas de git status --short y git diff --stat.
  >
  > Probe la validacion del correo en mi iPhone. Al ingresar un dominio incompleto, como nombre@bonito, el formulario mostro un error. Esta comprobacion corresponde al campo de correo en la pestaña Datos personales. Probe en mi la pestaña Datos personales del registro. Comprobe que puedo ingresar texto y numeros, seleccionar una fecha y elegir una opcion de genero.

  **3. Confirmación del estado y solicitud de documentación:**

  > Confirme que estoy en la rama Jhoseth-dev y que mi segundo avance sigue sin commit. Los archivos nuevos son src/screens/RegistrationScreen.js, src/utils/validateRegistration.js y tests/validateRegistration.test.mjs. La prueba npm run test termino con 11 casos aprobados. Tambien probe la app en mi iPhone. Comprobe que abre Inicio, que puedo ingresar datos en la pestaña Datos personales, seleccionar fecha y genero, y que un correo con dominio incompleto muestra un error. Aun no he probado todo el formulario en el celular. Necesito que prepares la entrada de este avance como pendiente y me indiques que contenido debo incorporar a docs/AI_LOG.md en mi rama.

- **Resumen de la respuesta:** ChatGPT revisó el alcance reportado, organizó las evidencias y diferenció las pruebas automatizadas de las comprobaciones manuales en iPhone. Aclaró que la exportación de Expo genera JavaScript y recursos, no un instalador nativo, y que el avance permanece pendiente de commit.
- **Qué se usó / modificó / descartó:** Se utilizaron las recomendaciones de revisión, los criterios de verificación y la estructura propuesta para documentar el avance. Se corrigió el reporte inicial de 10 a 11 casos aprobados.
- **Archivos afectados por el avance:** `app.json`, `package-lock.json`, `package.json`, `src/context/DriverContext.js`, `src/i18n/translations.js`, `src/navigation/RootNavigator.js`, `src/screens/HomeScreen.js`, `src/screens/RegistrationScreen.js`, `src/utils/validateRegistration.js`, `tests/validateRegistration.test.mjs`.
- **Documentación:** Esta entrada se incorpora a `docs/AI_LOG.md` en `Jhoseth-dev`.
- **Commit y hash:** `44a85b5ddd716426f47c28bb4a1bb33ba560beab` en `Jhoseth-dev`.
- **Verificación:**
  - `npm run test:registration`: `11 validation cases passed`. Casos: formulario válido, teléfono corto, capacidad XL menor de 6, conductor menor de edad, placa en minúsculas, SOAT que vence hoy, fecha imposible de SOAT, fecha imposible de nacimiento, vehículo que requiere revisión según el año, foto de revisión faltante y términos sin aceptar.
  - `npm run check`: `Dependencies are up to date`. Se utilizó el mapa local de Expo porque la consulta de red no estuvo disponible.
  - `npx expo export --platform android --platform ios`: exportación de JavaScript y recursos para Android e iOS. No corresponde a una compilación instalable APK, AAB o IPA.
  - Prueba manual en iPhone: la aplicación abre Inicio; en Datos personales se puede ingresar texto y números, seleccionar una fecha y una opción de género; un correo con dominio incompleto muestra un error.
  - **Limitación:** No se ha probado el formulario completo en el dispositivo.
- **Aprendizaje:** Diferenciar las pruebas automatizadas de las pruebas manuales en dispositivo y comprender que una exportación de Expo no equivale a generar una compilación instalable. Documentar las limitaciones evita afirmar que el formulario completo está validado cuando quedan comprobaciones pendientes.

## Entrada #12 — Mapa, ubicación y disponibilidad con Firestore

- **Fecha:** 2026-11-05
- **Integrante:** Keiner Jhoseth Vega
- **Herramienta:** ChatGPT
- **Objetivo:** Revisar el tercer avance local en `Jhoseth-dev`: mapa, ubicación, disponibilidad, Firestore y aprobación de demostración.
- **Prompt(s):**

  **1. Solicitud de planificación del avance:**

  > Quiero iniciar mi tercer commit personal en Jhoseth-dev. El avance sera el mapa, la ubicacion del conductor y el estado Disponible o No disponible. El registro actual solo tiene el estado pending_demo, por lo que no debe permitir activar la disponibilidad como si el conductor estuviera aprobado. Quiero usar el hook useDriverLocation y limpiar el seguimiento al salir de la pantalla o cambiar a No disponible. Aun no tenemos backend ni llaves de mapas, asi que cualquier ubicacion compartida debe quedar claramente en modo demostracion. Que estructura y verificaciones recomiendas para este avance antes de escribir el codigo?

  **2. Aclaración sobre las pruebas del mapa:**

  > Aclaro mi prueba del mapa. En esta version solo comprobe que Inicio obtiene y muestra mi ubicacion actual. Al salir y volver a Inicio, la app vuelve a consultar la posicion. No probe seguimiento continuo ni limpieza de una suscripcion activa, porque la disponibilidad esta bloqueada y el seguimiento no se inicia. En la captura aparece Registro sin enviar, no pending_demo, durante esa sesion. El envio de ubicacion a un backend sigue pendiente.

  **3. Actualización del hook y solicitud de documentación:**

  > Revise el comportamiento del mapa y del hook useDriverLocation. En el estado actual Inicio consulta una posicion puntual. El seguimiento continuo solo se iniciaria con la disponibilidad activa, que sigue bloqueada. El codigo prepara la limpieza de la suscripcion, pero no la he probado con una suscripcion activa. Ajuste el hook para borrar la posicion anterior al salir de Inicio. Despues pasaron 5 casos de disponibilidad y la exportacion de iOS. El avance sigue sin commit. Prepara la entrada 6 con estas limitaciones

  **4. Ampliacion con Firebase y revision de evidencias:**

  > Ya amplie mi tercer avance local en Jhoseth-dev. Cree el proyecto Firebase UberClone Conductor . Configure Firestore, las reglas de acceso y el inicio anonimo de demostracion. La app puede guardar un registro pendiente, escuchar su estado en tiempo real y, despues de cambiar manualmente el estado a approved_demo, guardar disponibilidad y coordenadas. Una prueba desde un cliente de prueba confirmo las reglas, el cambio de aprobacion, las coordenadas y el apagado de la disponibilidad. Pasaron 13 casos de registro y 7 de disponibilidad, npm run check y la exportacion para Android e iOS. En mi iPhone solo habia probado antes el mapa y la ubicacion local. Aun debo probar desde el telefono el registro en Firestore, la activacion y la limpieza al salir de Inicio. No he creado el commit. Actualiza la entrada 12 con estos hechos y pendientes, sin presentar la prueba del cliente como una prueba en el celular.

  **5. Resultado de la prueba en iPhone:**

  > Ya probe el tercer avance en mi iPhone. Despues de cambiar mi registro de prueba a approved_demo en Firestore, Inicio mostro la aprobacion de demostracion y habilito Disponibilidad. Al activarla, Firestore guardo available true, coordenadas y actualizo locationUpdatedAt. Al abrir Registro, available volvio a false y location a null. Esta fue una prueba en el dispositivo con aprobacion simulada, no una revision real del conductor. El commit sigue pendiente. Actualiza la entrada 12 con este resultado.

  **6. Consulta sobre el boton en las tres pestanas:**

  > Quiero ajustar la pantalla de registro en mi rama Jhoseth-dev. El boton Enviar registro aparece al final de Documentos, pero quiero que tambien sea visible en Datos personales y Vehiculo. Debe permanecer deshabilitado hasta que las tres pestañas esten completas y validas, se acepten los terminos y haya conexion con Firestore. La guia exige que no se pueda enviar un registro incompleto. Que ubicacion del boton y que pruebas me recomiendas para hacer este ajuste?

  **7. Resultado local del ajuste:**

  > Ya ajuste el registro en Jhoseth-dev. El mismo boton Enviar registro aparece fijo en Datos personales, Vehiculo y Documentos. Usa la validacion de las tres pestañas y los terminos. Cuando Firebase esta configurado, espera la conexion con Firestore y bloquea envios repetidos. Durante el envio muestra un indicador de carga. Si faltan variables de Firebase, el boton dice Simular registro para distinguir el modo local. Pasaron 13 casos de registro, 7 de disponibilidad, la comprobacion de dependencias y la exportacion para Android e iOS. Todavia no probe el nuevo boton en mi iPhone y no hice commit. Ayudame a actualizar la entrada 12 con este cambio y las pruebas pendientes.

- **Resumen de la respuesta:** ChatGPT organizó las verificaciones de Firestore y del iPhone, y recomendó un único botón compartido con validación global en las tres pestañas. El pie fijo y su estado deshabilitado se comprobaron después en iPhone.
- **Qué se usó / modificó / descartó:** Se usó la recomendación de mantener el botón visible y la condición de envío centralizada. Se conservaron la validación del formulario y la función de envío existentes; se añadió una protección contra envíos repetidos y un indicador de carga. Las descripciones de ausencia de backend quedaron solo como prompts históricos.
- **Archivos afectados por el avance:** `app.json`, `package.json`, `package-lock.json`, `firebase.json`, `firestore.rules`, `docs/FIREBASE_SETUP.md`, `src/context/DriverContext.js`, `src/i18n/translations.js`, `src/screens/HomeScreen.js`, `src/screens/RegistrationScreen.js`, `src/components/AvailabilityToggle.js`, `src/components/DriverMap.js`, `src/hooks/useDriverLocation.js`, `src/services/firebaseClient.js`, `src/services/driverRepository.js`, `src/utils/canEnableAvailability.js` y `tests/availability.test.mjs`.
- **Bitácora:** Esta entrada se actualiza en `docs/AI_LOG.md` y `docs/AI_LOG_JHOSETH.md` de `Jhoseth-dev`.
- **Commit y hash:** Pendientes al redactar esta entrada. El hash se incorporará en una actualización posterior de la bitácora; `main` no se modificó.
- **Verificación:**
  - `npm run test:registration`: 13 casos aprobados.
  - `npm run test:availability`: 7 casos aprobados.
  - `npm run check`: dependencias al día según el mapa local de Expo; la consulta de red no estuvo disponible.
  - `npx expo export --platform android --platform ios`: exportación de bundles y recursos para ambas plataformas. No genera APK ni IPA.
  - Cliente de prueba de Firestore: confirmó reglas de acceso, rechazo de autoaprobación, rechazo de disponibilidad pendiente, recepción del cambio manual a `approved_demo`, actualización de coordenadas y apagado de disponibilidad.
  - Prueba manual reportada en iPhone: el registro de prueba apareció en Firestore como `pending_demo`; tras cambiarlo manualmente a `approved_demo`, Inicio mostró la aprobación de demostración y habilitó Disponibilidad. Al activarla, Firestore guardó `available: true`, coordenadas y una marca `locationUpdatedAt` actualizada. Al abrir Registro, `available` volvió a `false` y `location` a `null`.
  - Ajuste del formulario: un mismo botón fijo se renderiza en las tres pestañas, con validación global, carga visible y bloqueo de envíos repetidos. Se repitieron los 13 casos de registro, los 7 de disponibilidad, la comprobación de dependencias y la exportación Android/iOS.
  - Prueba manual reportada en iPhone: el botón fijo apareció en Datos personales, Vehículo y Documentos al desplazar el formulario. Con el registro ya aprobado en demostración permaneció deshabilitado y mostró el estado de aprobación.
  - Pendiente: probar la habilitación del nuevo botón, el indicador de carga y el bloqueo de envíos repetidos con un registro nuevo.
  - Alcance: la salida de Inicio y el estado remoto se probaron en iPhone; no se instrumentó directamente el número de suscripciones GPS activas. Android no se probó en dispositivo.
- **Aprendizaje:** Una prueba del cliente de Firestore y una prueba en el teléfono aportan evidencias distintas. La aprobación `approved_demo` no representa una revisión real. Mostrar el botón en tres pestañas no debe crear tres flujos de envío ni permitir saltarse las validaciones.


## Entrada #19 — Ocultar errores del registro enviado

- **Fecha:** 2026-11-06
- **Hora:** 10:42:29 (America/Bogota, UTC-5)
- **Integrante:** Keiner Jhoseth Vega
- **Herramienta:** ChatGPT
- **Objetivo:** Ajustar la presentación de errores en la pantalla de registro para que un registro ya enviado no muestre errores de campos, fotografías ni aceptación de términos, sin modificar las validaciones de registros nuevos ni la integración con Firestore.
- **Prompt:**

  > Ajuste localmente la pantalla de registro para ocultar los errores de campos, fotos y terminos cuando el registro ya fue enviado. No cambie la validacion de registros nuevos ni Firestore. Pasaron 13 pruebas de registro y la exportacion de iOS. Todavia debo comprobar el ajuste en mi iPhone. ya hice commit

- **Resumen de la respuesta:** ChatGPT recomendó separar las reglas de validación de un registro nuevo de la presentación de los mensajes de error en un registro ya enviado. También señaló las comprobaciones de regresión necesarias para verificar que los errores se oculten sin debilitar las validaciones existentes.
- **Qué se usó / modificó / descartó:**
  - Se realizó el ajuste en la pantalla de registro para ocultar los errores de campos cuando el registro ya fue enviado.
  - Se ocultaron los mensajes de error relacionados con fotografías y aceptación de términos en ese mismo estado.
  - Se conservaron las validaciones de los registros nuevos.
  - No se modificó Firestore ni la información almacenada.
  - No se cambiaron las reglas que impiden enviar registros incompletos.
- **Archivos y commit:**
  - Archivo modificado: `src/screens/RegistrationScreen.js`.
  - Rama: `Jhoseth-dev`.
  - Mensaje del commit: `Ocultar errores del registro enviado`.
  - Hash completo: `06b9ecd7dbc48fcbc61a2a28ba2f7bce554b177f`.
  - Fecha del commit: `2026-11-06 10:42:29` (hora de Bogotá).
  - Estado: commit local creado.
  - Push a GitHub: pendiente al registrar esta entrada.
  - Integración en `main`: pendiente.
- **Verificación:**
  - 13 pruebas de registro aprobadas.
  - Exportación de Expo para iOS completada.
  - Prueba del ajuste en iPhone: pendiente.
  - Todavía falta comprobar en el dispositivo que los errores de campos, fotografías y términos permanezcan ocultos al recuperar un registro enviado, incluyendo después de reiniciar la aplicación.
  - No se registra una prueba móvil como completada.
- **Aprendizaje:** Es importante separar la validación de los datos de la presentación de los errores. Un registro que ya fue enviado debe conservar su estado de solo lectura y no mostrar mensajes de campos obligatorios como si todavía estuviera en proceso de diligenciamiento. Este ajuste puede realizarse en la interfaz sin alterar las reglas de validación de los registros nuevos ni los datos de Firestore.
