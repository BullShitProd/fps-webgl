import * as BABYLON from 'babylonjs';
import Player from './player';
import Arena from './arena';

export default class Game {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.engine = new BABYLON.Engine(this.canvas, true);
    this.scene = this._initScene(this.engine);

    this._player = new Player(this, this.canvas);
    this._arena = new Arena(this);

    this.engine.runRenderLoop(() => {
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
