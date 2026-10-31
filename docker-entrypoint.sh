#!/bin/sh
set -eu

# Grafana Cloud OTLP uses HTTP Basic auth: instance ID as username and the
# scoped access token as password. Keep the raw token out of the Node process.
if [ -n "${GRAFANA_CLOUD_OTLP_TOKEN:-}" ]; then
  : "${GRAFANA_CLOUD_OTLP_INSTANCE_ID:?Set the local Grafana Cloud OTLP instance ID}"
  auth="$(printf '%s' "${GRAFANA_CLOUD_OTLP_INSTANCE_ID}:${GRAFANA_CLOUD_OTLP_TOKEN}" | base64 | tr -d '\n')"
  export OTEL_EXPORTER_OTLP_HEADERS="Authorization=Basic%20${auth}"
fi
unset GRAFANA_CLOUD_OTLP_TOKEN

exec node server.js
