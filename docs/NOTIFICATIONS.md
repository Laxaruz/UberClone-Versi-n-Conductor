# Notificaciones de solicitudes

La app registra el identificador FCM del dispositivo en `drivers/{uid}/devices/{deviceId}` cuando el conductor esta aprobado. El servidor escucha solicitudes nuevas en Firestore y envia un aviso breve a los conductores aprobados y disponibles. El aviso solo contiene el ID de la solicitud. Al tocarlo, la app abre Solicitud entrante y consulta Firestore otra vez. Si ya vencio o fue aceptada, la transaccion existente impide aceptarla.

El servidor debe estar encendido para enviar estos avisos. La solicitud dura 15 segundos, asi que la entrega del aviso no esta garantizada antes del vencimiento. Expo Go no incluye el modulo nativo FCM. La app puede seguir usandose en Expo Go, pero alli no registra el dispositivo ni recibe push. Las pruebas de codigo y la exportacion de Expo tampoco demuestran que haya llegado un aviso real.

El servidor marca la solicitud como tomada para avisar una sola vez. Si falla una lectura o un envio, reintenta una vez mientras siga vigente y no vuelve a enviar a los dispositivos que ya recibieron una respuesta exitosa de FCM. Si el segundo intento tambien falla, la marca permanece y el aviso se pierde. Tambien se puede perder si el servidor se detiene durante esos 15 segundos.

## Configuracion nativa pendiente

- Android: instalar una compilacion de desarrollo del paquete `com.laxaruz.uberclonedriver` y permitir notificaciones. El proyecto ya incluye `google-services.json` y la configuracion del plugin.
- iPhone: configurar APNs para este proyecto en Firebase y firmar una compilacion de desarrollo con Apple Developer. Se necesita un iPhone fisico para probar la recepcion. Actualmente el equipo no tiene la cuenta de pago, por lo que esta prueba sigue pendiente.
- `app.config.js` usa APNs `development` para una build local de desarrollo y `production` para perfiles EAS distintos de `development`. Se puede fijar con `EXPO_APNS_ENV`; debe coincidir con el perfil de firma de Apple.
- Publicar las reglas nuevas de `firestore.rules` antes de registrar dispositivos. Si no se publican, Firestore rechazara el guardado del identificador FCM.

Para la prueba, deja un conductor aprobado y disponible con la app en segundo plano, y crea una solicitud nueva de prueba desde el proceso administrativo que ya se usa. Comprueba que aparezca el aviso, que al tocarlo se abra Solicitud entrante y que una solicitud vencida no pueda aceptarse. No presentes una alerta local ni la exportacion de Expo como prueba de FCM.
