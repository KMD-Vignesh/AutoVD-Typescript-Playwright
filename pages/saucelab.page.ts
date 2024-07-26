import { type Page } from '@playwright/test';
import { PlayVD } from '../library/helper/vdPlay';

export class SauceLabPage {
  private playVD: PlayVD;
  private username_input: string = "#user-name";
  private password_input: string = "#password"
  private login_button: string = "#login-button"

  constructor(playVD: PlayVD) {
    this.playVD = playVD;
  }

  async openApp() {
    await this.playVD.open('https://saucedemo.com');
    return this
  }

  async loginApp() {
    await this.playVD.fill(this.username_input, "standard_user")
    await this.playVD.fill(this.password_input, "secret_sauce")
    await this.playVD.click(this.login_button)
    console.log(await this.playVD.title())
    return this
  }

}