import { type Page } from '@playwright/test';

export class PlayVD {
    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async open(url: string) {
        await this.page.goto(url);
        return this
    }

    async fill(selector: string, fill_text: string) {
        await this.page.locator(selector).fill(fill_text);
        return this;
    }

    async click(selector: string) {
        await this.page.locator(selector).click();
        return this;
    }

    async title() {
        return this.page.title()
    }


}