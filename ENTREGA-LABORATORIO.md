# Laboratorio 6 — Monitoreo de UNA Chat

**Estudiante:** Gerald  
**Fecha:** 2026-10-30  
**Repositorio:** https://github.com/Gerald120904/infosec-unachat-2026  
**Estado:** UNA Chat está desplegado públicamente en Vercel y la conversación Socket.IO fue comprobada entre dos clientes. Docker y las pruebas locales de carga están comprobados. Cronitor tiene un monitor saludable para Render; falta añadir el alias público de Vercel. Sentry ya tiene proyecto, falta configurar el DSN en Vercel y confirmar un evento real. Grafana tiene política OTLP restringida; su token aún no se ha guardado localmente ni se ha verificado ingestión.

## Resultados verificados

- Docker Engine 29.9.2 responde; Docker Compose muestra fork-ger120904-una-chat-1 como healthy.
- GET http://127.0.0.1:3000/: HTTP 200.
- Node.js 24.22.2 dentro del contenedor.
- Socket.IO Artillery (run `tc5wr_mp4bq43cfnrzgnkq9ahkamcq7rtjc_erhf`): 60 s, 5 VU/s, 300 mensajes emitidos y 300 procesados en logs Docker, 0 VU fallidos; p50 3.7 ms, p95 17.3 ms, p99 29.1 ms.
- HTTP Artillery local: 60 s, 5 VU/s, 300 POST y 300 HTTP 200; 0 fallos; p50 4 ms, p95 8.9 ms, p99 22.9 ms.
- npm audit de producción: 0 vulnerabilidades tras npm audit fix --omit=dev y reconstrucción.
- Después de actualizar Mocha a 12.0.3, Node.js 24.22.1 aprobó 12 Mocha, 5 Jest y 6 Playwright E2E (23/23), ejecutando las CLI directas porque `npm ci` quedó muy lento en Windows. Los resultados se detallan en `evidencias-laboratorio/parte-3-docker-artillery/node24-tests-after-mocha12-2026-10-30.txt`.
- La actualización de Mocha 12.0.3 redujo el total de avisos de auditoría de 29 a 27; quedaron 3 bajas y 24 moderadas, sin altas. La auditoría de producción reportó 0 vulnerabilidades.
- En la imagen final, `npm ci --omit=dev` reportó 0 vulnerabilidades.
- Vercel: proyecto conectado al fork en `master`, URL pública https://infosec-unachat-2026.vercel.app. Dos clientes de navegador establecieron Socket.IO por WebSocket y recibieron los mensajes de prueba. Capturas originales en `evidencias-laboratorio/parte-1-vercel-sentry-cronitor/`.
- Cronitor: `UNA Chat - Vercel` se creó para https://infosec-unachat-2026.vercel.app, con chequeo HTTP cada 5 minutos, alertas activas y lista `Default`. El primer chequeo confirmó Healthy, HTTP 200, 260 ms desde Frankfurt. `UNA Chat - Render` permanece como monitor separado y Healthy.
- El contenedor local generó 310 logs de mensajes con correlación Pino `trace_id` y `span_id`, verificado en sus logs Docker sin conservar texto de conversación.
- Carga de otro proyecto fue preservada; la variabilidad de CPU limita interpretar los percentiles de cola como benchmark aislado.

## Adaptaciones

- OpenTelemetry inicia antes de Express/HTTP; Pino agrega trace_id/span_id, y se añadieron métricas HTTP/chat y spans de mensaje.
- La ruta /__lab/message está habilitada solo en local, valida origen loopback/bridge, reutiliza el validador real y se bloquea bajo VERCEL=1.
- Artillery usa el motor Socket.IO nativo; no se instaló el motor legado.
- Docker publica el puerto solo en 127.0.0.1:3000.
- Sentry Node SDK 10.78.0 está integrado solo para Vercel, requiere `SENTRY_DSN`, no captura PII y elimina datos, cookies, headers y query strings antes del envío. El error controlado está apagado y protegido por secreto.
- Auditoría de producción: 0 vulnerabilidades. Tras Mocha 12.0.3, la auditoría de desarrollo reportó 27 (24 moderadas y 3 bajas; sin altas). No se ejecutó `npm audit fix --force`, que proponía degradaciones incompatibles de Jest/Artillery.

## Pendiente

Pendiente: configurar `SENTRY_DSN` en Vercel y comprobar un evento real con el error de laboratorio temporal protegido (retirándolo al terminar), y guardar el token OTLP en `.env` ignorado para validar logs, métricas y trazas en Grafana Cloud. No se simulan capturas ni estados de servicios.

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
| Grafana OTLP | `evidencias-laboratorio/parte-2-grafana/01-grafana-politica-otlp-scopes-2026-10-30.png` | Scopes limitados; no demuestra ingestión. |
| Docker, interfaz y dos clientes | `evidencias-laboratorio/parte-3-docker-artillery/03-chat-docker-verificado-2026-10-30.png`, `04-recepcion-dos-clientes-docker-2026-10-30.png` | Interfaz local y difusión Socket.IO en Compose. |

Las capturas previas de Docker (`01-chat-docker-2026-10-30.png` y `02-conversacion-docker-dos-clientes-2026-10-30.png`) también se conservan. El índice con fecha, entorno y prueba está en `evidencias-laboratorio/README.md`. No se incluyeron secretos.
