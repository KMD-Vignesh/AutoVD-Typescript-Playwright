import { test as base } from '@playwright/test';
import { PlayVD } from '../helper/vdPlay';

const test = base.extend<{ playVD: PlayVD }>({
    playVD: async ({ page }, use) => {
        const playVD = new PlayVD(page);
        await use(playVD);
    },
});

export { test };
