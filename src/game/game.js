import * as BABYLON from 'babylonjs';
import Player from './player';
import Arena from './arena';

export default class Game {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.engine = new BABYLON.Engine(this.canvas, true);

    this.actualTime = Date.now();
    this.fps = 0;

    this.scene = this._initScene(this.engine);

    this._player = new Player(this, this.canvas);
    this._arena = new Arena(this);

    this.engine.runRenderLoop(() => {
      this.fps = this.engine.getFps();

      const divFps = document.getElementById('fps');
      divFps.innerHTML = `${this.fps.toFixed()} fps`;

      this._player.checkMove(this.fps / 60);

      this.scene.render();
    });

    window.addEventListener('resize', () => {
      if (this.engine) {
        this.engine.resize();
      }
    }, false);
  }

  _initScene() {
    const scene = new BABYLON.Scene(this.engine);
    scene.clearColor = new BABYLON.Color3(0.9, 0.9, 0.9);
    return scene;
  }
}
