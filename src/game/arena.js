import * as BABYLON from 'babylonjs';
import tile from '../../assets/images/tile.jpg';

export default class Arena {
  constructor(game) {
    this.game = game;
    this.scene = game.scene;

    this._initLight();
    this._initMaterial();
    this._initBox();
    this._initColumn();
  }

  // Création de notre lumière principale
  _initLight() {
    this.light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 10, 0), this.scene);
    this.light2 = new BABYLON.HemisphericLight('light2', new BABYLON.Vector3(0, -1, 0), this.scene);
    this.light2.intensity = 0.8;
  }

  _initMaterial() {
    // Material pour le sol
    this.materialGround = new BABYLON.StandardMaterial('groundTexture', this.scene);
    this.materialGround.diffuseTexture = new BABYLON.Texture(tile, this.scene);
    this.materialGround.diffuseTexture.uScale = 8.0;
    this.materialGround.diffuseTexture.vScale = 8.0;

    // material pour les objets
    this.materialWall = new BABYLON.StandardMaterial('wallTexture', this.scene);
    this.materialWall.diffuseTexture = new BABYLON.Texture(tile, this.scene);
  }

  _initBox() {
    this.boxArena = BABYLON.MeshBuilder.CreateBox('box1', { size: 100, updatable: 100, sideOrientation: BABYLON.Mesh.BACKSIDE }, this.scene);
    this.boxArena.material = this.materialGround;
    this.boxArena.position.y = 50 * 0.3;
    this.boxArena.scaling.y = 0.3;
    this.boxArena.scaling.z = 0.8;
    this.boxArena.scaling.x = 3.5;
  }

  _initColumn() {
    this.columns = [];
    this.numberColumn = 6;
    this.sizeArena = 100 * this.boxArena.scaling.x - 50;
    this.ratio = ((100 / this.numberColumn) / 100) * this.sizeArena;

    for (let i = 0; i <= 1; i += 1) {
      if (this.numberColumn > 0) {
        this.columns[i] = [];
        const mainCylinder = BABYLON.MeshBuilder.CreateCylinder(`cyl0-${i}`, {
          diameterTop: 5, diameterBottom: 5, height: 30, tessellation: 20, subdivisions: 4,
        }, this.scene);

        mainCylinder.position = new BABYLON.Vector3(-this.sizeArena / 2, 30 / 2, -20 + (40 * i));
        mainCylinder.material = this.materialWall;
        this.columns[i].push(mainCylinder);
      }

      if (this.numberColumn > 1) {
        for (let y = 1; y <= this.numberColumn - 1; y += 1) {
          const newCylinder = this.columns[i][0].clone(`cy1-${y}-${i}`);
          newCylinder.position = new BABYLON.Vector3(-(this.sizeArena / 2) + (this.ratio * y), 30 / 2, this.columns[i][0].position.z);
          this.columns[i].push(newCylinder);
        }
      }
    }
  }
}
