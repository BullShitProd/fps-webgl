import * as BABYLON from 'babylonjs';
import { degToRad } from './utils';
import Weapons from './weapons';

export default class Player {
  constructor(game, canvas) {
    this.game = game;
    this.scene = game.scene;
    this.canvas = canvas;

    // camera
    this.angularSensitivity = 400;
    this.rotEngaged = false;
    this.controlEnabled = false;
    this.speed = 1;

    // params players
    this.isAlive = true;
    this.weponShoot = false;

    this._initPointerLock();
    this._initMovement();
    this._initCamera(canvas);
    this._initWeapon();
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
        this.camera.rotation.y += event.movementX * 0.01 * (this.angularSensitivity / 250);
        const nextRotationX = this.camera.rotation.x + (event.movementY * 0.001 * (this.angularSensitivity / 250));

        if (nextRotationX < degToRad(90) && nextRotationX > degToRad(-90)) {
          this.camera.rotation.x += event.movementY * 0.001 * (this.angularSensitivity / 250);
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

  _initCamera() {
    // On crée la caméra
    this.camera = new BABYLON.FreeCamera('camera', new BABYLON.Vector3(-20, 5, 0), this.scene);
    // Axe de mouvement X et Z
    this.camera.axisMovement = [false, false, false, false];
    // Si le joueur est en vie ou non
    this.isAlive = true;
    // On demande à la caméra de regarder au point zéro de la scène
    this.camera.setTarget(BABYLON.Vector3.Zero());
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
      this.camera.position = new BABYLON.Vector3(
        this.camera.position.x + (Math.sin(this.camera.rotation.y) * relativeSpeed),
        this.camera.position.y,
        this.camera.position.z + (Math.cos(this.camera.rotation.y) * relativeSpeed),
      );
    }
    if (this.camera.axisMovement[1]) {
      this.camera.position = new BABYLON.Vector3(
        this.camera.position.x + (Math.sin(this.camera.rotation.y) * -relativeSpeed),
        this.camera.position.y,
        this.camera.position.z + (Math.cos(this.camera.rotation.y) * -relativeSpeed),
      );
    }
    if (this.camera.axisMovement[2]) {
      this.camera.position = new BABYLON.Vector3(
        this.camera.position.x + Math.sin(this.camera.rotation.y + degToRad(-90)) * relativeSpeed,
        this.camera.position.y,
        this.camera.position.z + Math.cos(this.camera.rotation.y + degToRad(-90)) * relativeSpeed,
      );
    }
    if (this.camera.axisMovement[3]) {
      this.camera.position = new BABYLON.Vector3(
        this.camera.position.x + Math.sin(this.camera.rotation.y + degToRad(-90)) * -relativeSpeed,
        this.camera.position.y,
        this.camera.position.z + Math.cos(this.camera.rotation.y + degToRad(-90)) * -relativeSpeed,
      );
    }
  }
}
