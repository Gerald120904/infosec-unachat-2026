# Índice de evidencias — actualización 31 de octubre de 2026

Las imágenes listadas son capturas originales de interfaces reales, tomadas con Playwright o desde las sesiones autenticadas del navegador. No se retocaron los estados del servicio; las imágenes originales se conservan. Cuando una captura refleja una configuración histórica, se identifica como tal junto al registro vigente.

## Parte 1 — Vercel, Cronitor y Sentry

- Vercel: el fork `Gerald120904/infosec-unachat-2026` está desplegado en https://infosec-unachat-2026-black.vercel.app. Dos clientes reales de navegador se conectaron por WebSocket Socket.IO e intercambiaron mensajes. Capturas `parte-1-vercel-sentry-cronitor/01-vercel-chat-funcionando-2026-10-30.png` y `02-vercel-dos-clientes-2026-10-30.png`; prueba resumida en `vercel-chat-test-2026-10-30.txt`.
- Cronitor: `UNA Chat - Vercel` apunta ahora a https://infosec-unachat-2026-black.vercel.app, con GET cada 5 minutos, alertas activas y lista `Default`. Tras el cambio, la vista mostró Healthy, uptime 100% en 24 h, promedio 341 ms, 19 chequeos y 0 alertas. Estado actual registrado en `parte-1-vercel-sentry-cronitor/10-cronitor-vercel-final-2026-10-31.txt`; la imagen 05 es una captura histórica del alias previo. Monitor real: https://cronitor.io/app/monitors/UTzIWf. `UNA Chat - Render` continúa separado.
- Sentry: proyecto `una-chat-vercel` en `gerald-aw0` recibió el error controlado de verificación desde Vercel Production (1 evento). La captura original `parte-1-vercel-sentry-cronitor/07-sentry-controlled-event-2026-10-31.jpg` muestra el issue en el Feed; la captura 06 documenta el estado inicial. Las variables temporales fueron eliminadas de Vercel Production; solo se conserva `SENTRY_DSN`. No se incluyen valores secretos.
- Vercel tras limpieza: el commit `c411341` quedó Ready. GET `/` respondió 200, el smoke test Socket.IO/WebSocket recibió el evento y la ruta temporal devolvió 404. Captura Playwright original `parte-1-vercel-sentry-cronitor/09-vercel-live-chat-after-cleanup-2026-10-31.png`; metadatos en el `.txt` homónimo.
- GitHub Actions: ejecución `41177108139` terminó Success; aprobó Node 24, instalación, pruebas unitarias, integración, Playwright y el trabajo `deploy`. Captura de la vista pública en `parte-1-vercel-sentry-cronitor/08-github-actions-cleanup-success-2026-10-31.png`; metadatos y enlace en el `.txt` homónimo. Run: https://github.com/Gerald120904/infosec-unachat-2026/actions/runs/41177108139.

## Parte 2 — Grafana Cloud

- El contenedor usa endpoint OTLP, instance ID y token solo desde `.env` local ignorado por Git; el entrypoint construye Basic auth y retira el token antes de iniciar Node. El gateway aceptó la autenticación (HTTP 200); una comprobación de IDs incorrectos dio 401. Esto no prueba por sí solo ingestión. En la página Hosted Logs se observó `Ingest Rate: 0 bytes` y Explore quedó cargando, así que recepción/consulta de señales permanece pendiente. Registro sin secretos: `parte-2-grafana/02-otlp-auth-y-smoke-local-2026-10-31.txt`.

Captura de la vista de Access Policies sin mostrar tokens: `parte-2-grafana/01-grafana-politica-otlp-scopes-2026-10-30.png`. Se tomó el 2026-10-30 desde la sesión autenticada y muestra la política activa `una-chat-local-otel-write` con los tres scopes OTLP limitados; no demuestra ingestión.

Capturas de Vercel en `parte-1-vercel-sentry-cronitor/01-vercel-chat-funcionando-2026-10-30.png` y `02-vercel-dos-clientes-2026-10-30.png` documentan la interfaz y mensajes difundidos por WebSocket. `vercel-chat-test-2026-10-30.txt` describe fecha, entorno, resultado y límites.

## Parte 3 — Docker y Artillery

| Archivo | Fecha/entorno/servicio | Qué demuestra |
|---|---|---|
| parte-3-docker-artillery/01-chat-docker-2026-10-30.png | 2026-10-30, navegador local, Docker Compose | Interfaz real de UNA Chat servida por el contenedor local. |
| parte-3-docker-artillery/02-conversacion-docker-dos-clientes-2026-10-30.png | 2026-10-30, navegador local, Docker Compose + Socket.IO | Dos clientes locales y un mensaje difundido por el evento real del chat. |
| parte-3-docker-artillery/03-chat-docker-verificado-2026-10-30.png | 2026-10-30, navegador local, contenedor reconstruido | Interfaz y mensaje real recibidos tras reconstrucción final de Docker. |
| parte-3-docker-artillery/04-recepcion-dos-clientes-docker-2026-10-30.png | 2026-10-30, navegador local, dos clientes Socket.IO | Mensaje emitido por un cliente recibido en los dos clientes conectados. |

Los resultados más recientes están en `parte-3-docker-artillery/artillery-socketio-retest-2026-10-30.txt` (300 VUs, 300 emits, 0 fallos; p50 3.7 ms, p95 17.3 ms), `socketio-processed-count-2026-10-30.txt` (300 logs del servidor con `outcome=success`) y `artillery-http-retest-path-2026-10-30.txt` (300 respuestas 200). CPU del contenedor ajeno `respondent-community-respondent-1` permaneció activa (24.8% antes y 51.19% después); no se detuvo.

El archivo `parte-3-docker-artillery/pino-trace-correlation-2026-10-30.txt` registra el conteo de 310 logs de mensajes con `trace_id` y `span_id`; no incluye el texto del chat.

Los resultados de carga se conservan como reportes de consola de Artillery y archivos YAML ejecutables, junto con logs Pino y verificaciones del daemon. Los logs se guardan sin campos de credenciales y sin registrar el texto de mensajes.

La suite repetida tras actualizar Mocha a 12.0.3 aprobó 12 Mocha, 5 Jest y 6 Playwright (23/23) con Node 24.22.1; el registro está en `parte-3-docker-artillery/node24-tests-after-mocha12-2026-10-30.txt`. En la revisión actual, `npm ci` local no avanzó durante varios minutos; se canceló, Mocha pasó 12/12 directamente en Node 24.22.2 y GitHub Actions completó con éxito todas las pruebas para el commit publicado. En Docker, la instalación de producción y su auditoría sí terminaron con 0 vulnerabilidades.

Las pruebas anteriores posteriores al ajuste de seguridad/Sentry aparecen en `parte-3-docker-artillery/final-test-results-sentry-2026-10-30.txt`. El build final de Docker y la prueba funcional posterior constan en `parte-3-docker-artillery/docker-build-sentry-10-postcheck-2026-10-30.txt`. `parte-3-docker-artillery/docker-daemon-recovery-2026-10-30.txt` deja constancia de la indisponibilidad transitoria de la API Docker y de su recuperación sin intervenir en contenedores ajenos.


Validación posterior al ajuste OTLP: parte-3-docker-artillery/05-validacion-tras-otel-2026-10-31.txt registra 12 Mocha, 5 Jest y 6 Playwright aprobados con Node 24.22.2, Docker healthy, HTTP 200 y respuesta Socket.IO. parte-2-grafana/02-otlp-auth-y-smoke-local-2026-10-31.txt registra el estado de autenticación y la limitación de consulta de Grafana.
