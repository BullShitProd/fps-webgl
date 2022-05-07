import * as BABYLON from 'babylonjs';

export default class Player {
  constructor(game, canvas) {
    this.scene = game.scene;
    this._initCamera(canvas);
  }

  _initCamera(canvas) {
    // On crée la caméra
    this.camera = new BABYLON.FreeCamera('camera', new BABYLON.Vector3(0, 5, -10), this.scene);
    // On demande à la caméra de regarder au point zéro de la scène
    this.camera.setTarget(BABYLON.Vector3.Zero());
    // On affecte le mouvement de la caméra au canvas
    this.camera.attachControl(canvas, true);
  }
}
