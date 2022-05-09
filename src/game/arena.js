import * as BABYLON from 'babylonjs';
import tile from '../../assets/images/tile.jpg';

export default class Arena {
  constructor(game) {
    this.game = game;
    this.scene = game.scene;

    this._initLight();
    // this._initShadow();
    this._initMaterial();
    this._initBox();
    this._initColumn();
  }

  // Création de notre lumière principale
  _initLight() {
    this.light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 10, 0), this.scene);
    this.light.intensity = 0.2;

    this.light2 = new BABYLON.HemisphericLight('light2', new BABYLON.Vector3(0, -1, 0), this.scene);
    this.light2.specular = new BABYLON.Color3(0, 0, 0);
    this.light2.intensity = 0.2;

    this.light3 = new BABYLON.PointLight('Spot0', new BABYLON.Vector3(-40, 10, -100), this.scene);
    this.light3.intensity = 0.3;
    this.light3.specular = new BABYLON.Color3(0, 0, 0);
  }

  _initShadow() {
    this.shadowGenerator1 = new BABYLON.ShadowGenerator(2048, this.light3);
    this.shadowGenerator1.usePoissonSampling = true;
    this.shadowGenerator1.bias = 0.0005;

    this.scene.materials.forEach((material) => {
      // eslint-disable-next-line no-param-reassign
      material.maxSimultaneousLights = 50;
    });
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
    this.boxArena = BABYLON.MeshBuilder.CreateBox('box1', { size: 100, updatable: false, sideOrientation: BABYLON.Mesh.BACKSIDE }, this.scene);
    this.boxArena.material = this.materialGround;
    this.boxArena.position.y = 50 * 0.3;
    this.boxArena.scaling.y = 0.3;
    this.boxArena.scaling.z = 0.8;
    this.boxArena.scaling.x = 3.5;

    this.boxArena.checkCollisions = true;

    this.boxArena.receiveShadows = true;
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
        mainCylinder.checkCollisions = true;

        // La formule pour générer des ombres
        // this.shadowGenerator1.getShadowMap().renderList.push(mainCylinder);

        // La formule pour recevoir des ombres
        mainCylinder.receiveShadows = true;

        this.columns[i].push(mainCylinder);
      }

      if (this.numberColumn > 1) {
        for (let y = 1; y <= this.numberColumn - 1; y += 1) {
          const newCylinder = this.columns[i][0].clone(`cy1-${y}-${i}`);
          newCylinder.position = new BABYLON.Vector3(-(this.sizeArena / 2) + (this.ratio * y), 30 / 2, this.columns[i][0].position.z);
          newCylinder.checkCollisions = true;

          // this.shadowGenerator1.getShadowMap().renderList.push(newCylinder);
          newCylinder.receiveShadows = true;
          this.columns[i].push(newCylinder);
        }
      }
    }
  }
}
