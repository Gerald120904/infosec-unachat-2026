'use strict';

// Sentry is enabled only on the Vercel deployment and only after its DSN is
// configured in the platform environment. Local Docker telemetry stays OTLP-only.
var isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV === 'production' || Boolean(process.env.VERCEL_URL);
var enabled = isVercel && Boolean(process.env.SENTRY_DSN);
var Sentry = enabled ? require('@sentry/node') : null;

if (Sentry) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.SENTRY_ENVIRONMENT || 'vercel',
    sendDefaultPii: false,
    skipOpenTelemetrySetup: true,
    beforeSend: function(event) {
      if (event.request) {
        delete event.request.data;
        delete event.request.cookies;
        delete event.request.headers;
        delete event.request.query_string;
        if (event.request.url) {
          try {
            var url = new URL(event.request.url);
            event.request.url = url.origin + url.pathname;
          } catch (_) {
            delete event.request.url;
          }
        }
      }
      return event;
    }
  });
}

module.exports = Sentry;
