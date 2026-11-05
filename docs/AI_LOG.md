# Bitácora de uso de IA

Cada entrada registra una interacción de IA relacionada con el proyecto. Los datos no disponibles o todavía no verificados se marcan como pendientes; no se infiere que una recomendación haya sido implementada.

## Entrada #1

- **Fecha y hora:** 2026-11-04 19:13:02 (America/Bogota)
- **Integrante:** Kevin
- **Herramienta:** ChatGPT (Codex)
- **Objetivo:** Confirmar los requisitos de la sección 8 de la guía, iniciar la revisión en modo lectura y registrar esta consulta sin atribuir avances de implementación.
- **Prompt completo y literal:**

> Actúa como par revisor y responsable de la bitácora de IA del proyecto final “UberClone — Versión Conductor”. Soy Kevin y trabajo en pareja con Jhoseth.
>
> Lee primero la guía completa:
> C:\Users\kevin\OneDrive\Escritorio\Universidad\SEMESTRE 5\Desarrollo movil\ProyectoFinal\UberClone — Versión Conductor.pdf
>
> Repositorio:
> https://github.com/Laxaruz/UberClone-Versi-n-Conductor.git
>
> Carpeta local:
> C:\Users\kevin\OneDrive\Escritorio\Universidad\SEMESTRE 5\Desarrollo movil\ProyectoFinal\UberClone-Versi-n-Conductor
>
> Mi rama es Kevin-dev. La de mi compañero es Jhoseth-dev. El plan inicial contempla 12 avances alternados, seis commits por integrante. Verifica siempre el estado real del repositorio antes de dar por hecho que un avance existe.
>
> Tu función es revisar avances en modo lectura, señalar errores concretos, recomendar buenas prácticas dentro de lo visto en clase y ayudarme a entender lo que debo poder explicar en la sustentación. Indica el archivo y la línea cuando señales un problema. Distingue entre un error comprobado, un posible riesgo y una sugerencia. No modifiques código, no instales dependencias y no hagas commits, push, merges ni Pull Requests.
>
> Lleva una bitácora fiel de todo uso de IA relacionado con este proyecto, conforme a la sección 8 de la guía. Registra cada interacción en el momento, con fecha y hora reales de America/Bogota, incluyendo segundos si es posible. Para cada entrada incluye:
>
> - Número consecutivo, fecha, hora, integrante y herramienta.
> - Objetivo de la consulta.
> - Prompt completo y literal, sin resumirlo.
> - Resumen de la respuesta en 2 o 3 líneas y enlace al chat si está disponible.
> - Qué se usó, modificó o descartó. No supongas que una sugerencia fue implementada.
> - Archivos afectados y hash del commit; si aún no existen, escribe “pendiente” y complétalos cuando te dé esos datos.
> - Cómo se verificó el resultado, solo con pruebas que realmente se hayan hecho.
> - Aprendizaje: qué entendí y qué haría distinto.
>
> Incluye también las consultas de revisión y planificación. Si te informo de interacciones con otras herramientas o chats, pídeme el prompt literal y los datos necesarios para registrarlas correctamente. Nunca inventes conversaciones, pruebas, autores, fechas ni commits.
>
> La bitácora final debe quedar en docs/AI_LOG.md, enlazada desde el README y exportada a PDF para la entrega. Cada integrante aportará sus entradas desde su rama mediante Pull Request. Si detectas un bloque asistido por IA sin la referencia exigida por la guía, señálalo: // AI-assisted: see docs/AI_LOG.md #N. Puedes mantener el archivo de bitácora cuando te lo indique; ningún otro archivo debe ser editado.
>
> No incluyas llaves de API, tokens, credenciales ni datos personales reales en prompts o registros. Si una consulta no contiene esos datos, regístrala tal como fue escrita.
>
> Para empezar, confirma los requisitos de la bitácora que encontraste en el PDF y registra esta primera consulta sin atribuir trabajo que todavía no se haya realizado.

- **Resumen de la respuesta:** La sección 8 requiere registrar cada uso de IA en el momento, conservar el prompt literal, resumir la respuesta en 2–3 líneas y documentar uso, cambios, archivos/commit, verificación y aprendizaje. También requiere docs/AI_LOG.md, entradas por integrante integradas por PR a main, referencia desde README.md y entrega en PDF.
- **Enlace al chat:** No disponible en esta sesión.
- **Qué se usó / modificó / descartó:** Se usaron las instrucciones de la sección 8 para estructurar esta entrada. No se modificó código ni se atribuyó implementación. La revisión de avances queda pendiente.
- **Archivos afectados y commit:** docs/AI_LOG.md (creado en esta sesión; entrada #1); hash del commit — 6ba2a33b07cc243c6c17bda0c0c7340a525a1a7b.
- **Verificación:** Se renderizaron y revisaron visualmente las 9 páginas del PDF; los requisitos se verificaron en la sección 8 (páginas 7–9). La lectura local y la consulta de ramas en GitHub confirmaron que Kevin-dev y Jhoseth-dev apuntan a 085730a5af585e3d7c58c335e9d5a41f4783f8dd y main a d249e54fd14d81d9d6f0172388f74a81cbc847af. La consulta del estado local falló por permisos; no quedó confirmado si el árbol de trabajo está limpio. No se ejecutaron pruebas del proyecto.
- **Aprendizaje:** Pendiente de Kevin; no se atribuye una reflexión personal sin confirmación.


## Entrada #2

- **Fecha y hora:** 2026-11-04 19:23:57 (America/Bogota)
- **Integrante:** Kevin
- **Herramienta:** ChatGPT (Codex)
- **Objetivo:** Revisar el avance de Kevin-dev y recomendar una estructura sencilla para centralizar los precios, calcular la tarifa y representar el viaje.
- **Prompt completo y literal:**

> Voy a trabajar en el calculo de tarifa y el modelo de viaje del proyecto conductor. Revise la guia y el avance que ya esta en mi rama. Que estructura sencilla recomiendas para mantener los precios en un solo archivo y comprobar el ejemplo de 8,5 km y 22 minutos.

- **Resumen de la respuesta:** La rama Kevin-dev sigue en el commit `085730a5af585e3d7c58c335e9d5a41f4783f8dd`; aún no contiene cálculo tarifario ni modelo detallado del viaje. Se recomendó centralizar parámetros y una función pura en `src/config/pricing.js`; con categoría Económica, el ejemplo da tarifa de 19.200 COP, comisión de 3.840 COP y ganancia neta de 15.360 COP sin propina.
- **Enlace al chat:** No disponible en esta sesión.
- **Qué se usó / modificó / descartó:** Se consultaron la guía y el árbol/código actual de la rama para formular una recomendación conforme al requisito de una función pura y precios centralizados. No se modificó código ni se afirmó que la sugerencia se haya implementado.
- **Archivos afectados y commit:** `docs/AI_LOG.md` (esta entrada); hash del commit que la incluya — 6ba2a33b07cc243c6c17bda0c0c7340a525a1a7b.
- **Verificación:** La API de GitHub confirmó los heads de las ramas; el árbol de Kevin-dev y los contenidos de `src/context/DriverContext.js` y `src/screens/TripPreviewScreen.js` se leyeron en el commit indicado. El contexto conserva `activeTrip` inicialmente en `null` (línea 10) y la pantalla de vista previa solo muestra su ID (línea 14). No se ejecutaron pruebas; la aritmética del ejemplo se comprobó manualmente contra la fórmula y la tabla de la guía (páginas 4–5).
- **Aprendizaje:** Pendiente de Kevin; no se atribuye una reflexión personal sin confirmación.


## Entrada #3

- **Fecha y hora:** 2026-11-04 20:02:07 (America/Bogota)
- **Integrante:** Kevin
- **Herramienta:** ChatGPT (Codex)
- **Objetivo:** Revisar los tres archivos locales de precios, cálculo de tarifa y modelo de viaje antes del commit.
- **Prompt completo y literal:**

> Ya implemente en mi copia local src/config/pricing.js, src/utils/calculateFare.js y src/models/trip.js. Separe los precios, la funcion de calculo y el objeto inicial del viaje. Mi funcion devuelve tarifa, comision y ganancia, y el viaje guarda el porcentaje de comision aplicado. Comprobe con Node los ejemplos de Economico y XL, la tarifa minima, una propina y el porcentaje guardado. Todavia no hice commit ni push. Podrias revisar estos archivos locales y decirme si ves un error o algun ajuste necesario antes del commit.

- **Resumen de la respuesta:** La separación entre configuración, cálculo puro y creación del viaje coincide con la estructura recomendada por la guía, y los valores del ejemplo son consistentes con la fórmula. Se señalaron riesgos de validación/categoría y una mejora para conservar en el viaje la misma tasa que devolvió el cálculo.
- **Enlace al chat:** No disponible en esta sesión.
- **Qué se usó / modificó / descartó:** Se leyó el contenido local de los tres archivos y se comparó con la guía. Se recomendaron ajustes antes del commit; no se modificó código ni se afirmó que fueran aplicados.
- **Archivos revisados:** `src/config/pricing.js`, `src/utils/calculateFare.js`, `src/models/trip.js`.
- **Archivo afectado y commit:** `docs/AI_LOG.md` (esta entrada); hash del commit que la incluya — 6ba2a33b07cc243c6c17bda0c0c7340a525a1a7b. Según Kevin, los archivos revisados aún no tienen commit ni push.
- **Verificación:** Se inspeccionaron las tres copias locales con números de línea. La lista de ramas en GitHub aún muestra `Kevin-dev` y `Jhoseth-dev` en `085730a5af585e3d7c58c335e9d5a41f4783f8dd` y `main` en `d249e54fd14d81d9d6f0172388f74a81cbc847af`; la consulta local de `git status` falló por permisos. Kevin reportó haber comprobado con Node Económico, XL, tarifa mínima, propina y tasa guardada; no se repitieron esas comprobaciones.
- **Aprendizaje:** Pendiente de Kevin; no se atribuye una reflexión personal sin confirmación.


## Entrada #4

- **Fecha y hora:** 2026-11-04 20:16:47 (America/Bogota)
- **Integrante:** Kevin
- **Herramienta:** ChatGPT (Codex)
- **Objetivo:** Revisar la corrección local de `calculateFare.js` y confirmar si queda algún problema antes del commit.
- **Prompt completo y literal:**

> Corregi calculateFare.js despues de la revision. Ahora compruebo que la categoria pertenezca al objeto de multiplicadores y rechazo distancia, duracion o propina con valores invalidos. Mantengo los tres resultados que pide la guia y guardo el porcentaje de comision en el viaje desde la configuracion. Comprobe de nuevo los ejemplos de Economico y XL, la tarifa minima, el viaje y casos invalidos como toString. No hice commit ni push. Ves algun problema pendiente antes del commit.

- **Resumen de la respuesta:** La comprobación de propiedad propia para la categoría y las validaciones numéricas cubren los riesgos señalados anteriormente; el cálculo conserva la fórmula de la guía y el modelo guarda la tasa configurada. No se encontró un error pendiente en la lógica revisada; queda como posible riesgo que createTrip acepte campos obligatorios ausentes si quien lo llama no los valida.
- **Enlace al chat:** No disponible en esta sesión.
- **Qué se usó / modificó / descartó:** Se leyó la versión local actual de los tres archivos y se revisaron sus referencias de IA. No se modificó código. Las pruebas de Node se registran como reportadas por Kevin; no se repitieron.
- **Archivos revisados:** `src/config/pricing.js`, `src/utils/calculateFare.js`, `src/models/trip.js`.
- **Archivo afectado y commit:** `docs/AI_LOG.md` (esta entrada); hash del commit que la incluya — 6ba2a33b07cc243c6c17bda0c0c7340a525a1a7b. Kevin reporta que los cambios de código siguen sin commit ni push.
- **Verificación:** Se inspeccionaron los tres archivos locales con números de línea. GitHub confirma que los heads remotos siguen en Kevin-dev y Jhoseth-dev: `085730a5af585e3d7c58c335e9d5a41f4783f8dd`; main: `d249e54fd14d81d9d6f0172388f74a81cbc847af`. git status local falló por permisos. Kevin reportó volver a comprobar Económico, XL, tarifa mínima, viaje, tasa guardada y categoría toString; no se ejecutaron pruebas en esta revisión.
- **Aprendizaje:** Pendiente de Kevin; no se atribuye una reflexión personal sin confirmación.
## Entrada #5

- **Fecha y hora:** 2026-11-04 20:28:15 (America/Bogota)
- **Integrante:** Kevin
- **Herramienta:** ChatGPT (Codex)
- **Objetivo:** Verificar el commit local informado y completar los hashes en las entradas previas relacionadas.
- **Prompt completo y literal:**

> Hice el commit 6ba2a33 en Kevin-dev con el modelo de viaje, los precios configurables, el calculo de tarifas y docs/AI_LOG.md. Comprobe que package-lock.json quedo fuera. Aun no hice push. El hash de este commit ya se puede completar en las entradas relacionadas.

- **Resumen de la respuesta:** El HEAD local de Kevin-dev es el commit completo `6ba2a33b07cc243c6c17bda0c0c7340a525a1a7b`. La lista de archivos del commit confirma que incluye `docs/AI_LOG.md` y los tres archivos de código indicados, y que `package-lock.json` quedó fuera.
- **Enlace al chat:** No disponible en esta sesión.
- **Qué se usó / modificó / descartó:** Se completó el hash `6ba2a33b07cc243c6c17bda0c0c7340a525a1a7b` en las entradas #1–#4, que corresponden al registro y al trabajo de tarifa/modelo incluido en ese commit. Se añadió esta entrada para registrar la actualización. No se hizo push ni se creó un commit.
- **Archivos afectados y commit:** `docs/AI_LOG.md` (actualización posterior al commit); hash del commit que incluya esta actualización — pendiente.
- **Verificación:** El ref local `HEAD`/`Kevin-dev` resolvió al hash completo indicado. `git show --stat` y `git diff-tree` enumeraron `docs/AI_LOG.md`, `src/config/pricing.js`, `src/models/trip.js` y `src/utils/calculateFare.js`; `package-lock.json` no aparece. `git status` no pudo ejecutarse porque Git respondió que la operación requiere un árbol de trabajo. GitHub todavía mostraba las ramas remotas en los heads anteriores; los cambios del commit local no aparecen publicados. No se ejecutaron pruebas.
- **Aprendizaje:** Pendiente de Kevin; no se atribuye una reflexión personal sin confirmación.


## Entrada #6

- **Fecha y hora:** 2026-11-04 22:31:15 (America/Bogota)
- **Integrante:** Kevin
- **Herramienta:** ChatGPT (Codex)
- **Objetivo:** Recomendar una estructura de bitácoras y revisar los requisitos del formulario antes de integrar el segundo avance de Jhoseth.
- **Prompt completo y literal:**

> Quiero integrar el segundo avance de Jhoseth en Kevin-dev. Voy a conservar mi bitacora en docs/AI_LOG_KEVIN.md y la de Jhoseth en docs/AI_LOG_JHOSETH.md. La guia tambien exige docs/AI_LOG.md en main, asi que necesito mantener un archivo final que reuna las entradas de ambos. Voy a revisar el registro de este avance para que incluya el idioma en Datos personales, use listas desplegables donde la guia las pide y guarde categorias compatibles con calculateFare. Quiero conservar las validaciones y pruebas que ya funcionan, usando solo lo visto en clase. Que estructura recomiendas para las bitacoras y para estos ajustes. Ves algun requisito del registro que deba revisar antes de modificarlo.

- **Resumen de la respuesta:** GitHub confirma el avance de Jhoseth en 44a85b5ddd716426f47c28bb4a1bb33ba560beab, hijo de 085730a5af585e3d7c58c335e9d5a41f4783f8dd; Kevin-dev va por una rama distinta. La revisión encontró pendientes en idioma, listas desplegables, valores de categoría compatibles, referencias IA y fidelidad/estructura del registro de Jhoseth.
- **Enlace al chat:** No disponible en esta sesión.
- **Qué se usó / modificó / descartó:** Se contrastaron la guía, el commit y los archivos del registro con la configuración y función de tarifa en Kevin-dev. Se recomendó conservar bitácoras por integrante y una bitácora canónica global en main, resolviendo numeración y referencias al consolidar. No se modificó código ni se integraron ramas.
- **Archivos revisados:** src/screens/RegistrationScreen.js, src/utils/validateRegistration.js, src/context/DriverContext.js, src/i18n/translations.js, tests/validateRegistration.test.mjs y docs/AI_LOG.md de Jhoseth-dev; src/config/pricing.js y src/utils/calculateFare.js de Kevin-dev.
- **Archivo afectado y commit:** docs/AI_LOG.md (esta entrada en la copia local de Kevin); hash del commit que la incluya — pendiente.
- **Verificación:** GitHub API confirmó Jhoseth-dev en 44a85b5ddd716426f47c28bb4a1bb33ba560beab, padre 085730a5af585e3d7c58c335e9d5a41f4783f8dd, y Kevin-dev en 6ba2a33b07cc243c6c17bda0c0c7340a525a1a7b. El commit de Jhoseth incluye el formulario, validador y prueba de 11 casos; no se ejecutaron pruebas. Se leyeron los archivos y sus líneas indicadas en la respuesta.
- **Aprendizaje:** Pendiente de Kevin; no se atribuye una reflexión personal sin confirmación.

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
## Entrada #8 — Revisión local de la integración del registro

- **Fecha y hora:** 2026-11-04 22:55:03 (America/Bogota)
- **Integrante:** Kevin
- **Herramienta:** ChatGPT (Codex)
- **Objetivo:** Revisar en modo lectura la integración local del segundo avance de Jhoseth, los ajustes de idioma/opciones/categorías, las pruebas reportadas y la sincronización de las bitácoras antes de confirmarla.
- **Prompt completo y literal:**

> Prepare en Kevin-dev la integracion del commit 44a85b5. Separe mis entradas en docs/AI_LOG_KEVIN.md y las de Jhoseth en docs/AI_LOG_JHOSETH.md. Deje docs/AI_LOG.md como registro comun con numeros del 1 al 7. Corregi el idioma del registro, las listas de opciones y los valores de categoria para que coincidan con calculateFare. Comprobe 13 casos de validacion y exporte el JavaScript para Android e iOS. No hice commit ni push y no probe todo el formulario en un celular. Quiero que revises los archivos locales antes de confirmar la integracion. Las nuevas entradas mias deben quedar en mi archivo y en el registro comun con el mismo numero.

- **Resumen de la respuesta:** La revisión local encontró que el formulario ya incluye idioma, menús desplegables y categorías compatibles con calculateFare; el validador y el archivo de pruebas también usan los nuevos valores. Quedan por resolver referencias IA ausentes si los bloques fueron asistidos y la entrada #7 común, que agrupa tres consultas y aún contiene datos personales y no registra horas.
- **Enlace al chat:** No disponible en esta sesión.
- **Qué se usó / modificó / descartó:** Se leyeron los archivos locales y se compararon con la guía y las categorías de calculateFare. Se añadió esta misma entrada #8 a la bitácora de Kevin y a la común. No se modificó código ni se realizó merge, commit o push.
- **Archivos revisados:** src/screens/RegistrationScreen.js, src/utils/validateRegistration.js, src/context/DriverContext.js, src/i18n/translations.js, src/navigation/RootNavigator.js, src/screens/HomeScreen.js, tests/validateRegistration.test.mjs, package.json, app.json, src/config/pricing.js, src/utils/calculateFare.js, docs/AI_LOG_KEVIN.md, docs/AI_LOG_JHOSETH.md y docs/AI_LOG.md.
- **Archivos afectados y commit:** docs/AI_LOG_KEVIN.md y docs/AI_LOG.md (entrada #8, mismo texto); hash del commit que incluya estas actualizaciones — pendiente.
- **Verificación:** La copia local muestra HEAD en Kevin-dev en 6ba2a33b07cc243c6c17bda0c0c7340a525a1a7b; git status falló con “this operation must be run in a work tree”, así que no se confirmó el estado del índice/árbol. GitHub confirma Kevin-dev en ese hash, Jhoseth-dev en 44a85b5ddd716426f47c28bb4a1bb33ba560beab y main en d249e54fd14d81d9d6f0172388f74a81cbc847af. Se inspeccionó el archivo con 13 aserciones, pero las pruebas y la exportación se registran como reportadas por Kevin; no se repitieron. Kevin indica que no se ha probado el formulario completo en un celular.
- **Aprendizaje:** Pendiente de Kevin; no se atribuye una reflexión personal sin confirmación.
## Entrada #9 — Alcance de cuentas y aprobación del conductor

- **Fecha y hora:** 2026-11-04 23:08:17 (America/Bogota)
- **Integrante:** Kevin
- **Herramienta:** ChatGPT (Codex)
- **Objetivo:** Verificar el estado actual de Kevin-dev y definir un alcance pequeño para el siguiente avance de cuenta y aprobación, separando lo implementable en modo demo de una integración real.
- **Prompt completo y literal:**

> Ya integre en Kevin-dev el avance de Jhoseth con el commit 70ee701. Separe las bitacoras de ambos y mantuve el registro comun. Todavia no hice push. Quiero empezar mi siguiente avance sobre cuentas y aprobacion del conductor. Antes de tocar codigo, revisa el estado actual y dime cual seria el alcance concreto de este commit, que puedo resolver con lo visto en clase y que servicios o datos faltan para no presentar una simulacion como integracion real.

- **Resumen de la respuesta:** El HEAD local es el merge commit 70ee701890ce0161f54474b394b9624b650dafc3, con padres 6ba2a33 y 44a85b5; las ramas remotas aún no lo muestran. La sesión y aprobación actuales son solo estado local pending_demo, sin autenticación, persistencia de cuenta, backend, almacenamiento de documentos ni control de disponibilidad.
- **Enlace al chat:** No disponible en esta sesión.
- **Qué se usó / modificó / descartó:** Se inspeccionaron el commit, el contexto, las pantallas, las dependencias y la configuración de entorno para proponer el alcance del siguiente avance. No se modificó código ni se ejecutaron pruebas.
- **Archivos revisados:** package.json, .env.example, src/context/DriverContext.js, src/screens/RegistrationScreen.js, src/screens/HomeScreen.js, src/navigation/RootNavigator.js y la guía del proyecto.
- **Archivos afectados y commit:** docs/AI_LOG_KEVIN.md y docs/AI_LOG.md (entrada #9, mismo texto); hash del commit que incluya estas actualizaciones — pendiente.
- **Verificación:** git rev-parse y git show confirmaron HEAD 70ee701890ce0161f54474b394b9624b650dafc3 con padres 6ba2a33b07cc243c6c17bda0c0c7340a525a1a7b y 44a85b5ddd716426f47c28bb4a1bb33ba560beab. GitHub aún muestra Kevin-dev en 6ba2a33, Jhoseth-dev en 44a85b5 y main en d249e54. git status falló con “this operation must be run in a work tree”; el estado limpio del árbol no quedó confirmado. La búsqueda en código y dependencias no encontró autenticación, backend, disponibilidad ni SDK Firebase; .env.example solo contiene nombres de configuración vacíos. No se ejecutaron pruebas.
- **Aprendizaje:** Pendiente de Kevin; no se atribuye una reflexión personal sin confirmación.


## Entrada #10 — Materiales y contenidos vistos en clase

- **Fecha y hora:** 2026-11-04 23:23:48 (America/Bogota)
- **Integrante:** Kevin
- **Herramienta:** ChatGPT (Codex)
- **Objetivo:** Incorporar la carpeta de la materia como referencia para ajustar recomendaciones futuras a talleres, clases y ejemplos disponibles.
- **Prompt completo y literal (ruta local sanitizada para no registrar el usuario de Windows):**

> No se si tengas conocimiento de lo que hemos visto en clase, para facilitar las cosas te dejo la ruta de la materia y ahi guardo todos los archivos, esto incluye talleres, clases, ejemplos, etc. Con esto ya puedes saber realmente que es lo que he visto en clase y que no
>
> Ruta: C:\Users\<usuario>\OneDrive\Escritorio\Universidad\SEMESTRE 5\Desarrollo movil.

- **Resumen de la respuesta:** Se localizaron y contrastaron ejemplos locales de React Native/Expo: estado con `useState`, Context, persistencia JSON con AsyncStorage y consumo de API con `fetch`, `async/await` y `response.ok`. En los materiales revisados no apareció un ejemplo de autenticación ni un flujo administrativo de aprobación.
- **Enlace al chat:** No disponible en esta sesión.
- **Qué se usó / modificó / descartó:** Se usaron los archivos de clase listados abajo para calibrar las futuras recomendaciones del proyecto. No se modificó código ni se ejecutaron pruebas. La ruta de Windows se sanitizó en este registro para omitir el usuario local.
- **Archivos de clase revisados:** `Codigos explicados.md`, `practicas/map.js`, `practicas/Flatlist.js`, `ClasesInglesMV/src/hooks/useAlmacenamiento.js`, `ClasesInglesMV/src/contexts/ReservasContext.js`, `ClasesInglesMV/src/hooks/useReserva.js` y `Pok-Dex-Explorer/src/services/pokemonApi.js`.
- **Archivos del proyecto afectados y commit:** Solo esta entrada en `docs/AI_LOG_KEVIN.md` y `docs/AI_LOG.md`, con el mismo número #10; hash del commit que incluya la actualización — pendiente.
- **Verificación:** Se listaron materiales de la carpeta excluyendo dependencias instaladas y metadatos; se leyeron los ejemplos relevantes y se buscaron referencias a autenticación, API y almacenamiento en prácticas/proyectos de clase. No se ejecutaron pruebas ni se modificaron archivos de código.
- **Aprendizaje:** Pendiente de Kevin; no se atribuye una reflexión personal sin confirmación.
## Entrada #11 — Revisión del estado local de disponibilidad

- **Fecha y hora:** 2026-11-05 07:06:20 (America/Bogota)
- **Integrante:** Kevin
- **Herramienta:** ChatGPT (Codex)
- **Objetivo:** Revisar los cambios locales de disponibilidad y la condición de aprobación antes del commit.
- **Prompt completo y literal:**

> Prepare en mi rama un estado local de disponibilidad. Al enviar un registro valido, la cuenta queda pendiente en modo demostracion. El interruptor inicia apagado y solo permite activarse cuando la sesion tiene el estado approved_demo. No agregue una opcion para aprobar mi propia cuenta. Comprobe la regla con cuatro estados de sesion y exporte la app para Android e iOS. Todavia no hice commit ni push. Podrias revisar los cambios locales y decirme si hay algun error antes del commit.

- **Resumen de la respuesta:** La condición de disponibilidad exige `approved_demo`; sin sesión y con registro pendiente el interruptor parte apagado y queda deshabilitado. No se encontró una opción de autoaprobación en la pantalla, aunque el contexto sí expone el setter de sesión a sus consumidores.
- **Enlace al chat:** No disponible en esta sesión.
- **Qué se usó / modificó / descartó:** Se revisaron contexto, helper, pantalla, traducciones, pruebas y metadatos de exportación. No se modificó código ni se ejecutaron pruebas; la comprobación de cuatro estados se conserva como reportada por Kevin.
- **Archivos revisados:** `src/context/DriverContext.js`, `src/utils/canEnableAvailability.js`, `src/screens/HomeScreen.js`, `src/i18n/translations.js`, `tests/validateRegistration.test.mjs`, `package.json` y `dist/metadata.json`.
- **Archivos afectados y commit:** Solo esta entrada en `docs/AI_LOG_KEVIN.md` y `docs/AI_LOG.md`, con el mismo número #11; hash del commit que incluya las actualizaciones — pendiente.
- **Verificación:** La lectura del código confirmó el estado inicial falso, la condición `approvalStatus === 'approved_demo'`, la protección de `updateAvailability` y el interruptor deshabilitado cuando falta aprobación. `dist/metadata.json` contiene bundles para Android e iOS. En el repositorio solo se encontró la prueba de validación del registro, no una prueba guardada de los cuatro estados; no se ejecutaron pruebas ni se verificó la app en dispositivo. Git no pudo acceder al árbol de trabajo por “Permission denied”, por lo que rama, diff y hash actual no quedaron confirmados.
- **Aprendizaje:** Pendiente de Kevin; no se atribuye una reflexión personal sin confirmación.
