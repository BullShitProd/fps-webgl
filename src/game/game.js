import * as BABYLON from 'babylonjs';
import Player from './player';
import Arena from './arena';
import Armory from './armory';

export default class Game {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.engine = new BABYLON.Engine(this.canvas, true);

    this.actualTime = Date.now();
    this.fps = 0;

    this.allSpawnPoints = [
      new BABYLON.Vector3(-20, 5, 0),
      new BABYLON.Vector3(0, 5, 0),
      new BABYLON.Vector3(20, 5, 0),
      new BABYLON.Vector3(-40, 5, 0),
    ];

    // Ajout de l'armurie
    this.armory = new Armory();

    this.scene = this._initScene(this.engine);

    this._player = new Player(this, this.canvas);
    this._arena = new Arena(this);

    this.playerData = this._player;

    // Les roquettes générées dans Player.js
    this.rockets = [];
    // Les explosions qui découlent des roquettes
    this.explosionRadius = [];

    this.lasers = [];

    this.engine.runRenderLoop(() => {
      this.renderLoop();
    });

    window.addEventListener('resize', () => {
      if (this.engine) {
        this.engine.resize();
      }
    }, false);
  }

  renderLoop() {
    this.fps = this.engine.getFps();

    const divFps = document.getElementById('fps');
    divFps.innerHTML = `${this.fps.toFixed()} fps`;

    this._player.checkMove(this.fps / 60);

    // On apelle nos deux fonctions de calcul pour les roquettes
    this.renderRockets();
    this.renderExplosionRadius();

    // On calcule la diminution de la taille du laser
    this.renderLaser();

    // On calcule les animations des armes
    this.renderWeapons();

    this.scene.render();

    // Si launchBullets est a true, on tire
    if (this._player.camera.weapons.lauchBullets === true) {
      this._player.camera.weapons.lauchFire();
    }
  }

  _initScene() {
    const scene = new BABYLON.Scene(this.engine);
    scene.clearColor = new BABYLON.Color3(0.9, 0.9, 0.9);
    // scene.gravity = new BABYLON.Vector3(0, -9.81, 0);
    scene.collisionsEnabled = true;
    return scene;
  }

  renderRockets() {
    this.rockets.forEach((rocket, rocketIndex) => {
      // On crée un rayon qui part de la base de la roquette vers l'avant
      const rayRocket = new BABYLON.Ray(rocket.position, rocket.direction);

      // On regarde quel est le premier objet qu'on touche
      const meshFound = rocket.getScene().pickWithRay(rayRocket);

      // Si la distance au premier objet touché est inférieure a 10, on détruit la roquette
      if (!meshFound || meshFound.distance < 10) {
        this.explosionRocket(meshFound);
        rocket.dispose();

        // On enlève de l'array _rockets le mesh numéro i (défini par la boucle)
        this.rockets.splice(rocketIndex, 1);
      } else {
        const relativeSpeed = 1 / (this.fps / 60);
        rocket.position.addInPlace(rocket.direction.scale(relativeSpeed));
      }
    });
  }

  renderExplosionRadius() {
    if (this.explosionRadius.length) {
      this.explosionRadius.forEach((explosionRadius, explosionRadiusIndex) => {
        // eslint-disable-next-line no-param-reassign
        explosionRadius.material.alpha -= 0.02;
        if (explosionRadius.material.alpha <= 0) {
          explosionRadius.dispose();
          this.explosionRadius.splice(explosionRadiusIndex, 1);
        }
      });
    }
  }

  explosionRocket(meshFound) {
    // On vérifie qu'on a bien touché quelque chose
    if (meshFound.pickedMesh) {
      // On crée une sphere qui représentera la zone d'impact
      const explosionRadius = BABYLON.MeshBuilder.CreateSphere('explosionRadius', { segments: 5.0, diameter: 20 }, this.scene);
      // On positionne la sphère là où il y a eu impact
      explosionRadius.position = meshFound.pickedPoint;
      // On fait en sorte que les explosions ne soient pas considérées pour le Ray de la roquette
      explosionRadius.isPickable = false;

      // On crée un petit material orange
      explosionRadius.material = new BABYLON.StandardMaterial('textureExplosion', this.scene);
      explosionRadius.material.diffuseColor = new BABYLON.Color3(1, 0.6, 0);
      explosionRadius.material.specularColor = new BABYLON.Color3(0, 0, 0);
      explosionRadius.material.alpha = 0.8;

      this.impactWithPlayer(explosionRadius);

      this.explosionRadius.push(explosionRadius);
    }
  }

  renderLaser() {
    this.lasers.forEach((laser, laserIndex) => {
      this.lasers[laserIndex].edgesWidth -= 1;
      if (this.lasers[laserIndex].edgesWidth <= 0) {
        laser.dispose();
        this.lasers.splice(laserIndex, 1);
      }
    });
  }

  renderWeapons() {
    if (this.playerData && this.playerData.camera.weapons.inventory) {
      // On regarde toutes les armes dans inventory
      const inventoryWeapons = this.playerData.camera.weapons.inventory;

      inventoryWeapons.forEach((weapon, weaponIndex) => {
        if (weapon.isActive && weapon.position.y < this.playerData.camera.weapons.topPositionY) {
          inventoryWeapons[weaponIndex].position.y += 0.1;
        } else if (!weapon.isActive && weapon.position.y !== this.playerData.camera.weapons.bottomPosition.y) {
          // Sinon, si l'arme est inactive et pas encore à la position basse
          inventoryWeapons[weaponIndex].position.y -= 0.1;
        }
      });
    }
  }

  impactWithPlayer(explosionRadius) {
    // Calcule la matrice de l'objet pour les collisions
    explosionRadius.computeWorldMatrix(true);
    if (this.playerData.isAlive && this.playerData.camera.playerBox
      && explosionRadius.intersectsMesh(this.playerData.camera.playerBox)
    ) {
      this.playerData.getDamage(30);
    }
  }
}
