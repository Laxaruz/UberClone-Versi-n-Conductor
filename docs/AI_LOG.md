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
- **Archivos afectados y commit:** docs/AI_LOG.md (creado en esta sesión; entrada #1); hash del commit — pendiente.
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
- **Archivos afectados y commit:** `docs/AI_LOG.md` (esta entrada); hash del commit que la incluya — pendiente.
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
- **Archivo afectado y commit:** `docs/AI_LOG.md` (esta entrada); hash del commit que la incluya — pendiente. Según Kevin, los archivos revisados aún no tienen commit ni push.
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
- **Archivo afectado y commit:** `docs/AI_LOG.md` (esta entrada); hash del commit que la incluya — pendiente. Kevin reporta que los cambios de código siguen sin commit ni push.
- **Verificación:** Se inspeccionaron los tres archivos locales con números de línea. GitHub confirma que los heads remotos siguen en Kevin-dev y Jhoseth-dev: `085730a5af585e3d7c58c335e9d5a41f4783f8dd`; main: `d249e54fd14d81d9d6f0172388f74a81cbc847af`. git status local falló por permisos. Kevin reportó volver a comprobar Económico, XL, tarifa mínima, viaje, tasa guardada y categoría toString; no se ejecutaron pruebas en esta revisión.
- **Aprendizaje:** Pendiente de Kevin; no se atribuye una reflexión personal sin confirmación.
