import { expect } from '@playwright/test';
import { test } from '../library/interface/vdBase';
import { MainPage } from '../pages/main.page';

test('add cart', async ({ playVD }) => {
  const mainPage = new MainPage(playVD);
  await mainPage.openApp();
  await mainPage.loginApp();
  expect (await mainPage.isMainPageLoaded());
  await mainPage.addProductCart("Sauce Labs Bike Light");
  await mainPage.addProductCart("Sauce Labs Backpack")
  await mainPage.addProductCart("Sauce Labs Onesie")
  await playVD.waitForTimeout(5000);

});

