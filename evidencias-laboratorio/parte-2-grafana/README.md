Evidencia: política Grafana Cloud para telemetría local
Fecha: 2026-10-30, sesión autenticada en navegador integrado.
Servicio: Grafana Labs, organización earnestbus1072.
Prueba: inspección de Access Policies de la política `una-chat-local-otel-write`.
Resultado observado: política activa con scopes `logs:write`, `metrics:write` y `traces:write`; el detalle de tokens se ocultó antes de capturar.
Límite: confirma permisos configurados, no la recepción de datos. La ingestión OTLP y las consultas quedan pendientes hasta configurar el token local.
Captura: 01-grafana-politica-otlp-scopes-2026-10-30.png
