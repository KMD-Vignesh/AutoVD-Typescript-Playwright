import { expect } from '@playwright/test';
import { test } from '../library/interface/vdBase';
import { MainPage } from '../pages/main.page';
test.describe('Add Cart', () => {
  test('add cart 1', async ({ playVD }) => {
    const mainPage = new MainPage(playVD);
    await mainPage.openApp();
    await mainPage.loginApp();
    expect(await mainPage.isMainPageLoaded()).toBeTruthy();
    await mainPage.addProductCart("Sauce Labs Bike Light");
    await mainPage.addProductCart("Sauce Labs Backpack")
    await mainPage.addProductCart("Sauce Labs Onesie")
    await playVD.waitForTimeout(5000);

  });

  test('add cart 2', async ({ playVD }) => {
    const mainPage = new MainPage(playVD);
    await mainPage.openApp();
    await mainPage.loginApp();
    expect(await mainPage.isMainPageLoaded()).toBeTruthy();
    await mainPage.addProductCart("Sauce Labs Backpack")
    await mainPage.addProductCart("Sauce Labs Onesie")
    await mainPage.addProductCart("Sauce Labs Bike Light");
    await playVD.waitForTimeout(5000);

  });
});

test.describe('Remove Cart', () => {
  test('remove cart 1', async ({ playVD }) => {
    const mainPage = new MainPage(playVD);
    await mainPage.openApp();
    await mainPage.loginApp();
    expect(await mainPage.isMainPageLoaded()).toBeTruthy();
    await mainPage.addProductCart("Sauce Labs Bike Light");
    await mainPage.addProductCart("Sauce Labs Onesie")
    await playVD.waitForTimeout(5000);

  });

  test('remove cart 2', async ({ playVD }) => {
    const mainPage = new MainPage(playVD);
    await mainPage.openApp();
    await mainPage.loginApp();
    expect(await mainPage.isMainPageLoaded()).toBeTruthy();
    await mainPage.addProductCart("Sauce Labs Backpack")
    await mainPage.addProductCart("Sauce Labs Bike Light");
    await playVD.waitForTimeout(5000);

  });
});