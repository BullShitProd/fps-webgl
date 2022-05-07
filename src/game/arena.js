import * as BABYLON from 'babylonjs';

export default class Arena {
  constructor(game) {
    this.game = game;
    this.scene = game.scene;

    // Création de notre lumière principale
    this.light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), this.scene);

    // Créons une sphère
    // this.sphere = BABYLON.Mesh.CreateSphere('sphere1', 16, 2, this.scene);
    this.sphere = BABYLON.MeshBuilder('sphere1', { segments: 16, diameter: 2 }, this.scene);

    // Remontons le sur l'axe y de la moitié de sa hauteur
    this.sphere.position.y = 1;

    // Ajoutons un sol pour situer la sphere dans l'espace
    // this.ground = BABYLON.Mesh.CreateGround('ground1', 6, 6, 2, this.scene);
    this.ground = BABYLON.MeshBuilder.CreateGround('group1', { width: 6, height: 6, subdivisions: 2 }, this.scene);
  }
}
