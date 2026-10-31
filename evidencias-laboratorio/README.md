# Índice de evidencias — 30 de octubre de 2026

Todas las imágenes listadas son capturas originales del navegador local de laboratorio. No se guardaron capturas de plataformas externas sin acceso de sesión. No se retocaron los estados del servicio; las imágenes originales se conservan.

## Parte 1 — Vercel, Cronitor y Sentry

- Vercel: el fork `Gerald120904/infosec-unachat-2026` está desplegado en https://infosec-unachat-2026.vercel.app. Dos clientes reales de navegador se conectaron por WebSocket Socket.IO e intercambiaron mensajes. Capturas `parte-1-vercel-sentry-cronitor/01-vercel-chat-funcionando-2026-10-30.png` y `02-vercel-dos-clientes-2026-10-30.png`; prueba resumida en `vercel-chat-test-2026-10-30.txt`.
- Cronitor: se creó `UNA Chat - Vercel` para la URL pública, con GET cada 5 minutos, alertas activas y lista `Default`. El primer chequeo comprobó Healthy, HTTP 200 y 260 ms desde Frankfurt. Captura de configuración en `parte-1-vercel-sentry-cronitor/04-cronitor-vercel-monitor-created-2026-10-30.png` y resultado saludable en `05-cronitor-vercel-healthy-2026-10-30.png`. Monitor real: https://cronitor.io/app/monitors/UTzIWf. `UNA Chat - Render` continúa separado y Healthy; captura en `03-cronitor-render-healthy-2026-10-30.png`.
- Sentry: proyecto `una-chat-vercel` creado en la organización `gerald-aw0`; el Issues Feed real aún muestra el onboarding sin eventos. Captura `parte-1-vercel-sentry-cronitor/06-sentry-project-no-events-yet-2026-10-30.png` registra ese estado. DSN y otros secretos no se incluyen en las capturas ni el repositorio. La integración en Vercel y el evento controlado siguen pendientes.

## Parte 2 — Grafana Cloud

- Política Grafana real creada en `earnestbus1072`, restringida a `logs:write`, `metrics:write`, `traces:write`; token local de 90 días aún no asociado a `.env`. No se afirma ingestión remota.

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

La suite repetida tras actualizar Mocha a 12.0.3 aprobó 12 Mocha, 5 Jest y 6 Playwright (23/23) con Node 24.22.1; el registro está en `parte-3-docker-artillery/node24-tests-after-mocha12-2026-10-30.txt`. El `npm ci` local completo no terminó por la lentitud de reify en Windows; se deja constancia y no se afirma que haya finalizado. En Docker, la instalación de producción y su auditoría sí terminaron con 0 vulnerabilidades.

Las pruebas anteriores posteriores al ajuste de seguridad/Sentry aparecen en `parte-3-docker-artillery/final-test-results-sentry-2026-10-30.txt`. El build final de Docker y la prueba funcional posterior constan en `parte-3-docker-artillery/docker-build-sentry-10-postcheck-2026-10-30.txt`. `parte-3-docker-artillery/docker-daemon-recovery-2026-10-30.txt` deja constancia de la indisponibilidad transitoria de la API Docker y de su recuperación sin intervenir en contenedores ajenos.
