/**
 * P0 #1 — Visual Regression Testing
 * Screenshot baselines for key pages.
 * First run: npx playwright test --update-snapshots
 */
import { test, expect } from '../fixtures';

test.describe('Visual Regression', () => {
  test('login page matches baseline', async ({ page }) => {
    await page.goto('https://saucedemo.com');
    await expect(page).toHaveScreenshot('login-page.png', { maxDiffPixelRatio: 0.01 });
  });

  test('main page after login matches baseline', async ({ page }) => {
    await page.goto('https://saucedemo.com');
    await page.fill('#user-name', 'standard_user');
    await page.fill('#password', 'secret_sauce');
    await page.click('#login-button');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('main-page.png', { maxDiffPixelRatio: 0.01 });
  });

  test('cart page matches baseline', async ({ page }) => {
    await page.goto('https://saucedemo.com');
    await page.fill('#user-name', 'standard_user');
    await page.fill('#password', 'secret_sauce');
    await page.click('#login-button');
    await page.waitForLoadState('networkidle');

    // Click first product's add to cart button
    await page.locator('.btn.btn_primary').first().click();
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('cart-page.png', { maxDiffPixelRatio: 0.01 });
  });
});
