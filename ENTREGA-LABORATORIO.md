# Laboratorio 6 — Monitoreo de UNA Chat

**Estudiante:** Gerald  
**Fecha:** 2026-10-30  
**Repositorio:** https://github.com/Gerald120904/infosec-unachat-2026  
**Estado:** implementación local comprobada; integraciones externas pendientes de autenticación/configuración.

## Resultados verificados

- Docker Engine 29.9.2 responde; Docker Compose muestra fork-ger120904-una-chat-1 como healthy.
- GET http://127.0.0.1:3000/: HTTP 200.
- Node.js 24.22.2 dentro del contenedor.
- Socket.IO Artillery: 60 s, 5 VU/s, 300 usuarios, 300 eventos procesados, 0 fallos; p50 7.6 ms, p95 77.5 ms, p99 111.1 ms.
- HTTP Artillery local: 60 s, 5 VU/s, 300 POST y 300 HTTP 200; 0 fallos; p50 7.9 ms, p95 64.7 ms, p99 671.9 ms.
- npm audit de producción: 0 vulnerabilidades tras npm audit fix --omit=dev y reconstrucción.
- Suite repetida después de actualizar el lockfile e integrar Sentry: 12 Mocha, 5 Jest integration y 6 Playwright E2E aprobadas bajo Node.js 24.22.1.
- En la imagen final, `npm ci --omit=dev` reportó 0 vulnerabilidades.
- Carga de otro proyecto fue preservada; la variabilidad de CPU limita interpretar los percentiles de cola como benchmark aislado.

## Adaptaciones

- OpenTelemetry inicia antes de Express/HTTP; Pino agrega trace_id/span_id, y se añadieron métricas HTTP/chat y spans de mensaje.
- La ruta /__lab/message está habilitada solo en local, valida origen loopback/bridge, reutiliza el validador real y se bloquea bajo VERCEL=1.
- Artillery usa el motor Socket.IO nativo; no se instaló el motor legado.
- Docker publica el puerto solo en 127.0.0.1:3000.
- Sentry Node SDK 10.78.0 está integrado solo para Vercel, requiere `SENTRY_DSN`, no captura PII y elimina datos, cookies, headers y query strings antes del envío. El error controlado está apagado y protegido por secreto.
- La auditoría completa de desarrollo reporta 1 alta, 24 moderadas y 3 bajas. La alta remanente es `serialize-javascript` transitiva de Mocha; npm solo ofrece corregirla instalando Mocha 5.0.5, lo que rompe compatibilidad. La auditoría de producción tiene 0.

## Pendiente

Grafana Cloud requiere inicio de sesión y credencial OTLP configurada localmente. Vercel aún no tiene deployment público verificado; Cronitor depende de esa URL. Sentry aún requiere crear/reutilizar el proyecto, configurar su DSN en Vercel y observar un evento real. No se simulan capturas ni estados de servicios.

Consulte el informe PDF y los archivos de evidencias-laboratorio/.
