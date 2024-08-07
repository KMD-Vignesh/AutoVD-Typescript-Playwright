import {
  type Page,
  BrowserContext,
  Dialog,
  Download,
  expect,
  FrameLocator,
  Locator,
} from "@playwright/test";
import { allure } from "allure-playwright";

export class PlayVD {
  private page: Page;
  private context: BrowserContext;

  constructor(page: Page) {
    this.page = page;
    this.context = page.context();
  }

  async getContext(): Promise<BrowserContext> {
    return this.context;
  }

  async openNewTab(url?: string): Promise<PlayVD> {
    const newPage = await this.context.newPage();
    if (url) {
      await newPage.goto(url);
    }
    return new PlayVD(newPage);
  }

  async clickForNewTab(selector: string): Promise<PlayVD> {
    const [newPage] = await Promise.all([
      this.context.waitForEvent("page"),
      this.page.click(selector),
    ]);
    await newPage.waitForLoadState();
    return new PlayVD(newPage);
  }

  async clickForDialog(selector: string): Promise<Dialog> {
    const [dialog] = await Promise.all([
      this.page.waitForEvent("dialog"),
      this.page.click(selector),
    ]);
    this.log(dialog.message());
    return dialog;
  }

  async clickForDownload(selector: string): Promise<Download> {
    const [download] = await Promise.all([
      this.page.waitForEvent("download"),
      this.page.click(selector),
    ]);
    return download;
  }


  async waitForLoadState(): Promise<this> {
    await this.page.waitForLoadState();
    return this;
  }

  async bringToFront(): Promise<this> {
    await this.page.bringToFront();
    return this;
  }

  async log(message: string | null): Promise<this> {
    const finalMessage = message ?? "null";
    allure.step(finalMessage, async () => {});
    console.log(finalMessage);
    return this;
  }
  async goto(
    url: string,
    options?: { waitUntil?: "load" | "domcontentloaded" | "networkidle" }
  ): Promise<this> {
    await this.page.goto(url, options);
    return this;
  }

  async goBack(options?: {
    waitUntil?: "load" | "domcontentloaded" | "networkidle";
  }): Promise<this> {
    await this.page.goBack(options);
    return this;
  }

  async goForward(options?: {
    waitUntil?: "load" | "domcontentloaded" | "networkidle";
  }): Promise<this> {
    await this.page.goForward(options);
    return this;
  }

  async reload(options?: {
    waitUntil?: "load" | "domcontentloaded" | "networkidle";
  }): Promise<this> {
    await this.page.reload(options);
    return this;
  }

  private getLocator(selector: string): Locator {
    return this.page.locator(selector);
  }

  async isPresent(selector: string, timeout: number = 30): Promise<boolean> {
    try {
      await this.page
        .locator(selector)
        .waitFor({ state: "attached", timeout: timeout * 1000 });
      return true;
    } catch {
      return false;
    }
  }

  async getText(selector: string): Promise<string | null> {
    return await this.getLocator(selector).textContent();
  }

  // Interactions
  async fill(selector: string, fill_text: string): Promise<this> {
    await this.getLocator(selector).fill(fill_text);
    return this;
  }

  async click(selector: string): Promise<this> {
    await this.getLocator(selector).click();
    return this;
  }

  async doubleClick(selector: string): Promise<this> {
    await this.getLocator(selector).dblclick();
    return this;
  }

  async type(
    selector: string,
    text: string,
    options?: { delay?: number }
  ): Promise<this> {
    await this.getLocator(selector).type(text, options);
    return this;
  }

  async press(
    selector: string,
    key: string,
    options?: { delay?: number }
  ): Promise<this> {
    await this.getLocator(selector).press(key, options);
    return this;
  }

  async check(selector: string): Promise<this> {
    await this.getLocator(selector).check();
    return this;
  }

  async uncheck(selector: string): Promise<this> {
    await this.getLocator(selector).uncheck();
    return this;
  }

  async selectOption(
    selector: string,
    values: string | string[]
  ): Promise<this> {
    await this.getLocator(selector).selectOption(values);
    return this;
  }

  async hover(selector: string): Promise<this> {
    await this.getLocator(selector).hover();
    return this;
  }

  async waitSeconds(timeout: number): Promise<this> {
    // Ensure timeout is a positive number
    if (timeout <= 0) {
      throw new Error("Timeout must be a positive number");
    }

    // Handle case when page is no longer active or the test has ended
    try {
      await this.page.waitForTimeout(timeout * 1000);
    } catch (error) {
      console.error("Error occurred during waitForTimeout:", error);
      throw new Error("Page or test ended during waitForTimeout");
    }

    return this;
  }

  // Content
  async title(): Promise<string> {
    return this.page.title();
  }

  async content(): Promise<string> {
    return this.page.content();
  }

  async screenshot(
    path: string,
    options?: { type?: "png" | "jpeg"; quality?: number; fullPage?: boolean }
  ): Promise<this> {
    await this.page.screenshot({ path, ...options });
    return this;
  }

  // Frames
  frame(selector: string): FrameLocator {
    return this.page.frameLocator(selector);
  }

  // Cookies
  async contextCookies(): Promise<any[]> {
    return this.page.context().cookies();
  }

  async addCookie(cookie: {
    name: string;
    value: string;
    domain?: string;
    path?: string;
    expires?: number;
    httpOnly?: boolean;
    secure?: boolean;
  }): Promise<this> {
    await this.page.context().addCookies([cookie]);
    return this;
  }

  async clearCookies(): Promise<this> {
    await this.page.context().clearCookies();
    return this;
  }

  // URL
  async url(): Promise<string> {
    return this.page.url();
  }

  // Accessibility
  async accessibilitySnapshot(options?: {
    interestingOnly?: boolean;
  }): Promise<any> {
    return this.page.accessibility.snapshot(options);
  }

  // Others
  async setViewportSize(width: number, height: number): Promise<this> {
    await this.page.setViewportSize({ width, height });
    return this;
  }

  async setContent(
    content: string,
    options?: { timeout?: number }
  ): Promise<this> {
    await this.page.setContent(content, options);
    return this;
  }

  async setOffline(offline: boolean): Promise<this> {
    await this.page.context().setOffline(offline);
    return this;
  }

  // Add new page
  async newPage(): Promise<PlayVD> {
    const newPage = await this.context.newPage();
    return new PlayVD(newPage);
  }

  // Add new tab
  async newTab(): Promise<PlayVD> {
    const [newTab] = await Promise.all([
      this.context.waitForEvent("page"),
      this.page.evaluate(() => window.open("")),
    ]);
    return new PlayVD(newTab);
  }

  // Switch to page
  async switchToPage(index: number): Promise<this> {
    const pages = this.context.pages();
    if (index < 0 || index >= pages.length) {
      throw new Error(`Page index ${index} out of bounds`);
    }
    this.page = pages[index];
    return this;
  }
}
