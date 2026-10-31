# Índice de evidencias — 30 de octubre de 2026

Todas las imágenes listadas son capturas originales del navegador local de laboratorio. No se guardaron capturas de plataformas externas sin acceso de sesión. No se retocaron los estados del servicio; las imágenes originales se conservan.

## Parte 1 — Vercel, Cronitor y Sentry

- **Sin captura todavía.** No hay URL de Vercel desplegada y verificada, por lo que no existe evidencia legítima del monitor Cronitor ni de un evento Sentry producido en ese despliegue. El código Sentry quedó preparado, pero no se configuró proyecto/DSN sin una sesión autenticada.

## Parte 2 — Grafana Cloud

- **Sin captura todavía.** La instrumentación local está preparada, pero no se autenticó Grafana Cloud ni se configuró una credencial OTLP. No se afirma ingestión remota de logs, métricas o trazas.

## Parte 3 — Docker y Artillery

| Archivo | Fecha/entorno/servicio | Qué demuestra |
|---|---|---|
| parte-3-docker-artillery/01-chat-docker-2026-10-30.png | 2026-10-30, navegador local, Docker Compose | Interfaz real de UNA Chat servida por el contenedor local. |
| parte-3-docker-artillery/02-conversacion-docker-dos-clientes-2026-10-30.png | 2026-10-30, navegador local, Docker Compose + Socket.IO | Dos clientes locales y un mensaje difundido por el evento real del chat. |

Los resultados de carga se conservan como reportes JSON generados por Artillery y archivos YAML ejecutables, junto con logs Pino y verificaciones del daemon. Los logs de muestra se guardan sin campos de credenciales y sin registrar el texto de mensajes.

Las pruebas posteriores al ajuste de seguridad/Sentry se documentan en `parte-3-docker-artillery/final-test-results-sentry-2026-10-30.txt` (12 Mocha, 5 Jest, 6 Playwright). El build final de Docker y la prueba funcional posterior constan en `parte-3-docker-artillery/docker-build-sentry-10-postcheck-2026-10-30.txt`. `parte-3-docker-artillery/docker-daemon-recovery-2026-10-30.txt` deja constancia de la indisponibilidad transitoria de la API Docker y de su recuperación sin intervenir en contenedores ajenos.
