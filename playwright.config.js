var { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
  expect: {
    timeout: 10000
  },
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://127.0.0.1:3100',
    headless: Boolean(process.env.CI),
    launchOptions: {
      slowMo: process.env.CI ? 0 : 1000
    }
  },
  webServer: {
    command: 'npm start',
    env: {
      NODE_ENV: 'test',
      PORT: '3100',
      AUTH0_DOMAIN: '',
      AUTH0_CLIENT_ID: '',
      REQUIRE_AUTH: ''
    },
    url: 'http://127.0.0.1:3100',
    reuseExistingServer: false,
    timeout: 30000
  }
});
