import * as BABYLON from 'babylonjs';
import wood from '../../assets/images/wood.jpg';
import brick from '../../assets/images/brick.jpg';

export default class Arena {
  constructor(game) {
    this.game = game;
    this.scene = game.scene;

    // Création de notre lumière principale
    // this.light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 20, 0), this.scene);
    // this.light.diffuse = new BABYLON.Color3(1, 1, 1);
    // this.light.specular = new BABYLON.Color3(1, 1, 1);

    this.light1 = new BABYLON.PointLight('Spot1', new BABYLON.Vector3(0, 30, -10), this.scene);
    this.light1.diffuse = new BABYLON.Color3(0.5, 1, 1);
    this.light1.specular = new BABYLON.Color3(1, 1, 1);
    this.light1.range = 40;

    console.log('couou');

    // Material pour le sol
    this.materialGround = new BABYLON.StandardMaterial('groundTexture', this.scene);
    this.materialGround.diffuseTexture = new BABYLON.Texture(brick, this.scene);
    this.materialGround.diffuseTexture.scale(4.0);

    // Material pour les objects
    this.materialWall = new BABYLON.StandardMaterial('wallTexture', this.scene);
    this.materialWall.diffuseTexture = new BABYLON.Texture(wood, this.scene);

    // Ajoutons un sol de 20 par 20
    this.ground = BABYLON.MeshBuilder.CreateGround('ground1', { height: 20, width: 20, subdivision: 2 }, this.scene);
    this.ground.scaling = new BABYLON.Vector3(2, 10, 3);
    this.ground.scaling.z = 2;
    this.ground.material = this.materialGround;

    // SUR TOUS LES AXES Y -> On monte les meshes de la moitié de la hauteur du mesh en question.

    this.mainBox = BABYLON.MeshBuilder.CreateBox('box1', { size: 3 }, this.scene);
    this.mainBox.scaling.y = 1;
    this.mainBox.position = new BABYLON.Vector3(5, ((3 / 2) * this.mainBox.scaling.y), 5);
    this.mainBox.rotation.y = (Math.PI * 45) / 180;
    this.mainBox.material = this.materialWall;

    this.mainBox2 = this.mainBox.clone('box2');
    this.mainBox2.scaling.y = 2;
    this.mainBox2.position = new BABYLON.Vector3(5, ((3 / 2) * this.mainBox2.scaling.y), -5);

    this.mainBox3 = this.mainBox.clone('box3');
    this.mainBox3.scaling.y = 3;
    this.mainBox3.position = new BABYLON.Vector3(-5, ((3 / 2) * this.mainBox3.scaling.y), -5);

    this.mainBox4 = this.mainBox.clone('box4');
    this.mainBox4.scaling.y = 2;
    this.mainBox4.position = new BABYLON.Vector3(-5, ((3 / 2) * this.mainBox4.scaling.y), 5);

    this.cylinder = BABYLON.MeshBuilder.CreateCylinder('cyl1', {
      height: 20, diameterTop: 5, diameterBottom: 5, tessellation: 20, subdivisions: 4,
    }, this.scene);
    this.cylinder.position.y = 20 / 2;
    this.cylinder.material = this.materialWall;
  }
}
