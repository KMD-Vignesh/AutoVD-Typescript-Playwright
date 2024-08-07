import { PlayVD } from "../helper/vdPlay";

export class PageBase {
    protected playVD: PlayVD;
  
    constructor(playVD: PlayVD) {
      this.playVD = playVD;
    }

    async openApp() {
        await this.playVD.goto("https://saucedemo.com", {waitUntil:'load'});
        return this;
    }
}