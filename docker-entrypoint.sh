#!/bin/sh
set -eu

# Grafana Cloud OTLP uses HTTP Basic auth: instance ID as username and the
# scoped access token as password. Keep the raw token out of the Node process.
if [ -n "${GRAFANA_CLOUD_OTLP_TOKEN:-}" ]; then
  auth="$(printf '%s' "1900004:${GRAFANA_CLOUD_OTLP_TOKEN}" | base64 | tr -d '\n')"
  export OTEL_EXPORTER_OTLP_HEADERS="Authorization=Basic ${auth}"
fi
unset GRAFANA_CLOUD_OTLP_TOKEN

exec node server.js
