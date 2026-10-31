# Laboratorio 6 — Monitoreo de UNA Chat

**Estudiante:** Gerald  
**Fecha:** 2026-10-31
**Repositorio:** https://github.com/Gerald120904/infosec-unachat-2026  
**Estado:** UNA Chat está desplegado en Vercel y Socket.IO fue comprobado entre dos clientes. El commit `c411341` quedó listo en Vercel; CI, integración, Playwright y el paso de despliegue pasaron. Sentry recibió un error controlado; la ruta y las variables temporales se retiraron, y `SENTRY_DSN` quedó como la única variable de aplicación. Grafana OTLP está configurado en Docker y su autenticación al gateway fue aceptada; la búsqueda de señales aún no quedó verificada en la interfaz de Grafana.

## Resultados verificados

- Docker Engine 29.9.2 responde; Docker Compose muestra fork-ger120904-una-chat-1 como healthy.
- GET http://127.0.0.1:3000/: HTTP 200.
- Node.js 24.22.2 dentro del contenedor.
- GitHub Actions, ejecución [41177108139](https://github.com/Gerald120904/infosec-unachat-2026/actions/runs/41177108139): éxito en `master`, commit `c411341`; Node.js 24, instalación, unitarias, integración, Playwright y job `deploy` aprobados.
- Socket.IO Artillery (run `tc5wr_mp4bq43cfnrzgnkq9ahkamcq7rtjc_erhf`): 60 s, 5 VU/s, 300 mensajes emitidos y 300 procesados en logs Docker, 0 VU fallidos; p50 3.7 ms, p95 17.3 ms, p99 29.1 ms.
- HTTP Artillery local: 60 s, 5 VU/s, 300 POST y 300 HTTP 200; 0 fallos; p50 4 ms, p95 8.9 ms, p99 22.9 ms.
- npm audit de producción: 0 vulnerabilidades tras npm audit fix --omit=dev y reconstrucción.
- Después de actualizar Mocha a 12.0.3, Node.js 24.22.1 aprobó 12 Mocha, 5 Jest y 6 Playwright E2E (23/23), ejecutando las CLI directas porque `npm ci` quedó muy lento en Windows. Los resultados se detallan en `evidencias-laboratorio/parte-3-docker-artillery/node24-tests-after-mocha12-2026-10-30.txt`.
- La actualización de Mocha 12.0.3 redujo el total de avisos de auditoría de 29 a 27; quedaron 3 bajas y 24 moderadas, sin altas. La auditoría de producción reportó 0 vulnerabilidades. Tras el ajuste OTLP local, se repitieron Mocha 12/12, Jest 5/5 y Playwright 6/6 con Node 24.22.2; registro en `evidencias-laboratorio/parte-3-docker-artillery/05-validacion-tras-otel-2026-10-31.txt`.
- En la imagen final, `npm ci --omit=dev` reportó 0 vulnerabilidades.
- Vercel: proyecto conectado al fork en `master`, dominio asignado https://infosec-unachat-2026-black.vercel.app. Dos clientes de navegador establecieron Socket.IO por WebSocket y recibieron los mensajes de prueba. Capturas originales en `evidencias-laboratorio/parte-1-vercel-sentry-cronitor/`.
- Vercel: tras quitar los controles temporales de prueba, el deployment del commit `c411341` quedó Ready. La URL asignada respondió HTTP 200; una prueba Socket.IO/WebSocket de un solo mensaje recibió la respuesta del evento `Evento-Mensaje-Server`; `/api/__lab/sentry-test` respondió 404.
- Cronitor: el monitor `UNA Chat - Vercel` apunta ahora a la URL asignada `https://infosec-unachat-2026-black.vercel.app`, con GET cada 5 minutos, alertas activas y lista `Default`. La vista mostró Healthy, 100% en las últimas 24 horas, promedio 341 ms, 19 chequeos y 0 alertas. `UNA Chat - Render` permanece independiente. Registro de estado actual: `10-cronitor-vercel-final-2026-10-31.txt`; la captura 05 queda identificada como histórica.
- El contenedor local generó logs de solicitudes y mensajes con Pino `trace_id` y `span_id`; el smoke test actual confirmó HTTP 200 y el eco correcto del mensaje Socket.IO. El texto no se conserva en los logs. La configuración OTLP local carga la autenticación en Docker, y Vercel se probó sin generar headers de Grafana.
- Carga de otro proyecto fue preservada; la variabilidad de CPU limita interpretar los percentiles de cola como benchmark aislado.

## Adaptaciones

- OpenTelemetry inicia antes de Express/HTTP; Pino agrega trace_id/span_id, y se añadieron métricas HTTP/chat y spans de mensaje.
- La ruta /__lab/message está habilitada solo en local, valida origen loopback/bridge, reutiliza el validador real y se bloquea bajo VERCEL=1.
- Artillery usa el motor Socket.IO nativo; no se instaló el motor legado.
- Docker publica el puerto solo en 127.0.0.1:3000.
- Sentry Node SDK 10.78.0 está integrado solo para Vercel, requiere `SENTRY_DSN`, no captura PII y elimina datos, cookies, headers y query strings antes del envío. El proyecto `una-chat-vercel` recibió el error de prueba (1 evento). Las variables `SENTRY_LAB_TEST_ENABLED` y `SENTRY_LAB_TEST_SECRET` se eliminaron de Production; solo permanece `SENTRY_DSN`. El deployment posterior quedó Ready y la ruta de laboratorio devuelve 404.
- Auditoría de producción: 0 vulnerabilidades. Tras Mocha 12.0.3, la auditoría de desarrollo reportó 27 (24 moderadas y 3 bajas; sin altas). No se ejecutó `npm audit fix --force`, que proponía degradaciones incompatibles de Jest/Artillery.

## Pendiente

Docker usa el token OTLP desde `.env` local ignorado por Git. El gateway aceptó la autenticación; falta confirmar ingestión indexada y consulta de las tres señales: Hosted Logs indicó 0 bytes durante la verificación y Explore quedó cargando. El registro está en `evidencias-laboratorio/parte-2-grafana/02-otlp-auth-y-smoke-local-2026-10-31.txt`. El `npm ci` local se detuvo tras varios minutos sin progreso en Windows; Mocha aprobó 12/12 localmente y GitHub Actions confirmó todas las suites en Node 24 para el commit publicado. No se simulan capturas ni estados de servicios.

Consulte el informe PDF y los archivos de evidencias-laboratorio/.

## Capturas auténticas

| Evidencia | Ruta relativa | Qué muestra |
|---|---|---|
| Vercel, chat público | `evidencias-laboratorio/parte-1-vercel-sentry-cronitor/01-vercel-chat-funcionando-2026-10-30.png` | Mensajes visibles en el alias público. |
| Vercel, dos clientes | `evidencias-laboratorio/parte-1-vercel-sentry-cronitor/02-vercel-dos-clientes-2026-10-30.png` | Cliente público conectado y mensaje de prueba. |
| Cronitor, Render | `evidencias-laboratorio/parte-1-vercel-sentry-cronitor/03-cronitor-render-healthy-2026-10-30.png` | Monitor Render Healthy y chequeo 200. |
| Cronitor, configuración Vercel | `evidencias-laboratorio/parte-1-vercel-sentry-cronitor/04-cronitor-vercel-monitor-created-2026-10-30.png` | URL monitorizada y configuración inicial. |
| Cronitor, Vercel Healthy | `evidencias-laboratorio/parte-1-vercel-sentry-cronitor/05-cronitor-vercel-healthy-2026-10-30.png` | Chequeo HTTP 200, 260 ms, alertas activas. |
| Sentry | `evidencias-laboratorio/parte-1-vercel-sentry-cronitor/06-sentry-project-no-events-yet-2026-10-30.png` | Proyecto creado; Issues Feed aún sin eventos. |
| Sentry, evento controlado | `evidencias-laboratorio/parte-1-vercel-sentry-cronitor/07-sentry-controlled-event-2026-10-31.jpg` | Evento de error controlado recibido desde Vercel Production; conteo 1. |
| GitHub Actions | `evidencias-laboratorio/parte-1-vercel-sentry-cronitor/08-github-actions-cleanup-success-2026-10-31.png` | Ejecución 41177108139: estado Success, test y deploy completados. |
| Vercel, chat después de limpieza | `evidencias-laboratorio/parte-1-vercel-sentry-cronitor/09-vercel-live-chat-after-cleanup-2026-10-31.png` | Interfaz pública y respuesta al mensaje de smoke test por Socket.IO. |
| Cronitor, estado actualizado | `evidencias-laboratorio/parte-1-vercel-sentry-cronitor/10-cronitor-vercel-final-2026-10-31.txt` | Registro textual del panel actual tras cambiar la URL; la captura 05 corresponde a la configuración previa. |
| Grafana OTLP | `evidencias-laboratorio/parte-2-grafana/01-grafana-politica-otlp-scopes-2026-10-30.png` | Scopes limitados; no demuestra ingestión. |
| Docker, interfaz y dos clientes | `evidencias-laboratorio/parte-3-docker-artillery/03-chat-docker-verificado-2026-10-30.png`, `04-recepcion-dos-clientes-docker-2026-10-30.png` | Interfaz local y difusión Socket.IO en Compose. |

Las capturas previas de Docker (`01-chat-docker-2026-10-30.png` y `02-conversacion-docker-dos-clientes-2026-10-30.png`) también se conservan. El índice con fecha, entorno y prueba está en `evidencias-laboratorio/README.md`. No se incluyeron secretos.
