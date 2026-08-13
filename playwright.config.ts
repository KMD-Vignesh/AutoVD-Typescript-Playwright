import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';

const browserMode = process.env.BROWSER_MODE || 'single';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['line'],
    ['allure-playwright', { outputFolder: 'report/allure/allure-results' }],
    ['html', { outputFolder: 'report/playwrightreport', open: 'never' }],
  ],
  use: {
    acceptDownloads : true,
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    headless: false,
    screenshotDir: 'report/screenshots',
  },

  projects: [
    ...(browserMode === 'single' ? [
      {
        name: 'chromium',
        use: { ...devices['Desktop Chrome'] },
      }
    ] : [
      { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
      { name: 'firefox',   use: { ...devices['Desktop Firefox'] } },
      { name: 'webkit',    use: { ...devices['Desktop Safari'] } },
    ]),

    // Mobile web viewport tests
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
});
