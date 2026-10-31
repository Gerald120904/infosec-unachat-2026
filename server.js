
// Load monitoring before Express/HTTP so instrumentation can patch modules.
var sentry = require('./sentry');
var telemetry = require('./telemetry');
var logger = require('./logger');

// libreriuas
var validation = require('./libs/unalib');
var app = require('express')();
var http = require('http').Server(app);
// Vercel Functions route the Socket.IO upgrade through an API path; the same
// path also works locally and keeps the native Socket.IO protocol unchanged.
var io = require('socket.io')(http, { path: '/api/socket-io/socket.io' });
var port = process.env.PORT || 3000;
var metrics = telemetry.metrics;
var requests = metrics ? metrics.createCounter('http.server.requests') : null;
var requestErrors = metrics ? metrics.createCounter('http.server.errors') : null;
var duration = metrics ? metrics.createHistogram('http.server.duration', { unit: 'ms' }) : null;
var messages = metrics ? metrics.createCounter('chat.messages.processed') : null;
var messageDuration = metrics ? metrics.createHistogram('chat.message.duration', { unit: 'ms' }) : null;

app.use(function(req, res, next) {
  var start = process.hrtime.bigint();
  res.on('finish', function() {
    var ms = Number(process.hrtime.bigint() - start) / 1e6;
    var attrs = { 'http.route': req.path, 'http.request.method': req.method, 'http.response.status_code': res.statusCode };
    if (requests) requests.add(1, attrs);
    if (duration) duration.record(ms, attrs);
    if (res.statusCode >= 400 && requestErrors) requestErrors.add(1, attrs);
    var log = res.statusCode >= 500 ? logger.error : res.statusCode >= 400 ? logger.warn : logger.info;
    log.call(logger, { event: 'http.request', method: req.method, route: req.path, status: res.statusCode, duration_ms: ms });
  });
  next();
});

function processMessage(msg) {
  return validation.validateMessage(msg);
}

// root: presentar html
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

if (process.env.LAB_HTTP_TEST_ENABLED === 'true' && process.env.VERCEL !== '1') {
  app.post('/__lab/message', require('express').json({ limit: '16kb' }), function(req, res) {
    var ip = req.socket.remoteAddress || '';
    var localHost = /^127\.0\.0\.1:3000$/.test(req.headers.host || '');
    var loopback = ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(ip);
    var dockerBridge = /^::ffff:172\.(1[6-9]|2\d|3[01])\./.test(ip);
    if (!localHost || (!loopback && !dockerBridge)) return res.sendStatus(404);
    var span = telemetry.tracer.startSpan('chat.process_message.http', { attributes: { 'deployment.environment': 'local' } });
    var start = process.hrtime.bigint();
    try {
      var result = processMessage(JSON.stringify(req.body));
      if (messages) messages.add(1, { outcome: 'success', transport: 'http' });
      logger.info({ event: 'chat.message.processed', outcome: 'success', transport: 'http' });
      span.setStatus({ code: 1 });
      res.type('application/json').send(result);
    } catch (error) {
      span.recordException(error);
      span.setStatus({ code: 2 });
      if (messages) messages.add(1, { outcome: 'error', transport: 'http' });
      logger.error({ event: 'chat.message.processed', outcome: 'error', err: error.message });
      res.sendStatus(400);
    } finally {
      if (messageDuration) messageDuration.record(Number(process.hrtime.bigint() - start) / 1e6, { outcome: res.statusCode >= 400 ? 'error' : 'success', transport: 'http' });
      span.end();
    }
  });
}

if (sentry && process.env.SENTRY_LAB_TEST_ENABLED === 'true') {
  var sentryLabTestPath = process.env.VERCEL === '1' ? '/api/__lab/sentry-test' : '/__lab/sentry-test';
  app.get(sentryLabTestPath, function(req, res, next) {
    var expected = process.env.SENTRY_LAB_TEST_SECRET || '';
    var supplied = req.get('authorization') || '';
    var expectedHeader = 'Bearer ' + expected;
    var authorized = expected.length > 0 && supplied.length === expectedHeader.length &&
      require('crypto').timingSafeEqual(Buffer.from(supplied), Buffer.from(expectedHeader));
    if (!authorized) return res.sendStatus(404);
    next(new Error('UNA Chat controlled Sentry verification event'));
  });
}

if (sentry) sentry.setupExpressErrorHandler(app);

// escuchar una conexion por socket
io.on('connection', function(socket){
  // si se escucha "chat message"
  socket.on('Evento-Mensaje-Server', function(msg){
    var tracer = telemetry.tracer;
    var span = tracer.startSpan('chat.process_message', { attributes: { 'messaging.system': 'socket.io', 'messaging.destination': 'Evento-Mensaje-Server' } });
    var start = process.hrtime.bigint();
    var outcome = 'success';
    var api = require('@opentelemetry/api');
    var activeContext = api.trace.setSpan(api.context.active(), span);
    try {
      api.context.with(activeContext, function() {
        var result = processMessage(msg);
        if (messages) messages.add(1, { outcome: 'success' });
        logger.info({ event: 'chat.message.processed', outcome: 'success', transport: 'socket.io' });
        io.emit('Evento-Mensaje-Server', result);
      });
    } catch (error) {
      outcome = 'error';
      span.recordException(error);
      span.setStatus({ code: 2 });
      if (messages) messages.add(1, { outcome: 'error' });
      api.context.with(activeContext, function() { logger.error({ event: 'chat.message.processed', outcome: 'error', transport: 'socket.io', err: error.message }); });
    } finally {
      if (messageDuration) messageDuration.record(Number(process.hrtime.bigint() - start) / 1e6, { outcome: outcome, transport: 'socket.io' });
      span.end();
    }
  });
});

if (require.main === module) {
  http.listen(port, function(){
    console.log('listening on *:' + port);
  });
}

module.exports = http;
