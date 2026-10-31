'use strict';
const { trace, metrics } = require('@opentelemetry/api');
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const enabled = Boolean(process.env.OTEL_EXPORTER_OTLP_ENDPOINT && process.env.OTEL_EXPORTER_OTLP_HEADERS);
let sdk;
if (process.env.NODE_ENV !== 'vercel' && process.env.NODE_ENV !== 'test') {
  // Unit/integration runs must never send telemetry to a configured remote backend.
  const exportersEnabled = enabled && process.env.NODE_ENV !== 'test' && process.env.VERCEL !== '1';
  const config = {
    serviceName: process.env.OTEL_SERVICE_NAME || 'una-chat',
    instrumentations: [getNodeAutoInstrumentations({ '@opentelemetry/instrumentation-http': { ignoreIncomingRequestHook: req => req.url && req.url.startsWith('/otlp/') } })]
  };
  if (exportersEnabled) {
  const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-proto');
  const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-proto');
  const { OTLPLogExporter } = require('@opentelemetry/exporter-logs-otlp-proto');
  const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');
  const { BatchLogRecordProcessor } = require('@opentelemetry/sdk-logs');
  Object.assign(config, {
    traceExporter: new OTLPTraceExporter(),
    metricReader: new PeriodicExportingMetricReader({ exporter: new OTLPMetricExporter(), exportIntervalMillis: 10000 }),
    logRecordProcessors: [new BatchLogRecordProcessor(new OTLPLogExporter())]
  });
  }
  sdk = new NodeSDK(config);
  sdk.start();
}
module.exports = { sdk, tracer: trace.getTracer('una-chat'), metrics: metrics.getMeter('una-chat'), enabled };
