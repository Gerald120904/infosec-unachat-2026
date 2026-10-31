'use strict';
const { trace, metrics, diag, DiagLogLevel } = require('@opentelemetry/api');
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { ExportResultCode } = require('@opentelemetry/core');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
// Accept either the standard OTLP headers value or the local-only Grafana token
// pair. Never construct this authentication header in Vercel or test processes.
const localGrafanaAuth = process.env.NODE_ENV !== 'vercel' && process.env.VERCEL !== '1' && process.env.NODE_ENV !== 'test';
if (localGrafanaAuth && !process.env.OTEL_EXPORTER_OTLP_HEADERS && process.env.GRAFANA_CLOUD_OTLP_INSTANCE_ID && process.env.GRAFANA_CLOUD_OTLP_TOKEN) {
  const basic = Buffer.from(`${process.env.GRAFANA_CLOUD_OTLP_INSTANCE_ID}:${process.env.GRAFANA_CLOUD_OTLP_TOKEN}`).toString('base64');
  process.env.OTEL_EXPORTER_OTLP_HEADERS = `Authorization=Basic%20${basic}`;
}
// Opt-in diagnostics report only transport error codes/statuses, never raw
// exporter messages (which could contain request details or credentials).
if (localGrafanaAuth && process.env.OTEL_SAFE_DIAGNOSTICS === 'true') {
  const safeFailure = (level, args) => {
    const text = args.map(value => {
      if (typeof value === 'string') return value;
      if (!value || typeof value !== 'object') return '';
      return [value.name, value.code, value.statusCode, value.message, value.error, value.response && value.response.statusCode].filter(item => ['string', 'number'].includes(typeof item)).join(' ');
    }).join(' ');
    const code = text.match(/\b(E[A-Z]{2,})\b/);
    const status = text.match(/\b(?:status(?: code)?\s*[:=]?\s*)([1-5]\d\d)\b/i);
    const safeText = text.replace(/Authorization\s*[:=]\s*Basic\s+\S+/gi, 'Authorization: [REDACTED]')
      .replace(/\bBearer\s+\S+/gi, 'Bearer [REDACTED]')
      .replace(/\bglc_[A-Za-z0-9_-]+\b/g, '[REDACTED]')
      .replace(/Basic%20\S+/gi, 'Basic%20[REDACTED]')
      .slice(0, 200);
    console[level](JSON.stringify({ event: 'otel.export.diagnostic', severity: level, ...(code ? { code: code[1] } : {}), ...(status ? { status: Number(status[1]) } : {}), ...(safeText ? { summary: safeText } : {}) }));
  };
  diag.setLogger({ verbose() {}, debug() {}, info() {}, warn(...args) { safeFailure('warn', args); }, error(...args) { safeFailure('error', args); } }, DiagLogLevel.WARN);
}
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
  const diagnose = (signal, result) => {
    if (process.env.OTEL_SAFE_DIAGNOSTICS !== 'true' || !result || result.code === ExportResultCode.SUCCESS) return;
    const err = result.error;
    const message = err && typeof err.message === 'string' ? err.message : '';
    const status = (err && (err.statusCode || (err.response && err.response.statusCode))) || (message.match(/\b(?:status(?: code)?\s*[:=]?\s*|HTTP\s+)([1-5]\d\d)\b/i) || [])[1];
    console.error(JSON.stringify({ event: 'otel.export.failed', signal, resultCode: result.code, ...(status ? { httpStatus: Number(status) } : {}), ...(err && err.code ? { errorCode: String(err.code).slice(0, 40) } : {}), ...(err && err.name ? { errorType: String(err.name).slice(0, 40) } : {}) }));
  };
  const observe = (signal, exporter) => {
    const originalExport = exporter.export.bind(exporter);
    exporter.export = (records, callback) => originalExport(records, result => { diagnose(signal, result); callback(result); });
    return exporter;
  };
  Object.assign(config, {
    traceExporter: observe('traces', new OTLPTraceExporter()),
    metricReaders: [new PeriodicExportingMetricReader({ exporter: observe('metrics', new OTLPMetricExporter()), exportIntervalMillis: 10000 })],
    logRecordProcessors: [new BatchLogRecordProcessor({ exporter: observe('logs', new OTLPLogExporter()) })]
  });
  }
  sdk = new NodeSDK(config);
  sdk.start();
}
module.exports = { sdk, tracer: trace.getTracer('una-chat'), metrics: metrics.getMeter('una-chat'), enabled };
