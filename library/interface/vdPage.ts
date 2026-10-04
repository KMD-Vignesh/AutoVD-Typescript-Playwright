import { PlayVD } from "../helper/vdPlay";
import { env } from "../config/env";

export class PageBase {
    protected playVD: PlayVD;
  
    constructor(playVD: PlayVD) {
      this.playVD = playVD;
    }

    async openApp() {
        await this.playVD.goto(env.webBaseUrl, {waitUntil:'load'});
        return this;
    }
}