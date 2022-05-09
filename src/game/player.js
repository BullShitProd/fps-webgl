import * as BABYLON from 'babylonjs';
import { degToRad } from './utils';
import Weapons from './weapons';

export default class Player {
  constructor(game, canvas) {
    this.game = game;
    this.scene = game.scene;
    this.canvas = canvas;

    // camera
    this.angularSensitivity = 200;
    this.rotEngaged = false;
    this.controlEnabled = false;
    this.speed = 1;

    // params players
    this.isAlive = true;
    this.weponShoot = false;

    // deadh Camera init
    this.deadCamera = null;

    this._initPointerLock();
    this._initMovement();
    this._initPlayerBox();
    this._initCamera();
    this._initWeapon();
    this._initHitBox();
  }

  _initMovement() {
    this.axisMovement = [false, false, false, false];

    window.addEventListener('keyup', (event) => {
      const key = event.key.toLowerCase();

      switch (key) {
        case 'z':
          this.camera.axisMovement[0] = false;
          break;
        case 's':
          this.camera.axisMovement[1] = false;
          break;
        case 'q':
          this.camera.axisMovement[2] = false;
          break;
        case 'd':
          this.camera.axisMovement[3] = false;
          break;
        default:
          break;
      }
    }, false);

    window.addEventListener('keydown', (event) => {
      const key = event.key.toLowerCase();
      switch (key) {
        case 'z':
          this.camera.axisMovement[0] = true;
          break;
        case 's':
          this.camera.axisMovement[1] = true;
          break;
        case 'q':
          this.camera.axisMovement[2] = true;
          break;
        case 'd':
          this.camera.axisMovement[3] = true;
          break;
        default:
          break;
      }
    }, false);

    window.addEventListener('mousemove', (event) => {
      if (this.rotEngaged === true) {
        this.camera.playerBox.rotation.y += event.movementX * 0.001 * (this.angularSensitivity / 250);
        const nextRotationX = this.camera.playerBox.rotation.x + (event.movementY * 0.001 * (this.angularSensitivity / 250));

        if (nextRotationX < degToRad(90) && nextRotationX > degToRad(-90)) {
          this.camera.playerBox.rotation.x += event.movementY * 0.001 * (this.angularSensitivity / 250);
        }
      }
    }, false);
  }

  _initPointerLock() {
    const canvas = this.scene.getEngine().getRenderingCanvas();

    canvas.addEventListener('click', () => {
      canvas.requestPointerLock = canvas.requestPointerLock
      || canvas.msRequestPointerLock
      || canvas.mozRequestPointerLock
      || canvas.webkitRequestPointerLock;
      if (canvas.requestPointerLock) {
        canvas.requestPointerLock();
      }
    }, false);

    const pointerlockchange = () => {
      this.controlEnabled = (document.mozPointerLockElement === canvas
        || document.webkitPointerLockElement === canvas
        || document.msPointerLockElement === canvas
        || document.pointerLockElement === canvas);

      if (!this.controlEnabled) {
        this.rotEngaged = false;
      } else {
        this.rotEngaged = true;
      }
    };

    // Event pour changer l'état du pointeur, sous tout les types de navigateur
    document.addEventListener('pointerlockchange', pointerlockchange, false);
    document.addEventListener('mspointerlockchange', pointerlockchange, false);
    document.addEventListener('mozpointerlockchange', pointerlockchange, false);
    document.addEventListener('webkitpointerlockchange', pointerlockchange, false);
  }

  _initPlayerBox() {
    // Math.random nous donne un nombre entre 0 et 1
    let randomPoint = Math.random();

    // randomPoint fait un arrondi de ce chiffre et du nombre de spawnPoints
    randomPoint = Math.round(randomPoint * (this.game.allSpawnPoints.length - 1));

    /// / On dit que le spawnPoint est celui choisi selon le random plus haut
    this.spawnPoint = this.game.allSpawnPoints[randomPoint];

    console.log(randomPoint);

    this.playerBox = BABYLON.MeshBuilder.CreateBox('headMainPlayer', { size: 3 }, this.scene);
    this.playerBox.position = this.spawnPoint.clone();
    this.playerBox.ellipsoid = new BABYLON.Vector3(2, 2, 2);
  }

  _initCamera() {
    // On crée la caméra
    this.camera = new BABYLON.FreeCamera('camera', new BABYLON.Vector3(0, 0, 0), this.scene);
    this.camera.playerBox = this.playerBox;
    this.camera.parent = this.camera.playerBox;

    // Ajout des collisons avec playerBVox
    this.camera.playerBox.checkCollisions = true;
    this.camera.playerBox.applyGravity = true;

    // pour savoir que c'est le joueur principal
    this.camera.isMain = true;

    // La santé du joueur
    this.camera.health = 100;
    // L'armure du joueur
    this.camera.armor = 100;

    // Axe de mouvement X et Z
    this.camera.axisMovement = [false, false, false, false];
    // Si le joueur est en vie ou non
    this.isAlive = true;

    // On réinitialise la position de la caméra
    // this.camera.setTarget(BABYLON.Vector3.Zero());
    this.game.scene.activeCamera = this.camera;
  }

  _initHitBox() {
    this.hitBoxPlayer = BABYLON.MeshBuilder.CreateBox('hitBoxPlayer', { size: 3 }, this.scene);
    this.hitBoxPlayer.parent = this.camera.playerBox;
    this.hitBoxPlayer.scaling.y = 2;
    this.hitBoxPlayer.isPickable = true;
    this.hitBoxPlayer.isMain = true;
  }

  _initWeapon() {
    this.camera.weapons = new Weapons(this);

    this.canvas.addEventListener('mousedown', () => {
      if (this.controlEnabled && !this.weponShoot) {
        this.weponShoot = true;
        this.handleUserMouseDown();
      }
    }, false);

    this.canvas.addEventListener('mouseup', () => {
      if (this.controlEnabled && this.weponShoot) {
        this.weponShoot = false;
        this.handleUserMouseUp();
      }
    }, false);
  }

  handleUserMouseDown() {
    if (this.isAlive === true) {
      this.camera.weapons.fire();
    }
  }

  handleUserMouseUp() {
    if (this.isAlive === true) {
      this.camera.weapons.stopFire();
    }
  }

  checkMove(ratioFps) {
    const relativeSpeed = this.speed / ratioFps;

    if (this.camera.axisMovement[0]) {
      const forward = new BABYLON.Vector3(
        parseFloat(Math.sin(parseFloat(this.camera.playerBox.rotation.y))) * relativeSpeed,
        0,
        parseFloat(Math.cos(parseFloat(this.camera.playerBox.rotation.y))) * relativeSpeed,
      );
      this.camera.playerBox.moveWithCollisions(forward);
    }
    if (this.camera.axisMovement[1]) {
      const backward = new BABYLON.Vector3(
        parseFloat(-Math.sin(parseFloat(this.camera.playerBox.rotation.y))) * relativeSpeed,
        0,
        parseFloat(-Math.cos(parseFloat(this.camera.playerBox.rotation.y))) * relativeSpeed,
      );
      this.camera.playerBox.moveWithCollisions(backward);
    }
    if (this.camera.axisMovement[2]) {
      const left = new BABYLON.Vector3(
        parseFloat(Math.sin(parseFloat(this.camera.playerBox.rotation.y) + degToRad(-90))) * relativeSpeed,
        0,
        parseFloat(Math.cos(parseFloat(this.camera.playerBox.rotation.y) + degToRad(-90))) * relativeSpeed,
      );
      this.camera.playerBox.moveWithCollisions(left);
    }
    if (this.camera.axisMovement[3]) {
      const right = new BABYLON.Vector3(
        parseFloat(-Math.sin(parseFloat(this.camera.playerBox.rotation.y) + degToRad(-90))) * relativeSpeed,
        0,
        parseFloat(-Math.cos(parseFloat(this.camera.playerBox.rotation.y) + degToRad(-90))) * relativeSpeed,
      );
      this.camera.playerBox.moveWithCollisions(right);
    }
    this.camera.playerBox.moveWithCollisions(new BABYLON.Vector3(0, (-1.5) * relativeSpeed, 0));
  }

  getDamage(damage) {
    let damageTaken = damage;

    // Tampon des degats par l'armure
    if (this.camera.armor > Math.round(damageTaken / 2)) {
      damageTaken = Math.round(damageTaken / 2);
      this.camera.armor -= damageTaken;
    } else {
      damageTaken -= this.camera.armor;
      this.camera.armor = 0;
    }

    // Si le joueur i a encore de la vie
    if (this.camera.health > damageTaken) {
      this.camera.health -= damageTaken;
    } else {
      // Sinon, il est mort
      this.playerDead();
    }
  }

  playerDead() {
    this.deadCamera = new BABYLON.ArcRotateCamera('ArcRotateCamera', 0, 0.8, 10, new BABYLON.Vector3(
      this.camera.playerBox.position.x,
      this.camera.playerBox.position.y,
      this.camera.playerBox.position.z,
    ), this.scene);

    this.scene.activeCamera = this.deadCamera;
    this.deadCamera.attachControl(this.scene.getEngine().getRenderingCanvas());

    // Suppression de la playerBox
    this.camera.playerBox.dispose();

    // Suppression de la camera
    this.camera.dispose();

    // Suppression de l'arme
    this.camera.weapons.rocketLauncher.dispose();

    // On signale à Weapons que le joueur est mort
    this.isAlive = false;

    // On fait revivre le joeur
    setTimeout(() => {
      this._initPlayerBox();
      this._initCamera();
      this._initWeapon();
      this._initHitBox();
    }, 4000);
  }
}
