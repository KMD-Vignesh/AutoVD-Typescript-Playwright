import { PlayVD } from "../library/helper/vdPlay";
import { env } from "../library/config/env";
import { PageBase } from "../library/interface/vdPage";

export class LoginPage extends PageBase{
  private usernameInput: string = "#user-name";
  private passwordInput: string = "#password";
  private loginButton: string = "#login-button";

  constructor(playVD: PlayVD) {
    super(playVD);
  }

  async loginApp() {
    await this.playVD.type(this.usernameInput, env.username);
    await this.playVD.type(this.passwordInput, env.password);
    await this.playVD.click(this.loginButton);
    return this;
  }
}
