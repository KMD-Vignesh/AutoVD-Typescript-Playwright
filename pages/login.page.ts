import { PlayVD } from "../library/helper/vdPlay";

export class LoginPage {
  protected playVD: PlayVD;
  private usernameInput: string = "#user-name";
  private passwordInput: string = "#password";
  private loginButton: string = "#login-button";

  constructor(playVD: PlayVD) {
    this.playVD = playVD;
  }

  async openApp() {
    await this.playVD.goto("https://saucedemo.com", {waitUntil:'load'});
    return this;
  }

  async loginApp() {
    await this.playVD.type(this.usernameInput, "standard_user");
    await this.playVD.type(this.passwordInput, "secret_sauce");
    await this.playVD.click(this.loginButton);
    return this;
  }
}
