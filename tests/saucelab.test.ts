import { test } from '../library/interface/vdBase';
import { SauceLabPage } from '../pages/saucelab.page';

test('add cart', async ({ playVD }) => {
  const sauceLab = new SauceLabPage(playVD);
  await sauceLab.openApp();
  await sauceLab.loginApp();
});

