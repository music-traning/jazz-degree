const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './tests',
  webServer: {
    command: 'npm run start',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: 'http://localhost:3000',
  },
});
