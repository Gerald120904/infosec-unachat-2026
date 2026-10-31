## Grafana Cloud: ingestión verificada

Fecha de consulta: 2026-10-31. Sesión autenticada de Grafana Cloud, stack `earnestbus1072` en `us-east-3`. Todas las capturas de consulta indican `service_name=una-chat`, entorno `local` y un intervalo de una hora. Los JPG son capturas originales del navegador; los PNG homónimos son conversiones de formato sin recorte ni anotaciones.

- **Loki:** la consulta `{service_name="una-chat"} |= "chat.message.processed"` encontró el evento del mensaje Socket.IO. Se observó `deployment_environment=local`, `runtime=docker` y `transport=socket.io`. Capturas: `grafana-loki-logs-2026-10-31.png`, `02-loki-message-log-2026-10-31.png`.
- **Prometheus/Mimir:** las consultas `http_server_requests_total`, `chat_messages_processed_total`, `http_server_duration_milliseconds_bucket` y `http_server_errors_total`, filtradas por servicio y entorno local, devolvieron series. Capturas: `grafana-prometheus-requests-2026-10-31.png`, `grafana-chat-metrics-2026-10-31.png`, `grafana-prometheus-latency-2026-10-31.png`, `grafana-prometheus-errors-2026-10-31.png`.
- **Tempo:** TraceQL `{ resource.service.name = "una-chat" }` devolvió trazas. Una traza de `Evento-Mensaje-Server` contiene tres spans, incluidos `chat.process_message` y los spans de Socket.IO. Capturas: `grafana-trace-chat-span-local-2026-10-31.png`, `grafana-tempo-trace-id-2026-10-31.png`.
- **Correlación:** desde Tempo se abrió la consulta de logs de la traza y Loki devolvió un evento filtrado por el mismo `trace_id`. Capturas: `grafana-log-trace-correlated-2026-10-31.png`, `grafana-trace-detail-correlated-2026-10-31.png`.

La autenticación HTTP 200 se considera solo comprobación de conectividad, no ingestión. La conclusión de recepción se basa en las consultas de datos anteriores. Las pruebas funcionales incluyeron GET `/` 200, un POST local válido, un POST inválido con HTTP 400 y un mensaje Socket.IO válido con respuesta. Diagnósticos temporales no registraron fallos de exportación; se mostró una advertencia no bloqueante de valor inválido para `host.id`.

### Configuración y seguridad

- `.env.example` contiene el endpoint `https://otlp-gateway-prod-us-east-3.grafana.net/otlp`, que coincide con la región de la instancia consultada.
- La autenticación local genera `Authorization=Basic%20...`. El parser del exportador OTLP de Node URL-decodifica los pares clave/valor, por lo que `%20` se convierte en el espacio esperado por HTTP Basic.
- `GRAFANA_CLOUD_OTLP_TOKEN` solo se lee desde `.env` local ignorado por Git y el entrypoint lo retira antes de iniciar Node. OpenTelemetry se desactiva para Vercel.
- Se corrigieron en `telemetry.js` los nombres de configuración de SDK para lectores métricos/procesadores de logs. Sin estos nombres, el SDK no inicializaba los exportadores de esas señales.
- `01-grafana-politica-otlp-scopes-2026-10-30.png` documenta la política con scopes de escritura limitados; por sí sola no acredita ingestión.

Cada imagen tiene un archivo `.txt` junto a ella con servicio, entorno, intervalo, consulta y resultado observado. No se guardaron capturas de tokens ni encabezados de autorización.
