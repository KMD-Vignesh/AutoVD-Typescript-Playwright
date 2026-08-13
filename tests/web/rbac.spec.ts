/**
 * P2 #9 — Role-Based Access Control (RBAC) Matrices
 */
import { test, expect } from '../fixtures';
import { MainPage } from '../../pages/main.page';

const ROLES = [
  {
    name: 'standard_user',
    username: 'standard_user',
    password: 'secret_sauce',
    shouldLogin: true,
  },
  {
    name: 'locked_out_user',
    username: 'locked_out_user',
    password: 'secret_sauce',
    shouldLogin: false,
  },
];

test.describe('RBAC — Role-Based Access Control', () => {
  for (const role of ROLES) {
    test.describe(`${role.name} role`, () => {
      test('login behavior matches expected', async ({ playVD }) => {
        const mainPage = new MainPage(playVD);
        await mainPage.openApp();

        await playVD.type('#user-name', role.username);
        await playVD.type('#password', role.password);
        await playVD.click('#login-button');
        await playVD.waitSeconds(2);

        if (role.shouldLogin) {
          // Should see the main page
          const isVisible = await playVD.isPresent('//div[@class="header_label"]', 3);
          expect(isVisible).toBe(true);
        } else {
          // Should see error message
          const isError = await playVD.isPresent('//div[contains(@class, "error")]', 3);
          expect(isError).toBe(true);
        }
      });
    });
  }
});
