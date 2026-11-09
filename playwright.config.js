import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './server/tests',
  testMatch: '**/*.spec.js',
  outputDir: './work/browser-results',
  workers: 1,
  use: {
    baseURL: 'http://127.0.0.1:8091',
    viewport: { width: 1365, height: 900 },
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'node server/tests/browserServer.js',
    url: 'http://127.0.0.1:8091/health',
    reuseExistingServer: false,
    timeout: 60000,
  },
})
