import { LoginPage } from './login.page';
import { PlayVD } from '../library/helper/vdPlay';

export class MainPage extends LoginPage {
    private mainPageHeader: string = "//div[@class='header_label']/div[text()='Swag Labs']";
    private productCount: string = "//span[@class='shopping_cart_badge']";


    constructor(playVD: PlayVD) {
        super(playVD);

    }

    async isMainPageLoaded() {
        return this.playVD.isPresent(this.mainPageHeader)
    }

    async addProductCart(productName: string) {
        const productSelector = `//div[text()='${productName}']/../../..//button`;
        if (await this.playVD.isPresent(productSelector, 30)) {
            this.playVD.click(productSelector);
        }
        await this.playVD.waitForTimeout(1000);
    }
}