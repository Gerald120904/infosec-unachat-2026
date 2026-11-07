'use strict';

const auth = require('./auth');
const vault = require('./vault');

function enabled() {
  const domain = Boolean(process.env.AUTH0_DOMAIN);
  const clientId = Boolean(process.env.AUTH0_CLIENT_ID);

  const production = (
    process.env.NODE_ENV === 'production' ||
    process.env.RENDER === 'true' ||
    Boolean(process.env.RENDER_EXTERNAL_URL) ||
    process.env.REQUIRE_AUTH === 'true'
  );

  if (domain !== clientId || (production && (!domain || !clientId))) {
    throw new Error('Auth0 es obligatorio en produccion. Configuracion incompleta.');
  }

  return domain && clientId;
}

function register(app, io) {
  app.get('/auth/config', (req, res) => {
    const settings = auth.authSettings();

    res.json(settings ? {
      enabled: true,
      domain: settings.domain,
      clientId: settings.clientId
    } : { enabled: false });
  });

  app.get('/auth/login', (req, res) => {
    if (!enabled()) return res.sendStatus(404);
    auth.beginLogin(req, res);
  });

  app.get('/auth/callback', (req, res) => {
    if (!enabled()) return res.redirect('/');
    auth.finishLogin(req, res);
  });

  app.get('/auth/logout', auth.logout);

  app.get('/sala', (req, res) => {
    if (!enabled()) return res.json({ enabled: false });
    auth.readSession(req, res);
  });

  app.get('/profile.js', (req, res) => {
    res.sendFile(
      require('path').join(__dirname, '..', 'libs', 'profile.js')
    );
  });

  io.use((socket, next) => {
    if (!enabled()) return next();
    auth.authorizeSocket(socket, next);
  });
}

async function boot() {
  if (!enabled()) return;

  const secret = await vault.loadAuth0ClientSecret();

  await auth.initAuth0(secret);
}

module.exports = {
  register,
  boot,
  stampSender: auth.stampSender
};
