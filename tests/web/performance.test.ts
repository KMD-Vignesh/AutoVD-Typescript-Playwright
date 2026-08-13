/**
 * P2 #10 — Performance Budget Assertions
 * Verifies page load times and resource budgets.
 */
import { test, expect } from '../fixtures';

test.describe('Performance', () => {
  test('page loads within 5 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('https://saucedemo.com');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(5000);
    await expect(page).toHaveTitle(/Swag Labs/);
  });

  test('DOM content loaded within 4 seconds', async ({ page }) => {
    const perfMetrics = await page.evaluate(() => {
      const entries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      return entries.map((e) => ({
        domContentLoaded: e.domContentLoadedEventEnd - e.startTime,
        responseEnd: e.responseEnd - e.startTime,
        connectEnd: e.connectEnd - e.startTime,
      }));
    });

    expect(perfMetrics[0].domContentLoaded).toBeLessThan(4000);
  });

  test('no failed network requests', async ({ page }) => {
    const failedRequests: string[] = [];

    page.on('requestfailed', (request) => {
      failedRequests.push(request.url());
    });

    await page.goto('https://saucedemo.com');
    await page.waitForLoadState('networkidle');

    expect(failedRequests).toHaveLength(0);
  });

  test('images load within budget', async ({ page }) => {
    const imageLoads: number[] = [];

    page.on('response', async (response) => {
      const contentType = response.headers()['content-type'] || '';
      if (contentType.startsWith('image/')) {
        const startTime = Date.now();
        await response.body().catch(() => {});
        imageLoads.push(Date.now() - startTime);
      }
    });

    await page.goto('https://saucedemo.com');
    await page.waitForLoadState('networkidle');

    // If there are images, each should load in under 500ms
    for (const loadTime of imageLoads) {
      expect(loadTime).toBeLessThan(500);
    }
  });

  test('total page weight under 2MB', async ({ page }) => {
    let totalSize = 0;

    page.on('response', async (response) => {
      try {
        const buffer = await response.body();
        totalSize += buffer.length;
      } catch {
        // Skip responses that can't be read
      }
    });

    await page.goto('https://saucedemo.com');
    await page.waitForLoadState('networkidle');

    expect(totalSize).toBeLessThan(2 * 1024 * 1024); // 2MB
  });
});
