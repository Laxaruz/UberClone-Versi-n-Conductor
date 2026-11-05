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
