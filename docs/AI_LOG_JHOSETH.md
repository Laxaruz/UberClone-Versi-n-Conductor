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
