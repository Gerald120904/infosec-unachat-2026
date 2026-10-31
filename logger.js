'use strict';
const pino = require('pino');
const { context, trace } = require('@opentelemetry/api');
module.exports = pino({
  level: process.env.LOG_LEVEL || 'info',
  mixin() {
    const span = trace.getSpan(context.active());
    const ctx = span && span.spanContext();
    return { 'deployment.environment': process.env.DEPLOYMENT_ENVIRONMENT || 'local', ...(ctx ? { trace_id: ctx.traceId, span_id: ctx.spanId } : {}) };
  },
  redact: { paths: ['req.headers.authorization', 'headers.authorization', 'token', 'password'], censor: '[REDACTED]' }
});
