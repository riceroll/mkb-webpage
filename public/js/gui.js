import * as THREE from '../../node_modules/three/build/three.module.js';
import { GUI } from '../../node_modules/three/examples/jsm/libs/dat.gui.module.js';

class GUI {
  static duration = 2000;   // ms
  constructor(mkb) {
    this.mkb = mkb;
    this.startTime = 0;

    this.playing = false;
  }

  reset() {
    this.startTime = (new Date()).getTime();
  }

  play() {
    this.playing = true;
  }

  stop() {
    this.playing = false;
  }

  start() {
    this.reset();
    this.play();
  }

  update() {
    if (!this.playing) return 0;

    let timePassed = (new Date()).getTime() - this.startTime;
    let t = timePassed / Animation.duration;

    if (t > 1) {
      this.stop();
      this.reset();
    }
    else {
      this.mkb.animate(t);
    }

  }
}

export {Animation};