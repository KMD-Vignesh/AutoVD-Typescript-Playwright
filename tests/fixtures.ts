import { test as base } from '@playwright/test';
import { PlayVD } from '../library/helper/vdPlay';

/**
 * Shared fixtures for all test suites (web + API + mobile glue)
 */
export const test = base.extend<{ playVD: PlayVD }>({
  playVD: async ({ page }, use) => {
    const playVD = new PlayVD(page);
    await use(playVD);
  },
});

export { expect } from '@playwright/test';
