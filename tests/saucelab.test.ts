import { expect } from "@playwright/test";
import { test } from "../library/interface/vdBase";
import { MainPage } from "../pages/main.page";

test.describe("Add Cart", () => {
  test("add cart 1", async ({ playVD }) => {
    const mainPage = new MainPage(playVD);
    await mainPage.openApp();
    await mainPage.loginApp();
    expect(await mainPage.isMainPageLoaded()).toBe(true);
    await mainPage.addProductCart("Sauce Labs Bike Light");
    await mainPage.addProductCart("Sauce Labs Backpack");
    await mainPage.addProductCart("Sauce Labs Onesie");
    await playVD.waitSeconds(5);
  });

  test("add cart 2", async ({ playVD }) => {
    const mainPage = new MainPage(playVD);
    await mainPage.openApp();
    await mainPage.loginApp();
    expect(await mainPage.isMainPageLoaded()).toBe(true);
    await mainPage.addProductCart("Sauce Labs Backpack");
    await mainPage.addProductCart("Sauce Labs Onesie");
    await mainPage.addProductCart("Sauce Labs Bike Light");
    await playVD.waitSeconds(5);
  });
});

test.describe("Remove Cart", () => {
  test.skip("remove cart 1", async ({ playVD }) => {
    const mainPage = new MainPage(playVD);
    await mainPage.openApp();
    await mainPage.loginApp();
    expect(await mainPage.isMainPageLoaded()).toBe(true);
    await mainPage.addProductCart("Sauce Labs Bike Light");
    await mainPage.addProductCart("Sauce Labs Onesie");
    await playVD.waitSeconds(5);
  });

  test("remove cart 2", async ({ playVD }) => {
    const mainPage = new MainPage(playVD);
    await mainPage.openApp();
    await mainPage.loginApp();
    expect(await mainPage.isMainPageLoaded()).toBe(true);
    await mainPage.addProductCart("Sauce Labs Backpack");
    await mainPage.addProductCart("Sauce Labs Bike Light");
    const playVD2 = await playVD.openNewTab(
      "https://demoqa.com/browser-windows"
    );
    const playVD3 = await playVD2.clickForNewTab("#tabButton");
    await playVD.log(await playVD3.getText("#sampleHeading"));
    await playVD.waitSeconds(5);
  });
});
